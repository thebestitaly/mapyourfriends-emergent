#!/usr/bin/env python3
"""
Script: add_groups_endpoints.py
Direttiva: 02_groups_circles.md

Genera il codice backend per la funzionalità gruppi.
Stampa il codice da aggiungere a server.py.
"""

MODELS_CODE = '''
# ============== GROUP MODELS ==============

class GroupCreate(BaseModel):
    name: str
    color: Optional[str] = "#EC4899"  # Default pink
    icon: Optional[str] = None

class GroupUpdate(BaseModel):
    name: Optional[str] = None
    color: Optional[str] = None
    icon: Optional[str] = None

class GroupMemberAdd(BaseModel):
    member_id: str
    member_type: str  # "user" or "imported"
'''

ENDPOINTS_CODE = '''
# ============== GROUPS ENDPOINTS ==============

@app.post("/api/groups")
async def create_group(group: GroupCreate, user: dict = Depends(get_current_user)):
    """Create a new group"""
    # Check max groups limit
    existing_count = await db.groups.count_documents({"owner_id": user["user_id"]})
    if existing_count >= 20:
        raise HTTPException(status_code=400, detail="Maximum 20 groups allowed")
    
    group_id = f"group_{uuid.uuid4().hex[:12]}"
    await db.groups.insert_one({
        "group_id": group_id,
        "owner_id": user["user_id"],
        "name": group.name,
        "color": group.color,
        "icon": group.icon,
        "member_ids": [],
        "imported_member_ids": [],
        "created_at": datetime.now(timezone.utc)
    })
    return {"message": "Group created", "group_id": group_id}


@app.get("/api/groups")
async def get_groups(user: dict = Depends(get_current_user)):
    """Get all groups for current user"""
    groups = await db.groups.find(
        {"owner_id": user["user_id"]},
        {"_id": 0}
    ).to_list(100)
    return groups


@app.get("/api/groups/{group_id}")
async def get_group(group_id: str, user: dict = Depends(get_current_user)):
    """Get a specific group"""
    group = await db.groups.find_one(
        {"group_id": group_id, "owner_id": user["user_id"]},
        {"_id": 0}
    )
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")
    return group


@app.put("/api/groups/{group_id}")
async def update_group(group_id: str, update: GroupUpdate, user: dict = Depends(get_current_user)):
    """Update a group"""
    update_data = {k: v for k, v in update.model_dump().items() if v is not None}
    if update_data:
        result = await db.groups.update_one(
            {"group_id": group_id, "owner_id": user["user_id"]},
            {"$set": update_data}
        )
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Group not found")
    
    group = await db.groups.find_one(
        {"group_id": group_id, "owner_id": user["user_id"]},
        {"_id": 0}
    )
    return group


@app.delete("/api/groups/{group_id}")
async def delete_group(group_id: str, user: dict = Depends(get_current_user)):
    """Delete a group (does NOT delete members)"""
    result = await db.groups.delete_one(
        {"group_id": group_id, "owner_id": user["user_id"]}
    )
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Group not found")
    return {"message": "Group deleted"}


@app.post("/api/groups/{group_id}/members")
async def add_group_member(group_id: str, member: GroupMemberAdd, user: dict = Depends(get_current_user)):
    """Add a member to a group"""
    group = await db.groups.find_one(
        {"group_id": group_id, "owner_id": user["user_id"]}
    )
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")
    
    if member.member_type == "user":
        # Verify it's a friend
        friendship = await db.friendships.find_one({
            "$or": [
                {"user_id": user["user_id"], "friend_id": member.member_id, "status": "accepted"},
                {"user_id": member.member_id, "friend_id": user["user_id"], "status": "accepted"}
            ]
        })
        if not friendship:
            raise HTTPException(status_code=400, detail="User is not a friend")
        
        await db.groups.update_one(
            {"group_id": group_id},
            {"$addToSet": {"member_ids": member.member_id}}
        )
    elif member.member_type == "imported":
        # Verify ownership
        imported = await db.imported_friends.find_one({
            "friend_id": member.member_id,
            "owner_id": user["user_id"]
        })
        if not imported:
            raise HTTPException(status_code=400, detail="Imported friend not found")
        
        await db.groups.update_one(
            {"group_id": group_id},
            {"$addToSet": {"imported_member_ids": member.member_id}}
        )
    else:
        raise HTTPException(status_code=400, detail="Invalid member_type")
    
    return {"message": "Member added to group"}


@app.delete("/api/groups/{group_id}/members/{member_id}")
async def remove_group_member(group_id: str, member_id: str, user: dict = Depends(get_current_user)):
    """Remove a member from a group"""
    result = await db.groups.update_one(
        {"group_id": group_id, "owner_id": user["user_id"]},
        {
            "$pull": {
                "member_ids": member_id,
                "imported_member_ids": member_id
            }
        }
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Group not found")
    return {"message": "Member removed from group"}


@app.get("/api/friends/map/grouped")
async def get_friends_for_map_with_groups(user: dict = Depends(get_current_user)):
    """Get friends with location and group info for map"""
    # Get all groups
    groups = await db.groups.find(
        {"owner_id": user["user_id"]},
        {"_id": 0}
    ).to_list(100)
    
    # Create lookup dictionaries
    user_groups = {}  # user_id -> [group_info]
    imported_groups = {}  # friend_id -> [group_info]
    
    for group in groups:
        group_info = {
            "group_id": group["group_id"],
            "name": group["name"],
            "color": group["color"]
        }
        for uid in group.get("member_ids", []):
            if uid not in user_groups:
                user_groups[uid] = []
            user_groups[uid].append(group_info)
        
        for fid in group.get("imported_member_ids", []):
            if fid not in imported_groups:
                imported_groups[fid] = []
            imported_groups[fid].append(group_info)
    
    # Get regular map data
    friends = await get_friends(user)
    map_data = []
    
    for friend in friends:
        if friend.get("active_city_lat") and friend.get("active_city_lng"):
            friend_groups = user_groups.get(friend["user_id"], [])
            map_data.append({
                "user_id": friend["user_id"],
                "name": friend["name"],
                "picture": friend.get("picture"),
                "bio": friend.get("bio"),
                "active_city": friend.get("active_city"),
                "lat": friend["active_city_lat"],
                "lng": friend["active_city_lng"],
                "competent_cities": friend.get("competent_cities", []),
                "availability": friend.get("availability", []),
                "marker_type": "active",
                "groups": friend_groups,
                "marker_color": friend_groups[0]["color"] if friend_groups else None
            })
    
    # Add imported friends
    imported = await db.imported_friends.find(
        {"owner_id": user["user_id"], "city_lat": {"$ne": None}},
        {"_id": 0}
    ).to_list(1000)
    
    for friend in imported:
        friend_groups = imported_groups.get(friend["friend_id"], [])
        map_data.append({
            "friend_id": friend["friend_id"],
            "name": f"{friend['first_name']} {friend.get('last_name', '')}".strip(),
            "city": friend["city"],
            "lat": friend["city_lat"],
            "lng": friend["city_lng"],
            "email": friend.get("email"),
            "phone": friend.get("phone"),
            "photo": friend.get("photo"),
            "geocode_status": friend.get("geocode_status", "success"),
            "marker_type": "imported",
            "groups": friend_groups,
            "marker_color": friend_groups[0]["color"] if friend_groups else None
        })
    
    return map_data
'''

def main():
    print("=" * 60)
    print("CODICE DA AGGIUNGERE A server.py")
    print("Direttiva: 02_groups_circles.md")
    print("=" * 60)
    
    print("\n\n# 1. AGGIUNGI QUESTI MODELLI DOPO ImportedFriendUpdate:")
    print(MODELS_CODE)
    
    print("\n\n# 2. AGGIUNGI QUESTI ENDPOINT (prima di # ============== HEALTH CHECK ==============):")
    print(ENDPOINTS_CODE)
    
    print("\n" + "=" * 60)
    print("✅ Copia il codice sopra in server.py")
    print("💡 Poi esegui: python execution/test_groups_api.py")
    print("=" * 60)


if __name__ == "__main__":
    main()

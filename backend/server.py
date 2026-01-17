from fastapi import FastAPI, HTTPException, Request, Response, Depends, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, timezone, timedelta
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import httpx
import uuid
import os
import csv
import io
import asyncio

load_dotenv()

app = FastAPI(title="Map Your Friends API")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MongoDB connection
MONGO_URL = os.environ.get("MONGO_URL")
DB_NAME = os.environ.get("DB_NAME", "map_your_friends")
client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]

# ============== MODELS ==============

class UserCreate(BaseModel):
    email: str
    name: str
    picture: Optional[str] = None

class UserUpdate(BaseModel):
    bio: Optional[str] = None
    active_city: Optional[str] = None
    active_city_lat: Optional[float] = None
    active_city_lng: Optional[float] = None
    competent_cities: Optional[List[dict]] = None
    availability: Optional[List[str]] = None

class User(BaseModel):
    user_id: str
    email: str
    name: str
    picture: Optional[str] = None
    bio: Optional[str] = None
    active_city: Optional[str] = None
    active_city_lat: Optional[float] = None
    active_city_lng: Optional[float] = None
    competent_cities: Optional[List[dict]] = []
    availability: Optional[List[str]] = []
    created_at: datetime

class FriendRequest(BaseModel):
    to_user_id: str

class MeetupCreate(BaseModel):
    title: str
    city: str
    city_lat: float
    city_lng: float
    date: str
    description: Optional[str] = None
    invited_user_ids: Optional[List[str]] = []

class MessageCreate(BaseModel):
    to_user_id: str
    content: str
    message_type: Optional[str] = "text"

class ImportedFriendCreate(BaseModel):
    first_name: str
    last_name: str
    city: str
    email: Optional[str] = None
    phone: Optional[str] = None
    photo: Optional[str] = None
    city_lat: Optional[float] = None
    city_lng: Optional[float] = None
    geocode_status: Optional[str] = "pending"  # pending, success, failed, manual

class ImportedFriendUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    city: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    photo: Optional[str] = None
    city_lat: Optional[float] = None
    city_lng: Optional[float] = None
    geocode_status: Optional[str] = None

# ============== AUTH HELPERS ==============

async def get_current_user(request: Request) -> dict:
    """Get current user from session token"""
    session_token = request.cookies.get("session_token")
    if not session_token:
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            session_token = auth_header.split(" ")[1]
    
    if not session_token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    session = await db.user_sessions.find_one(
        {"session_token": session_token},
        {"_id": 0}
    )
    if not session:
        raise HTTPException(status_code=401, detail="Invalid session")
    
    expires_at = session.get("expires_at")
    if isinstance(expires_at, str):
        expires_at = datetime.fromisoformat(expires_at)
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    if expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=401, detail="Session expired")
    
    user = await db.users.find_one(
        {"user_id": session["user_id"]},
        {"_id": 0}
    )
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    
    return user

# ============== AUTH ENDPOINTS ==============

@app.post("/api/auth/session")
async def create_session(request: Request, response: Response):
    """Exchange session_id for session_token"""
    data = await request.json()
    session_id = data.get("session_id")
    
    if not session_id:
        raise HTTPException(status_code=400, detail="session_id required")
    
    async with httpx.AsyncClient() as client:
        resp = await client.get(
            "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data",
            headers={"X-Session-ID": session_id}
        )
        if resp.status_code != 200:
            raise HTTPException(status_code=401, detail="Invalid session_id")
        auth_data = resp.json()
    
    email = auth_data.get("email")
    name = auth_data.get("name")
    picture = auth_data.get("picture")
    session_token = auth_data.get("session_token")
    
    existing_user = await db.users.find_one({"email": email}, {"_id": 0})
    if existing_user:
        user_id = existing_user["user_id"]
        await db.users.update_one(
            {"email": email},
            {"$set": {"name": name, "picture": picture}}
        )
    else:
        user_id = f"user_{uuid.uuid4().hex[:12]}"
        await db.users.insert_one({
            "user_id": user_id,
            "email": email,
            "name": name,
            "picture": picture,
            "bio": None,
            "active_city": None,
            "active_city_lat": None,
            "active_city_lng": None,
            "competent_cities": [],
            "availability": [],
            "created_at": datetime.now(timezone.utc)
        })
    
    await db.user_sessions.delete_many({"user_id": user_id})
    await db.user_sessions.insert_one({
        "user_id": user_id,
        "session_token": session_token,
        "expires_at": datetime.now(timezone.utc) + timedelta(days=7),
        "created_at": datetime.now(timezone.utc)
    })
    
    user = await db.users.find_one({"user_id": user_id}, {"_id": 0})
    
    response.set_cookie(
        key="session_token",
        value=session_token,
        httponly=True,
        secure=True,
        samesite="none",
        path="/",
        max_age=7 * 24 * 60 * 60
    )
    
    return {"user": user, "session_token": session_token}

@app.get("/api/auth/me")
async def get_me(user: dict = Depends(get_current_user)):
    """Get current user"""
    return user

@app.post("/api/auth/logout")
async def logout(request: Request, response: Response):
    """Logout user"""
    session_token = request.cookies.get("session_token")
    if session_token:
        await db.user_sessions.delete_one({"session_token": session_token})
    response.delete_cookie(key="session_token", path="/")
    return {"message": "Logged out"}

# ============== USER ENDPOINTS ==============

@app.put("/api/users/me")
async def update_user(update: UserUpdate, user: dict = Depends(get_current_user)):
    """Update current user profile"""
    update_data = {k: v for k, v in update.model_dump().items() if v is not None}
    if update_data:
        await db.users.update_one(
            {"user_id": user["user_id"]},
            {"$set": update_data}
        )
    updated_user = await db.users.find_one({"user_id": user["user_id"]}, {"_id": 0})
    return updated_user

@app.get("/api/users/{user_id}")
async def get_user(user_id: str, current_user: dict = Depends(get_current_user)):
    """Get user by ID"""
    user = await db.users.find_one({"user_id": user_id}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

# ============== FRIENDS ENDPOINTS ==============

@app.get("/api/friends")
async def get_friends(user: dict = Depends(get_current_user)):
    """Get all friends of current user"""
    friendships = await db.friendships.find(
        {"$or": [{"user_id": user["user_id"]}, {"friend_id": user["user_id"]}], "status": "accepted"},
        {"_id": 0}
    ).to_list(1000)
    
    friend_ids = []
    for f in friendships:
        if f["user_id"] == user["user_id"]:
            friend_ids.append(f["friend_id"])
        else:
            friend_ids.append(f["user_id"])
    
    friends = await db.users.find(
        {"user_id": {"$in": friend_ids}},
        {"_id": 0}
    ).to_list(1000)
    
    return friends

@app.get("/api/friends/map")
async def get_friends_for_map(user: dict = Depends(get_current_user)):
    """Get friends with location data for map"""
    friends = await get_friends(user)
    map_data = []
    for friend in friends:
        if friend.get("active_city_lat") and friend.get("active_city_lng"):
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
                "marker_type": "active"
            })
        for city in friend.get("competent_cities", []):
            if city.get("lat") and city.get("lng"):
                map_data.append({
                    "user_id": friend["user_id"],
                    "name": friend["name"],
                    "picture": friend.get("picture"),
                    "bio": friend.get("bio"),
                    "city_name": city.get("name"),
                    "lat": city["lat"],
                    "lng": city["lng"],
                    "availability": friend.get("availability", []),
                    "marker_type": "competent"
                })
    return map_data

@app.post("/api/friends/request")
async def send_friend_request(req: FriendRequest, user: dict = Depends(get_current_user)):
    """Send friend request"""
    if req.to_user_id == user["user_id"]:
        raise HTTPException(status_code=400, detail="Cannot friend yourself")
    
    target = await db.users.find_one({"user_id": req.to_user_id}, {"_id": 0})
    if not target:
        raise HTTPException(status_code=404, detail="User not found")
    
    existing = await db.friendships.find_one({
        "$or": [
            {"user_id": user["user_id"], "friend_id": req.to_user_id},
            {"user_id": req.to_user_id, "friend_id": user["user_id"]}
        ]
    }, {"_id": 0})
    
    if existing:
        raise HTTPException(status_code=400, detail="Friendship already exists")
    
    friendship_id = f"friendship_{uuid.uuid4().hex[:12]}"
    await db.friendships.insert_one({
        "friendship_id": friendship_id,
        "user_id": user["user_id"],
        "friend_id": req.to_user_id,
        "status": "pending",
        "created_at": datetime.now(timezone.utc)
    })
    
    return {"message": "Friend request sent", "friendship_id": friendship_id}

@app.get("/api/friends/requests")
async def get_friend_requests(user: dict = Depends(get_current_user)):
    """Get pending friend requests"""
    requests = await db.friendships.find(
        {"friend_id": user["user_id"], "status": "pending"},
        {"_id": 0}
    ).to_list(100)
    
    result = []
    for req in requests:
        sender = await db.users.find_one({"user_id": req["user_id"]}, {"_id": 0})
        if sender:
            result.append({
                "friendship_id": req["friendship_id"],
                "from_user": sender,
                "created_at": req["created_at"]
            })
    return result

@app.post("/api/friends/accept/{friendship_id}")
async def accept_friend_request(friendship_id: str, user: dict = Depends(get_current_user)):
    """Accept friend request"""
    result = await db.friendships.update_one(
        {"friendship_id": friendship_id, "friend_id": user["user_id"], "status": "pending"},
        {"$set": {"status": "accepted", "accepted_at": datetime.now(timezone.utc)}}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Friend request not found")
    return {"message": "Friend request accepted"}

@app.delete("/api/friends/{friend_id}")
async def remove_friend(friend_id: str, user: dict = Depends(get_current_user)):
    """Remove friend"""
    await db.friendships.delete_one({
        "$or": [
            {"user_id": user["user_id"], "friend_id": friend_id},
            {"user_id": friend_id, "friend_id": user["user_id"]}
        ]
    })
    return {"message": "Friend removed"}

# ============== GEOCODING HELPER ==============

async def geocode_city(city_name: str) -> dict:
    """Geocode a city name using OpenStreetMap Nominatim API"""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                "https://nominatim.openstreetmap.org/search",
                params={
                    "q": city_name,
                    "format": "json",
                    "limit": 1,
                    "addressdetails": 1
                },
                headers={"User-Agent": "MapYourFriends/1.0"}
            )
            if response.status_code == 200:
                results = response.json()
                if results:
                    result = results[0]
                    return {
                        "lat": float(result["lat"]),
                        "lng": float(result["lon"]),
                        "display_name": result.get("display_name", city_name),
                        "status": "success"
                    }
            return {"lat": None, "lng": None, "display_name": city_name, "status": "failed"}
    except Exception as e:
        print(f"Geocoding error: {e}")
        return {"lat": None, "lng": None, "display_name": city_name, "status": "failed"}

# ============== IMPORTED FRIENDS ENDPOINTS ==============

@app.post("/api/imported-friends/csv")
async def import_friends_csv(file: UploadFile = File(...), user: dict = Depends(get_current_user)):
    """Import friends from CSV file with geocoding"""
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="File must be a CSV")
    
    content = await file.read()
    try:
        # Try different encodings
        try:
            text_content = content.decode('utf-8')
        except UnicodeDecodeError:
            text_content = content.decode('latin-1')
        
        csv_reader = csv.DictReader(io.StringIO(text_content))
        
        imported = []
        failed = []
        
        for row in csv_reader:
            # Handle different column name variations
            first_name = row.get('Nome') or row.get('nome') or row.get('First Name') or row.get('first_name') or ''
            last_name = row.get('Cognome') or row.get('cognome') or row.get('Last Name') or row.get('last_name') or ''
            city = row.get('Città') or row.get('citta') or row.get('City') or row.get('city') or ''
            email = row.get('Email') or row.get('email') or None
            phone = row.get('Telefono') or row.get('telefono') or row.get('Phone') or row.get('phone') or None
            
            if not first_name or not city:
                failed.append({
                    "row": row,
                    "error": "Missing required fields (Nome/First Name and Città/City)"
                })
                continue
            
            # Geocode the city
            geo_result = await geocode_city(city)
            
            # Small delay to respect Nominatim rate limits
            await asyncio.sleep(0.5)
            
            friend_id = f"imported_{uuid.uuid4().hex[:12]}"
            friend_data = {
                "friend_id": friend_id,
                "owner_id": user["user_id"],
                "first_name": first_name.strip(),
                "last_name": last_name.strip() if last_name else "",
                "city": city.strip(),
                "city_lat": geo_result["lat"],
                "city_lng": geo_result["lng"],
                "display_name": geo_result["display_name"],
                "geocode_status": geo_result["status"],
                "email": email.strip() if email else None,
                "phone": phone.strip() if phone else None,
                "photo": None,
                "created_at": datetime.now(timezone.utc)
            }
            
            await db.imported_friends.insert_one(friend_data)
            imported.append({
                "friend_id": friend_id,
                "name": f"{first_name} {last_name}".strip(),
                "city": city,
                "lat": geo_result["lat"],
                "lng": geo_result["lng"],
                "geocode_status": geo_result["status"]
            })
        
        return {
            "message": f"Imported {len(imported)} friends",
            "imported": imported,
            "failed": failed,
            "total_imported": len(imported),
            "total_failed": len(failed)
        }
    
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error parsing CSV: {str(e)}")

@app.get("/api/imported-friends")
async def get_imported_friends(user: dict = Depends(get_current_user)):
    """Get all imported friends for current user"""
    friends = await db.imported_friends.find(
        {"owner_id": user["user_id"]},
        {"_id": 0}
    ).to_list(1000)
    return friends

@app.post("/api/imported-friends")
async def add_imported_friend(friend: ImportedFriendCreate, user: dict = Depends(get_current_user)):
    """Add a single friend manually with automatic geocoding"""
    # Geocode the city if coordinates not provided
    if friend.city_lat is None or friend.city_lng is None:
        geo_result = await geocode_city(friend.city)
        city_lat = geo_result["lat"]
        city_lng = geo_result["lng"]
        geocode_status = geo_result["status"]
        display_name = geo_result["display_name"]
    else:
        city_lat = friend.city_lat
        city_lng = friend.city_lng
        geocode_status = "manual"
        display_name = friend.city
    
    friend_id = f"imported_{uuid.uuid4().hex[:12]}"
    friend_data = {
        "friend_id": friend_id,
        "owner_id": user["user_id"],
        "first_name": friend.first_name.strip(),
        "last_name": friend.last_name.strip() if friend.last_name else "",
        "city": friend.city.strip(),
        "city_lat": city_lat,
        "city_lng": city_lng,
        "display_name": display_name,
        "geocode_status": geocode_status,
        "email": friend.email.strip() if friend.email else None,
        "phone": friend.phone.strip() if friend.phone else None,
        "photo": friend.photo,
        "created_at": datetime.now(timezone.utc)
    }
    
    await db.imported_friends.insert_one(friend_data)
    
    return {
        "friend_id": friend_id,
        "name": f"{friend.first_name} {friend.last_name or ''}".strip(),
        "city": friend.city,
        "lat": city_lat,
        "lng": city_lng,
        "geocode_status": geocode_status
    }

@app.get("/api/imported-friends/map")
async def get_imported_friends_for_map(user: dict = Depends(get_current_user)):
    """Get imported friends with location data for map"""
    friends = await db.imported_friends.find(
        {"owner_id": user["user_id"], "city_lat": {"$ne": None}},
        {"_id": 0}
    ).to_list(1000)
    
    map_data = []
    for friend in friends:
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
            "marker_type": "imported"
        })
    return map_data

@app.put("/api/imported-friends/{friend_id}")
async def update_imported_friend(friend_id: str, update: ImportedFriendUpdate, user: dict = Depends(get_current_user)):
    """Update an imported friend (including manual position)"""
    update_data = {k: v for k, v in update.model_dump().items() if v is not None}
    
    if update_data:
        result = await db.imported_friends.update_one(
            {"friend_id": friend_id, "owner_id": user["user_id"]},
            {"$set": update_data}
        )
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Friend not found")
    
    friend = await db.imported_friends.find_one(
        {"friend_id": friend_id, "owner_id": user["user_id"]},
        {"_id": 0}
    )
    return friend

@app.post("/api/imported-friends/{friend_id}/geocode")
async def geocode_imported_friend(friend_id: str, user: dict = Depends(get_current_user)):
    """Re-geocode a specific imported friend"""
    friend = await db.imported_friends.find_one(
        {"friend_id": friend_id, "owner_id": user["user_id"]},
        {"_id": 0}
    )
    if not friend:
        raise HTTPException(status_code=404, detail="Friend not found")
    
    geo_result = await geocode_city(friend["city"])
    
    await db.imported_friends.update_one(
        {"friend_id": friend_id},
        {"$set": {
            "city_lat": geo_result["lat"],
            "city_lng": geo_result["lng"],
            "display_name": geo_result["display_name"],
            "geocode_status": geo_result["status"]
        }}
    )
    
    return {
        "friend_id": friend_id,
        "lat": geo_result["lat"],
        "lng": geo_result["lng"],
        "geocode_status": geo_result["status"]
    }

@app.delete("/api/imported-friends/{friend_id}")
async def delete_imported_friend(friend_id: str, user: dict = Depends(get_current_user)):
    """Delete an imported friend"""
    result = await db.imported_friends.delete_one(
        {"friend_id": friend_id, "owner_id": user["user_id"]}
    )
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Friend not found")
    return {"message": "Friend deleted"}

@app.post("/api/geocode")
async def geocode_single_city(request: Request, user: dict = Depends(get_current_user)):
    """Geocode a single city name"""
    data = await request.json()
    city_name = data.get("city")
    if not city_name:
        raise HTTPException(status_code=400, detail="City name required")
    
    result = await geocode_city(city_name)
    return result

# ============== MEETUPS ENDPOINTS ==============

@app.post("/api/meetups")
async def create_meetup(meetup: MeetupCreate, user: dict = Depends(get_current_user)):
    """Create a new meetup"""
    meetup_id = f"meetup_{uuid.uuid4().hex[:12]}"
    await db.meetups.insert_one({
        "meetup_id": meetup_id,
        "creator_id": user["user_id"],
        "title": meetup.title,
        "city": meetup.city,
        "city_lat": meetup.city_lat,
        "city_lng": meetup.city_lng,
        "date": meetup.date,
        "description": meetup.description,
        "invited_user_ids": meetup.invited_user_ids,
        "attendee_ids": [user["user_id"]],
        "status": "active",
        "created_at": datetime.now(timezone.utc)
    })
    return {"message": "Meetup created", "meetup_id": meetup_id}

@app.get("/api/meetups")
async def get_meetups(user: dict = Depends(get_current_user)):
    """Get user's meetups"""
    meetups = await db.meetups.find(
        {"$or": [
            {"creator_id": user["user_id"]},
            {"invited_user_ids": user["user_id"]},
            {"attendee_ids": user["user_id"]}
        ]},
        {"_id": 0}
    ).to_list(100)
    return meetups

@app.post("/api/meetups/{meetup_id}/join")
async def join_meetup(meetup_id: str, user: dict = Depends(get_current_user)):
    """Join a meetup"""
    result = await db.meetups.update_one(
        {"meetup_id": meetup_id},
        {"$addToSet": {"attendee_ids": user["user_id"]}}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Meetup not found")
    return {"message": "Joined meetup"}

@app.delete("/api/meetups/{meetup_id}")
async def delete_meetup(meetup_id: str, user: dict = Depends(get_current_user)):
    """Delete a meetup"""
    result = await db.meetups.delete_one(
        {"meetup_id": meetup_id, "creator_id": user["user_id"]}
    )
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Meetup not found or not authorized")
    return {"message": "Meetup deleted"}

# ============== MESSAGES ENDPOINTS ==============

@app.post("/api/messages")
async def send_message(msg: MessageCreate, user: dict = Depends(get_current_user)):
    """Send a message"""
    message_id = f"msg_{uuid.uuid4().hex[:12]}"
    await db.messages.insert_one({
        "message_id": message_id,
        "from_user_id": user["user_id"],
        "to_user_id": msg.to_user_id,
        "content": msg.content,
        "message_type": msg.message_type,
        "read": False,
        "created_at": datetime.now(timezone.utc)
    })
    return {"message": "Message sent", "message_id": message_id}

@app.get("/api/messages/inbox")
async def get_inbox(user: dict = Depends(get_current_user)):
    """Get inbox messages"""
    messages = await db.messages.find(
        {"to_user_id": user["user_id"]},
        {"_id": 0}
    ).sort("created_at", -1).to_list(100)
    
    result = []
    for msg in messages:
        sender = await db.users.find_one({"user_id": msg["from_user_id"]}, {"_id": 0})
        result.append({
            **msg,
            "from_user": sender
        })
    return result

@app.get("/api/messages/sent")
async def get_sent_messages(user: dict = Depends(get_current_user)):
    """Get sent messages"""
    messages = await db.messages.find(
        {"from_user_id": user["user_id"]},
        {"_id": 0}
    ).sort("created_at", -1).to_list(100)
    return messages

@app.put("/api/messages/{message_id}/read")
async def mark_message_read(message_id: str, user: dict = Depends(get_current_user)):
    """Mark message as read"""
    await db.messages.update_one(
        {"message_id": message_id, "to_user_id": user["user_id"]},
        {"$set": {"read": True}}
    )
    return {"message": "Marked as read"}

# ============== SEARCH ENDPOINTS ==============

@app.get("/api/search/users")
async def search_users(q: str, user: dict = Depends(get_current_user)):
    """Search users by name or email"""
    users = await db.users.find(
        {"$and": [
            {"user_id": {"$ne": user["user_id"]}},
            {"$or": [
                {"name": {"$regex": q, "$options": "i"}},
                {"email": {"$regex": q, "$options": "i"}}
            ]}
        ]},
        {"_id": 0}
    ).to_list(20)
    return users

# ============== HEALTH CHECK ==============

@app.get("/api/health")
async def health():
    return {"status": "healthy", "timestamp": datetime.now(timezone.utc).isoformat()}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)

#!/usr/bin/env python3
"""
Script: export_user_data.py
Direttiva: 10_export_gdpr.md

Esporta tutti i dati di un utente in formato JSON e CSV (GDPR compliant).
Genera un file ZIP scaricabile.
"""

import asyncio
import json
import csv
import io
import zipfile
import os
from datetime import datetime, timezone
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv()

MONGO_URL = os.environ.get("MONGO_URL")
DB_NAME = os.environ.get("DB_NAME", "map_your_friends")
EXPORT_DIR = os.path.join(os.path.dirname(__file__), '..', '.tmp', 'exports')


README_CONTENT = """# MapYourFriends Data Export
Generated: {timestamp}

This archive contains all your personal data stored in MapYourFriends.

## Files Included

- profile.json - Your profile information
- friends_imported.json - Friends you manually imported
- friends_imported.csv - Same data in spreadsheet format
- friends_registered.json - Your registered friends (public info only)
- groups.json - Groups you created
- messages_sent.json - Messages you sent
- messages_received.json - Messages you received
- meetups.json - Meetups you created or joined
- stats.json - Your calculated statistics

## Data Retention

After account deletion, data is retained for 30 days before permanent removal.
You can cancel deletion during this period.

## Questions?

Contact: support@mapyourfriends.com
"""


async def export_user_data(user_id: str, output_dir: str = None) -> str:
    """
    Esporta tutti i dati di un utente.
    
    Returns: path to the generated ZIP file
    """
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]
    
    if output_dir is None:
        output_dir = EXPORT_DIR
    
    os.makedirs(output_dir, exist_ok=True)
    
    try:
        # 1. Profile data
        user = await db.users.find_one({"user_id": user_id}, {"_id": 0})
        if not user:
            raise ValueError(f"User {user_id} not found")
        
        print(f"📦 Exporting data for: {user.get('name', user_id)}")
        
        # 2. Imported friends
        imported_friends = await db.imported_friends.find(
            {"owner_id": user_id},
            {"_id": 0}
        ).to_list(10000)
        print(f"   - {len(imported_friends)} imported friends")
        
        # 3. Registered friends (public info only)
        friendships = await db.friendships.find({
            "$or": [{"user_id": user_id}, {"friend_id": user_id}],
            "status": "accepted"
        }).to_list(1000)
        
        friend_ids = []
        for f in friendships:
            friend_ids.append(f["friend_id"] if f["user_id"] == user_id else f["user_id"])
        
        registered_friends = await db.users.find(
            {"user_id": {"$in": friend_ids}},
            {"_id": 0, "email": 0}  # Exclude private info
        ).to_list(1000)
        print(f"   - {len(registered_friends)} registered friends")
        
        # 4. Groups
        groups = await db.groups.find(
            {"owner_id": user_id},
            {"_id": 0}
        ).to_list(100)
        print(f"   - {len(groups)} groups")
        
        # 5. Messages sent
        messages_sent = await db.messages.find(
            {"from_user_id": user_id},
            {"_id": 0}
        ).to_list(10000)
        print(f"   - {len(messages_sent)} messages sent")
        
        # 6. Messages received
        messages_received = await db.messages.find(
            {"to_user_id": user_id},
            {"_id": 0}
        ).to_list(10000)
        print(f"   - {len(messages_received)} messages received")
        
        # 7. Meetups
        meetups = await db.meetups.find({
            "$or": [
                {"creator_id": user_id},
                {"attendee_ids": user_id}
            ]
        }, {"_id": 0}).to_list(1000)
        print(f"   - {len(meetups)} meetups")
        
        # 8. Stats
        stats = await db.user_stats.find_one({"user_id": user_id}, {"_id": 0})
        
        # Convert datetime objects for JSON serialization
        def json_serializer(obj):
            if isinstance(obj, datetime):
                return obj.isoformat()
            raise TypeError(f"Object of type {type(obj)} is not JSON serializable")
        
        # Create ZIP file
        timestamp = datetime.now(timezone.utc).strftime("%Y-%m-%d_%H%M%S")
        zip_filename = f"export_mapyourfriends_{timestamp}.zip"
        zip_path = os.path.join(output_dir, zip_filename)
        
        with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zf:
            # README
            zf.writestr("README.txt", README_CONTENT.format(
                timestamp=datetime.now(timezone.utc).isoformat()
            ))
            
            # Profile
            zf.writestr("profile.json", json.dumps(user, indent=2, default=json_serializer))
            
            # Imported friends JSON
            zf.writestr("friends_imported.json", json.dumps(
                imported_friends, indent=2, default=json_serializer
            ))
            
            # Imported friends CSV
            if imported_friends:
                csv_buffer = io.StringIO()
                fieldnames = ["first_name", "last_name", "city", "email", "phone", 
                             "city_lat", "city_lng", "geocode_status", "created_at"]
                writer = csv.DictWriter(csv_buffer, fieldnames=fieldnames, extrasaction='ignore')
                writer.writeheader()
                for friend in imported_friends:
                    row = {k: friend.get(k, "") for k in fieldnames}
                    if isinstance(row.get("created_at"), datetime):
                        row["created_at"] = row["created_at"].isoformat()
                    writer.writerow(row)
                zf.writestr("friends_imported.csv", csv_buffer.getvalue())
            
            # Registered friends
            zf.writestr("friends_registered.json", json.dumps(
                registered_friends, indent=2, default=json_serializer
            ))
            
            # Groups
            zf.writestr("groups.json", json.dumps(groups, indent=2, default=json_serializer))
            
            # Messages
            zf.writestr("messages_sent.json", json.dumps(
                messages_sent, indent=2, default=json_serializer
            ))
            zf.writestr("messages_received.json", json.dumps(
                messages_received, indent=2, default=json_serializer
            ))
            
            # Meetups
            zf.writestr("meetups.json", json.dumps(meetups, indent=2, default=json_serializer))
            
            # Stats
            if stats:
                zf.writestr("stats.json", json.dumps(stats, indent=2, default=json_serializer))
        
        # Get file size
        file_size = os.path.getsize(zip_path)
        file_size_mb = file_size / (1024 * 1024)
        
        print(f"\n✅ Export complete!")
        print(f"   File: {zip_path}")
        print(f"   Size: {file_size_mb:.2f} MB")
        
        return zip_path
        
    finally:
        client.close()


async def main():
    import sys
    
    if len(sys.argv) < 2:
        print("Usage: python export_user_data.py <user_id>")
        print("\nExample:")
        print("  python export_user_data.py user_abc123")
        sys.exit(1)
    
    user_id = sys.argv[1]
    await export_user_data(user_id)


if __name__ == "__main__":
    asyncio.run(main())

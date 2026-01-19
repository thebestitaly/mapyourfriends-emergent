#!/usr/bin/env python3
"""
Script: calculate_user_stats.py
Direttiva: 08_gamification_stats.md

Calcola le statistiche di un utente e assegna i badge.
Può essere eseguito come one-shot o schedulato come cron.
"""

import asyncio
from datetime import datetime, timezone
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv
from collections import Counter

load_dotenv()

# Configurazione
MONGO_URL = os.environ.get("MONGO_URL")
DB_NAME = os.environ.get("DB_NAME", "map_your_friends")

# Mappatura continenti
COUNTRY_TO_CONTINENT = {
    # Europe
    "Italy": "Europe", "Germany": "Europe", "France": "Europe", "Spain": "Europe",
    "United Kingdom": "Europe", "UK": "Europe", "Netherlands": "Europe", "Belgium": "Europe",
    "Switzerland": "Europe", "Austria": "Europe", "Portugal": "Europe", "Poland": "Europe",
    "Sweden": "Europe", "Norway": "Europe", "Denmark": "Europe", "Finland": "Europe",
    "Ireland": "Europe", "Greece": "Europe", "Czech Republic": "Europe", "Romania": "Europe",
    # Asia
    "Japan": "Asia", "China": "Asia", "South Korea": "Asia", "India": "Asia",
    "Thailand": "Asia", "Vietnam": "Asia", "Singapore": "Asia", "Indonesia": "Asia",
    "Malaysia": "Asia", "Philippines": "Asia", "Taiwan": "Asia", "Hong Kong": "Asia",
    # Americas
    "United States": "Americas", "USA": "Americas", "Canada": "Americas", "Mexico": "Americas",
    "Brazil": "Americas", "Argentina": "Americas", "Colombia": "Americas", "Chile": "Americas",
    # Africa
    "South Africa": "Africa", "Egypt": "Africa", "Morocco": "Africa", "Kenya": "Africa",
    "Nigeria": "Africa", "Ghana": "Africa",
    # Oceania
    "Australia": "Oceania", "New Zealand": "Oceania",
}

# Definizione Badge
BADGES = {
    "early_adopter": {
        "name": "Early Adopter",
        "description": "Tra i primi utenti",
        "icon": "🚀",
        "check": lambda stats, user: True  # Da implementare con data lancio
    },
    "first_friend": {
        "name": "First Friend",
        "description": "Hai aggiunto il tuo primo amico",
        "icon": "👋",
        "check": lambda stats, user: stats["total_friends"] >= 1
    },
    "social_starter": {
        "name": "Social Starter",
        "description": "10+ amici mappati",
        "icon": "🌱",
        "check": lambda stats, user: stats["total_friends"] >= 10
    },
    "social_butterfly": {
        "name": "Social Butterfly",
        "description": "50+ amici mappati",
        "icon": "🦋",
        "check": lambda stats, user: stats["total_friends"] >= 50
    },
    "network_master": {
        "name": "Network Master",
        "description": "100+ amici mappati",
        "icon": "👑",
        "check": lambda stats, user: stats["total_friends"] >= 100
    },
    "city_explorer": {
        "name": "City Explorer",
        "description": "Amici in 5+ città",
        "icon": "🏙️",
        "check": lambda stats, user: stats["unique_cities"] >= 5
    },
    "globetrotter": {
        "name": "Globetrotter",
        "description": "Amici in 10+ paesi",
        "icon": "🌍",
        "check": lambda stats, user: stats["unique_countries"] >= 10
    },
    "world_citizen": {
        "name": "World Citizen",
        "description": "Amici in 20+ paesi",
        "icon": "🌐",
        "check": lambda stats, user: stats["unique_countries"] >= 20
    },
    "european_network": {
        "name": "European Network",
        "description": "Amici in 5+ paesi europei",
        "icon": "🇪🇺",
        "check": lambda stats, user: stats.get("continents_breakdown", {}).get("Europe", 0) >= 5
    },
    "asia_explorer": {
        "name": "Asia Explorer",
        "description": "Amici in 3+ paesi asiatici",
        "icon": "🏯",
        "check": lambda stats, user: stats.get("continents_breakdown", {}).get("Asia", 0) >= 3
    },
    "americas_connector": {
        "name": "Americas Connector",
        "description": "Amici in 2+ paesi americani",
        "icon": "🗽",
        "check": lambda stats, user: stats.get("continents_breakdown", {}).get("Americas", 0) >= 2
    },
    "multi_continental": {
        "name": "Multi-Continental",
        "description": "Amici in 3+ continenti",
        "icon": "✈️",
        "check": lambda stats, user: stats["unique_continents"] >= 3
    },
    "meetup_starter": {
        "name": "Meetup Starter",
        "description": "Hai organizzato il primo meetup",
        "icon": "📅",
        "check": lambda stats, user: stats.get("meetups_created", 0) >= 1
    },
    "meetup_master": {
        "name": "Meetup Master",
        "description": "5+ meetup organizzati",
        "icon": "🎉",
        "check": lambda stats, user: stats.get("meetups_created", 0) >= 5
    },
}


def extract_country_from_city(display_name: str) -> str:
    """Estrae il paese da un display_name geocodificato."""
    if not display_name:
        return None
    parts = display_name.split(",")
    if parts:
        return parts[-1].strip()
    return None


async def calculate_stats_for_user(db, user_id: str) -> dict:
    """Calcola tutte le statistiche per un utente."""
    
    # Conta amici registrati (friendships accettate)
    friendships = await db.friendships.find({
        "$or": [{"user_id": user_id}, {"friend_id": user_id}],
        "status": "accepted"
    }).to_list(1000)
    total_registered = len(friendships)
    
    # Prendi info degli amici registrati
    friend_ids = []
    for f in friendships:
        if f["user_id"] == user_id:
            friend_ids.append(f["friend_id"])
        else:
            friend_ids.append(f["user_id"])
    
    registered_friends = await db.users.find(
        {"user_id": {"$in": friend_ids}},
        {"active_city": 1, "active_city_lat": 1, "active_city_lng": 1}
    ).to_list(1000)
    
    # Conta amici importati
    imported_friends = await db.imported_friends.find(
        {"owner_id": user_id},
        {"city": 1, "display_name": 1, "city_lat": 1, "city_lng": 1}
    ).to_list(5000)
    total_imported = len(imported_friends)
    
    # Raccogli città e paesi
    cities = set()
    countries = Counter()
    
    for friend in registered_friends:
        if friend.get("active_city"):
            cities.add(friend["active_city"])
    
    for friend in imported_friends:
        if friend.get("city"):
            cities.add(friend["city"])
        country = extract_country_from_city(friend.get("display_name", ""))
        if country:
            countries[country] += 1
    
    # Calcola continenti
    continents = Counter()
    for country, count in countries.items():
        continent = COUNTRY_TO_CONTINENT.get(country, "Other")
        continents[continent] += count
    
    # Conta meetup creati
    meetups_created = await db.meetups.count_documents({"creator_id": user_id})
    
    # Conta messaggi inviati
    messages_sent = await db.messages.count_documents({"from_user_id": user_id})
    
    stats = {
        "user_id": user_id,
        "total_friends": total_registered + total_imported,
        "total_imported": total_imported,
        "total_registered": total_registered,
        "unique_cities": len(cities),
        "unique_countries": len(countries),
        "unique_continents": len([c for c in continents if c != "Other"]),
        "countries_breakdown": dict(countries),
        "continents_breakdown": dict(continents),
        "meetups_created": meetups_created,
        "messages_sent": messages_sent,
        "badges_earned": [],
        "last_calculated": datetime.now(timezone.utc)
    }
    
    return stats


def check_badges(stats: dict, user: dict = None) -> list:
    """Verifica quali badge l'utente ha guadagnato."""
    earned = []
    for badge_id, badge_def in BADGES.items():
        try:
            if badge_def["check"](stats, user):
                earned.append(badge_id)
        except Exception as e:
            print(f"Error checking badge {badge_id}: {e}")
    return earned


async def update_user_stats(user_id: str):
    """Calcola e salva le stats per un singolo utente."""
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]
    
    try:
        # Calcola stats
        stats = await calculate_stats_for_user(db, user_id)
        
        # Check badges
        stats["badges_earned"] = check_badges(stats)
        
        # Upsert stats
        await db.user_stats.update_one(
            {"user_id": user_id},
            {"$set": stats},
            upsert=True
        )
        
        print(f"✅ Stats updated for {user_id}")
        print(f"   Friends: {stats['total_friends']} ({stats['total_registered']} reg, {stats['total_imported']} imp)")
        print(f"   Cities: {stats['unique_cities']}, Countries: {stats['unique_countries']}, Continents: {stats['unique_continents']}")
        print(f"   Badges: {', '.join(stats['badges_earned']) or 'None yet'}")
        
        return stats
        
    finally:
        client.close()


async def update_all_users_stats():
    """Ricalcola stats per tutti gli utenti."""
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]
    
    try:
        users = await db.users.find({}, {"user_id": 1}).to_list(10000)
        print(f"Updating stats for {len(users)} users...")
        
        for i, user in enumerate(users):
            await update_user_stats(user["user_id"])
            if (i + 1) % 10 == 0:
                print(f"Progress: {i + 1}/{len(users)}")
        
        print(f"\n✅ All stats updated!")
        
    finally:
        client.close()


if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1:
        user_id = sys.argv[1]
        print(f"Calculating stats for user: {user_id}")
        asyncio.run(update_user_stats(user_id))
    else:
        print("Usage:")
        print("  python calculate_user_stats.py <user_id>   # Single user")
        print("  python calculate_user_stats.py --all       # All users")
        
        if len(sys.argv) > 1 and sys.argv[1] == "--all":
            asyncio.run(update_all_users_stats())

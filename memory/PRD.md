# Map Your Friends - PRD

## Project Overview
**Name:** Map Your Friends  
**Vision:** Premium Social Mapping Experience - a map-first, emotionally engaging social utility that allows users to visualize and activate their real-world network across cities.

## Tech Stack
- **Frontend:** React 18 + Tailwind CSS + Framer Motion + Leaflet
- **Backend:** FastAPI (Python) 
- **Database:** MongoDB
- **Auth:** Emergent-managed Google OAuth
- **Geocoding:** OpenStreetMap Nominatim API

## Core Requirements (Static)
1. **Map-first interface** - Full-screen map as the main canvas
2. **Glassmorphism UI** - Premium glass panels with backdrop blur
3. **Friend markers** - Active (living) and competent (knows well) city markers
4. **Travel Mode** - Find connections before arriving at destination
5. **Meetups** - Organize gatherings in any city
6. **Simple Inbox** - Basic messaging without real-time chat
7. **Profile management** - Bio, current city, availability tags
8. **CSV Import** - Import friends from CSV with automatic geocoding

## User Personas
1. **Traveler** - Uses Travel Mode to find connections before trips
2. **Networker** - Manages friends across cities, tracks who knows what cities well
3. **Host** - Creates meetups and invites friends visiting their city
4. **Importer** - Imports existing contacts from spreadsheets

## What's Been Implemented ✅

### Jan 17, 2026 - MVP Complete
- ✅ Landing page with Google OAuth integration
- ✅ Full-screen Leaflet map with CartoDB Positron tiles
- ✅ Glassmorphism sidebar with icon navigation
- ✅ Friend markers (active/competent cities)
- ✅ Friend cards with availability tags
- ✅ Travel Mode overlay with destination input
- ✅ Meetups creation and listing
- ✅ Simple inbox for messages
- ✅ Profile modal with bio, city, coordinates, availability
- ✅ Search users functionality
- ✅ Friend requests flow
- ✅ Filter chips (Tutti, Vivono, Conoscono, Importati)

### Jan 17, 2026 - CSV Import Feature
- ✅ CSV upload modal with drag & drop UI
- ✅ Automatic geocoding via OpenStreetMap Nominatim
- ✅ Imported friends displayed with pink/purple markers
- ✅ Edit imported friend modal
- ✅ Manual position adjustment for failed geocodes
- ✅ Re-geocode functionality
- ✅ Delete imported friend
- ✅ Support for: Nome, Cognome, Città, Email, Telefono

### Backend APIs
- `/api/auth/*` - Authentication endpoints
- `/api/users/me` - Profile management
- `/api/friends/*` - Friends management
- `/api/meetups/*` - Meetups CRUD
- `/api/messages/*` - Messaging
- `/api/search/users` - User search
- `/api/imported-friends/*` - CSV imported friends CRUD
- `/api/imported-friends/csv` - CSV upload with geocoding
- `/api/geocode` - Single city geocoding

## Prioritized Backlog

### P0 - Critical (Next Sprint)
- [ ] City autocomplete in profile/meetup forms
- [ ] Photo upload for imported friends

### P1 - High Priority
- [ ] Competent cities management in profile
- [ ] Meetup invitations and RSVP
- [ ] Message threading/conversations
- [ ] Bulk edit/delete for imported friends

### P2 - Nice to Have
- [ ] Export friends to CSV
- [ ] City-based meetup suggestions
- [ ] Dark mode toggle
- [ ] Notification system

## Next Tasks
1. Add city autocomplete with geocoding suggestions
2. Implement photo upload for imported friends
3. Add competent cities editor in profile
4. Bulk operations for imported friends

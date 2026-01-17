# Map Your Friends - PRD

## Project Overview
**Name:** Map Your Friends  
**Vision:** Premium Social Mapping Experience - a map-first, emotionally engaging social utility that allows users to visualize and activate their real-world network across cities.

## Tech Stack
- **Frontend:** React 18 + Tailwind CSS + Framer Motion + Leaflet
- **Backend:** FastAPI (Python) 
- **Database:** MongoDB
- **Auth:** Emergent-managed Google OAuth

## Core Requirements (Static)
1. **Map-first interface** - Full-screen map as the main canvas
2. **Glassmorphism UI** - Premium glass panels with backdrop blur
3. **Friend markers** - Active (living) and competent (knows well) city markers
4. **Travel Mode** - Find connections before arriving at destination
5. **Meetups** - Organize gatherings in any city
6. **Simple Inbox** - Basic messaging without real-time chat
7. **Profile management** - Bio, current city, availability tags

## User Personas
1. **Traveler** - Uses Travel Mode to find connections before trips
2. **Networker** - Manages friends across cities, tracks who knows what cities well
3. **Host** - Creates meetups and invites friends visiting their city

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
- ✅ Filter chips (All Cities, Living In, Knows Well)

### Backend APIs
- `/api/auth/session` - OAuth session exchange
- `/api/auth/me` - Current user
- `/api/auth/logout` - Logout
- `/api/users/me` - Profile update
- `/api/friends` - Friends list
- `/api/friends/map` - Friends with location data
- `/api/friends/request` - Send friend request
- `/api/friends/requests` - Pending requests
- `/api/friends/accept/{id}` - Accept request
- `/api/meetups` - CRUD meetups
- `/api/messages/inbox` - Inbox
- `/api/search/users` - Search users

## Prioritized Backlog

### P0 - Critical (Next Sprint)
- [ ] City autocomplete with geocoding API
- [ ] Friend card "Ask Advice" sends message
- [ ] Friend card "Request Intro" functionality

### P1 - High Priority
- [ ] Competent cities management in profile
- [ ] Meetup invitations and RSVP
- [ ] Message threading/conversations
- [ ] Zoom to friend location on click

### P2 - Nice to Have
- [ ] Friend request notifications
- [ ] City-based meetup suggestions
- [ ] Export network visualization
- [ ] Dark mode toggle

## Next Tasks
1. Add geocoding for city search (OpenStreetMap Nominatim)
2. Implement "Ask Advice" message flow
3. Add competent cities editor in profile
4. Improve friend card interactions

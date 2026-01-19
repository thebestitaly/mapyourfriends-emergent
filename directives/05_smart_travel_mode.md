# Direttiva 05: Travel Mode Intelligente

## Obiettivo
Trasformare il Travel Mode da input vuoto a feature killer che suggerisce chi contattare quando viaggi.

## Problema
Attualmente Travel Mode:
- Mostra solo un input per la città
- Non fa nulla di utile
- Non suggerisce azioni

## Input
- Lista amici (registrati + importati) con città
- Città destinazione inserita dall'utente
- API geocoding esistente

## Output

### Funzionalità
1. **Autocomplete città** con suggestions
2. **Lista amici nella destinazione** (match esatto + raggio 50km)
3. **Amici che conoscono la città** (competent_cities)
4. **Suggerimenti azione**:
   - "Scrivi a Mario" → apre composer messaggio
   - "Crea meetup" → pre-compila modal con città/data
   - "Chiedi consiglio" → template messaggio
5. **Info città** (opzionale): weather, timezone, tips

### Backend - Nuovi Endpoint
```
GET /api/travel/search?city={name}
# Response:
{
  "city": {
    "name": "Tokyo",
    "country": "Japan", 
    "lat": 35.6762,
    "lng": 139.6503,
    "timezone": "Asia/Tokyo"
  },
  "friends_living": [
    {"user_id": "...", "name": "Marco", "type": "registered"},
    {"friend_id": "...", "name": "Yuki", "type": "imported"}
  ],
  "friends_know_city": [
    {"user_id": "...", "name": "Luca", "visited_times": 3}
  ],
  "total_connections": 5
}
```

### Frontend - UI Redesign
```
┌─────────────────────────────────────────────┐
│  🛫 Where are you traveling?                │
│  ┌─────────────────────────────────────┐   │
│  │ Tokyo, Japan                    🔍  │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  📍 2 friends live in Tokyo                 │
│  ┌─────────────────────────────────────┐   │
│  │ 👤 Marco (registered)  [Message]    │   │
│  │ 👤 Yuki (imported)     [WhatsApp]   │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  🧠 3 friends know Tokyo                    │
│  ┌─────────────────────────────────────┐   │
│  │ 👤 Luca - visited 3 times           │   │
│  │ 👤 Anna - lived 2 years             │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  [📅 Create Meetup]  [💬 Ask for Tips]     │
└─────────────────────────────────────────────┘
```

## Procedura
1. Creare endpoint `/api/travel/search`
2. Implementare matching città (fuzzy + geocoding)
3. Implementare ricerca amici per città
4. Redesign componente TravelMode
5. Aggiungere autocomplete con debounce
6. Creare azioni quick (message, meetup)
7. Zoom mappa su destinazione con marker amici

## Script da Usare
- `execution/create_travel_endpoint.py` - Backend Travel API
- `execution/city_matcher.py` - Utility matching fuzzy città

## Criteri di Successo
- [ ] Autocomplete città funziona (< 300ms)
- [ ] Mostra amici nella città e dintorni (50km)
- [ ] Mostra amici che conoscono la città
- [ ] Click su amico → flyTo sulla mappa
- [ ] Quick action "Message" funziona
- [ ] Quick action "Create Meetup" pre-compila modal

## Casi Limite
- Nessun amico nella città: "Non conosci nessuno qui. Vuoi esplorare chi è vicino?"
- Città ambigua (es. "Paris"): mostrare dropdown selezione paese
- Città non trovata: "Città non trovata. Prova con un nome diverso."
- Rate limit geocoding: cache risultati per 24h

## Nice to Have (v2)
- Integrazione Airbnb/Booking per date viaggio
- Weather forecast destinazione
- Fuso orario e "best time to call"
- Flight deals (Skyscanner API)

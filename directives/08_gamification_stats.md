# Direttiva 08: Gamification & Statistiche

## Obiettivo
Aggiungere elementi di gamification e dashboard statistiche per aumentare engagement e retention.

## Problema
Attualmente:
- Nessun incentivo a tornare
- Nessun dato interessante sulla propria rete
- Nessun senso di progresso

## Input
- Dati amici esistenti
- Location history (direttiva 07)
- Attività utente

## Output

### Dashboard Statistiche
```
┌─────────────────────────────────────────────────────────┐
│  📊 Your Network Stats                                  │
│                                                         │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐   │
│  │   47    │  │   23    │  │    4    │  │   12    │   │
│  │ Friends │  │ Cities  │  │Continents│ │ Groups  │   │
│  └─────────┘  └─────────┘  └─────────┘  └─────────┘   │
│                                                         │
│  🌍 Geographic Distribution                             │
│  ████████████████ Europe (28)                          │
│  ████████        Asia (14)                             │
│  ████            Americas (5)                          │
│                                                         │
│  📈 Network Growth                                      │
│  [chart: amici aggiunti per mese]                      │
│                                                         │
│  🏆 Your Badges                                         │
│  [Globetrotter] [Early Adopter] [Social Butterfly]     │
└─────────────────────────────────────────────────────────┘
```

### Sistema Badge
```python
# Badges disponibili
BADGES = {
    "early_adopter": {
        "name": "Early Adopter",
        "description": "Joined in the first month",
        "icon": "🚀",
        "condition": "created_at < launch_date + 30 days"
    },
    "globetrotter": {
        "name": "Globetrotter", 
        "description": "Friends in 10+ countries",
        "icon": "🌍",
        "condition": "unique_countries >= 10"
    },
    "social_butterfly": {
        "name": "Social Butterfly",
        "description": "50+ friends mapped",
        "icon": "🦋", 
        "condition": "total_friends >= 50"
    },
    "european_network": {
        "name": "European Network",
        "description": "Friends in 5+ European countries",
        "icon": "🇪🇺",
        "condition": "european_countries >= 5"
    },
    "asia_explorer": {
        "name": "Asia Explorer",
        "description": "Friends in 3+ Asian countries",
        "icon": "🏯",
        "condition": "asian_countries >= 3"
    },
    "meetup_master": {
        "name": "Meetup Master",
        "description": "Organized 5+ meetups",
        "icon": "🎉",
        "condition": "meetups_created >= 5"
    },
    "connector": {
        "name": "Connector",
        "description": "Introduced 3+ friends to each other",
        "icon": "🤝",
        "condition": "intros_made >= 3"
    },
    "traveler": {
        "name": "Frequent Traveler",
        "description": "Used Travel Mode 10+ times",
        "icon": "✈️",
        "condition": "travel_searches >= 10"
    }
}
```

### Backend - Nuovi Endpoint
```
GET  /api/stats/me                 # Stats personali
GET  /api/stats/me/badges          # Badge earned
GET  /api/stats/leaderboard        # Leaderboard globale (opt-in)
POST /api/stats/leaderboard/join   # Opt-in leaderboard
```

### Schema Stats (cached)
```python
# Collezione: user_stats (aggiornato periodicamente)
{
    "user_id": "user_xyz",
    "total_friends": 47,
    "total_imported": 35,
    "total_registered": 12,
    "unique_cities": 23,
    "unique_countries": 15,
    "unique_continents": 4,
    "countries_breakdown": {"Italy": 12, "UK": 8, ...},
    "continents_breakdown": {"Europe": 28, "Asia": 14, ...},
    "badges_earned": ["early_adopter", "globetrotter"],
    "meetups_created": 3,
    "messages_sent": 45,
    "travel_searches": 8,
    "last_calculated": "2024-01-15T10:00:00Z"
}
```

## Procedura
1. Creare collezione `user_stats`
2. Implementare job calcolo stats (on-demand o cron)
3. Creare endpoint stats
4. Implementare logica badge
5. Creare UI dashboard stats
6. (Opzionale) Leaderboard

## Script da Usare
- `execution/calculate_user_stats.py` - Calcolo stats
- `execution/check_badges.py` - Verifica badge earned
- `execution/generate_leaderboard.py` - Genera leaderboard

## Criteri di Successo
- [ ] Dashboard stats mostra dati corretti
- [ ] Badge assegnati automaticamente
- [ ] Stats aggiornate entro 1 ora da modifiche
- [ ] UI visivamente accattivante
- [ ] Leaderboard opt-in funzionante

## Casi Limite
- Utente nuovo: mostra "Start mapping!" invece di 0
- Badge revocato: se condizione non più vera, keep badge
- Cache stats: invalidare su ogni modifica amici

## Gamification Psychology
- Mostrare sempre il "next milestone" (es. "3 more countries for Globetrotter!")
- Celebrare nuovi badge con animazione/toast
- Share badge su social (opzionale)

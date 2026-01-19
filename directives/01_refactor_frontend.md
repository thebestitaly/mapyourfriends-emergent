# Direttiva 01: Refactoring Frontend - Architettura Componenti

## Obiettivo
Spezzare il file monolitico `Dashboard.jsx` (2000+ righe) in componenti riutilizzabili e mantenibili.

## Problema
Un singolo file da 2000+ righe è impossibile da:
- Mantenere
- Testare
- Debuggare
- Far evolvere

## Input
- `frontend/src/pages/Dashboard.jsx` - File monolitico attuale

## Output
Struttura componenti modulare:
```
frontend/src/
├── components/
│   ├── Map/
│   │   ├── MapView.jsx           # Container mappa principale
│   │   ├── MapController.jsx     # Controllo flyTo, zoom
│   │   ├── FriendMarker.jsx      # Marker amico registrato
│   │   ├── ImportedMarker.jsx    # Marker amico importato
│   │   └── MarkerCluster.jsx     # Wrapper cluster
│   ├── Friends/
│   │   ├── FriendCard.jsx        # Card dettaglio amico
│   │   ├── FriendsList.jsx       # Lista amici sidebar
│   │   ├── FriendRequest.jsx     # Richiesta amicizia
│   │   └── ImportedFriendCard.jsx
│   ├── Modals/
│   │   ├── ProfileModal.jsx      # Modal profilo utente
│   │   ├── SearchModal.jsx       # Modal ricerca utenti
│   │   ├── ImportModal.jsx       # Modal import CSV
│   │   ├── MeetupModal.jsx       # Modal creazione meetup
│   │   └── AddFriendModal.jsx    # Modal aggiunta manuale
│   ├── Layout/
│   │   ├── Sidebar.jsx           # Sidebar navigazione
│   │   ├── Header.jsx            # Header con search/notifiche
│   │   └── FilterChips.jsx       # Filtri mappa
│   └── ui/                       # Componenti base (già esistente)
├── hooks/
│   ├── useAuth.js                # Hook autenticazione
│   ├── useFriends.js             # Hook fetch amici
│   ├── useMap.js                 # Hook stato mappa
│   └── useApi.js                 # Hook chiamate API generiche
├── services/
│   └── api.js                    # Service layer API
└── pages/
    ├── Dashboard.jsx             # Ora solo orchestrazione
    └── LandingPage.jsx           # Invariato
```

## Procedura
1. Creare le cartelle della nuova struttura
2. Estrarre `services/api.js` con tutte le chiamate API
3. Creare hooks custom per la logica di stato
4. Estrarre componenti Map (prima i più indipendenti)
5. Estrarre componenti Modals
6. Estrarre componenti Layout
7. Refactoring Dashboard come orchestratore
8. Test manuale di ogni componente

## Script da Usare
- `execution/create_component_structure.py` - Crea la struttura cartelle
- `execution/extract_api_service.py` - Estrae service layer

## Criteri di Successo
- [ ] Nessun file > 300 righe
- [ ] Dashboard.jsx < 200 righe
- [ ] Ogni componente ha una sola responsabilità
- [ ] Zero regressioni funzionali

## Note
- Non usare context API per tutto, solo dove necessario
- Mantenere la prop drilling per 1-2 livelli (va bene)
- Usare hooks custom per logica condivisa

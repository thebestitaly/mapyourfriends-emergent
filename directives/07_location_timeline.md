# Direttiva 07: Timeline degli Spostamenti

## Obiettivo
Tracciare la storia degli spostamenti degli amici e visualizzarla come timeline/animazione.

## Problema
Attualmente:
- Non c'è storico delle città
- "Dove viveva Marco 2 anni fa?" → impossibile saperlo
- Nessuna visualizzazione delle migrazioni

## Input
- Campo `active_city` esistente negli utenti
- Amici importati con città

## Output

### Schema Location History
```python
# Collezione: location_history
{
    "history_id": "hist_abc123",
    "user_id": "user_xyz",           # oppure imported_friend_id
    "entity_type": "user",           # "user" | "imported_friend"
    "city": "Milano",
    "country": "Italy",
    "lat": 45.4642,
    "lng": 9.1900,
    "start_date": "2022-03-01",      # Quando si è trasferito
    "end_date": "2024-01-15",        # null = ancora lì
    "source": "user_update",         # "user_update" | "import" | "manual"
    "created_at": "2024-01-15T10:00:00Z"
}
```

### Backend - Modifiche
1. **Trigger automatico**: quando `active_city` cambia, crea record storico
2. **Nuovi endpoint**:
```
GET  /api/users/{user_id}/location-history
GET  /api/imported-friends/{friend_id}/location-history
POST /api/users/me/location-history     # Aggiungi manualmente passato
```

### Frontend - UI

**1. Timeline Amico** (nel friend card espanso)
```
┌─────────────────────────────────────────────┐
│  📍 Location History                        │
│                                             │
│  ●━━━━━━━●━━━━━━━●━━━━━━━●                 │
│  Roma    Milano  Londra   Tokyo             │
│  2018    2020    2022     2024              │
│                                             │
│  Currently: Tokyo, Japan (since Jan 2024)   │
└─────────────────────────────────────────────┘
```

**2. Animazione Mappa** (feature avanzata)
- Slider temporale in basso
- Play/pause animazione
- Marker si muovono sulla mappa nel tempo
- "Film della tua rete"

**3. Stats Globali**
- "I tuoi amici hanno vissuto in 45 città"
- "Paese più popolare: UK (12 amici)"

## Procedural  
1. Creare collezione `location_history`
2. Modificare `update_user` per creare history record
3. Migrare dati esistenti (snapshot attuale come primo record)
4. Creare endpoint lettura history
5. UI timeline nel friend card
6. (Opzionale) Animazione mappa

## Script da Usare
- `execution/migrate_location_history.py` - Migrazione iniziale
- `execution/track_location_change.py` - Utility tracking

## Criteri di Successo
- [ ] Cambio città crea record automatico
- [ ] Timeline visibile nel profilo amico
- [ ] Storico accessibile via API
- [ ] Migrazione dati esistenti completata
- [ ] Stats aggregate funzionanti

## Casi Limite
- Prima volta: data_start = data creazione account
- Città uguale: non creare duplicato
- Import CSV con date: parsare se presente, altrimenti oggi
- Amico rimosso: mantenere history per stats (anonimizzato)

## Privacy
- History visibile solo al proprietario della mappa
- Amici registrati controllano la propria history
- "Nascondi history" opzione per amici registrati

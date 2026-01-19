# Direttiva 04: PWA + Notifiche Push

## Obiettivo
Trasformare MapYourFriends in una Progressive Web App con supporto offline e notifiche push.

## Problema
Attualmente:
- Nessuna presenza mobile (no app store)
- Nessun engagement fuori dal browser
- Non funziona offline
- Nessuna notifica per eventi importanti

## Input
- App React esistente
- Backend FastAPI

## Output

### PWA Setup
```
frontend/public/
├── manifest.json          # PWA manifest
├── sw.js                   # Service Worker
├── icons/
│   ├── icon-192.png
│   ├── icon-512.png
│   └── maskable-icon.png
```

### manifest.json
```json
{
  "name": "Map Your Friends",
  "short_name": "MapFriends",
  "description": "Mappa i tuoi amici nel mondo",
  "start_url": "/dashboard",
  "display": "standalone",
  "background_color": "#0F172A",
  "theme_color": "#06B6D4",
  "icons": [...]
}
```

### Notifiche Push - Trigger
1. **Nuovo messaggio** ricevuto
2. **Richiesta amicizia** ricevuta
3. **Amico si è spostato** (cambio città)
4. **Meetup reminder** (24h prima)
5. **Amico nelle vicinanze** (opt-in, geolocation)

### Backend - Nuovi Endpoint
```
POST /api/notifications/subscribe     # Registra subscription push
DELETE /api/notifications/unsubscribe # Rimuovi subscription
GET  /api/notifications/preferences   # Preferenze notifiche
PUT  /api/notifications/preferences   # Aggiorna preferenze
```

### Schema Notifiche
```python
# Collezione: push_subscriptions
{
    "user_id": "user_xyz",
    "endpoint": "https://fcm.googleapis.com/...",
    "keys": {
        "p256dh": "...",
        "auth": "..."
    },
    "created_at": "2024-01-15T10:00:00Z"
}

# Collezione: notification_preferences
{
    "user_id": "user_xyz",
    "new_message": True,
    "friend_request": True,
    "friend_moved": True,
    "meetup_reminder": True,
    "nearby_friend": False
}
```

## Procedura
1. Creare manifest.json e icone
2. Implementare Service Worker base (cache-first)
3. Registrare SW in index.js
4. Generare VAPID keys per push
5. Creare endpoint subscription backend
6. Integrare web-push library (pywebpush)
7. Creare UI preferenze notifiche
8. Implementare trigger notifiche

## Script da Usare
- `execution/setup_pwa.py` - Genera manifest, SW, icone placeholder
- `execution/generate_vapid_keys.py` - Genera chiavi VAPID

## Dipendenze Backend
```
pywebpush==1.14.0
```

## Criteri di Successo
- [ ] App installabile su mobile (Add to Home Screen)
- [ ] App funziona offline (cache statica)
- [ ] Notifiche push funzionano su Chrome/Firefox
- [ ] Utente può configurare preferenze notifiche
- [ ] Notifiche mostrano icona app e azione click

## Casi Limite
- Safari iOS: supporto limitato push, gestire gracefully
- Permesso negato: non richiedere di nuovo, mostrare info
- Service Worker update: gestire refresh automatico
- Offline + nuovi dati: mostrare banner "Dati non aggiornati"

## Testing
- Lighthouse PWA audit > 90
- Test su Android Chrome
- Test su iOS Safari (Add to Home Screen)

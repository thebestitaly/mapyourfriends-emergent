# Direttiva 09: Smart Suggestions (AI)

## Obiettivo
Fornire suggerimenti intelligenti basati sulla rete dell'utente per aumentare il valore del prodotto.

## Problema
Attualmente MapYourFriends è passivo:
- Non suggerisce azioni
- Non evidenzia opportunità
- Non sfrutta i pattern nella rete

## Input
- Dati amici e location history
- Travel mode searches
- Meetup history
- Messaggi inviati

## Output

### Tipi di Suggerimenti

**1. Travel Suggestions**
```
"Stai cercando Tokyo? Il tuo amico Marco ha vissuto lì 2 anni 
e può darti consigli!"
```

**2. Reconnection Reminders**
```
"Non senti Luca da 6 mesi. Vive ancora a Londra?"
```

**3. Introduction Opportunities**
```
"Anna (Milano) e Marco (Milano) non si conoscono ma hanno 
interessi simili. Vuoi presentarli?"
```

**4. Meetup Suggestions**
```
"Hai 5 amici a Roma. È il momento di un meetup!"
```

**5. Network Insights**
```
"La tua rete è forte in Europa ma debole in Asia. 
Conosci qualcuno lì?"
```

### Backend - Nuovi Endpoint
```
GET /api/suggestions                    # Lista suggerimenti
POST /api/suggestions/{id}/dismiss      # Ignora suggerimento
POST /api/suggestions/{id}/act          # Agisci su suggerimento
```

### Schema Suggestions
```python
# Collezione: suggestions
{
    "suggestion_id": "sug_abc123",
    "user_id": "user_xyz",
    "type": "reconnection",           # travel|reconnection|intro|meetup|insight
    "priority": 8,                    # 1-10
    "title": "Riconnettiti con Luca",
    "description": "Non lo senti da 6 mesi...",
    "action_type": "message",         # message|meetup|intro|none
    "action_data": {
        "to_user_id": "user_luca",
        "template": "Ciao! Come stai? È un po' che..."
    },
    "related_users": ["user_luca"],
    "created_at": "2024-01-15T10:00:00Z",
    "expires_at": "2024-02-15T10:00:00Z",
    "dismissed": False,
    "acted": False
}
```

### Algoritmi Suggerimenti

**Reconnection (cron giornaliero):**
```python
# Pseudo-code
for friend in user.friends:
    last_contact = get_last_message_or_meetup(user, friend)
    if days_since(last_contact) > 180:  # 6 mesi
        create_suggestion("reconnection", friend)
```

**Travel Match (real-time):**
```python
# Triggerato da Travel Mode search
def on_travel_search(user, destination_city):
    friends_there = get_friends_in_city(user, destination_city)
    friends_know = get_friends_who_know_city(user, destination_city)
    
    for friend in friends_know:
        if friend not in friends_there:
            create_suggestion("travel_advice", friend, destination_city)
```

**Intro Opportunities (weekly):**
```python
# Trova amici nella stessa città che non si conoscono
for city in user.friends_cities:
    friends_in_city = get_friends_in_city(user, city)
    if len(friends_in_city) >= 2:
        for pair in combinations(friends_in_city, 2):
            if not are_connected(pair[0], pair[1]):
                create_suggestion("intro", pair)
```

## Procedura
1. Creare collezione `suggestions`
2. Implementare algoritmo reconnection (cron)
3. Implementare trigger travel suggestions
4. Creare endpoint API
5. UI widget suggerimenti (sidebar o banner)
6. Tracking azioni su suggerimenti

## Script da Usare
- `execution/generate_reconnection_suggestions.py`
- `execution/generate_travel_suggestions.py`
- `execution/generate_intro_suggestions.py`
- `execution/suggestions_cron.py` - Orchestratore cron

## Criteri di Successo
- [ ] Almeno 1 suggerimento attivo per utente con >10 amici
- [ ] Suggerimenti pertinenti (no spam)
- [ ] Azioni one-click funzionanti
- [ ] Dismiss rimuove suggerimento
- [ ] Max 5 suggerimenti attivi (evita overwhelm)

## Casi Limite
- Utente nuovo: no suggestions, mostra onboarding invece
- Tutti dismissed: "Non ci sono suggerimenti. Stai gestendo bene la tua rete!"
- Suggerimento scaduto: nascondi automaticamente
- Same suggestion twice: deduplica

## Privacy Considerations
- Suggerimenti basati SOLO su dati dell'utente stesso
- Non condividere chi ha contattato chi
- Intro suggestions solo se entrambi hanno profilo pubblico

## Future: AI Enhancement
- Usare embeddings per similarity matching
- Analisi sentiment messaggi per priorità reconnection  
- Predizione "quando viaggerà" basata su pattern

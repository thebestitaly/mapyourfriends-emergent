# Direttiva 06: Import Multi-Source (Google Contacts, LinkedIn)

## Obiettivo
Permettere import automatico da Google Contacts e guidato da LinkedIn, oltre al CSV esistente.

## Problema
L'import CSV è:
- Manuale e tedioso
- Richiede preparazione file
- Non sincronizzato (one-shot)

## Input
- OAuth Google People API
- LinkedIn esportazione manuale (Privacy > Get your data)
- Parser CSV esistente

## Output

### Google Contacts Integration

**Flusso:**
1. Utente clicca "Importa da Google"
2. OAuth consent screen Google
3. Backend legge contatti con indirizzo
4. Preview contatti trovati
5. Utente seleziona quali importare
6. Geocoding + import

**Backend - Nuovi Endpoint:**
```
GET  /api/import/google/auth       # Redirect a Google OAuth
GET  /api/import/google/callback   # Callback OAuth
GET  /api/import/google/preview    # Anteprima contatti
POST /api/import/google/confirm    # Conferma import selezionati
```

**Scopes richiesti:**
```
https://www.googleapis.com/auth/contacts.readonly
```

### LinkedIn Import (Guidato)

**Flusso:**
1. Mostra istruzioni step-by-step per esportare da LinkedIn
2. Utente scarica ZIP da LinkedIn
3. Upload ZIP su MapYourFriends
4. Parser estrae `Connections.csv`
5. Geocoding città (campo "Position" o "Company")
6. Preview + selezione + import

**Backend - Nuovi Endpoint:**
```
POST /api/import/linkedin/upload   # Upload ZIP
GET  /api/import/linkedin/preview  # Anteprima estratta
POST /api/import/linkedin/confirm  # Conferma import
```

### Deduplicazione

**Logica matching:**
1. Email esatto match → merge
2. Nome + Cognome + Città match → suggerisci merge
3. Solo nome match → mostra warning, non merge automatico

**Azioni merge:**
- Mantieni dati più recenti
- Combina info mancanti (email da uno, telefono dall'altro)
- Log merge per undo

## Procedura
1. Registrare app su Google Cloud Console
2. Aggiungere OAuth scopes per Contacts
3. Implementare flusso OAuth dedicato (separato da login)
4. Creare parser Google Contacts
5. Creare parser LinkedIn ZIP
6. Implementare logica deduplicazione
7. UI modale import multi-tab

## Script da Usare
- `execution/import_google_contacts.py` - Parser Google People API
- `execution/import_linkedin_zip.py` - Parser LinkedIn export
- `execution/deduplicate_friends.py` - Logica deduplicazione

## Dipendenze Backend
```
google-api-python-client==2.100.0
google-auth-oauthlib==1.1.0
```

## Environment Variables
```
GOOGLE_CONTACTS_CLIENT_ID=...
GOOGLE_CONTACTS_CLIENT_SECRET=...
```

## Criteri di Successo
- [ ] Import Google Contacts funziona end-to-end
- [ ] Istruzioni LinkedIn chiare e funzionanti
- [ ] Preview mostra contatti trovati con città
- [ ] Deduplicazione suggerisce merge corretti
- [ ] Geocoding batch rispetta rate limit

## Casi Limite
- Contatto senza indirizzo: skip, mostra in "non importabili"
- Contatto con solo paese: geocoda capitale
- LinkedIn senza città: estrai da "Company" field
- OAuth expired: refresh token automatico
- ZIP corrotto: messaggio errore chiaro

## Privacy & GDPR
- Mostrare chiaramente cosa viene importato
- NON salvare token Google permanentemente
- Permettere eliminazione dati importati
- Log di tutti gli import per audit

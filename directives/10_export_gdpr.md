# Direttiva 10: Export & Backup Dati (GDPR Compliance)

## Obiettivo
Permettere agli utenti di esportare, backuppare e cancellare i propri dati in conformità GDPR.

## Problema
Attualmente:
- Nessun modo di esportare i propri dati
- Nessun backup utente
- Nessun delete account
- Non GDPR compliant

## Input
- Tutti i dati utente nel database
- Dati amici importati
- History, messaggi, meetup

## Output

### Funzionalità

**1. Export Completo**
- Formato: JSON + CSV (zip)
- Include: profilo, amici importati, gruppi, history, messaggi
- Download immediato o email link

**2. Backup Automatico (opt-in)**
- Weekly backup via email
- Formato JSON compresso
- Link download valido 7 giorni

**3. Delete Account**
- Soft delete prima (30 giorni recovery)
- Hard delete dopo 30 giorni
- Export obbligatorio prima del delete
- Rimuove: profilo, amici importati, messaggi
- Mantiene: anonimizzato nelle amicizie (per altri utenti)

**4. Privacy Dashboard**
- Lista dati raccolti
- Controlli privacy
- History accessi
- Connected apps (Google, etc)

### Backend - Nuovi Endpoint
```
POST /api/export/request              # Richiedi export (async)
GET  /api/export/status/{job_id}      # Stato export
GET  /api/export/download/{job_id}    # Download file
POST /api/backup/enable               # Abilita backup weekly
DELETE /api/backup/disable            # Disabilita backup
POST /api/account/delete              # Richiedi cancellazione
POST /api/account/delete/cancel       # Annulla cancellazione
GET  /api/privacy/dashboard           # Privacy overview
GET  /api/privacy/access-log          # Log accessi
```

### Schema Export Job
```python
# Collezione: export_jobs
{
    "job_id": "export_abc123",
    "user_id": "user_xyz",
    "status": "processing",      # pending|processing|completed|failed
    "format": "full",            # full|json_only|csv_only
    "file_url": null,            # S3 presigned URL quando pronto
    "file_size_bytes": null,
    "expires_at": null,          # URL scade dopo 24h
    "created_at": "2024-01-15T10:00:00Z",
    "completed_at": null,
    "error": null
}
```

### Schema Delete Request
```python
# Collezione: delete_requests
{
    "request_id": "del_abc123",
    "user_id": "user_xyz",
    "status": "pending",         # pending|cancelled|completed
    "export_job_id": "export_xyz",  # Export obbligatorio
    "reason": "Not using anymore",  # Opzionale
    "requested_at": "2024-01-15T10:00:00Z",
    "scheduled_deletion": "2024-02-14T10:00:00Z",  # +30 giorni
    "cancelled_at": null,
    "completed_at": null
}
```

### Export File Structure
```
export_mapyourfriends_2024-01-15.zip
├── profile.json           # Dati profilo
├── friends_imported.csv   # Amici importati (CSV per Excel)
├── friends_imported.json  # Amici importati (JSON)
├── friends_registered.json # Amici registrati (solo public info)
├── groups.json            # Gruppi creati
├── location_history.json  # Storico spostamenti
├── messages_sent.json     # Messaggi inviati
├── messages_received.json # Messaggi ricevuti
├── meetups.json           # Meetup creati/partecipati
├── suggestions_log.json   # Azioni su suggerimenti
└── README.txt             # Spiegazione dati
```

## Procedura
1. Creare collezioni `export_jobs`, `delete_requests`
2. Implementare export async (background job)
3. Generare ZIP con tutti i dati
4. Upload su storage (S3/local) con presigned URL
5. Implementare delete flow con 30 giorni grace
6. Creare UI privacy dashboard
7. Email notifications per export ready/delete countdown

## Script da Usare
- `execution/export_user_data.py` - Genera export
- `execution/process_delete_request.py` - Processa cancellazioni
- `execution/cleanup_expired_exports.py` - Pulizia file scaduti

## Dipendenze
```
boto3==1.28.0  # Per S3 storage (opzionale)
```

## Criteri di Successo
- [ ] Export genera file completo in < 60 secondi
- [ ] Download funziona per 24 ore
- [ ] Delete richiede conferma email
- [ ] 30 giorni grace period rispettato
- [ ] Privacy dashboard mostra tutti i dati

## GDPR Compliance Checklist
- [x] Right to access (export)
- [x] Right to erasure (delete)
- [x] Right to portability (JSON/CSV formats)
- [ ] Right to rectification (edit profile - già esistente)
- [ ] Data minimization (review dati raccolti)
- [ ] Privacy by design (già in architettura)

## Casi Limite
- Export troppo grande: chunked download o email link
- Delete con amicizie attive: anonimizza, non invalida amicizia
- Delete poi re-register: nuovo account, dati persi
- Export durante delete grace: permesso

## Email Templates
1. "Your export is ready" - link download
2. "Account deletion requested" - conferma + how to cancel  
3. "Account deletion reminder" - 7 giorni prima
4. "Account deleted" - conferma finale

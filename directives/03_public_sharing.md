# Direttiva 03: Condivisione Mappa Pubblica

## Obiettivo
Permettere agli utenti di generare un link pubblico per condividere la propria mappa (es. `mapyourfriends.com/@massimo`).

## Problema
Attualmente la mappa è visibile solo all'utente loggato. Nessun modo di:
- Mostrare la propria rete a potenziali contatti
- Embeddarla in portfolio/blog
- Condividere su social

## Input
- Dati utente e amici esistenti
- Mappa Leaflet attuale

## Output

### Backend - Nuovo Schema
```python
# Aggiunta a users collection
{
    ...existing_fields,
    "public_profile": {
        "enabled": True,
        "slug": "massimo",              # URL slug univoco
        "show_imported": True,          # Mostra amici importati
        "show_registered": True,        # Mostra amici registrati  
        "hide_emails": True,            # Privacy
        "hide_phones": True,
        "hide_last_names": False,
        "custom_title": "La mia rete globale",
        "custom_bio": "Nomade digitale...",
        "allowed_groups": ["group_1"],  # Solo alcuni gruppi (null = tutti)
        "theme": "light"                # light/dark
    }
}
```

### Backend - Nuovi Endpoint
```
GET  /api/public/@{slug}              # Dati mappa pubblica (no auth)
PUT  /api/users/me/public-profile     # Configura profilo pubblico
POST /api/users/me/public-profile/slug  # Verifica/riserva slug
```

### Frontend - Nuove Pagine
1. **Pagina pubblica** `/p/{slug}` - Mappa readonly, no sidebar
2. **Settings privacy** in modal profilo
3. **Generatore embed code** per iframe

## Procedura
1. Aggiungere campi `public_profile` allo schema utente
2. Creare endpoint pubblico (no auth required)
3. Creare pagina React `/p/:slug`
4. Aggiungere UI configurazione in ProfileModal
5. Implementare validazione slug (univocità)
6. Creare snippet embed

## Script da Usare
- `execution/add_public_profile.py` - Modifica backend
- `execution/generate_embed_code.py` - Utility generazione embed

## Criteri di Successo
- [ ] Utente può abilitare/disabilitare profilo pubblico
- [ ] Utente può scegliere slug personalizzato
- [ ] Pagina pubblica mostra mappa senza login
- [ ] Controlli privacy funzionanti (hide info)
- [ ] Embed iframe funziona su siti esterni

## Casi Limite
- Slug già preso: suggerisci alternative (massimo1, massimo_m)
- Profilo disabilitato: 404 con messaggio "Profilo privato"
- Nessun amico con location: mostra mappa vuota con messaggio
- Rate limiting: max 100 request/min per IP su endpoint pubblico

## SEO & Social
- Meta tags OpenGraph per preview su social
- Immagine preview generata dinamicamente (screenshot mappa)
- Title: "{nome} - La mia rete su MapYourFriends"

# Direttiva 02: Sistema di Gruppi/Cerchie

## Obiettivo
Permettere agli utenti di organizzare i propri amici in gruppi (es. "Famiglia", "Colleghi Milano", "Amici d'infanzia").

## Problema
Attualmente gli amici sono una lista piatta. Con 100+ amici diventa impossibile:
- Trovare chi cerchi
- Filtrare per contesto
- Visualizzare sottoinsiemi sulla mappa

## Input
- Schema MongoDB attuale (`users`, `imported_friends`, `friendships`)
- Frontend Dashboard esistente

## Output

### Backend - Nuovo Schema
```python
# Collezione: groups
{
    "group_id": "group_abc123",
    "owner_id": "user_xyz",           # Chi ha creato il gruppo
    "name": "Colleghi Milano",
    "color": "#EC4899",               # Colore marker sulla mappa
    "icon": "briefcase",              # Icona opzionale
    "member_ids": ["user_1", "user_2"],           # Amici registrati
    "imported_member_ids": ["imported_1", "imported_2"],  # Amici importati
    "created_at": "2024-01-15T10:00:00Z"
}
```

### Backend - Nuovi Endpoint
```
POST   /api/groups                    # Crea gruppo
GET    /api/groups                    # Lista gruppi utente
GET    /api/groups/{group_id}         # Dettaglio gruppo
PUT    /api/groups/{group_id}         # Modifica gruppo
DELETE /api/groups/{group_id}         # Elimina gruppo
POST   /api/groups/{group_id}/members # Aggiungi membri
DELETE /api/groups/{group_id}/members/{member_id}  # Rimuovi membro
```

### Frontend - Modifiche
1. **Filtro gruppi** nella barra filtri mappa
2. **Colori marker** diversi per gruppo
3. **Modal creazione gruppo**
4. **Drag & drop** amici in gruppi (lista amici)
5. **Multi-select** per aggiungere più amici a un gruppo

## Procedura
1. Aggiungere modelli Pydantic per Group
2. Creare endpoint CRUD gruppi
3. Modificare endpoint `/api/friends/map` per includere info gruppo
4. Aggiungere UI filtro gruppi
5. Creare modal gestione gruppi
6. Implementare assegnazione amici a gruppi

## Script da Usare
- `execution/add_groups_endpoints.py` - Genera codice backend
- `execution/migrate_groups_schema.py` - Migrazione DB (se necessario)

## Criteri di Successo
- [ ] Utente può creare gruppi con nome e colore
- [ ] Utente può aggiungere amici (registrati e importati) a gruppi
- [ ] Mappa filtra per gruppo selezionato
- [ ] Marker mostrano colore del gruppo
- [ ] Un amico può appartenere a più gruppi

## Casi Limite
- Amico in più gruppi: mostra colore del primo gruppo (o gradient)
- Gruppo vuoto: permesso, mostra placeholder
- Eliminazione gruppo: NON elimina gli amici, solo l'associazione
- Amico rimosso: rimuovere automaticamente dai gruppi

## UX Notes
- Colori predefiniti: rosa, blu, verde, arancione, viola, grigio
- Max 20 gruppi per utente (evita chaos)
- Gruppo "Tutti" sempre presente (pseudo-gruppo)

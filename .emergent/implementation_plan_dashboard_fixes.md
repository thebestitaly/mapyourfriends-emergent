# Piano di Implementazione - Dashboard & Analytics Fixes

## PRIORITÀ ALTA - Analytics & Statistics

### 1. Fix Engagement Rate Calculation ✓
**Problema**: Engagement Rate > 100% (impossibile)
**Causa**: Calcolo errato `clicks / scans` invece di `scans_with_clicks / total_scans`
**Soluzione**: 
- Modificare `calculateSummary()` in `analytics.service.ts`
- Engagement Rate = (numero di scansioni uniche che hanno generato almeno 1 click) / (totale scansioni) * 100
- Cap al 100% per sicurezza

**File da modificare**:
- `apps/api/src/analytics/analytics.service.ts` (linea 234)

### 2. Chiarire Differenza Scan vs Click
**Scan**: Quando un utente scannerizza il QR code (evento iniziale)
**Click**: Quando un utente clicca su una traduzione/video specifico

**Documentazione da aggiungere**:
- Commenti nel codice
- Tooltip nella UI

### 3. Aggiungere Statistiche alla Pagina Attività
**File**: `apps/web/src/app/dashboard/activities/[id]/page.tsx`
**Cosa aggiungere**:
- KPI cards: Total Scans, Total Clicks, Engagement Rate, Unique Devices
- Timeline chart (ultimi 30 giorni)
- Top QR Codes della attività

### 4. Aggiungere Statistiche Attività in Analytics
**File**: `apps/web/src/app/dashboard/analytics/page.tsx`
**Cosa aggiungere**:
- Filtro per attività (già presente)
- Breakdown per attività quando "Tutte le attività" è selezionato

### 5. Aggiornare Statistiche Homepage Dashboard
**File**: `apps/web/src/app/dashboard/page.tsx`
**Problemi**:
- Conteggio attività errato per user_id
- Scansioni totali = 0

**Soluzione**:
- Verificare query backend per conteggio attività
- Aggiungere chiamata API per scansioni totali

### 6. Fix Statistiche QR Code Detail Page
**File**: `apps/web/src/app/dashboard/qrcodes/[activityId]/[id]/page.tsx`
**Problemi**:
- Engagement Rate errato (213%)
- Manca area dedicata ai video

**Soluzione**:
- Usare il nuovo calcolo engagement rate
- Aggiungere sezione "Video Translations"

## PRIORITÀ MEDIA - Translations UI/UX

### 7. Formattare Testo HTML (non Markdown)
**File**: `apps/web/src/app/dashboard/components/TranslateModal.tsx`
**Problema**: Il testo viene mostrato in markdown invece di HTML formattato
**Soluzione**:
- Usare `dangerouslySetInnerHTML` per renderizzare HTML
- Sanitizzare l'HTML per sicurezza

### 8. Disabilitare Tasto "Traduci" se Traduzioni Complete
**File**: `apps/web/src/app/dashboard/components/TranslateModal.tsx`
**Logica**:
```typescript
const allTranslationsComplete = existingTranslations.length === totalLanguages;
const hasMissingTranslations = existingTranslations.length < totalLanguages;
```
- Disabilitare button se `allTranslationsComplete`
- Mostrare messaggio "Tutte le traduzioni sono già complete"

### 9. Migliorare UI "50 traduzioni già completate"
**File**: `apps/web/src/app/dashboard/components/TranslateModal.tsx`
**Design**:
```tsx
<div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-6 border-2 border-green-200 dark:border-green-700">
  <div className="flex items-start gap-4">
    <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    </div>
    <div className="flex-1">
      <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
        {existingTranslations.length} traduzioni già completate! 🎉
      </h4>
      <p className="text-sm text-gray-600 dark:text-gray-400">
        Cliccando "Traduci" verranno create solo le <strong>{totalLanguages - existingTranslations.length} traduzioni mancanti</strong>.
      </p>
      <div className="mt-3 flex items-center gap-2">
        <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-500"
            style={{ width: `${(existingTranslations.length / totalLanguages) * 100}%` }}
          />
        </div>
        <span className="text-xs font-semibold text-green-600 dark:text-green-400">
          {Math.round((existingTranslations.length / totalLanguages) * 100)}%
        </span>
      </div>
    </div>
  </div>
</div>
```

### 10. Video: Escludere Lingua Originale
**File**: `apps/web/src/app/dashboard/components/TranslateModal.tsx`
**Logica**:
```typescript
// Nel tab Video, filtrare le lingue
const availableLanguagesForVideo = ALL_LANGUAGES.filter(
  lang => lang.code !== qrcode.language // Escludi lingua originale
);
```

### 11. Aggiungere Area Video in QR Code Detail Page
**File**: `apps/web/src/app/dashboard/qrcodes/[activityId]/[id]/page.tsx`
**Sezione da aggiungere**:
- Lista video translations
- Stato (pending, processing, completed)
- Link per scaricare/visualizzare

## ORDINE DI IMPLEMENTAZIONE

1. ✅ Fix Engagement Rate (backend)
2. ✅ Fix Statistiche Homepage Dashboard
3. ✅ Fix Statistiche QR Code Detail Page
4. ✅ Aggiungere Statistiche Pagina Attività
5. ✅ Formattare Testo HTML in TranslateModal
6. ✅ Migliorare UI "traduzioni completate"
7. ✅ Disabilitare tasto se traduzioni complete
8. ✅ Escludere lingua originale per video
9. ✅ Aggiungere area video in QR Detail

## NOTE TECNICHE

### Engagement Rate Corretto
```typescript
// Invece di: clicks / scans
// Usare: scans_with_at_least_one_click / total_scans

const scansWithClicks = new Set(
  clicks.map(c => c.ip_hash + c.created_at.toDateString())
).size;
const engagementRate = totalScans > 0 
  ? Math.min(scansWithClicks / totalScans, 1.0) // Cap a 1.0 (100%)
  : 0;
```

### Sanitizzazione HTML
```typescript
import DOMPurify from 'isomorphic-dompurify';

const sanitizedHTML = DOMPurify.sanitize(qrcode.description);
<div dangerouslySetInnerHTML={{ __html: sanitizedHTML }} />
```

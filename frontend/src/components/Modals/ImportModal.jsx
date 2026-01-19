import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { FileSpreadsheet, Upload, RefreshCw, Check, MapPin, AlertCircle, X } from 'lucide-react';
import { toast } from 'sonner';

const API_URL = process.env.REACT_APP_BACKEND_URL;

export default function ImportModal({ onClose, onImported }) {
  const [uploading, setUploading] = useState(false);
  const [results, setResults] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      toast.error('Per favore seleziona un file CSV');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`${API_URL}/api/imported-friends/csv`, {
        method: 'POST',
        credentials: 'include',
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        setResults(data);
        if (data.total_imported > 0) {
          toast.success(`Importati ${data.total_imported} amici!`);
        }
      } else {
        const error = await response.json();
        toast.error(error.detail || 'Errore durante l\'importazione');
      }
    } catch (error) {
      toast.error('Errore durante l\'importazione');
    } finally {
      setUploading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm" onClick={onClose}></div>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg"
      >
        <div className="glass-panel rounded-3xl p-6 shadow-floating">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-heading font-bold text-xl text-slate-800">Importa Amici da CSV</h2>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100">
              <X className="w-5 h-5 text-slate-500" />
            </button>
          </div>

          {!results ? (
            <>
              <div className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-2xl p-6 text-center border-2 border-dashed border-pink-200">
                <FileSpreadsheet className="w-12 h-12 text-pink-400 mx-auto mb-4" />
                <p className="text-slate-700 font-medium mb-2">Carica il tuo file CSV</p>
                <p className="text-sm text-slate-500 mb-4">
                  Formato: Nome, Cognome, Città<br />
                  (opzionali: Email, Telefono)
                </p>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleFileSelect}
                  className="hidden"
                  data-testid="csv-file-input"
                />

                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  data-testid="select-csv-btn"
                  className="px-6 py-3 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 text-white font-semibold 
                             shadow-lg shadow-pink-500/30 hover:shadow-pink-500/50 transition-shadow
                             disabled:opacity-50 flex items-center gap-2 mx-auto"
                >
                  {uploading ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      Importazione in corso...
                    </>
                  ) : (
                    <>
                      <Upload className="w-5 h-5" />
                      Seleziona File
                    </>
                  )}
                </button>
              </div>

              <div className="mt-4 p-4 bg-slate-50 rounded-xl">
                <p className="text-xs text-slate-500 font-medium mb-2">Esempio CSV:</p>
                <code className="text-xs text-slate-600 block">
                  Nome,Cognome,Città<br />
                  Mario,Rossi,Milano<br />
                  Giulia,Bianchi,Roma<br />
                  Luca,Verdi,Firenze
                </code>
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-green-50 rounded-xl">
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                  <Check className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="font-semibold text-green-800">{results.total_imported} amici importati</p>
                  {results.total_failed > 0 && (
                    <p className="text-sm text-amber-600">{results.total_failed} righe non importate</p>
                  )}
                </div>
              </div>

              {results.imported?.length > 0 && (
                <div className="max-h-60 overflow-y-auto space-y-2">
                  {results.imported.map((friend, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-100">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center">
                          <span className="text-white text-sm font-bold">{friend.name?.charAt(0)}</span>
                        </div>
                        <div>
                          <p className="font-medium text-slate-700">{friend.name}</p>
                          <p className="text-xs text-slate-500">{friend.city}</p>
                        </div>
                      </div>
                      {friend.geocode_status === 'success' ? (
                        <span className="px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs">
                          <MapPin className="w-3 h-3 inline mr-1" />
                          Trovato
                        </span>
                      ) : (
                        <span className="px-2 py-1 rounded-full bg-amber-100 text-amber-700 text-xs">
                          <AlertCircle className="w-3 h-3 inline mr-1" />
                          Da verificare
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <button
                onClick={onImported}
                data-testid="close-import-results-btn"
                className="w-full px-6 py-3 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 text-white font-semibold 
                           shadow-lg shadow-pink-500/30 hover:shadow-pink-500/50 transition-shadow"
              >
                Vai alla Mappa
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

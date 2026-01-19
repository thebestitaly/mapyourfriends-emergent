import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, RefreshCw, MapPin } from 'lucide-react';
import { toast } from 'sonner';

const API_URL = process.env.REACT_APP_BACKEND_URL;

export default function EditImportedModal({ friend, onClose, onSaved }) {
  const [firstName, setFirstName] = useState(friend?.first_name || friend?.name?.split(' ')[0] || '');
  const [lastName, setLastName] = useState(friend?.last_name || friend?.name?.split(' ').slice(1).join(' ') || '');
  const [city, setCity] = useState(friend?.city || '');
  const [cityLat, setCityLat] = useState(friend?.lat || '');
  const [cityLng, setCityLng] = useState(friend?.lng || '');
  const [email, setEmail] = useState(friend?.email || '');
  const [phone, setPhone] = useState(friend?.phone || '');
  const [saving, setSaving] = useState(false);
  const [geocoding, setGeocoding] = useState(false);

  const handleGeocode = async () => {
    if (!city) {
      toast.error('Inserisci una città');
      return;
    }

    setGeocoding(true);
    try {
      const response = await fetch(`${API_URL}/api/geocode`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ city })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.status === 'success') {
          setCityLat(data.lat);
          setCityLng(data.lng);
          toast.success('Posizione trovata!');
        } else {
          toast.error('Città non trovata, inserisci le coordinate manualmente');
        }
      }
    } catch (error) {
      toast.error('Errore durante la ricerca');
    } finally {
      setGeocoding(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch(`${API_URL}/api/imported-friends/${friend.friend_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          first_name: firstName,
          last_name: lastName,
          city,
          city_lat: parseFloat(cityLat) || null,
          city_lng: parseFloat(cityLng) || null,
          email: email || null,
          phone: phone || null,
          geocode_status: cityLat && cityLng ? 'manual' : 'failed'
        })
      });

      if (response.ok) {
        const updated = await response.json();
        toast.success('Amico aggiornato!');
        onSaved({
          ...updated,
          name: `${updated.first_name} ${updated.last_name}`.trim(),
          lat: updated.city_lat,
          lng: updated.city_lng
        });
      } else {
        toast.error('Errore durante il salvataggio');
      }
    } catch (error) {
      toast.error('Errore durante il salvataggio');
    } finally {
      setSaving(false);
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
        className="relative w-full max-w-md max-h-[90vh] overflow-y-auto"
      >
        <div className="glass-panel rounded-3xl p-6 shadow-floating">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-heading font-bold text-xl text-slate-800">Modifica Amico</h2>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100">
              <X className="w-5 h-5 text-slate-500" />
            </button>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1.5 block">Nome</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  data-testid="edit-first-name-input"
                  className="w-full px-4 py-3 rounded-xl bg-white/80 border border-slate-200 
                             focus:border-pink-400 focus:ring-2 focus:ring-pink-400/20 outline-none"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1.5 block">Cognome</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  data-testid="edit-last-name-input"
                  className="w-full px-4 py-3 rounded-xl bg-white/80 border border-slate-200 
                             focus:border-pink-400 focus:ring-2 focus:ring-pink-400/20 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 mb-1.5 block">Città</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="es. Milano, Italia"
                  data-testid="edit-city-input"
                  className="flex-1 px-4 py-3 rounded-xl bg-white/80 border border-slate-200 
                             focus:border-pink-400 focus:ring-2 focus:ring-pink-400/20 outline-none"
                />
                <button
                  onClick={handleGeocode}
                  disabled={geocoding}
                  data-testid="geocode-btn"
                  className="px-4 py-3 rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 text-white 
                             hover:shadow-lg transition-shadow disabled:opacity-50"
                >
                  {geocoding ? <RefreshCw className="w-5 h-5 animate-spin" /> : <MapPin className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1.5 block">Latitudine</label>
                <input
                  type="number"
                  step="any"
                  value={cityLat}
                  onChange={(e) => setCityLat(e.target.value)}
                  placeholder="45.4642"
                  data-testid="edit-lat-input"
                  className="w-full px-4 py-3 rounded-xl bg-white/80 border border-slate-200 
                             focus:border-pink-400 focus:ring-2 focus:ring-pink-400/20 outline-none"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1.5 block">Longitudine</label>
                <input
                  type="number"
                  step="any"
                  value={cityLng}
                  onChange={(e) => setCityLng(e.target.value)}
                  placeholder="9.1900"
                  data-testid="edit-lng-input"
                  className="w-full px-4 py-3 rounded-xl bg-white/80 border border-slate-200 
                             focus:border-pink-400 focus:ring-2 focus:ring-pink-400/20 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 mb-1.5 block">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@esempio.com"
                data-testid="edit-email-input"
                className="w-full px-4 py-3 rounded-xl bg-white/80 border border-slate-200 
                           focus:border-pink-400 focus:ring-2 focus:ring-pink-400/20 outline-none"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 mb-1.5 block">Telefono</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+39 123 456 7890"
                data-testid="edit-phone-input"
                className="w-full px-4 py-3 rounded-xl bg-white/80 border border-slate-200 
                           focus:border-pink-400 focus:ring-2 focus:ring-pink-400/20 outline-none"
              />
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            data-testid="save-imported-btn"
            className="w-full mt-6 px-6 py-3 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 text-white font-semibold 
                       shadow-lg shadow-pink-500/30 hover:shadow-pink-500/50 transition-shadow
                       disabled:opacity-50"
          >
            {saving ? 'Salvataggio...' : 'Salva Modifiche'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

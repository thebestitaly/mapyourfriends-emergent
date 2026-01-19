import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, MapPin, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

const API_URL = process.env.REACT_APP_BACKEND_URL;

/**
 * ProfileModal - Edit user profile
 */
export default function ProfileModal({ user, setUser, onClose }) {
  const [bio, setBio] = useState(user?.bio || '');
  const [activeCity, setActiveCity] = useState(user?.active_city || '');
  const [activeCityLat, setActiveCityLat] = useState(user?.active_city_lat || '');
  const [activeCityLng, setActiveCityLng] = useState(user?.active_city_lng || '');
  const [availability, setAvailability] = useState(user?.availability || []);
  const [saving, setSaving] = useState(false);
  const [geocoding, setGeocoding] = useState(false);

  const availabilityOptions = ['Advice', 'Intro', 'Meetup', 'Coffee', 'Collaboration'];

  const toggleAvailability = (option) => {
    if (availability.includes(option)) {
      setAvailability(availability.filter(a => a !== option));
    } else {
      setAvailability([...availability, option]);
    }
  };

  const handleGeocode = async () => {
    if (!activeCity) {
      toast.error('Inserisci una città');
      return;
    }

    setGeocoding(true);
    try {
      const response = await fetch(`${API_URL}/api/geocode`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ city: activeCity })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.status === 'success') {
          setActiveCityLat(data.lat);
          setActiveCityLng(data.lng);
          toast.success('Posizione trovata!');
        } else {
          toast.error('Città non trovata');
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
      const response = await fetch(`${API_URL}/api/users/me`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          bio,
          active_city: activeCity,
          active_city_lat: parseFloat(activeCityLat) || null,
          active_city_lng: parseFloat(activeCityLng) || null,
          availability
        })
      });

      if (response.ok) {
        const updated = await response.json();
        setUser(updated);
        toast.success('Profilo aggiornato!');
        onClose();
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
            <h2 className="font-heading font-bold text-xl text-slate-800">Modifica Profilo</h2>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100">
              <X className="w-5 h-5 text-slate-500" />
            </button>
          </div>

          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 
                            flex items-center justify-center border-3 border-white shadow-lg">
              {user?.picture ? (
                <img src={user.picture} alt={user.name} className="w-full h-full rounded-full object-cover" />
              ) : (
                <span className="text-white text-2xl font-bold">{user?.name?.charAt(0)}</span>
              )}
            </div>
            <div>
              <p className="font-heading font-bold text-slate-800">{user?.name}</p>
              <p className="text-sm text-slate-500">{user?.email}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1.5 block">Bio</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Raccontaci di te..."
                data-testid="profile-bio-input"
                className="w-full px-4 py-3 rounded-xl bg-white/80 border border-slate-200 
                           focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 
                           outline-none resize-none h-24"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 mb-1.5 block">Città Attuale</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={activeCity}
                  onChange={(e) => setActiveCity(e.target.value)}
                  placeholder="es. Milano, Italia"
                  data-testid="profile-city-input"
                  className="flex-1 px-4 py-3 rounded-xl bg-white/80 border border-slate-200 
                             focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 outline-none"
                />
                <button
                  onClick={handleGeocode}
                  disabled={geocoding}
                  data-testid="profile-geocode-btn"
                  className="px-4 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white 
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
                  value={activeCityLat}
                  onChange={(e) => setActiveCityLat(e.target.value)}
                  placeholder="45.4642"
                  data-testid="profile-lat-input"
                  className="w-full px-4 py-3 rounded-xl bg-white/80 border border-slate-200 
                             focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 outline-none"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1.5 block">Longitudine</label>
                <input
                  type="number"
                  step="any"
                  value={activeCityLng}
                  onChange={(e) => setActiveCityLng(e.target.value)}
                  placeholder="9.1900"
                  data-testid="profile-lng-input"
                  className="w-full px-4 py-3 rounded-xl bg-white/80 border border-slate-200 
                             focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">Disponibile per</label>
              <div className="flex flex-wrap gap-2">
                {availabilityOptions.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => toggleAvailability(option)}
                    data-testid={`availability-${option.toLowerCase()}`}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${availability.includes(option)
                        ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-md'
                        : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            data-testid="save-profile-btn"
            className="w-full mt-6 px-6 py-3 rounded-full btn-gradient-primary text-white font-semibold 
                       shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 transition-shadow
                       disabled:opacity-50"
          >
            {saving ? 'Salvataggio...' : 'Salva Modifiche'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

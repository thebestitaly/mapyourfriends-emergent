import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Plus, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

const API_URL = process.env.REACT_APP_BACKEND_URL;

export default function AddFriendModal({ onClose, onAdded }) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [city, setCity] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [saving, setSaving] = useState(false);

  const handleAdd = async () => {
    if (!firstName.trim() || !city.trim()) {
      toast.error('Nome e Città sono obbligatori');
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(`${API_URL}/api/imported-friends`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          city: city.trim(),
          email: email.trim() || null,
          phone: phone.trim() || null
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.geocode_status === 'success') {
          toast.success(`${data.name} aggiunto sulla mappa!`);
        } else {
          toast.success(`${data.name} aggiunto! Posizione da verificare.`);
        }
        onAdded();
      } else {
        toast.error('Errore durante l\'aggiunta');
      }
    } catch (error) {
      toast.error('Errore durante l\'aggiunta');
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
        className="relative w-full max-w-md"
      >
        <div className="glass-panel rounded-3xl p-6 shadow-floating">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-heading font-bold text-xl text-slate-800">Aggiungi Amico</h2>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100">
              <X className="w-5 h-5 text-slate-500" />
            </button>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1.5 block">Nome *</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Mario"
                  data-testid="add-first-name-input"
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
                  placeholder="Rossi"
                  data-testid="add-last-name-input"
                  className="w-full px-4 py-3 rounded-xl bg-white/80 border border-slate-200 
                             focus:border-pink-400 focus:ring-2 focus:ring-pink-400/20 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 mb-1.5 block">Città *</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="es. Milano, Italia"
                data-testid="add-city-input"
                className="w-full px-4 py-3 rounded-xl bg-white/80 border border-slate-200 
                           focus:border-pink-400 focus:ring-2 focus:ring-pink-400/20 outline-none"
              />
              <p className="text-xs text-slate-400 mt-1">La città verrà cercata automaticamente sulla mappa</p>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 mb-1.5 block">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@esempio.com"
                data-testid="add-email-input"
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
                data-testid="add-phone-input"
                className="w-full px-4 py-3 rounded-xl bg-white/80 border border-slate-200 
                           focus:border-pink-400 focus:ring-2 focus:ring-pink-400/20 outline-none"
              />
            </div>
          </div>

          <button
            onClick={handleAdd}
            disabled={saving}
            data-testid="add-friend-submit-btn"
            className="w-full mt-6 px-6 py-3 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 text-white font-semibold 
                       shadow-lg shadow-pink-500/30 hover:shadow-pink-500/50 transition-shadow
                       disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                Aggiunta in corso...
              </>
            ) : (
              <>
                <Plus className="w-5 h-5" />
                Aggiungi Amico
              </>
            )}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

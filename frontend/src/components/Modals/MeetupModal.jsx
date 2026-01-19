import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { toast } from 'sonner';

const API_URL = process.env.REACT_APP_BACKEND_URL;

export default function MeetupModal({ onClose, onCreated }) {
  const [title, setTitle] = useState('');
  const [city, setCity] = useState('');
  const [cityLat, setCityLat] = useState('');
  const [cityLng, setCityLng] = useState('');
  const [date, setDate] = useState('');
  const [description, setDescription] = useState('');
  const [creating, setCreating] = useState(false);

  const handleCreate = async () => {
    if (!title || !city || !cityLat || !cityLng || !date) {
      toast.error('Please fill in all required fields');
      return;
    }

    setCreating(true);
    try {
      const response = await fetch(`${API_URL}/api/meetups`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          title,
          city,
          city_lat: parseFloat(cityLat),
          city_lng: parseFloat(cityLng),
          date,
          description
        })
      });

      if (response.ok) {
        toast.success('Meetup created!');
        onCreated();
      } else {
        toast.error('Failed to create meetup');
      }
    } catch (error) {
      toast.error('Failed to create meetup');
    } finally {
      setCreating(false);
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
            <h2 className="font-heading font-bold text-xl text-slate-800">Create Meetup</h2>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100">
              <X className="w-5 h-5 text-slate-500" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1.5 block">Title *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Weekend catchup"
                data-testid="meetup-title-input"
                className="w-full px-4 py-3 rounded-xl bg-white/80 border border-slate-200 
                           focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 outline-none"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 mb-1.5 block">City *</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Paris, France"
                data-testid="meetup-city-input"
                className="w-full px-4 py-3 rounded-xl bg-white/80 border border-slate-200 
                           focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1.5 block">Latitude *</label>
                <input
                  type="number"
                  step="any"
                  value={cityLat}
                  onChange={(e) => setCityLat(e.target.value)}
                  placeholder="48.8566"
                  data-testid="meetup-lat-input"
                  className="w-full px-4 py-3 rounded-xl bg-white/80 border border-slate-200 
                             focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 outline-none"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1.5 block">Longitude *</label>
                <input
                  type="number"
                  step="any"
                  value={cityLng}
                  onChange={(e) => setCityLng(e.target.value)}
                  placeholder="2.3522"
                  data-testid="meetup-lng-input"
                  className="w-full px-4 py-3 rounded-xl bg-white/80 border border-slate-200 
                             focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 mb-1.5 block">Date *</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                data-testid="meetup-date-input"
                className="w-full px-4 py-3 rounded-xl bg-white/80 border border-slate-200 
                           focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 outline-none"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 mb-1.5 block">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What's the plan?"
                data-testid="meetup-description-input"
                className="w-full px-4 py-3 rounded-xl bg-white/80 border border-slate-200 
                           focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 
                           outline-none resize-none h-20"
              />
            </div>
          </div>

          <button
            onClick={handleCreate}
            disabled={creating}
            data-testid="create-meetup-submit-btn"
            className="w-full mt-6 px-6 py-3 rounded-full btn-gradient-primary text-white font-semibold 
                       shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 transition-shadow
                       disabled:opacity-50"
          >
            {creating ? 'Creating...' : 'Create Meetup'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

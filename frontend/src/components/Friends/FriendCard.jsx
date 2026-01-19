import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Users } from 'lucide-react';

export default function FriendCard({ friend, onClose, onAssignGroup }) {
  if (!friend) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 w-[90%] max-w-md pointer-events-auto z-20"
      >
        <div className="glass-panel rounded-3xl p-5 shadow-floating">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4 text-slate-500" />
          </button>

          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 
                            flex items-center justify-center border-3 border-white shadow-lg">
              {friend.picture ? (
                <img src={friend.picture} alt={friend.name} className="w-full h-full rounded-full object-cover" />
              ) : (
                <span className="text-white text-xl font-bold">{friend.name?.charAt(0)}</span>
              )}
            </div>

            <div className="flex-1">
              <h3 className="font-heading font-bold text-xl text-slate-800">{friend.name}</h3>
              <p className="text-slate-500 flex items-center gap-1.5 mt-0.5">
                <MapPin className="w-4 h-4" />
                {friend.marker_type === 'active' ? friend.active_city : friend.city_name || friend.city}
              </p>
              {friend.bio && (
                <p className="text-sm text-slate-600 mt-2">{friend.bio}</p>
              )}
            </div>
          </div>

          {friend.competent_cities?.length > 0 && (
            <div className="mt-4">
              <p className="text-xs text-slate-500 mb-2">Also knows:</p>
              <div className="flex gap-2 flex-wrap">
                {friend.competent_cities.slice(0, 4).map((city, i) => (
                  <span key={i} className="px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-sm">
                    {city.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {friend.availability?.length > 0 && (
            <div className="mt-4">
              <p className="text-xs text-slate-500 mb-2">Available for:</p>
              <div className="flex gap-2 flex-wrap">
                {friend.availability.map((tag) => (
                  <span key={tag} className="px-3 py-1.5 rounded-full bg-cyan-100 text-cyan-700 text-sm font-medium">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-2 mt-5">
            <button
              onClick={onAssignGroup}
              className="px-4 py-2.5 rounded-full bg-slate-100 text-slate-700 font-medium hover:bg-slate-200 transition-colors"
              title="Manage Groups"
            >
              <Users className="w-5 h-5" />
            </button>
            <button
              className="flex-1 px-4 py-2.5 rounded-full btn-gradient-primary text-white font-medium 
                         shadow-md shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-shadow"
            >
              Ask Advice
            </button>
            <button
              className="flex-1 px-4 py-2.5 rounded-full bg-white border border-slate-200 
                         text-slate-700 font-medium hover:bg-slate-50 transition-colors"
            >
              Request Intro
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

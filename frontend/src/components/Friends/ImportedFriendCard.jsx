import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, AlertCircle, Edit3, Trash2, Users } from 'lucide-react';

export default function ImportedFriendCard({
  friend,
  onClose,
  onEdit,
  onDelete,
  onAssignGroup
}) {
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
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 
                            flex items-center justify-center border-3 border-white shadow-lg">
              <span className="text-white text-xl font-bold">{friend.name?.charAt(0)}</span>
            </div>

            <div className="flex-1">
              <h3 className="font-heading font-bold text-xl text-slate-800">{friend.name}</h3>
              <p className="text-slate-500 flex items-center gap-1.5 mt-0.5">
                <MapPin className="w-4 h-4" />
                {friend.city}
              </p>
              {friend.email && (
                <p className="text-sm text-slate-400 mt-1">{friend.email}</p>
              )}
              {friend.geocode_status !== 'success' && (
                <div className="mt-2 text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-md inline-flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  Posizione approssimativa
                </div>
              )}
            </div>
          </div>

          <div className="mt-5 flex gap-2">
            <button
              onClick={onAssignGroup}
              className="px-3 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-medium hover:bg-slate-200 transition-colors"
              title="Manage Groups"
            >
              <Users className="w-5 h-5" />
            </button>
            <button
              onClick={onEdit}
              className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 text-white font-medium 
                         shadow-md shadow-pink-500/25 hover:shadow-pink-500/40 transition-shadow flex items-center justify-center gap-2"
            >
              <Edit3 className="w-4 h-4" />
              Modifica
            </button>
            <button
              onClick={() => onDelete(friend)}
              className="px-4 py-2.5 rounded-xl bg-white border border-red-200 
                         text-red-600 font-medium hover:bg-red-50 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

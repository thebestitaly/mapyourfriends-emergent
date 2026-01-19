import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Search } from 'lucide-react';
import { toast } from 'sonner';

const API_URL = process.env.REACT_APP_BACKEND_URL;

/**
 * SearchModal - Search for users to add as friends
 */
export default function SearchModal({ onClose }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  const handleSearch = async (q) => {
    setSearchQuery(q);
    if (q.length < 2) {
      setSearchResults([]);
      return;
    }

    setSearching(true);
    try {
      const response = await fetch(`${API_URL}/api/search/users?q=${encodeURIComponent(q)}`, {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setSearchResults(data);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setSearching(false);
    }
  };

  const sendFriendRequest = async (toUserId) => {
    try {
      const response = await fetch(`${API_URL}/api/friends/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ to_user_id: toUserId })
      });
      if (response.ok) {
        toast.success('Richiesta di amicizia inviata!');
        // Remove from results
        setSearchResults(searchResults.filter(r => r.user_id !== toUserId));
      } else {
        const data = await response.json();
        toast.error(data.detail || 'Errore nell\'invio della richiesta');
      }
    } catch (error) {
      toast.error('Errore nell\'invio della richiesta');
    }
  };

  return (
    <motion.div
      key="search-modal"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm" onClick={onClose}></div>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg"
      >
        <div className="glass-panel rounded-3xl p-6 shadow-floating">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Cerca persone per nome o email..."
              data-testid="search-input"
              className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/80 border border-slate-200 
                         focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 
                         outline-none transition-all text-lg"
              autoFocus
            />
          </div>

          {searching && (
            <div className="flex justify-center py-8">
              <div className="w-8 h-8 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}

          {!searching && searchResults.length > 0 && (
            <div className="mt-4 space-y-2 max-h-80 overflow-y-auto">
              {searchResults.map((result) => (
                <div
                  key={result.user_id}
                  className="flex items-center justify-between p-3 rounded-xl bg-white/50 hover:bg-white transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 
                                    flex items-center justify-center">
                      {result.picture ? (
                        <img src={result.picture} alt={result.name} className="w-full h-full rounded-full object-cover" />
                      ) : (
                        <span className="text-white font-bold">{result.name?.charAt(0)}</span>
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-slate-800">{result.name}</p>
                      <p className="text-sm text-slate-500">{result.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => sendFriendRequest(result.user_id)}
                    data-testid={`add-friend-${result.user_id}`}
                    className="px-4 py-2 rounded-full btn-gradient-primary text-white text-sm font-medium 
                               shadow-md hover:shadow-lg transition-shadow"
                  >
                    Aggiungi
                  </button>
                </div>
              ))}
            </div>
          )}

          {!searching && searchQuery.length >= 2 && searchResults.length === 0 && (
            <p className="text-center text-slate-500 mt-6">Nessun utente trovato</p>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

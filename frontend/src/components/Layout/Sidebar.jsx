import React from 'react';
import {
  Map, Plane, Users, Calendar, MessageCircle, User,
  Upload, LogOut
} from 'lucide-react';

export default function Sidebar({
  activeView,
  setActiveView,
  travelMode,
  setTravelMode,
  onProfileClick,
  onImportClick,
  onLogout
}) {
  const sidebarItems = [
    { id: 'map', icon: Map, label: 'Mappa' },
    { id: 'travel', icon: Plane, label: 'Travel Mode' },
    { id: 'friends', icon: Users, label: 'Amici' },
    { id: 'import', icon: Upload, label: 'Importa CSV' },
    { id: 'meetups', icon: Calendar, label: 'Meetups' },
    { id: 'inbox', icon: MessageCircle, label: 'Messaggi' },
    { id: 'profile', icon: User, label: 'Profilo' },
  ];

  return (
    <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-auto z-10">
      <div className="glass-panel rounded-full p-2 flex flex-col gap-2">
        {sidebarItems.map((item) => (
          <button
            key={item.id}
            onClick={() => {
              if (item.id === 'travel') {
                setTravelMode(!travelMode);
                setActiveView('map');
              } else if (item.id === 'profile') {
                onProfileClick();
              } else if (item.id === 'import') {
                onImportClick();
              } else {
                setActiveView(item.id);
                setTravelMode(false);
              }
            }}
            data-testid={`sidebar-${item.id}-btn`}
            className={`relative p-3 rounded-full transition-all duration-300 group ${(activeView === item.id || (item.id === 'travel' && travelMode))
                ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/30'
                : item.id === 'import'
                  ? 'text-pink-500 hover:text-pink-600 hover:bg-pink-50'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-white/80'
              }`}
          >
            <item.icon className="w-5 h-5" />
            <span className="absolute left-full ml-3 px-3 py-1.5 rounded-lg bg-slate-800 text-white text-sm
                             whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200
                             pointer-events-none z-20">
              {item.label}
            </span>
          </button>
        ))}
        <div className="w-full h-px bg-slate-200 my-1"></div>
        <button
          onClick={onLogout}
          data-testid="logout-btn"
          className="p-3 rounded-full text-slate-500 hover:text-red-500 hover:bg-red-50 transition-all duration-300"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

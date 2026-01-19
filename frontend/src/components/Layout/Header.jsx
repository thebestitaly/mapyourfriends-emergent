import React from 'react';
import { Search, Bell, Globe2 } from 'lucide-react';

export default function Header({
  user,
  inboxCount = 0,
  onSearchClick,
  onNotificationsClick,
  onProfileClick
}) {
  return (
    <div className="absolute top-4 left-20 right-4 flex items-center justify-between pointer-events-auto z-10">
      <div className="glass-panel rounded-2xl px-4 py-2.5 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg btn-gradient-primary flex items-center justify-center">
          <Globe2 className="w-4 h-4 text-white" />
        </div>
        <span className="font-heading font-bold text-slate-800">Map Your Friends</span>
      </div>

      <div className="flex items-center gap-3">
        {/* Search */}
        <button
          onClick={onSearchClick}
          data-testid="search-btn"
          className="glass-panel rounded-full p-3 hover:bg-white/90 transition-all duration-300"
        >
          <Search className="w-5 h-5 text-slate-600" />
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={onNotificationsClick}
            data-testid="notifications-btn"
            className="glass-panel rounded-full p-3 hover:bg-white/90 transition-all duration-300"
          >
            <Bell className="w-5 h-5 text-slate-600" />
          </button>
          {inboxCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-pink-500 text-white text-xs flex items-center justify-center font-medium">
              {inboxCount}
            </span>
          )}
        </div>

        {/* User avatar */}
        <button
          onClick={onProfileClick}
          data-testid="profile-avatar-btn"
          className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 
                     flex items-center justify-center border-2 border-white shadow-md
                     hover:shadow-lg transition-shadow duration-300"
        >
          {user?.picture ? (
            <img src={user.picture} alt={user.name} className="w-full h-full rounded-full object-cover" />
          ) : (
            <span className="text-white font-bold">{user?.name?.charAt(0) || 'U'}</span>
          )}
        </button>
      </div>
    </div>
  );
}

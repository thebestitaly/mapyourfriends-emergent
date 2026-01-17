import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { 
  Map, Plane, Users, Calendar, MessageCircle, User, 
  LogOut, Search, X, Plus, Check, MapPin, ChevronRight,
  Globe2, Settings, Bell, Upload, FileSpreadsheet, Edit3,
  RefreshCw, Trash2, AlertCircle
} from 'lucide-react';

const API_URL = process.env.REACT_APP_BACKEND_URL;

// Custom marker icons
const createMarkerIcon = (type, initial, status = 'success') => {
  let bgClass;
  let textColor;
  
  if (type === 'imported') {
    if (status === 'failed' || status === 'manual') {
      bgClass = 'background: linear-gradient(135deg, #F59E0B, #EF4444);';
      textColor = '#fff';
    } else {
      bgClass = 'background: linear-gradient(135deg, #EC4899, #A855F7);';
      textColor = '#fff';
    }
  } else if (type === 'active') {
    bgClass = 'background: linear-gradient(135deg, #06B6D4, #3B82F6);';
    textColor = '#fff';
  } else {
    bgClass = 'background: transparent; border: 3px solid #06B6D4;';
    textColor = '#06B6D4';
  }
  
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        width: 40px; height: 40px; border-radius: 50%; ${bgClass}
        display: flex; align-items: center; justify-content: center;
        box-shadow: 0 4px 14px rgba(236, 72, 153, ${type === 'imported' ? '0.4' : '0.2'});
        border: 3px solid white; font-weight: 700; font-size: 14px;
        color: ${textColor}; font-family: 'Manrope', sans-serif;
      ">${initial}</div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -20]
  });
};

// Map center controller
function MapController({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, zoom || 5, { duration: 1.5 });
    }
  }, [center, zoom, map]);
  return null;
}

export default function Dashboard({ user, setUser }) {
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState('map');
  const [friends, setFriends] = useState([]);
  const [mapFriends, setMapFriends] = useState([]);
  const [importedFriends, setImportedFriends] = useState([]);
  const [meetups, setMeetups] = useState([]);
  const [inbox, setInbox] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [selectedImportedFriend, setSelectedImportedFriend] = useState(null);
  const [mapCenter, setMapCenter] = useState([20, 0]);
  const [mapZoom, setMapZoom] = useState(2);
  const [travelMode, setTravelMode] = useState(false);
  const [travelCity, setTravelCity] = useState('');
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showMeetupModal, setShowMeetupModal] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showEditImportedModal, setShowEditImportedModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [filter, setFilter] = useState('all');

  // Fetch data
  const fetchFriends = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/api/friends`, { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        setFriends(data);
      }
    } catch (error) {
      console.error('Error fetching friends:', error);
    }
  }, []);

  const fetchMapFriends = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/api/friends/map`, { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        setMapFriends(data);
      }
    } catch (error) {
      console.error('Error fetching map friends:', error);
    }
  }, []);

  const fetchMeetups = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/api/meetups`, { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        setMeetups(data);
      }
    } catch (error) {
      console.error('Error fetching meetups:', error);
    }
  }, []);

  const fetchInbox = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/api/messages/inbox`, { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        setInbox(data);
      }
    } catch (error) {
      console.error('Error fetching inbox:', error);
    }
  }, []);

  const fetchFriendRequests = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/api/friends/requests`, { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        setFriendRequests(data);
      }
    } catch (error) {
      console.error('Error fetching friend requests:', error);
    }
  }, []);

  const fetchImportedFriends = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/api/imported-friends/map`, { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        setImportedFriends(data);
      }
    } catch (error) {
      console.error('Error fetching imported friends:', error);
    }
  }, []);

  useEffect(() => {
    fetchFriends();
    fetchMapFriends();
    fetchMeetups();
    fetchInbox();
    fetchFriendRequests();
    fetchImportedFriends();
  }, [fetchFriends, fetchMapFriends, fetchMeetups, fetchInbox, fetchFriendRequests, fetchImportedFriends]);

  // Search users
  const handleSearch = async (q) => {
    setSearchQuery(q);
    if (q.length < 2) {
      setSearchResults([]);
      return;
    }
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
    }
  };

  // Send friend request
  const sendFriendRequest = async (toUserId) => {
    try {
      const response = await fetch(`${API_URL}/api/friends/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ to_user_id: toUserId })
      });
      if (response.ok) {
        toast.success('Friend request sent!');
        setShowSearchModal(false);
      } else {
        const data = await response.json();
        toast.error(data.detail || 'Failed to send request');
      }
    } catch (error) {
      toast.error('Failed to send friend request');
    }
  };

  // Accept friend request
  const acceptFriendRequest = async (friendshipId) => {
    try {
      const response = await fetch(`${API_URL}/api/friends/accept/${friendshipId}`, {
        method: 'POST',
        credentials: 'include'
      });
      if (response.ok) {
        toast.success('Friend request accepted!');
        fetchFriendRequests();
        fetchFriends();
        fetchMapFriends();
      }
    } catch (error) {
      toast.error('Failed to accept request');
    }
  };

  // Logout
  const handleLogout = async () => {
    try {
      await fetch(`${API_URL}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include'
      });
      navigate('/');
    } catch (error) {
      navigate('/');
    }
  };

  // Filter map friends
  const filteredMapFriends = mapFriends.filter(friend => {
    if (filter === 'all') return true;
    if (filter === 'active') return friend.marker_type === 'active';
    if (filter === 'competent') return friend.marker_type === 'competent';
    return true;
  });

  const sidebarItems = [
    { id: 'map', icon: Map, label: 'Map' },
    { id: 'travel', icon: Plane, label: 'Travel Mode' },
    { id: 'friends', icon: Users, label: 'Friends' },
    { id: 'meetups', icon: Calendar, label: 'Meetups' },
    { id: 'inbox', icon: MessageCircle, label: 'Inbox' },
    { id: 'profile', icon: User, label: 'Profile' },
  ];

  return (
    <div className="h-screen w-screen overflow-hidden relative bg-slate-50">
      {/* Map Background */}
      <div className="absolute inset-0 z-0">
        <MapContainer
          center={mapCenter}
          zoom={mapZoom}
          className="h-full w-full"
          zoomControl={false}
          attributionControl={false}
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          />
          <MapController center={mapCenter} zoom={mapZoom} />
          
          {/* User marker */}
          {user?.active_city_lat && user?.active_city_lng && (
            <Marker 
              position={[user.active_city_lat, user.active_city_lng]}
              icon={createMarkerIcon('active', user.name?.charAt(0) || 'U')}
            >
              <Popup>
                <div className="p-2 min-w-[180px]">
                  <p className="font-heading font-semibold">{user.name} (You)</p>
                  <p className="text-sm text-slate-500">{user.active_city}</p>
                </div>
              </Popup>
            </Marker>
          )}

          {/* Friend markers */}
          {filteredMapFriends.map((friend, idx) => (
            <Marker
              key={`${friend.user_id}-${friend.marker_type}-${idx}`}
              position={[friend.lat, friend.lng]}
              icon={createMarkerIcon(friend.marker_type, friend.name?.charAt(0) || '?')}
              eventHandlers={{
                click: () => setSelectedFriend(friend)
              }}
            >
              <Popup>
                <div className="p-2 min-w-[180px]">
                  <p className="font-heading font-semibold">{friend.name}</p>
                  <p className="text-sm text-slate-500">
                    {friend.marker_type === 'active' ? friend.active_city : friend.city_name}
                  </p>
                  {friend.availability?.length > 0 && (
                    <div className="flex gap-1 mt-2 flex-wrap">
                      {friend.availability.map(tag => (
                        <span key={tag} className="px-2 py-0.5 rounded-full bg-cyan-100 text-cyan-700 text-xs">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* Travel Mode Overlay */}
      <AnimatePresence>
        {travelMode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-5 bg-slate-900/30 pointer-events-none"
          />
        )}
      </AnimatePresence>

      {/* Floating UI Layer */}
      <div className="relative z-10 h-full pointer-events-none">
        
        {/* Header */}
        <div className="absolute top-4 left-20 right-4 flex items-center justify-between pointer-events-auto">
          <div className="glass-panel rounded-2xl px-4 py-2.5 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg btn-gradient-primary flex items-center justify-center">
              <Globe2 className="w-4 h-4 text-white" />
            </div>
            <span className="font-heading font-bold text-slate-800">Map Your Friends</span>
          </div>

          <div className="flex items-center gap-3">
            {/* Search */}
            <button
              onClick={() => setShowSearchModal(true)}
              data-testid="search-btn"
              className="glass-panel rounded-full p-3 hover:bg-white/90 transition-all duration-300"
            >
              <Search className="w-5 h-5 text-slate-600" />
            </button>

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setActiveView('inbox')}
                data-testid="notifications-btn"
                className="glass-panel rounded-full p-3 hover:bg-white/90 transition-all duration-300"
              >
                <Bell className="w-5 h-5 text-slate-600" />
              </button>
              {(inbox.filter(m => !m.read).length + friendRequests.length) > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-pink-500 text-white text-xs flex items-center justify-center font-medium">
                  {inbox.filter(m => !m.read).length + friendRequests.length}
                </span>
              )}
            </div>

            {/* User avatar */}
            <button
              onClick={() => setShowProfileModal(true)}
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

        {/* Sidebar */}
        <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-auto">
          <div className="glass-panel rounded-full p-2 flex flex-col gap-2">
            {sidebarItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  if (item.id === 'travel') {
                    setTravelMode(!travelMode);
                    setActiveView('map');
                  } else if (item.id === 'profile') {
                    setShowProfileModal(true);
                  } else {
                    setActiveView(item.id);
                    setTravelMode(false);
                  }
                }}
                data-testid={`sidebar-${item.id}-btn`}
                className={`relative p-3 rounded-full transition-all duration-300 group ${
                  (activeView === item.id || (item.id === 'travel' && travelMode))
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/30'
                    : 'text-slate-500 hover:text-slate-700 hover:bg-white/80'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="absolute left-full ml-3 px-3 py-1.5 rounded-lg bg-slate-800 text-white text-sm
                                 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200
                                 pointer-events-none">
                  {item.label}
                </span>
              </button>
            ))}
            <div className="w-full h-px bg-slate-200 my-1"></div>
            <button
              onClick={handleLogout}
              data-testid="logout-btn"
              className="p-3 rounded-full text-slate-500 hover:text-red-500 hover:bg-red-50 transition-all duration-300"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter chips */}
        <div className="absolute top-20 left-20 flex gap-2 pointer-events-auto">
          {['all', 'active', 'competent'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              data-testid={`filter-${f}-btn`}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                filter === f
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-md'
                  : 'glass-panel text-slate-600 hover:bg-white/90'
              }`}
            >
              {f === 'all' ? 'All Cities' : f === 'active' ? 'Living In' : 'Knows Well'}
            </button>
          ))}
        </div>

        {/* Travel Mode Input */}
        <AnimatePresence>
          {travelMode && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-20 left-1/2 -translate-x-1/2 pointer-events-auto"
            >
              <div className="glass-panel rounded-2xl p-4 w-80">
                <p className="text-sm font-medium text-slate-700 mb-3">Where are you traveling?</p>
                <div className="relative">
                  <Plane className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    value={travelCity}
                    onChange={(e) => setTravelCity(e.target.value)}
                    placeholder="Enter destination city..."
                    data-testid="travel-city-input"
                    className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/50 border border-white/60 
                               focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/20 
                               outline-none transition-all placeholder:text-slate-400"
                  />
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  See your connections in your destination
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Selected Friend Card */}
        <AnimatePresence>
          {selectedFriend && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="absolute bottom-8 left-1/2 -translate-x-1/2 w-[90%] max-w-md pointer-events-auto"
            >
              <div className="glass-panel rounded-3xl p-5 shadow-floating">
                <button
                  onClick={() => setSelectedFriend(null)}
                  data-testid="close-friend-card-btn"
                  className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 transition-colors"
                >
                  <X className="w-4 h-4 text-slate-500" />
                </button>
                
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 
                                  flex items-center justify-center border-3 border-white shadow-lg">
                    {selectedFriend.picture ? (
                      <img src={selectedFriend.picture} alt={selectedFriend.name} className="w-full h-full rounded-full object-cover" />
                    ) : (
                      <span className="text-white text-xl font-bold">{selectedFriend.name?.charAt(0)}</span>
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="font-heading font-bold text-xl text-slate-800">{selectedFriend.name}</h3>
                    <p className="text-slate-500 flex items-center gap-1.5 mt-0.5">
                      <MapPin className="w-4 h-4" />
                      {selectedFriend.marker_type === 'active' ? selectedFriend.active_city : selectedFriend.city_name}
                    </p>
                    {selectedFriend.bio && (
                      <p className="text-sm text-slate-600 mt-2">{selectedFriend.bio}</p>
                    )}
                  </div>
                </div>

                {selectedFriend.competent_cities?.length > 0 && (
                  <div className="mt-4">
                    <p className="text-xs text-slate-500 mb-2">Also knows:</p>
                    <div className="flex gap-2 flex-wrap">
                      {selectedFriend.competent_cities.slice(0, 4).map((city, i) => (
                        <span key={i} className="px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-sm">
                          {city.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {selectedFriend.availability?.length > 0 && (
                  <div className="mt-4">
                    <p className="text-xs text-slate-500 mb-2">Available for:</p>
                    <div className="flex gap-2 flex-wrap">
                      {selectedFriend.availability.map((tag) => (
                        <span key={tag} className="px-3 py-1.5 rounded-full bg-cyan-100 text-cyan-700 text-sm font-medium">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-3 mt-5">
                  <button
                    data-testid="ask-advice-btn"
                    className="flex-1 px-4 py-2.5 rounded-full btn-gradient-primary text-white font-medium 
                               shadow-md shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-shadow"
                  >
                    Ask Advice
                  </button>
                  <button
                    data-testid="request-intro-btn"
                    className="flex-1 px-4 py-2.5 rounded-full bg-white border border-slate-200 
                               text-slate-700 font-medium hover:bg-slate-50 transition-colors"
                  >
                    Request Intro
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Right Panel for Friends/Meetups/Inbox */}
        <AnimatePresence>
          {(activeView === 'friends' || activeView === 'meetups' || activeView === 'inbox') && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="absolute right-4 top-20 bottom-4 w-96 pointer-events-auto"
            >
              <div className="glass-panel rounded-3xl h-full flex flex-col overflow-hidden">
                <div className="p-5 border-b border-slate-200/50">
                  <div className="flex items-center justify-between">
                    <h2 className="font-heading font-bold text-xl text-slate-800">
                      {activeView === 'friends' && 'Friends'}
                      {activeView === 'meetups' && 'Meetups'}
                      {activeView === 'inbox' && 'Inbox'}
                    </h2>
                    <button
                      onClick={() => setActiveView('map')}
                      data-testid="close-panel-btn"
                      className="p-2 rounded-full hover:bg-slate-100 transition-colors"
                    >
                      <X className="w-5 h-5 text-slate-500" />
                    </button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {/* Friends List */}
                  {activeView === 'friends' && (
                    <>
                      {friendRequests.length > 0 && (
                        <div className="mb-4">
                          <p className="text-sm font-medium text-slate-500 mb-2">Friend Requests</p>
                          {friendRequests.map((req) => (
                            <div key={req.friendship_id} className="bg-white rounded-2xl p-4 mb-2 shadow-sm">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 
                                                flex items-center justify-center">
                                  <span className="text-white font-bold">{req.from_user.name?.charAt(0)}</span>
                                </div>
                                <div className="flex-1">
                                  <p className="font-medium text-slate-800">{req.from_user.name}</p>
                                  <p className="text-sm text-slate-500">{req.from_user.email}</p>
                                </div>
                                <button
                                  onClick={() => acceptFriendRequest(req.friendship_id)}
                                  data-testid={`accept-request-${req.friendship_id}`}
                                  className="p-2 rounded-full bg-green-100 text-green-600 hover:bg-green-200 transition-colors"
                                >
                                  <Check className="w-5 h-5" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {friends.length === 0 ? (
                        <div className="text-center py-12">
                          <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                          <p className="text-slate-500">No friends yet</p>
                          <button
                            onClick={() => setShowSearchModal(true)}
                            data-testid="add-friends-btn"
                            className="mt-3 text-cyan-600 font-medium hover:text-cyan-700"
                          >
                            Add friends
                          </button>
                        </div>
                      ) : (
                        friends.map((friend) => (
                          <div
                            key={friend.user_id}
                            onClick={() => {
                              setSelectedFriend({...friend, marker_type: 'active'});
                              if (friend.active_city_lat && friend.active_city_lng) {
                                setMapCenter([friend.active_city_lat, friend.active_city_lng]);
                                setMapZoom(8);
                              }
                              setActiveView('map');
                            }}
                            data-testid={`friend-item-${friend.user_id}`}
                            className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 
                                              flex items-center justify-center border-2 border-white shadow">
                                {friend.picture ? (
                                  <img src={friend.picture} alt={friend.name} className="w-full h-full rounded-full object-cover" />
                                ) : (
                                  <span className="text-white font-bold">{friend.name?.charAt(0)}</span>
                                )}
                              </div>
                              <div className="flex-1">
                                <p className="font-heading font-semibold text-slate-800">{friend.name}</p>
                                {friend.active_city && (
                                  <p className="text-sm text-slate-500 flex items-center gap-1">
                                    <MapPin className="w-3 h-3" />
                                    {friend.active_city}
                                  </p>
                                )}
                              </div>
                              <ChevronRight className="w-5 h-5 text-slate-400" />
                            </div>
                          </div>
                        ))
                      )}
                    </>
                  )}

                  {/* Meetups List */}
                  {activeView === 'meetups' && (
                    <>
                      <button
                        onClick={() => setShowMeetupModal(true)}
                        data-testid="create-meetup-btn"
                        className="w-full p-4 rounded-2xl border-2 border-dashed border-slate-200 
                                   text-slate-500 hover:border-cyan-400 hover:text-cyan-600 
                                   transition-colors flex items-center justify-center gap-2"
                      >
                        <Plus className="w-5 h-5" />
                        Create Meetup
                      </button>
                      
                      {meetups.length === 0 ? (
                        <div className="text-center py-12">
                          <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                          <p className="text-slate-500">No meetups planned</p>
                        </div>
                      ) : (
                        meetups.map((meetup) => (
                          <div
                            key={meetup.meetup_id}
                            data-testid={`meetup-item-${meetup.meetup_id}`}
                            className="bg-white rounded-2xl p-4 shadow-sm"
                          >
                            <h4 className="font-heading font-semibold text-slate-800">{meetup.title}</h4>
                            <p className="text-sm text-slate-500 flex items-center gap-1 mt-1">
                              <MapPin className="w-3 h-3" />
                              {meetup.city}
                            </p>
                            <p className="text-sm text-slate-500 flex items-center gap-1 mt-0.5">
                              <Calendar className="w-3 h-3" />
                              {new Date(meetup.date).toLocaleDateString()}
                            </p>
                          </div>
                        ))
                      )}
                    </>
                  )}

                  {/* Inbox */}
                  {activeView === 'inbox' && (
                    inbox.length === 0 ? (
                      <div className="text-center py-12">
                        <MessageCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                        <p className="text-slate-500">No messages yet</p>
                      </div>
                    ) : (
                      inbox.map((msg) => (
                        <div
                          key={msg.message_id}
                          data-testid={`message-item-${msg.message_id}`}
                          className={`bg-white rounded-2xl p-4 shadow-sm ${!msg.read ? 'ring-2 ring-cyan-400/30' : ''}`}
                        >
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 
                                            flex items-center justify-center flex-shrink-0">
                              <span className="text-white font-bold">{msg.from_user?.name?.charAt(0) || '?'}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-slate-800">{msg.from_user?.name || 'Unknown'}</p>
                              <p className="text-sm text-slate-600 mt-1 line-clamp-2">{msg.content}</p>
                              <p className="text-xs text-slate-400 mt-2">
                                {new Date(msg.created_at).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                    )
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Search Modal */}
      <AnimatePresence mode="wait">
        {showSearchModal && (
          <motion.div
            key="search-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4"
            onClick={() => setShowSearchModal(false)}
          >
            <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm" onClick={() => setShowSearchModal(false)}></div>
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
                    placeholder="Search people by name or email..."
                    data-testid="search-input"
                    className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/80 border border-slate-200 
                               focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 
                               outline-none transition-all text-lg"
                    autoFocus
                  />
                </div>

                {searchResults.length > 0 && (
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
                          Add Friend
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {searchQuery.length >= 2 && searchResults.length === 0 && (
                  <p className="text-center text-slate-500 mt-6">No users found</p>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Profile Modal */}
      <AnimatePresence mode="wait">
        {showProfileModal && (
          <ProfileModal 
            user={user} 
            setUser={setUser}
            onClose={() => setShowProfileModal(false)} 
          />
        )}
      </AnimatePresence>

      {/* Meetup Modal */}
      <AnimatePresence mode="wait">
        {showMeetupModal && (
          <MeetupModal
            onClose={() => setShowMeetupModal(false)}
            onCreated={() => {
              fetchMeetups();
              setShowMeetupModal(false);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// Profile Modal Component
function ProfileModal({ user, setUser, onClose }) {
  const [bio, setBio] = useState(user?.bio || '');
  const [activeCity, setActiveCity] = useState(user?.active_city || '');
  const [activeCityLat, setActiveCityLat] = useState(user?.active_city_lat || '');
  const [activeCityLng, setActiveCityLng] = useState(user?.active_city_lng || '');
  const [availability, setAvailability] = useState(user?.availability || []);
  const [saving, setSaving] = useState(false);

  const availabilityOptions = ['Advice', 'Intro', 'Meetup', 'Coffee', 'Collaboration'];

  const toggleAvailability = (option) => {
    if (availability.includes(option)) {
      setAvailability(availability.filter(a => a !== option));
    } else {
      setAvailability([...availability, option]);
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
        toast.success('Profile updated!');
        onClose();
      } else {
        toast.error('Failed to update profile');
      }
    } catch (error) {
      toast.error('Failed to update profile');
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
            <h2 className="font-heading font-bold text-xl text-slate-800">Edit Profile</h2>
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
                placeholder="Tell us about yourself..."
                data-testid="profile-bio-input"
                className="w-full px-4 py-3 rounded-xl bg-white/80 border border-slate-200 
                           focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 
                           outline-none resize-none h-24"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 mb-1.5 block">Current City</label>
              <input
                type="text"
                value={activeCity}
                onChange={(e) => setActiveCity(e.target.value)}
                placeholder="e.g., Berlin, Germany"
                data-testid="profile-city-input"
                className="w-full px-4 py-3 rounded-xl bg-white/80 border border-slate-200 
                           focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1.5 block">Latitude</label>
                <input
                  type="number"
                  step="any"
                  value={activeCityLat}
                  onChange={(e) => setActiveCityLat(e.target.value)}
                  placeholder="52.5200"
                  data-testid="profile-lat-input"
                  className="w-full px-4 py-3 rounded-xl bg-white/80 border border-slate-200 
                             focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 outline-none"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1.5 block">Longitude</label>
                <input
                  type="number"
                  step="any"
                  value={activeCityLng}
                  onChange={(e) => setActiveCityLng(e.target.value)}
                  placeholder="13.4050"
                  data-testid="profile-lng-input"
                  className="w-full px-4 py-3 rounded-xl bg-white/80 border border-slate-200 
                             focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">Available for</label>
              <div className="flex flex-wrap gap-2">
                {availabilityOptions.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => toggleAvailability(option)}
                    data-testid={`availability-${option.toLowerCase()}`}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      availability.includes(option)
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
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// Meetup Modal Component
function MeetupModal({ onClose, onCreated }) {
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

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X, Plus, Users, Calendar, MessageCircle, Check,
    ChevronRight, MapPin
} from 'lucide-react';

export default function RightPanel({
    activeView,
    onClose,
    friends,
    friendRequests,
    importedFriends,
    meetups,
    inbox,
    onAddFriendClick,
    onAcceptRequest,
    onImportedFriendClick,
    onFriendClick,
    onShowMeetupModal,
    onSetFilter,
    showAllImported // helper to know if we should show 'See all' logic
}) {
    const show = activeView === 'friends' || activeView === 'meetups' || activeView === 'inbox';

    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="absolute right-4 top-20 bottom-4 w-96 pointer-events-auto z-10"
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
                                    onClick={onClose}
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
                                    <button
                                        onClick={onAddFriendClick}
                                        className="w-full p-4 rounded-2xl border-2 border-dashed border-pink-200 
                               text-pink-500 hover:border-pink-400 hover:text-pink-600 hover:bg-pink-50
                               transition-colors flex items-center justify-center gap-2 mb-4"
                                    >
                                        <Plus className="w-5 h-5" />
                                        Aggiungi Amico
                                    </button>

                                    {friendRequests.length > 0 && (
                                        <div className="mb-4">
                                            <p className="text-sm font-medium text-slate-500 mb-2">Richieste di amicizia</p>
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
                                                            onClick={() => onAcceptRequest(req.friendship_id)}
                                                            className="p-2 rounded-full bg-green-100 text-green-600 hover:bg-green-200 transition-colors"
                                                        >
                                                            <Check className="w-5 h-5" />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {importedFriends.length > 0 && (
                                        <div className="mb-4">
                                            <p className="text-sm font-medium text-slate-500 mb-2">Amici Importati ({importedFriends.length})</p>
                                            {importedFriends.slice(0, 5).map((friend) => (
                                                <div
                                                    key={friend.friend_id}
                                                    onClick={() => onImportedFriendClick(friend)}
                                                    className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-2xl p-4 mb-2 shadow-sm 
                                     hover:shadow-md transition-shadow cursor-pointer border border-pink-100"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 
                                            flex items-center justify-center">
                                                            <span className="text-white font-bold">{friend.name?.charAt(0)}</span>
                                                        </div>
                                                        <div className="flex-1">
                                                            <p className="font-medium text-slate-800">{friend.name}</p>
                                                            <p className="text-sm text-slate-500 flex items-center gap-1">
                                                                <MapPin className="w-3 h-3" />
                                                                {friend.city}
                                                            </p>
                                                        </div>
                                                        <ChevronRight className="w-5 h-5 text-pink-400" />
                                                    </div>
                                                </div>
                                            ))}
                                            {importedFriends.length > 5 && (
                                                <button
                                                    onClick={() => onSetFilter('imported')}
                                                    className="w-full text-center text-sm text-pink-600 font-medium py-2 hover:text-pink-700"
                                                >
                                                    Vedi tutti ({importedFriends.length})
                                                </button>
                                            )}
                                        </div>
                                    )}

                                    {friends.length > 0 && (
                                        <p className="text-sm font-medium text-slate-500 mb-2">Amici Registrati ({friends.length})</p>
                                    )}
                                    {friends.length === 0 && importedFriends.length === 0 ? (
                                        <div className="text-center py-12">
                                            <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                                            <p className="text-slate-500">Nessun amico ancora</p>
                                        </div>
                                    ) : (
                                        friends.map((friend) => (
                                            <div
                                                key={friend.user_id}
                                                onClick={() => onFriendClick(friend)}
                                                className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer mb-2"
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
                                        onClick={onShowMeetupModal}
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
                                                className="bg-white rounded-2xl p-4 shadow-sm mb-2"
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
                                            className={`bg-white rounded-2xl p-4 shadow-sm mb-2 ${!msg.read ? 'ring-2 ring-cyan-400/30' : ''}`}
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
    );
}

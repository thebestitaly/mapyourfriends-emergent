import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Check } from 'lucide-react';
import { groupsApi } from '../../services/api';
import { toast } from 'sonner';

export default function AssignGroupModal({ friend, groups, onClose, onUpdate }) {
    // friend.groups is array of {group_id, name, color}
    const [processing, setProcessing] = useState(null); // groupId being processed

    const isMember = (groupId) => {
        return friend.groups?.some(g => g.group_id === groupId);
    };

    const toggleGroup = async (group) => {
        if (processing) return;
        setProcessing(group.group_id);

        try {
            if (isMember(group.group_id)) {
                await groupsApi.removeMember(group.group_id, friend.user_id || friend.friend_id);
            } else {
                const type = friend.marker_type === 'active' ? 'user' : 'imported';
                const id = friend.user_id || friend.friend_id;
                await groupsApi.addMember(group.group_id, id, type);
            }
            onUpdate(); // Trigger refresh to update local state
        } catch (error) {
            toast.error('Failed to update group membership');
        } finally {
            setProcessing(null);
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
                className="relative w-full max-w-sm"
            >
                <div className="glass-panel rounded-3xl p-6 shadow-floating">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="font-heading font-bold text-xl text-slate-800">Manage Groups</h2>
                        <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100">
                            <X className="w-5 h-5 text-slate-500" />
                        </button>
                    </div>

                    <div className="flex items-center gap-3 mb-6 p-3 bg-slate-50 rounded-xl">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center">
                            <span className="text-white font-bold">{friend.name?.charAt(0)}</span>
                        </div>
                        <p className="font-medium text-slate-700">{friend.name}</p>
                    </div>

                    <p className="text-sm text-slate-500 mb-3">Select groups to assign:</p>

                    <div className="space-y-2 max-h-60 overflow-y-auto">
                        {groups.length === 0 && (
                            <p className="text-center text-slate-400 py-4">No groups created yet.</p>
                        )}
                        {groups.map(group => {
                            const active = isMember(group.group_id);
                            return (
                                <button
                                    key={group.group_id}
                                    onClick={() => toggleGroup(group)}
                                    disabled={processing !== null}
                                    className={`w-full p-3 rounded-xl flex items-center justify-between transition-all ${active
                                            ? 'bg-gradient-to-r from-cyan-50 to-blue-50 border border-cyan-100'
                                            : 'bg-white border border-slate-100 hover:bg-slate-50'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                                            style={{ backgroundColor: group.color }}
                                        >
                                            {group.name.charAt(0)}
                                        </div>
                                        <span className={`font-medium ${active ? 'text-slate-800' : 'text-slate-600'}`}>
                                            {group.name}
                                        </span>
                                    </div>
                                    {active && (
                                        <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                                            <Check className="w-4 h-4 text-white" />
                                        </div>
                                    )}
                                    {processing === group.group_id && (
                                        <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></div>
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    <button
                        onClick={onClose}
                        className="w-full mt-6 px-6 py-3 rounded-full bg-slate-800 text-white font-semibold 
                       shadow-lg hover:bg-slate-700 transition-colors"
                    >
                        Done
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
}

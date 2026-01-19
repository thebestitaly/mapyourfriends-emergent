import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Plus, Users, Palette } from 'lucide-react';
import { toast } from 'sonner';

const API_URL = process.env.REACT_APP_BACKEND_URL;

// Colori predefiniti per i gruppi
const GROUP_COLORS = [
    { name: 'Rosa', value: '#EC4899' },
    { name: 'Viola', value: '#8B5CF6' },
    { name: 'Blu', value: '#3B82F6' },
    { name: 'Cyan', value: '#06B6D4' },
    { name: 'Verde', value: '#10B981' },
    { name: 'Arancione', value: '#F59E0B' },
    { name: 'Rosso', value: '#EF4444' },
    { name: 'Grigio', value: '#6B7280' },
];

/**
 * GroupsModal - Manage friend groups/circles
 */
export default function GroupsModal({ groups, onClose, onGroupsChanged }) {
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [newGroupName, setNewGroupName] = useState('');
    const [newGroupColor, setNewGroupColor] = useState(GROUP_COLORS[0].value);
    const [creating, setCreating] = useState(false);
    const [deleting, setDeleting] = useState(null);

    const handleCreateGroup = async () => {
        if (!newGroupName.trim()) {
            toast.error('Inserisci un nome per il gruppo');
            return;
        }

        setCreating(true);
        try {
            const response = await fetch(`${API_URL}/api/groups`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    name: newGroupName.trim(),
                    color: newGroupColor
                })
            });

            if (response.ok) {
                toast.success('Gruppo creato!');
                setNewGroupName('');
                setShowCreateForm(false);
                onGroupsChanged();
            } else {
                const data = await response.json();
                toast.error(data.detail || 'Errore nella creazione');
            }
        } catch (error) {
            toast.error('Errore nella creazione del gruppo');
        } finally {
            setCreating(false);
        }
    };

    const handleDeleteGroup = async (groupId) => {
        setDeleting(groupId);
        try {
            const response = await fetch(`${API_URL}/api/groups/${groupId}`, {
                method: 'DELETE',
                credentials: 'include'
            });

            if (response.ok) {
                toast.success('Gruppo eliminato');
                onGroupsChanged();
            } else {
                toast.error('Errore nell\'eliminazione');
            }
        } catch (error) {
            toast.error('Errore nell\'eliminazione');
        } finally {
            setDeleting(null);
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
                className="relative w-full max-w-md max-h-[80vh] overflow-hidden flex flex-col"
            >
                <div className="glass-panel rounded-3xl shadow-floating flex flex-col max-h-full">
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-slate-200/50">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 flex items-center justify-center">
                                <Users className="w-5 h-5 text-white" />
                            </div>
                            <h2 className="font-heading font-bold text-xl text-slate-800">I Miei Gruppi</h2>
                        </div>
                        <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100">
                            <X className="w-5 h-5 text-slate-500" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-4">
                        {/* Create new group */}
                        {!showCreateForm ? (
                            <button
                                onClick={() => setShowCreateForm(true)}
                                className="w-full p-4 rounded-2xl border-2 border-dashed border-pink-200 
                           text-pink-500 hover:border-pink-400 hover:text-pink-600 hover:bg-pink-50
                           transition-colors flex items-center justify-center gap-2"
                            >
                                <Plus className="w-5 h-5" />
                                Crea Nuovo Gruppo
                            </button>
                        ) : (
                            <div className="p-4 rounded-2xl bg-gradient-to-br from-pink-50 to-purple-50 border border-pink-200 space-y-4">
                                <input
                                    type="text"
                                    value={newGroupName}
                                    onChange={(e) => setNewGroupName(e.target.value)}
                                    placeholder="Nome del gruppo..."
                                    className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 
                             focus:border-pink-400 focus:ring-2 focus:ring-pink-400/20 outline-none"
                                    autoFocus
                                />

                                <div>
                                    <label className="text-sm font-medium text-slate-700 mb-2 block flex items-center gap-2">
                                        <Palette className="w-4 h-4" />
                                        Colore
                                    </label>
                                    <div className="flex flex-wrap gap-2">
                                        {GROUP_COLORS.map((color) => (
                                            <button
                                                key={color.value}
                                                onClick={() => setNewGroupColor(color.value)}
                                                className={`w-8 h-8 rounded-full transition-transform ${newGroupColor === color.value ? 'ring-2 ring-offset-2 ring-slate-400 scale-110' : ''
                                                    }`}
                                                style={{ backgroundColor: color.value }}
                                                title={color.name}
                                            />
                                        ))}
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <button
                                        onClick={() => {
                                            setShowCreateForm(false);
                                            setNewGroupName('');
                                        }}
                                        className="flex-1 px-4 py-2.5 rounded-full border border-slate-200 text-slate-600 
                               hover:bg-slate-50 transition-colors"
                                    >
                                        Annulla
                                    </button>
                                    <button
                                        onClick={handleCreateGroup}
                                        disabled={creating}
                                        className="flex-1 px-4 py-2.5 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 
                               text-white font-medium shadow-md hover:shadow-lg transition-shadow disabled:opacity-50"
                                    >
                                        {creating ? 'Creazione...' : 'Crea'}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Groups list */}
                        {groups?.length === 0 && !showCreateForm && (
                            <div className="text-center py-8">
                                <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                                <p className="text-slate-500">Nessun gruppo creato</p>
                                <p className="text-sm text-slate-400 mt-1">Crea gruppi per organizzare i tuoi amici</p>
                            </div>
                        )}

                        {groups?.map((group) => (
                            <div
                                key={group.group_id}
                                className="p-4 rounded-2xl bg-white shadow-sm border border-slate-100 hover:shadow-md transition-shadow"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                                            style={{ backgroundColor: group.color }}
                                        >
                                            {group.name?.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-medium text-slate-800">{group.name}</p>
                                            <p className="text-sm text-slate-500">
                                                {(group.member_ids?.length || 0) + (group.imported_member_ids?.length || 0)} membri
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleDeleteGroup(group.group_id)}
                                        disabled={deleting === group.group_id}
                                        className="p-2 rounded-full text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
}

#!/usr/bin/env python3
"""
Script: create_component_structure.py
Direttiva: 01_refactor_frontend.md

Crea la struttura di cartelle e file base per il refactoring del frontend.
NON modifica codice esistente, crea solo la struttura vuota.
"""

import os
import sys

# Base path del frontend
FRONTEND_SRC = os.path.join(os.path.dirname(__file__), '..', 'frontend', 'src')

# Struttura da creare
STRUCTURE = {
    'components': {
        'Map': [
            'MapView.jsx',
            'MapController.jsx', 
            'FriendMarker.jsx',
            'ImportedMarker.jsx',
            'MarkerCluster.jsx',
            'index.js'  # barrel export
        ],
        'Friends': [
            'FriendCard.jsx',
            'FriendsList.jsx',
            'FriendRequest.jsx',
            'ImportedFriendCard.jsx',
            'index.js'
        ],
        'Modals': [
            'ProfileModal.jsx',
            'SearchModal.jsx',
            'ImportModal.jsx',
            'MeetupModal.jsx',
            'AddFriendModal.jsx',
            'EditImportedModal.jsx',
            'index.js'
        ],
        'Layout': [
            'Sidebar.jsx',
            'Header.jsx',
            'FilterChips.jsx',
            'index.js'
        ]
    },
    'hooks': [
        'useAuth.js',
        'useFriends.js',
        'useMap.js',
        'useApi.js',
        'index.js'
    ],
    'services': [
        'api.js'
    ],
    'utils': [
        'constants.js',
        'helpers.js'
    ]
}

# Template per file index.js (barrel exports)
INDEX_TEMPLATE = '''// Barrel export for {folder}
// TODO: Add exports as components are created
'''

# Template per componente React base
COMPONENT_TEMPLATE = '''import React from 'react';

/**
 * {component_name}
 * 
 * TODO: Extract from Dashboard.jsx
 * See: directives/01_refactor_frontend.md
 */
export default function {component_name}({{ /* props */ }}) {{
  return (
    <div>
      {{/* TODO: Implement {component_name} */}}
    </div>
  );
}}
'''

# Template per hook
HOOK_TEMPLATE = '''import {{ useState, useEffect, useCallback }} from 'react';

/**
 * {hook_name}
 * 
 * TODO: Extract logic from Dashboard.jsx
 * See: directives/01_refactor_frontend.md
 */
export function {hook_name}() {{
  // TODO: Implement hook logic
  
  return {{
    // TODO: Return hook values
  }};
}}

export default {hook_name};
'''

# Template per service API
API_SERVICE_TEMPLATE = '''/**
 * API Service Layer
 * 
 * Centralizza tutte le chiamate API.
 * See: directives/01_refactor_frontend.md
 */

const API_URL = process.env.REACT_APP_BACKEND_URL;

// Helper per fetch con credentials
async function fetchWithAuth(endpoint, options = {}) {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
    throw new Error(error.detail || 'Request failed');
  }
  
  return response.json();
}

// ============== AUTH ==============

export const authApi = {
  getMe: () => fetchWithAuth('/api/auth/me'),
  logout: () => fetchWithAuth('/api/auth/logout', { method: 'POST' }),
};

// ============== FRIENDS ==============

export const friendsApi = {
  getAll: () => fetchWithAuth('/api/friends'),
  getForMap: () => fetchWithAuth('/api/friends/map'),
  getRequests: () => fetchWithAuth('/api/friends/requests'),
  sendRequest: (toUserId) => 
    fetchWithAuth('/api/friends/request', {
      method: 'POST',
      body: JSON.stringify({ to_user_id: toUserId }),
    }),
  acceptRequest: (friendshipId) =>
    fetchWithAuth(`/api/friends/accept/${friendshipId}`, { method: 'POST' }),
  remove: (friendId) =>
    fetchWithAuth(`/api/friends/${friendId}`, { method: 'DELETE' }),
};

// ============== IMPORTED FRIENDS ==============

export const importedFriendsApi = {
  getAll: () => fetchWithAuth('/api/imported-friends'),
  getForMap: () => fetchWithAuth('/api/imported-friends/map'),
  add: (friend) =>
    fetchWithAuth('/api/imported-friends', {
      method: 'POST',
      body: JSON.stringify(friend),
    }),
  update: (friendId, data) =>
    fetchWithAuth(`/api/imported-friends/${friendId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (friendId) =>
    fetchWithAuth(`/api/imported-friends/${friendId}`, { method: 'DELETE' }),
  geocode: (friendId) =>
    fetchWithAuth(`/api/imported-friends/${friendId}/geocode`, { method: 'POST' }),
  importCSV: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return fetch(`${API_URL}/api/imported-friends/csv`, {
      method: 'POST',
      credentials: 'include',
      body: formData,
    }).then(r => r.json());
  },
};

// ============== USERS ==============

export const usersApi = {
  get: (userId) => fetchWithAuth(`/api/users/${userId}`),
  updateMe: (data) =>
    fetchWithAuth('/api/users/me', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  search: (query) => fetchWithAuth(`/api/search/users?q=${encodeURIComponent(query)}`),
};

// ============== MEETUPS ==============

export const meetupsApi = {
  getAll: () => fetchWithAuth('/api/meetups'),
  create: (meetup) =>
    fetchWithAuth('/api/meetups', {
      method: 'POST',
      body: JSON.stringify(meetup),
    }),
  join: (meetupId) =>
    fetchWithAuth(`/api/meetups/${meetupId}/join`, { method: 'POST' }),
  delete: (meetupId) =>
    fetchWithAuth(`/api/meetups/${meetupId}`, { method: 'DELETE' }),
};

// ============== MESSAGES ==============

export const messagesApi = {
  getInbox: () => fetchWithAuth('/api/messages/inbox'),
  getSent: () => fetchWithAuth('/api/messages/sent'),
  send: (toUserId, content, messageType = 'text') =>
    fetchWithAuth('/api/messages', {
      method: 'POST',
      body: JSON.stringify({ to_user_id: toUserId, content, message_type: messageType }),
    }),
  markRead: (messageId) =>
    fetchWithAuth(`/api/messages/${messageId}/read`, { method: 'PUT' }),
};

// ============== GEOCODING ==============

export const geocodingApi = {
  geocode: (city) =>
    fetchWithAuth('/api/geocode', {
      method: 'POST',
      body: JSON.stringify({ city }),
    }),
};

// Default export con tutti i servizi
export default {
  auth: authApi,
  friends: friendsApi,
  importedFriends: importedFriendsApi,
  users: usersApi,
  meetups: meetupsApi,
  messages: messagesApi,
  geocoding: geocodingApi,
};
'''


def create_structure():
    """Crea la struttura di cartelle e file."""
    created_dirs = []
    created_files = []
    
    print("🏗️  Creating component structure...")
    print(f"   Base path: {os.path.abspath(FRONTEND_SRC)}\n")
    
    for folder, contents in STRUCTURE.items():
        folder_path = os.path.join(FRONTEND_SRC, folder)
        
        if isinstance(contents, dict):
            # Nested folders (like components/Map)
            for subfolder, files in contents.items():
                subfolder_path = os.path.join(folder_path, subfolder)
                os.makedirs(subfolder_path, exist_ok=True)
                created_dirs.append(subfolder_path)
                print(f"📁 Created: {folder}/{subfolder}/")
                
                for file in files:
                    file_path = os.path.join(subfolder_path, file)
                    if not os.path.exists(file_path):
                        if file == 'index.js':
                            content = INDEX_TEMPLATE.format(folder=subfolder)
                        else:
                            component_name = file.replace('.jsx', '')
                            content = COMPONENT_TEMPLATE.format(component_name=component_name)
                        
                        with open(file_path, 'w') as f:
                            f.write(content)
                        created_files.append(file_path)
                        print(f"   📄 {file}")
        else:
            # Direct files in folder
            os.makedirs(folder_path, exist_ok=True)
            created_dirs.append(folder_path)
            print(f"📁 Created: {folder}/")
            
            for file in contents:
                file_path = os.path.join(folder_path, file)
                if not os.path.exists(file_path):
                    if file == 'api.js':
                        content = API_SERVICE_TEMPLATE
                    elif file.startswith('use'):
                        hook_name = file.replace('.js', '')
                        content = HOOK_TEMPLATE.format(hook_name=hook_name)
                    elif file == 'index.js':
                        content = INDEX_TEMPLATE.format(folder=folder)
                    else:
                        content = f'// {file}\n// TODO: Implement\n'
                    
                    with open(file_path, 'w') as f:
                        f.write(content)
                    created_files.append(file_path)
                    print(f"   📄 {file}")
    
    print(f"\n✅ Done!")
    print(f"   Created {len(created_dirs)} directories")
    print(f"   Created {len(created_files)} files")
    print(f"\n💡 Next steps:")
    print(f"   1. Start with services/api.js (already populated)")
    print(f"   2. Extract MapController from Dashboard.jsx")
    print(f"   3. Extract modals one by one")
    print(f"   4. See directives/01_refactor_frontend.md for full plan")


if __name__ == '__main__':
    create_structure()

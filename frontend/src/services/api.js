/**
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
  getForMap: () => fetchWithAuth('/api/friends/map/grouped'),
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

// ============== GROUPS ==============

export const groupsApi = {
  getAll: () => fetchWithAuth('/api/groups'),
  create: (group) =>
    fetchWithAuth('/api/groups', {
      method: 'POST',
      body: JSON.stringify(group),
    }),
  addMember: (groupId, memberId, type) =>
    fetchWithAuth(`/api/groups/${groupId}/members`, {
      method: 'POST',
      body: JSON.stringify({ member_id: memberId, member_type: type }),
    }),
  removeMember: (groupId, memberId) =>
    fetchWithAuth(`/api/groups/${groupId}/members/${memberId}`, { method: 'DELETE' }),
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
  groups: groupsApi,
};

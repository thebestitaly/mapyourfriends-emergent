import { useState, useCallback } from 'react';
import { friendsApi, importedFriendsApi, groupsApi } from '../services/api';
import { toast } from 'sonner';

export function useFriends() {
  const [friends, setFriends] = useState([]);
  const [mapFriends, setMapFriends] = useState([]);
  const [importedFriends, setImportedFriends] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchFriends = useCallback(async () => {
    setLoading(true);
    try {
      const data = await friendsApi.getAll();
      setFriends(data);
    } catch (err) {
      console.error('Error fetching friends:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchMapFriends = useCallback(async () => {
    try {
      const data = await friendsApi.getForMap();
      setMapFriends(data.filter(f => f.marker_type === 'active'));
      setImportedFriends(data.filter(f => f.marker_type === 'imported'));
    } catch (err) {
      console.error('Error fetching map friends:', err);
    }
  }, []);

  const fetchImportedFriends = useCallback(async () => {
    // Kept for specific needs, but map fetch handles list population too usually
    try {
      const data = await importedFriendsApi.getForMap();
      setImportedFriends(data);
    } catch (err) {
      console.error('Error fetching imported friends:', err);
    }
  }, []);

  const fetchFriendRequests = useCallback(async () => {
    try {
      const data = await friendsApi.getRequests();
      setFriendRequests(data);
    } catch (err) {
      console.error('Error fetching friend requests:', err);
    }
  }, []);

  const fetchGroups = useCallback(async () => {
    try {
      const data = await groupsApi.getAll();
      setGroups(data);
    } catch (err) {
      console.error('Error fetching groups:', err);
    }
  }, []);

  const refreshAll = useCallback(() => {
    fetchFriends();
    fetchMapFriends(); // This now fetches both active and imported with group data
    fetchFriendRequests();
    fetchGroups();
  }, [fetchFriends, fetchMapFriends, fetchFriendRequests, fetchGroups]);

  const sendFriendRequest = async (toUserId) => {
    try {
      await friendsApi.sendRequest(toUserId);
      toast.success('Friend request sent!');
      return true;
    } catch (err) {
      toast.error(err.message || 'Failed to send request');
      return false;
    }
  };

  const acceptFriendRequest = async (friendshipId) => {
    try {
      await friendsApi.acceptRequest(friendshipId);
      toast.success('Friend request accepted!');
      refreshAll();
      return true;
    } catch (err) {
      toast.error('Failed to accept request');
      return false;
    }
  };

  return {
    friends,
    mapFriends,
    importedFriends,
    friendRequests,
    groups,
    loading,
    error,
    fetchFriends,
    fetchMapFriends,
    fetchImportedFriends,
    fetchFriendRequests,
    fetchGroups,
    refreshAll,
    sendFriendRequest,
    acceptFriendRequest,
  };
}

export default useFriends;

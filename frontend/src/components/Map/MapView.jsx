import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import MapController from './MapController';
import FriendMarker from './FriendMarker';
import ImportedMarker from './ImportedMarker';
import { createClusterCustomIcon, createMarkerIcon } from '../../utils/mapUtils';

export default function MapView({
  center,
  zoom,
  user,
  friends,
  importedFriends,
  onFriendClick,
  onImportedFriendClick
}) {
  return (
    <div className="absolute inset-0 z-0">
      <MapContainer
        center={center}
        zoom={zoom}
        className="h-full w-full"
        zoomControl={false}
        attributionControl={false}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />
        <MapController center={center} zoom={zoom} />

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
        {friends.map((friend, idx) => (
          <FriendMarker
            key={`${friend.user_id}-${friend.marker_type}-${idx}`}
            friend={friend}
            onClick={onFriendClick}
          />
        ))}

        {/* Imported friend markers with clustering */}
        <MarkerClusterGroup
          chunkedLoading
          iconCreateFunction={createClusterCustomIcon}
          maxClusterRadius={60}
          spiderfyOnMaxZoom={true}
          showCoverageOnHover={false}
          zoomToBoundsOnClick={true}
          disableClusteringAtZoom={12}
          animate={true}
        >
          {importedFriends.map((friend, idx) => (
            <ImportedMarker
              key={`imported-${friend.friend_id}-${idx}`}
              friend={friend}
              onClick={onImportedFriendClick}
            />
          ))}
        </MarkerClusterGroup>
      </MapContainer>
    </div>
  );
}

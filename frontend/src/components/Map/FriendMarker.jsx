import React from 'react';
import { Marker, Popup } from 'react-leaflet';
import { createMarkerIcon } from '../../utils/mapUtils';

export default function FriendMarker({ friend, onClick }) {
  const position = [friend.lat, friend.lng];
  const initial = friend.name?.charAt(0) || '?';
  const type = friend.marker_type;

  return (
    <Marker
      position={position}
      icon={createMarkerIcon(type, initial, 'success', friend.marker_color)}
      eventHandlers={{
        click: () => onClick(friend)
      }}
    >
      <Popup>
        <div className="p-2 min-w-[180px]">
          <p className="font-heading font-semibold">{friend.name}</p>
          <p className="text-sm text-slate-500">
            {type === 'active' ? friend.active_city : friend.city_name}
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
  );
}

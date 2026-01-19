import React from 'react';
import { Marker, Popup } from 'react-leaflet';
import { createMarkerIcon } from '../../utils/mapUtils';
import { AlertCircle } from 'lucide-react';

export default function ImportedMarker({ friend, onClick }) {
  const position = [friend.lat, friend.lng];
  const initial = friend.name?.charAt(0) || '?';

  return (
    <Marker
      position={position}
      icon={createMarkerIcon('imported', initial, friend.geocode_status, friend.marker_color)}
      eventHandlers={{
        click: () => onClick(friend)
      }}
    >
      <Popup>
        <div className="p-2 min-w-[180px]">
          <div className="flex items-center gap-2">
            <p className="font-heading font-semibold">{friend.name}</p>
            {friend.geocode_status === 'failed' && (
              <AlertCircle className="w-4 h-4 text-amber-500" />
            )}
          </div>
          <p className="text-sm text-slate-500">{friend.city}</p>
          {friend.email && (
            <p className="text-xs text-slate-400 mt-1">{friend.email}</p>
          )}
          {friend.phone && (
            <p className="text-xs text-slate-400">{friend.phone}</p>
          )}
          <span className="inline-block mt-2 px-2 py-0.5 rounded-full bg-pink-100 text-pink-700 text-xs">
            Importato
          </span>
        </div>
      </Popup>
    </Marker>
  );
}

import { useState, useCallback } from 'react';

export function useMap() {
  const [mapCenter, setMapCenter] = useState([20, 0]);
  const [mapZoom, setMapZoom] = useState(2);
  const [filter, setFilter] = useState('all');

  const flyTo = useCallback((lat, lng, zoom = 8) => {
    setMapCenter([lat, lng]);
    setMapZoom(zoom);
  }, []);

  return {
    mapCenter,
    mapZoom,
    filter,
    setMapCenter,
    setMapZoom,
    setFilter,
    flyTo
  };
}

export default useMap;

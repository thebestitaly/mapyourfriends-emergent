import L from 'leaflet';

export const createClusterCustomIcon = (cluster) => {
    const count = cluster.getChildCount();
    let size = 'small';
    let dimensions = 40;

    if (count >= 10) {
        size = 'large';
        dimensions = 60;
    } else if (count >= 5) {
        size = 'medium';
        dimensions = 50;
    }

    return L.divIcon({
        html: `<div class="cluster-marker cluster-${size}">
      <span>${count}</span>
    </div>`,
        className: 'custom-cluster-icon',
        iconSize: L.point(dimensions, dimensions, true),
    });
};

export const createMarkerIcon = (type, initial, status = 'success', color = null) => {
    let bgClass;
    let textColor;

    if (color) {
        bgClass = `background: ${color};`;
        textColor = '#fff';
    } else if (type === 'imported') {
        if (status === 'failed' || status === 'manual') {
            bgClass = 'background: linear-gradient(135deg, #F59E0B, #EF4444);';
            textColor = '#fff';
        } else {
            bgClass = 'background: linear-gradient(135deg, #EC4899, #A855F7);';
            textColor = '#fff';
        }
    } else if (type === 'active') {
        bgClass = 'background: linear-gradient(135deg, #06B6D4, #3B82F6);';
        textColor = '#fff';
    } else {
        bgClass = 'background: transparent; border: 3px solid #06B6D4;';
        textColor = '#06B6D4';
    }

    return L.divIcon({
        className: 'custom-marker',
        html: `
      <div style="
        width: 40px; height: 40px; border-radius: 50%; ${bgClass}
        display: flex; align-items: center; justify-content: center;
        box-shadow: 0 4px 14px rgba(236, 72, 153, ${type === 'imported' ? '0.4' : '0.2'});
        border: 3px solid white; font-weight: 700; font-size: 14px;
        color: ${textColor}; font-family: 'Manrope', sans-serif;
      ">${initial}</div>
    `,
        iconSize: [40, 40],
        iconAnchor: [20, 20],
        popupAnchor: [0, -20]
    });
};

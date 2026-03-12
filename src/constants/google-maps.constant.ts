export const MAP_CONTAINER_STYLE = {
  width: '100%',
  height: '100%',
  minHeight: '400px',
  borderRadius: '12px',
};

export const MAP_STYLES: google.maps.MapTypeStyle[] = [
  // POI — show local businesses and landmarks for area context
  {
    featureType: 'poi.park',
    elementType: 'geometry',
    stylers: [{ color: '#d9f6e1' }, { visibility: 'on' }],
  },
  {
    featureType: 'poi.business',
    elementType: 'all',
    stylers: [{ visibility: 'simplified' }],
  },
  {
    featureType: 'poi.attraction',
    elementType: 'all',
    stylers: [{ visibility: 'on' }],
  },
  {
    featureType: 'poi.government',
    elementType: 'all',
    stylers: [{ visibility: 'on' }],
  },
  {
    featureType: 'poi.medical',
    elementType: 'all',
    stylers: [{ visibility: 'on' }],
  },
  {
    featureType: 'poi.school',
    elementType: 'all',
    stylers: [{ visibility: 'on' }],
  },

  // Land — clean white/light gray (no yellow/beige)
  {
    featureType: 'landscape',
    elementType: 'geometry',
    stylers: [{ color: '#BEEBC8' }],
  },
  {
    featureType: 'landscape.natural',
    elementType: 'geometry',
    stylers: [{ color: '#f4f0e5' }],
  },
  {
    featureType: 'landscape.man_made',
    elementType: 'geometry',
    stylers: [{ color: '#f4f0e5' }],
  },

  // Water
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#97d7ea' }],
  },
  {
    featureType: 'water',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#4a9fb5' }],
  },

  // Roads — highways, arterial, and local for area context
  { featureType: 'road', elementType: 'all', stylers: [{ visibility: 'off' }] },
  {
    featureType: 'road.highway',
    elementType: 'geometry',
    stylers: [{ color: '#a4afc9' }, { visibility: 'on' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#a4afc9' }, { visibility: 'on' }],
  },
  {
    featureType: 'road.arterial',
    elementType: 'geometry',
    stylers: [{ color: '#b8c4d4' }, { visibility: 'on' }],
  },
  {
    featureType: 'road.arterial',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#b8c4d4' }, { visibility: 'on' }],
  },
  {
    featureType: 'road.local',
    elementType: 'geometry',
    stylers: [{ color: '#d4dae4' }, { visibility: 'on' }],
  },
  {
    featureType: 'road.local',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#d4dae4' }, { visibility: 'on' }],
  },

  // Administrative borders — very light, show locality for area names
  {
    featureType: 'administrative',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#e0e0e0' }, { weight: 0.5 }],
  },
  {
    featureType: 'administrative.country',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#cccccc' }],
  },
  {
    featureType: 'administrative.locality',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#333333' }, { visibility: 'on' }],
  },
  {
    featureType: 'administrative.neighborhood',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#555555' }, { visibility: 'on' }],
  },

  // Transit — show for local context
  {
    featureType: 'transit.station',
    elementType: 'all',
    stylers: [{ visibility: 'simplified' }],
  },

  // Labels — dark text, clean
  {
    featureType: 'all',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#333333' }],
  },
  {
    featureType: 'all',
    elementType: 'labels.text.stroke',
    stylers: [{ color: '#ffffff' }, { weight: 2 }],
  },
  {
    featureType: 'road',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#666666' }],
  },
];

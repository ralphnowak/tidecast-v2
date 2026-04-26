import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export default function Map({ region, zone, reports, visibleSpecies, setVisibleSpecies }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  // Get unique species from reports
  // Get unique species from reports
  const allSpecies = [...new Set(reports.map(r => r.species))];

  useEffect(() => {
    // Initialize visible species on first render
    if (visibleSpecies.size === 0 && allSpecies.length > 0) {
      setVisibleSpecies(new Set(allSpecies));
    }
  }, [allSpecies, visibleSpecies.size]);

  useEffect(() => {
    if (!mapRef.current) return;

    // Initialize map on first render
    if (!mapInstanceRef.current) {
      const centerCoords = getRegionCenter(region);
      mapInstanceRef.current = L.map(mapRef.current).setView(centerCoords, 9);
      
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(mapInstanceRef.current);
    }

    // Clear existing markers
    markersRef.current.forEach(marker => mapInstanceRef.current.removeLayer(marker));
    markersRef.current = [];

    // Add markers for each report (only if species is visible)
    if (reports && reports.length > 0) {
      reports.forEach(report => {
        if (!visibleSpecies.has(report.species)) return;

        const coords = getCoordinatesForLocation(report.location);
        
        if (coords) {
          const marker = L.circleMarker(coords, {
            radius: 8,
            fillColor: getColorForSpecies(report.species),
            color: '#fff',
            weight: 2,
            opacity: 1,
            fillOpacity: 0.8,
          }).addTo(mapInstanceRef.current);

          const popupHTML = `
            <div style="font-family: 'Courier Prime', monospace; width: 250px; color: #0A2342;">
              <h4 style="color: #4B5320; margin: 0 0 8px 0; font-size: 16px;">${report.species}</h4>
              <p style="margin: 4px 0;"><strong>Location:</strong> ${report.location}</p>
              <p style="margin: 4px 0;"><strong>Zone:</strong> ${report.zone}</p>
              <p style="margin: 4px 0;"><strong>Technique:</strong> ${report.technique}</p>
              <p style="margin: 4px 0;"><strong>Size:</strong> ${report.weight}</p>
              <p style="margin: 4px 0; color: #4B5320;"><strong>Action:</strong> ${report.action}</p>
            </div>
          `;

          marker.bindPopup(popupHTML);
          markersRef.current.push(marker);
        }
      });

      // Fit map to markers
      if (markersRef.current.length > 0) {
        const group = L.featureGroup(markersRef.current);
        mapInstanceRef.current.fitBounds(group.getBounds().pad(0.1));
      }
    }
  }, [reports, region, zone, visibleSpecies]);

  const toggleSpecies = (species) => {
    const newVisible = new Set(visibleSpecies);
    if (newVisible.has(species)) {
      newVisible.delete(species);
    } else {
      newVisible.add(species);
    }
    setVisibleSpecies(newVisible);
  };

  return (
    <div>
      <div style={{ marginBottom: '12px' }}>
        <div style={{ color: '#C2B280', fontSize: '12px', fontWeight: 'bold', marginBottom: '8px' }}>FILTER BY SPECIES:</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {allSpecies.map(species => (
            <button
              key={species}
              onClick={() => toggleSpecies(species)}
              style={{
                padding: '6px 12px',
                border: `1px solid ${getColorForSpecies(species)}`,
                backgroundColor: visibleSpecies.has(species) ? getColorForSpecies(species) : 'transparent',
                color: visibleSpecies.has(species) ? '#fff' : '#C2B280',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '11px',
                fontFamily: 'Courier Prime, monospace',
                transition: 'all 0.2s',
              }}
            >
              {species}
            </button>
          ))}
        </div>
      </div>
      <div
        ref={mapRef}
        style={{
          width: '100%',
          height: '500px',
          borderRadius: '8px',
          border: '2px solid #4B5320',
          marginTop: '20px',
          marginBottom: '20px',
        }}
      />
    </div>
  );
}

function getRegionCenter(region) {
  const centers = {
    chesapeake: [38.2, -76.2],
    potomac: [38.8, -77.2],
    paxriver: [38.6, -76.7],
  };
  return centers[region] || [38.5, -76.5];
}

function getCoordinatesForLocation(location) {
  // ACCURATE coordinates - water only!
const coords = {
  'Upper Chesapeake Bay': [37.8968, -76.2298],
  'Eastern Bay Lumps': [38.95, -76.15],
  'Eastern Bay Grass': [38.9, -76.2],
  'Eastern Bay Channel': [38.85, -76.3],
  'Middle Bay Structure': [38.6, -76.4],
  'Hooper Island Light': [38.2561, -76.2496],
  'Point Lookout': [37.5864, -76.3132],
  'Practice Target Ship (SE)': [38.0317, -76.1681],
  'Pilings & Channel Markers': [38.7, -76.35],
  'Lower Bay Flats': [37.8, -76.1],
  'Point No Point Light': [38.1308, -76.2117],
  'Eastern Bay Flats': [38.8, -76.25],
  'Wreck & Structure': [37.5, -76.25],
  'Sandy Bottom Areas': [37.7, -76.35],
  'Point Lookout Deep': [37.56, -76.35],
  'Eastern Shore Channel': [38.5, -75.85],
  'Eastern Shore Flats': [38.4, -75.8],
  'Sycamore Island': [39.1, -77.5],
  'Upper Potomac Flats': [39.15, -77.45],
  'Great Falls Pool': [39.0, -77.3],
  'Angler Island': [38.95, -77.25],
  'Quiet Coves': [39.05, -77.35],
  'Monitor Run': [38.82, -77.18],
  'Roosevelt Island': [38.78, -77.12],
  'Middle Potomac Ponds': [38.72, -77.08],
  'Current Breaks': [38.65, -76.98],
  'Vegetated Areas': [38.68, -77.02],
  'Occoquan': [38.52, -77.16],
  'Pohick Bay': [38.42, -77.22],
  'Lower Potomac Backwater': [38.32, -76.92],
  'Deep Holes': [38.22, -76.82],
  'Hunting Creek': [39.0, -76.8],
  'Upper Patuxent Ponds': [38.95, -76.75],
  'Weedy Areas': [38.9, -76.7],
  'Upper Patuxent': [38.85, -76.65],
  'Jug Bay': [38.65, -76.7],
  'Jug Bay Marsh': [38.62, -76.68],
  'Jug Bay Flats': [38.58, -76.62],
  'Middle Patuxent': [38.5, -76.6],
  'Deep Pools': [38.4, -76.55],
  'Benedict area': [38.35, -76.5],
  'Lower Patuxent Deep': [38.25, -76.45],
  'Lower Patuxent': [38.2706, -76.3763],
  'Lower Patuxent Backwater': [38.15, -76.35],
};
  return coords[location];
}

function getColorForSpecies(species) {
  const colors = {
    'Striped Bass': '#FFD700',
    'Black Drum': '#8B4513',
    'Largemouth Bass': '#228B22',
    'Spot': '#FF6347',
    'Croaker': '#FFA500',
    'Cobia': '#DC143C',
    'Red Drum': '#FF4500',
    'Bluefish': '#4169E1',
    'Sheepshead': '#696969',
    'Spanish Mackerel': '#00CED1',
    'Perch': '#DAA520',
    'Black Sea Bass': '#2F4F4F',
    'Flounder': '#A9A9A9',
    'Catfish': '#8B7355',
    'Smallmouth Bass': '#3CB371',
    'Snakehead': '#FF1493',
    'Channel Catfish': '#CD853F',
    'Chain Pickerel': '#6B8E23',
    'American Shad': '#778899',
    'Bluegill': '#FFB6C1',
    'Crappie': '#DEB887',
    'Flathead Catfish': '#654321',
  };
  return colors[species] || '#4B5320';
}
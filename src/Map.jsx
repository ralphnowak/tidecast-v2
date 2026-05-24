import { useEffect, useMemo, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { getRegionCenter, getReportCoordinates } from '../shared/geo.js';

export default function Map({ region, zone, reports, visibleSpecies, setVisibleSpecies }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const allSpecies = useMemo(() => [...new Set(reports.map(r => r.species))], [reports]);

  useEffect(() => {
    if (allSpecies.length > 0) setVisibleSpecies(new Set(allSpecies));
  }, [region, zone, allSpecies.join('|')]);

  useEffect(() => {
    if (!mapRef.current) return;
    if (!mapInstanceRef.current) {
      mapInstanceRef.current = L.map(mapRef.current).setView(getRegionCenter(region), 9);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(mapInstanceRef.current);
    }

    markersRef.current.forEach(marker => mapInstanceRef.current.removeLayer(marker));
    markersRef.current = [];

    reports.forEach((report, index) => {
      if (!visibleSpecies.has(report.species)) return;
      const coords = getReportCoordinates(report, region, zone, index);
      const marker = L.circleMarker(coords, {
        radius: 8,
        fillColor: getColorForSpecies(report.species),
        color: '#fff',
        weight: 2,
        opacity: 1,
        fillOpacity: 0.85,
      }).addTo(mapInstanceRef.current);

      marker.bindPopup(`
        <div style="font-family: Courier Prime, monospace; width: 260px; color: #0A2342;">
          <h4 style="color: #4B5320; margin: 0 0 8px 0; font-size: 16px;">${report.species}</h4>
          <p style="margin: 4px 0;"><strong>Location:</strong> ${report.location}</p>
          <p style="margin: 4px 0;"><strong>Zone:</strong> ${report.zone}</p>
          <p style="margin: 4px 0;"><strong>Technique:</strong> ${report.technique}</p>
          <p style="margin: 4px 0;"><strong>Action:</strong> ${report.action}</p>
          <p style="margin: 4px 0;"><strong>Signal:</strong> ${report.signalLabel || 'Regional Signal'}</p>
          <p style="margin: 4px 0;"><strong>Source:</strong> ${report.source || 'Regional Report'}</p>
        </div>`);
      markersRef.current.push(marker);
    });

    if (markersRef.current.length > 0) {
      const group = L.featureGroup(markersRef.current);
      mapInstanceRef.current.fitBounds(group.getBounds().pad(0.18));
    } else {
      mapInstanceRef.current.setView(getRegionCenter(region), 9);
    }
  }, [reports, region, zone, visibleSpecies]);

  const toggleSpecies = (species) => {
    const next = new Set(visibleSpecies);
    next.has(species) ? next.delete(species) : next.add(species);
    setVisibleSpecies(next);
  };

  return (
    <div>
      <div style={{ marginBottom: '12px' }}>
        <div style={{ color: '#C2B280', fontSize: '12px', fontWeight: 'bold', marginBottom: '8px' }}>FILTER BY SPECIES:</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
          <button onClick={() => setVisibleSpecies(new Set(allSpecies))} style={controlButtonStyle}>Show All</button>
          <button onClick={() => setVisibleSpecies(new Set())} style={controlButtonStyle}>Clear</button>
          {allSpecies.map(species => (
            <button key={species} onClick={() => toggleSpecies(species)} style={{
              padding: '6px 12px', border: `1px solid ${getColorForSpecies(species)}`,
              backgroundColor: visibleSpecies.has(species) ? getColorForSpecies(species) : 'transparent',
              color: visibleSpecies.has(species) ? '#fff' : '#C2B280', borderRadius: '4px', cursor: 'pointer',
              fontSize: '11px', fontFamily: 'Courier Prime, monospace', transition: 'all 0.2s',
            }}>{species}</button>
          ))}
        </div>
      </div>
      <div ref={mapRef} style={{ width: '100%', height: '500px', borderRadius: '8px', border: '2px solid #4B5320', marginTop: '20px', marginBottom: '20px' }} />
    </div>
  );
}

const controlButtonStyle = {
  padding: '6px 12px', border: '1px solid #C2B280', background: 'rgba(194,178,128,.15)',
  color: '#C2B280', borderRadius: '4px', cursor: 'pointer', fontSize: '11px', fontFamily: 'Courier Prime, monospace',
};

function getColorForSpecies(species) {
  const colors = {
    'Striped Bass': '#FFD700', 'Black Drum': '#8B4513', 'Largemouth Bass': '#228B22', 'Spot': '#FF6347',
    'Croaker': '#FFA500', 'Cobia': '#DC143C', 'Red Drum': '#FF4500', 'Bluefish': '#4169E1',
    'Sheepshead': '#696969', 'Spanish Mackerel': '#00CED1', 'Yellow Perch': '#6B6B22', 'White Perch': '#5F6428',
    'Black Sea Bass': '#2F4F4F', 'Flounder': '#A9A9A9', 'Catfish': '#8B7355', 'Smallmouth Bass': '#3CB371',
    'Snakehead': '#FF1493', 'Channel Catfish': '#CD853F', 'Chain Pickerel': '#6B8E23', 'American Shad': '#778899',
    'Bluegill': '#FFB6C1', 'Crappie': '#DEB887', 'Flathead Catfish': '#654321', 'Weakfish': '#7B68EE',
    'Carp': '#DAA520', 'Tautog': '#556B2F', 'Kingfish': '#20B2AA', 'Speckled Sea Trout': '#7CFC00', 'Sharks': '#708090',
  };
  return colors[species] || '#4B5320';
}

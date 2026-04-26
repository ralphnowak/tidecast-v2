import { useEffect, useMemo, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export default function Map({ region, zone, reports, visibleSpecies, setVisibleSpecies }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const allSpecies = useMemo(() => [...new Set(reports.map(r => r.species))], [reports]);

  useEffect(() => {
    if (allSpecies.length > 0) {
      setVisibleSpecies(new Set(allSpecies));
    }
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

      const coords = getCoordinatesForLocation(report.location) || getFallbackCoordinates(region, zone, index);
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
          <p style="margin: 4px 0;"><strong>Source:</strong> ${report.source || 'Regional Report'}</p>
        </div>
      `);

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

  const showAll = () => setVisibleSpecies(new Set(allSpecies));
  const clearAll = () => setVisibleSpecies(new Set());

  return (
    <div>
      <div style={{ marginBottom: '12px' }}>
        <div style={{ color: '#C2B280', fontSize: '12px', fontWeight: 'bold', marginBottom: '8px' }}>FILTER BY SPECIES:</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
          <button onClick={showAll} style={controlButtonStyle}>Show All</button>
          <button onClick={clearAll} style={controlButtonStyle}>Clear</button>
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
        style={{ width: '100%', height: '500px', borderRadius: '8px', border: '2px solid #4B5320', marginTop: '20px', marginBottom: '20px' }}
      />
    </div>
  );
}

const controlButtonStyle = {
  padding: '6px 12px',
  border: '1px solid #C2B280',
  background: 'rgba(194,178,128,.15)',
  color: '#C2B280',
  borderRadius: '4px',
  cursor: 'pointer',
  fontSize: '11px',
  fontFamily: 'Courier Prime, monospace',
};

function getRegionCenter(region) {
  const centers = {
    chesapeake: [38.2, -76.2],
    potomac: [38.8, -77.2],
    paxriver: [38.6, -76.7],
  };
  return centers[region] || [38.5, -76.5];
}

function getFallbackCoordinates(region, zone, index) {
  const zoneCenters = {
    'upper-bay': [39.05, -76.32],
    'middle-bay': [38.65, -76.33],
    'lower-bay': [37.75, -76.20],
    'eastern-shore': [38.62, -75.95],
    'upper-potomac': [39.05, -77.43],
    'middle-potomac': [38.78, -77.12],
    'lower-potomac': [38.32, -76.92],
    'upper-pax': [38.90, -76.72],
    'middle-pax': [38.55, -76.66],
    'lower-pax': [38.25, -76.45],
  };
  const base = zoneCenters[zone] || getRegionCenter(region);
  const offset = (index % 9) - 4;
  return [base[0] + offset * 0.018, base[1] + offset * 0.018];
}

function getCoordinatesForLocation(location) {
  const coords = {
    'Upper Bay Main Channel': [39.08, -76.28],
    'Upper Bay Flats': [39.12, -76.22],
    'Upper Bay Spawning Areas': [39.18, -76.20],
    'Upper Bay Channels': [39.03, -76.30],
    'Upper Bay Coves': [39.00, -76.25],
    'Upper Bay Shallows': [39.15, -76.25],
    'Upper Bay Vegetation': [39.10, -76.18],
    'Upper Bay Deep Holes': [38.98, -76.32],
    'Eastern Bay Channel': [38.85, -76.30],
    'Eastern Bay Grass Beds': [38.90, -76.20],
    'Eastern Bay Structure': [38.88, -76.26],
    'Eastern Bay Flats': [38.80, -76.25],
    'Middle Bay Sandy Areas': [38.62, -76.34],
    'Middle Bay Rocks': [38.58, -76.30],
    'Middle Bay Bottom': [38.55, -76.28],
    'Pilings & Jetties': [38.70, -76.35],
    'Middle Bay Channels': [38.60, -76.36],
    'Middle Bay Shallows': [38.66, -76.30],
    'Thimble Shoal Light': [37.02, -76.24],
    'Point Lookout': [37.5864, -76.3132],
    'Hooper Island Light': [38.2561, -76.2496],
    'Practice Target Ship': [38.0317, -76.1681],
    'Lower Bay Open Water': [37.80, -76.10],
    'Lower Bay Shelf': [37.72, -76.05],
    'Lower Bay Grass': [37.82, -76.25],
    'Point Lookout Deep': [37.56, -76.35],
    'Lower Bay Sandy Bottom': [37.70, -76.35],
    'Lower Bay Rocks': [37.64, -76.22],
    'Lower Bay Deep Areas': [37.58, -76.20],
    'Lower Bay Offshore': [37.45, -76.05],
    'Eastern Shore Marshes': [38.45, -75.90],
    'Eastern Shore Channel': [38.50, -75.85],
    'Eastern Shore Flats': [38.40, -75.80],
    'Eastern Shore Coves': [38.55, -75.92],
    'Eastern Shore Spawning': [38.62, -75.95],
    'Sycamore Island': [39.10, -77.50],
    'Upper Potomac Flats': [39.15, -77.45],
    'Great Falls Pool': [39.00, -77.30],
    'Angler Island': [38.95, -77.25],
    'Upper Potomac Coves': [39.05, -77.35],
    'Upper Potomac Rapids': [39.02, -77.38],
    'Upper Potomac Backwater': [39.08, -77.42],
    'Upper Potomac Shallows': [39.12, -77.40],
    'Monitor Run': [38.82, -77.18],
    'Middle Potomac Structure': [38.78, -77.12],
    'Roosevelt Island': [38.78, -77.12],
    'Middle Potomac Ponds': [38.72, -77.08],
    'Middle Potomac Deep': [38.68, -77.00],
    'Middle Potomac Current': [38.65, -76.98],
    'Middle Potomac Channels': [38.66, -77.04],
    'Middle Potomac Coves': [38.70, -77.06],
    'Occoquan': [38.52, -77.16],
    'Pohick Bay': [38.42, -77.22],
    'Lower Potomac Backwater': [38.32, -76.92],
    'Lower Potomac Deep': [38.22, -76.82],
    'Lower Potomac Structure': [38.28, -76.84],
    'Lower Potomac Open Water': [38.18, -76.78],
    'Lower Potomac Channel': [38.12, -76.70],
    'Hunting Creek': [39.00, -76.80],
    'Upper Patuxent Ponds': [38.95, -76.75],
    'Upper Patuxent Weeds': [38.90, -76.70],
    'Upper Patuxent': [38.85, -76.65],
    'Upper Patuxent Coves': [38.88, -76.68],
    'Jug Bay': [38.65, -76.70],
    'Jug Bay Marsh': [38.62, -76.68],
    'Jug Bay Flats': [38.58, -76.62],
    'Middle Patuxent': [38.50, -76.60],
    'Middle Patuxent Deep': [38.40, -76.55],
    'Middle Patuxent Channel': [38.45, -76.58],
    'Middle Patuxent Spawning': [38.48, -76.62],
    'Benedict Area': [38.50, -76.68],
    'Benedict area': [38.50, -76.68],
    'Lower Patuxent': [38.2706, -76.3763],
    'Cedar Point': [38.30, -76.38],
    'Lower Patuxent Backwater': [38.15, -76.35],
    'Lower Patuxent Deep': [38.25, -76.45],
    'Lower Patuxent Open': [38.20, -76.40],
    'Lower Patuxent Channel': [38.18, -76.38],
  };
  return coords[location];
}

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

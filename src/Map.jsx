import { useEffect, useMemo, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

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

function getRegionCenter(region) {
  const centers = { chesapeake: [38.2, -76.25], potomac: [38.5, -77.0], paxriver: [38.45, -76.58] };
  return centers[region] || [38.5, -76.5];
}

function getFallbackCoordinates(region, zone, index) {
  const waterCenters = {
    'upper-bay': [39.18, -76.18], 'middle-bay': [38.82, -76.28], 'lower-bay': [37.72, -76.20], 'eastern-shore': [38.52, -76.05],
    'upper-potomac': [39.05, -77.38], 'middle-potomac': [38.76, -77.04], 'lower-potomac': [38.15, -76.70],
    'upper-pax': [38.88, -76.67], 'middle-pax': [38.62, -76.69], 'lower-pax': [38.28, -76.43],
  };
  const base = waterCenters[zone] || getRegionCenter(region);
  const pattern = [[0,0], [0.012,-0.008], [-0.012,0.008], [0.018,0.006], [-0.018,-0.006], [0.006,0.018], [-0.006,-0.018], [0.024,-0.014], [-0.024,0.014]];
  const [latOffset, lonOffset] = pattern[index % pattern.length];
  return [base[0] + latOffset, base[1] + lonOffset];
}

function getCoordinatesForLocation(location) {
  const coords = {
    'Upper Bay Main Channel': [39.19, -76.18],
    'Upper Bay Flats': [39.12, -76.17],
    'Upper Bay Spawning Areas': [39.23, -76.22],
    'Upper Bay Channels': [39.06, -76.20],
    'Upper Bay Coves': [39.00, -76.20],
    'Upper Bay Shallows': [39.16, -76.24],
    'Upper Bay Vegetation': [39.10, -76.22],
    'Upper Bay Deep Holes': [38.99, -76.24],
    'Eastern Bay Channel': [38.84, -76.22],
    'Eastern Bay Grass Beds': [38.86, -76.17],
    'Eastern Bay Structure': [38.82, -76.20],
    'Eastern Bay Flats': [38.78, -76.19],
    'Middle Bay Sandy Areas': [38.55, -76.30],
    'Middle Bay Rocks': [38.50, -76.25],
    'Middle Bay Bottom': [38.47, -76.22],
    'Pilings & Jetties': [38.72, -76.30],
    'Middle Bay Channels': [38.64, -76.31],
    'Middle Bay Shallows': [38.68, -76.23],
    'Thimble Shoal Light': [37.01, -76.24],
    'Point Lookout': [37.57, -76.31],
    'Hooper Island Light': [38.26, -76.25],
    'Practice Target Ship': [38.04, -76.16],
    'Lower Bay Open Water': [37.78, -76.10],
    'Lower Bay Shelf': [37.68, -76.05],
    'Lower Bay Grass': [37.80, -76.22],
    'Point Lookout Deep': [37.53, -76.32],
    'Lower Bay Sandy Bottom': [37.65, -76.28],
    'Lower Bay Rocks': [37.60, -76.20],
    'Lower Bay Deep Areas': [37.50, -76.16],
    'Lower Bay Offshore': [37.42, -76.00],
    'Eastern Shore Marshes': [38.43, -76.17],
    'Eastern Shore Channel': [38.50, -76.18],
    'Eastern Shore Flats': [38.38, -76.14],
    'Eastern Shore Coves': [38.55, -76.20],
    'Eastern Shore Spawning': [38.62, -76.20],
    'Sycamore Island': [38.94, -77.13],
    'Upper Potomac Flats': [39.07, -77.38],
    'Great Falls Pool': [38.99, -77.25],
    'Angler Island': [38.94, -77.18],
    'Upper Potomac Coves': [39.03, -77.35],
    'Upper Potomac Rapids': [39.00, -77.30],
    'Upper Potomac Backwater': [39.05, -77.36],
    'Upper Potomac Shallows': [39.10, -77.40],
    'Monitor Run': [38.78, -77.05],
    'Middle Potomac Structure': [38.76, -77.04],
    'Roosevelt Island': [38.90, -77.06],
    'Middle Potomac Ponds': [38.69, -77.05],
    'Middle Potomac Deep': [38.62, -77.04],
    'Middle Potomac Current': [38.57, -77.00],
    'Middle Potomac Channels': [38.60, -77.02],
    'Middle Potomac Coves': [38.67, -77.05],
    'Occoquan': [38.68, -77.25],  // Occoquan Bay actual location
    'Pohick Bay': [38.67, -77.16],
    'Lower Potomac Backwater': [38.18, -76.75],
    'Lower Potomac Deep': [38.05, -76.58],
    'Lower Potomac Structure': [38.10, -76.63],
    'Lower Potomac Open Water': [38.00, -76.50],
    'Lower Potomac Channel': [37.90, -76.42],
    'Hunting Creek': [38.79, -76.70],
    'Upper Patuxent Ponds': [38.85, -76.73],  // river runs at ~-76.73 at this latitude
    'Upper Patuxent Weeds': [38.78, -76.70],
    'Upper Patuxent': [38.74, -76.68],
    'Upper Patuxent Coves': [38.72, -76.67],
    'Jug Bay': [38.77, -76.70],
    'Jug Bay Marsh': [38.75, -76.68],
    'Jug Bay Flats': [38.73, -76.69],
    'Middle Patuxent': [38.56, -76.68],
    'Middle Patuxent Deep': [38.48, -76.61],
    'Middle Patuxent Channel': [38.45, -76.58],
    'Middle Patuxent Spawning': [38.52, -76.65],
    'Benedict Area': [38.51, -76.68],
    'Benedict area': [38.51, -76.68],
    'Lower Patuxent': [38.32, -76.46],
    'Cedar Point': [38.30, -76.39],
    'Lower Patuxent Backwater': [38.24, -76.43],
    'Lower Patuxent Deep': [38.25, -76.45],
    'Lower Patuxent Open': [38.20, -76.40],
    'Lower Patuxent Channel': [38.22, -76.41],
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

import React, { useState, useEffect } from 'react';
import { Cloud, Fish, TrendingUp, AlertCircle, RefreshCw, MapPin } from 'lucide-react';
import { zones } from './zones';
import Map from './Map';
import { buildFishingIntelligence, getFishabilityLabel } from './intelligence';

function App() {
  const [selectedRegion, setSelectedRegion] = useState('chesapeake');
  const [selectedZone, setSelectedZone] = useState(zones['chesapeake'][0].id);
  const [forecast, setForecast] = useState(null);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [visibleSpecies, setVisibleSpecies] = useState(new Set());

  const regions = {
    chesapeake: { name: 'Chesapeake Bay' },
    potomac: { name: 'Potomac River' },
    paxriver: { name: 'Patuxent River' },
  };

  useEffect(() => {
    setSelectedZone(zones[selectedRegion][0].id);
  }, [selectedRegion]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        const forecastRes = await fetch(`/api/noaa?region=${selectedRegion}`);
        const forecastData = await forecastRes.json();
        setForecast(forecastData);

        const reportsRes = await fetch(`/api/reports?region=${selectedRegion}&zone=${selectedZone}`);
        const reportsData = await reportsRes.json();
        setReports(reportsData.reports || []);
      } catch (err) {
        setError('Failed to load forecast data');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [selectedRegion, selectedZone]);

  const currentRegion = regions[selectedRegion];
  const currentZones = zones[selectedRegion];
  const currentZone = currentZones.find(z => z.id === selectedZone);
  const intel = buildFishingIntelligence({ reports, forecast, currentZone, currentRegion });

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0a2342 0%, #1a4d6d 50%, #2a6b8d 100%)', color: '#f5f5f5', fontFamily: '"Courier Prime", monospace', padding: 20 }}>
      <div style={{ maxWidth: 1400, margin: '0 auto' }}>
        <h1 style={{ color: '#C2B280', letterSpacing: 2 }}>TIDECAST v2</h1>
        <p style={{ color: '#a0b0c0', textTransform: 'uppercase' }}>Zone-Based Fishing Intelligence</p>

        <div style={{ marginBottom: 24 }}>
          {Object.entries(regions).map(([key, region]) => (
            <button key={key} onClick={() => setSelectedRegion(key)} style={{ marginRight: 10, padding: '10px 18px', background: selectedRegion === key ? '#4B5320' : 'transparent', color: '#C2B280', border: '1px solid #4B5320' }}>
              {region.name}
            </button>
          ))}
        </div>

        <div style={{ marginBottom: 24 }}>
          {currentZones.map(zone => (
            <button key={zone.id} onClick={() => setSelectedZone(zone.id)} style={{ marginRight: 8, marginBottom: 8, padding: '8px 14px', background: selectedZone === zone.id ? 'rgba(194,178,128,.2)' : 'transparent', color: '#C2B280', border: '1px solid #4B5320' }}>
              {zone.name}
            </button>
          ))}
        </div>

        {!loading && intel?.best && (
          <div style={{ marginBottom: 30, padding: 24, background: 'rgba(10,35,66,.75)', border: '2px solid #C2B280', borderRadius: 8 }}>
            <div style={{ color: '#C2B280', fontSize: 14, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 12 }}>
              Today's Recommendation
            </div>
            <h2 style={{ margin: 0, fontSize: '2rem' }}>{intel.best.species}</h2>
            <p style={{ color: '#a0b0c0' }}>{currentZone?.name} • {currentRegion?.name}</p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 14, marginTop: 18 }}>
              <div><strong>Bite Index:</strong><br />{intel.biteIndex}/10 ({getFishabilityLabel(intel.best.biteScore)})</div>
              <div><strong>Best Window:</strong><br />{intel.bestWindow}</div>
              <div><strong>Technique:</strong><br />{intel.best.technique}</div>
              <div><strong>Confidence:</strong><br />{intel.confidence}%</div>
            </div>

            <div style={{ marginTop: 18, color: '#a0b0c0' }}>
              {intel.rationale.map((line, i) => <div key={i}>• {line}</div>)}
            </div>
          </div>
        )}

        <Map region={selectedRegion} zone={selectedZone} reports={reports} visibleSpecies={visibleSpecies} setVisibleSpecies={setVisibleSpecies} />

        <div style={{ marginTop: 24 }}>
          <h3 style={{ color: '#C2B280' }}>Live Reports</h3>
          {reports.map((report, idx) => (
            <div key={idx} style={{ padding: 14, marginBottom: 10, background: 'rgba(10,35,66,.6)', borderLeft: '4px solid #C2B280' }}>
              <strong>{report.species}</strong> — {report.location}<br />
              Technique: {report.technique} | Action: {report.action}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;

import React, { useState, useEffect } from 'react';
import { zones } from './zones';
import Map from './Map';
import { buildFishingIntelligence, getFishabilityLabel } from './intelligence';

function ConfidenceBar({ value }) {
  return (
    <div style={{ marginTop: 8 }}>
      <div style={{ height: 8, width: '100%', background: 'rgba(160,176,192,.25)', borderRadius: 999, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${value}%`, background: '#C2B280', borderRadius: 999 }} />
      </div>
    </div>
  );
}

function getFreshness(date) {
  if (!date) return { label: 'Recent', age: 'Recently', icon: '🟡' };
  const hours = Math.max(0, (Date.now() - new Date(date).getTime()) / 36e5);
  if (hours <= 12) return { label: 'Fresh', age: `${Math.round(hours)} hrs ago`, icon: '🔥' };
  if (hours <= 48) return { label: 'Recent', age: `${Math.round(hours)} hrs ago`, icon: '🟡' };
  return { label: 'Aging', age: `${Math.round(hours / 24)} days ago`, icon: '⚪' };
}

function getSource(report) {
  return report.source || report.provider || report.origin || 'Regional Report';
}

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

        {/* existing top sections unchanged */}

        <Map region={selectedRegion} zone={selectedZone} reports={reports} visibleSpecies={visibleSpecies} setVisibleSpecies={setVisibleSpecies} />

        <div style={{ marginTop: 24 }}>
          <h3 style={{ color: '#C2B280' }}>Live Reports</h3>
          {reports.map((report, idx) => {
            const freshness = getFreshness(report.date);
            const source = getSource(report);
            return (
              <div key={idx} style={{ padding: 16, marginBottom: 12, background: 'rgba(10,35,66,.6)', borderLeft: '4px solid #C2B280' }}>
                <div style={{ fontSize: 22, fontWeight: 'bold' }}>
                  {report.species} — {report.location}
                </div>

                <div style={{ marginTop: 8, color: '#a0b0c0', display: 'flex', flexWrap: 'wrap', gap: 18 }}>
                  <div><strong>Source:</strong> {source}</div>
                  <div><strong>Posted:</strong> {freshness.age}</div>
                  <div><strong>Freshness:</strong> {freshness.icon} {freshness.label}</div>
                </div>

                <div style={{ marginTop: 10 }}>
                  <strong>Technique:</strong> {report.technique}
                </div>
                <div style={{ marginTop: 6 }}>
                  <strong>Action:</strong> {report.action}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default App;

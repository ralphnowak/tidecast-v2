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
      const [forecastResult, reportsResult] = await Promise.allSettled([
        fetch(`/api/noaa?region=${selectedRegion}`).then(r => r.json()),
        fetch(`/api/reports?region=${selectedRegion}&zone=${selectedZone}`).then(r => r.json()),
      ]);
      if (forecastResult.status === 'fulfilled') setForecast(forecastResult.value);
      if (reportsResult.status === 'fulfilled') {
        setReports(reportsResult.value.reports || []);
      } else {
        setError('Failed to load reports');
      }
      setLoading(false);
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

        {error && <div style={{ color: '#C2B280', marginBottom: 16 }}>{error}</div>}

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
              <div><strong>Confidence:</strong><br />{intel.confidence}%<ConfidenceBar value={intel.confidence} /></div>
            </div>

            <div style={{ marginTop: 18, color: '#a0b0c0' }}>
              {intel.rationale.map((line, i) => <div key={i}>• {line}</div>)}
            </div>

            {intel.playbook?.length > 0 && (
              <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid rgba(194,178,128,.35)' }}>
                <div style={{ color: '#C2B280', fontSize: 14, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 14 }}>
                  Today's Playbook
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(230px,1fr))', gap: 14 }}>
                  {intel.playbook.map((item) => (
                    <div key={`${item.label}-${item.species}`} style={{ padding: 14, background: 'rgba(75,83,32,.22)', border: '1px solid rgba(194,178,128,.45)', borderRadius: 6 }}>
                      <div style={{ color: '#C2B280', fontSize: 12, textTransform: 'uppercase', letterSpacing: 1 }}>{item.label}</div>
                      <div style={{ fontSize: 20, fontWeight: 'bold', marginTop: 6 }}>{item.species}</div>
                      <div style={{ color: '#a0b0c0', marginTop: 6 }}>{item.location}</div>
                      <div style={{ marginTop: 10 }}><strong>Pattern:</strong> {item.technique}</div>
                      <div style={{ marginTop: 10 }}><strong>Bite:</strong> {(item.biteScore / 10).toFixed(1)}/10 • {getFishabilityLabel(item.biteScore)}</div>
                      <div style={{ marginTop: 10 }}><strong>Confidence:</strong> {item.confidence}%<ConfidenceBar value={item.confidence} /></div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {intel.primeWindows && (
              <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid rgba(194,178,128,.35)' }}>
                <div style={{ color: '#C2B280', fontSize: 14, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 14 }}>
                  Prime Bite Windows
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 14 }}>
                  <div style={{ padding: 14, background: 'rgba(10,35,66,.55)', border: '1px solid rgba(194,178,128,.45)', borderRadius: 6 }}>
                    <div style={{ color: '#C2B280', fontSize: 12, textTransform: 'uppercase', letterSpacing: 1 }}>Primary Window</div>
                    <div style={{ fontSize: 22, fontWeight: 'bold', marginTop: 6 }}>{intel.primeWindows.primary}</div>
                  </div>
                  <div style={{ padding: 14, background: 'rgba(10,35,66,.55)', border: '1px solid rgba(194,178,128,.45)', borderRadius: 6 }}>
                    <div style={{ color: '#C2B280', fontSize: 12, textTransform: 'uppercase', letterSpacing: 1 }}>Secondary Window</div>
                    <div style={{ fontSize: 22, fontWeight: 'bold', marginTop: 6 }}>{intel.primeWindows.secondary}</div>
                  </div>
                  <div style={{ padding: 14, background: 'rgba(10,35,66,.55)', border: '1px solid rgba(194,178,128,.45)', borderRadius: 6 }}>
                    <div style={{ color: '#C2B280', fontSize: 12, textTransform: 'uppercase', letterSpacing: 1 }}>Moon Phase</div>
                    <div style={{ fontSize: 22, fontWeight: 'bold', marginTop: 6 }}>{intel.primeWindows.moonPhase}</div>
                  </div>
                </div>
                <div style={{ marginTop: 14, color: '#a0b0c0', lineHeight: 1.5 }}>
                  <div>• <strong>Tide Signal:</strong> {intel.primeWindows.tideNote}</div>
                  <div>• <strong>Migration Signal:</strong> {intel.primeWindows.migrationNote}</div>
                </div>
              </div>
            )}
          </div>
        )}

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
                <div style={{ marginTop: 10 }}><strong>Technique:</strong> {report.technique}</div>
                <div style={{ marginTop: 6 }}><strong>Action:</strong> {report.action}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default App;

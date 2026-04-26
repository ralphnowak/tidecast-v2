import React, { useState, useEffect } from 'react';
import { Cloud, Wind, Fish, TrendingUp, AlertCircle, RefreshCw, MapPin } from 'lucide-react';
import { zones } from './zones';
import Map from './Map';

function App() {
  const [selectedRegion, setSelectedRegion] = useState('chesapeake');
  const [selectedZone, setSelectedZone] = useState(zones['chesapeake'][0].id);
  const [forecast, setForecast] = useState(null);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const regions = {
    chesapeake: {
      name: 'Chesapeake Bay',
      coords: [37.2707, -76.0633],
      primarySpecies: ['Striped Bass', 'Largemouth Bass', 'Bluefish'],
    },
    potomac: {
      name: 'Potomac River',
      coords: [38.6034, -77.0364],
      primarySpecies: ['Smallmouth Bass', 'Striped Bass', 'Channel Catfish'],
    },
    paxriver: {
      name: 'Patuxent River',
      coords: [38.3749, -76.6259],
      primarySpecies: ['Largemouth Bass', 'Catfish', 'Bluegill'],
    },
  };

  // Reset zone when region changes
  useEffect(() => {
    setSelectedZone(zones[selectedRegion][0].id);
  }, [selectedRegion]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch forecast
        const forecastRes = await fetch(`/api/noaa?region=${selectedRegion}`);
        const forecastData = await forecastRes.json();
        if (!forecastRes.ok || !forecastData.conditions) {
          throw new Error(forecastData.error || 'Invalid forecast response');
        }
        setForecast(forecastData);

        // Fetch reports filtered by zone
        const reportsRes = await fetch(`/api/reports?region=${selectedRegion}&zone=${selectedZone}`);
        const reportsData = await reportsRes.json();
        setReports(reportsData.reports || []);
      } catch (err) {
        console.error('Error loading data:', err);
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

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0a2342 0%, #1a4d6d 50%, #2a6b8d 100%)',
      color: '#f5f5f5',
      fontFamily: '"Courier Prime", monospace',
      padding: '20px',
    }}>
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        marginBottom: '40px',
      }}>
        {/* Header */}
        <div style={{
          borderBottom: '3px solid #4B5320',
          paddingBottom: '20px',
          marginBottom: '30px',
        }}>
          <h1 style={{
            fontSize: '2.5rem',
            margin: '0 0 8px 0',
            fontWeight: 'bold',
            letterSpacing: '2px',
            color: '#C2B280',
          }}>
            TIDECAST v2
          </h1>
          <p style={{
            margin: '0',
            fontSize: '0.95rem',
            color: '#a0b0c0',
            letterSpacing: '1px',
            textTransform: 'uppercase',
          }}>
            Zone-Based Fishing Intelligence
          </p>
        </div>

        {/* Region Selector */}
        <div style={{
          display: 'flex',
          gap: '12px',
          marginBottom: '30px',
          flexWrap: 'wrap',
        }}>
          {Object.entries(regions).map(([key, region]) => (
            <button
              key={key}
              onClick={() => setSelectedRegion(key)}
              style={{
                padding: '12px 24px',
                border: selectedRegion === key ? '2px solid #C2B280' : '2px solid #4B5320',
                background: selectedRegion === key ? '#4B5320' : 'transparent',
                color: selectedRegion === key ? '#C2B280' : '#a0b0c0',
                cursor: 'pointer',
                fontSize: '0.95rem',
                fontFamily: '"Courier Prime", monospace',
                fontWeight: 'bold',
                letterSpacing: '1px',
                transition: 'all 0.3s ease',
                textTransform: 'uppercase',
              }}
            >
              {region.name}
            </button>
          ))}
        </div>

        {/* Zone Selector */}
        <div style={{
          marginBottom: '30px',
          padding: '20px',
          background: 'rgba(10, 35, 66, 0.5)',
          border: '1px solid #4B5320',
          borderRadius: '8px',
        }}>
          <h2 style={{
            margin: '0 0 15px 0',
            fontSize: '1.1rem',
            color: '#C2B280',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}>
            <MapPin size={20} /> Select Zone
          </h2>
          <div style={{
            display: 'flex',
            gap: '10px',
            flexWrap: 'wrap',
          }}>
            {currentZones.map(zone => (
              <button
                key={zone.id}
                onClick={() => setSelectedZone(zone.id)}
                style={{
                  padding: '10px 16px',
                  border: selectedZone === zone.id ? '2px solid #C2B280' : '1px solid #7a8a9a',
                  background: selectedZone === zone.id ? 'rgba(194, 178, 128, 0.2)' : 'transparent',
                  color: selectedZone === zone.id ? '#C2B280' : '#a0b0c0',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  fontFamily: '"Courier Prime", monospace',
                  borderRadius: '4px',
                  transition: 'all 0.2s ease',
                  textTransform: 'capitalize',
                }}
              >
                {zone.name}
              </button>
            ))}
          </div>
        </div>

        {/* Zone Info */}
        {currentZone && (
          <div style={{
            marginBottom: '30px',
            padding: '20px',
            background: 'rgba(10, 35, 66, 0.5)',
            border: '1px solid #4B5320',
            borderRadius: '8px',
          }}>
            <h3 style={{
              margin: '0 0 12px 0',
              fontSize: '1.2rem',
              color: '#C2B280',
              fontWeight: 'bold',
            }}>
              {currentZone.name} • {currentRegion.name}
            </h3>
            <p style={{
              margin: '0',
              fontSize: '0.9rem',
              color: '#a0b0c0',
            }}>
              Coordinates: {currentZone.coords[0].toFixed(2)}°N, {Math.abs(currentZone.coords[1]).toFixed(2)}°W
            </p>
          </div>
        )}

        {/* Forecast Section */}
        {loading ? (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
          }}>
            <RefreshCw size={48} style={{
              animation: 'spin 2s linear infinite',
              marginBottom: '20px',
              color: '#C2B280',
            }} />
            <p style={{
              fontSize: '1.1rem',
              color: '#a0b0c0',
              letterSpacing: '1px',
            }}>
              LOADING FORECAST DATA
            </p>
            <style>{`
              @keyframes spin {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
              }
            `}</style>
          </div>
        ) : forecast ? (
          <>
            {/* Current Conditions */}
            <div style={{
              marginBottom: '30px',
              padding: '24px',
              background: 'rgba(10, 35, 66, 0.6)',
              border: '1px solid #4B5320',
              borderRadius: '8px',
            }}>
              <h3 style={{
                margin: '0 0 20px 0',
                fontSize: '1.2rem',
                color: '#C2B280',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
              }}>
                <Cloud size={24} /> Current Conditions
              </h3>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '20px',
              }}>
                {[
                  { label: 'Temperature', value: `${forecast?.conditions?.temperature}°F`, icon: '🌡️' },
                  { label: 'Wind', value: forecast?.conditions?.windSpeed || 'N/A', icon: '💨' },
                  { label: 'Direction', value: forecast?.conditions?.windDirection || 'N/A', icon: '↗️' },
                  { label: 'Summary', value: forecast?.conditions?.shortForecast || 'Fair', icon: '⛅' },
                ].map((item, idx) => (
                  <div key={idx} style={{
                    padding: '12px',
                    background: 'rgba(75, 83, 32, 0.3)',
                    border: '1px solid #4B5320',
                    borderRadius: '4px',
                  }}>
                    <div style={{ fontSize: '1.3rem', marginBottom: '4px' }}>{item.icon}</div>
                    <div style={{
                      fontSize: '0.85rem',
                      color: '#a0b0c0',
                      marginBottom: '6px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                    }}>
                      {item.label}
                    </div>
                    <div style={{
                      fontSize: '1.1rem',
                      color: '#C2B280',
                      fontWeight: 'bold',
                    }}>
                      {item.value}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Forecast Windows */}
            <div style={{
              marginBottom: '30px',
            }}>
              <h3 style={{
                margin: '0 0 20px 0',
                fontSize: '1.2rem',
                color: '#C2B280',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
              }}>
                <TrendingUp size={24} /> Forecast Windows
              </h3>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '16px',
              }}>
                {forecast?.forecast?.slice(0, 4).map((window, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: '20px',
                      background: 'rgba(10, 35, 66, 0.6)',
                      border: '1px solid #4B5320',
                      borderRadius: '8px',
                    }}
                  >
                    <div style={{
                      fontSize: '1rem',
                      color: '#C2B280',
                      fontWeight: 'bold',
                      marginBottom: '8px',
                      letterSpacing: '0.5px',
                    }}>
                      {window.time}
                    </div>
                    <p style={{
                      margin: '8px 0',
                      fontSize: '0.9rem',
                      color: '#a0b0c0',
                      lineHeight: '1.4',
                    }}>
                      {window.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : error && (
          <div style={{
            padding: '40px 20px',
            background: 'rgba(194, 178, 128, 0.1)',
            border: '1px solid #4B5320',
            borderRadius: '8px',
            textAlign: 'center',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
          }}>
            <AlertCircle size={24} color="#C2B280" />
            <span style={{ color: '#C2B280' }}>{error}</span>
          </div>
        )}
    <Map region={selectedRegion} zone={selectedZone} reports={reports} />
        {/* Live Reports */}
        {reports.length > 0 && (
          <div style={{ marginBottom: '30px' }}>
            <h3 style={{
              margin: '0 0 20px 0',
              fontSize: '1.2rem',
              color: '#C2B280',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}>
              <Fish size={24} /> Live Reports for {currentZone?.name}
            </h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '16px',
            }}>
              {reports.map((report, idx) => (
                <div key={idx} style={{
                  padding: '16px',
                  background: 'rgba(10, 35, 66, 0.6)',
                  border: '1px solid #4B5320',
                  borderRadius: '8px',
                  borderLeft: '4px solid #C2B280',
                }}>
                  <div style={{
                    fontSize: '1rem',
                    color: '#C2B280',
                    fontWeight: 'bold',
                    marginBottom: '4px',
                  }}>
                    {report.species}
                  </div>
                  <div style={{
                    fontSize: '0.85rem',
                    color: '#a0b0c0',
                    marginBottom: '8px',
                  }}>
                    {report.location} • {report.zone}
                  </div>
                  <div style={{
                    fontSize: '0.8rem',
                    color: '#a0b0c0',
                    marginBottom: '8px',
                    lineHeight: '1.4',
                  }}>
                    <strong>Technique:</strong> {report.technique}
                  </div>
                  {report.weight && (
                    <div style={{
                      fontSize: '0.8rem',
                      color: '#a0b0c0',
                      marginBottom: '8px',
                    }}>
                      <strong>Size:</strong> {report.weight}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
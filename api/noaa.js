export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { region } = req.query;
  const regions = {
    chesapeake: { coords: [38.9897, -76.5477] }, // Annapolis, MD
    potomac: { coords: [38.6534, -77.0535] },    // Alexandria, VA
    paxriver: { coords: [38.2887, -76.6077] },   // Solomons, MD
  };

  if (!region || !regions[region]) {
    return res.status(400).json({ error: 'Invalid region' });
  }

  try {
    const [lat, lon] = regions[region].coords;
    const url = `https://api.weather.gov/points/${lat},${lon}`;
    
    const resp1 = await fetch(url);
    if (!resp1.ok) throw new Error(`NOAA points API error: ${resp1.status}`);
    const data1 = await resp1.json();

    const forecastUrl = data1.properties?.forecast;
    if (!forecastUrl) throw new Error('NOAA response missing forecast URL');
    const resp2 = await fetch(forecastUrl);
    if (!resp2.ok) throw new Error(`NOAA forecast API error: ${resp2.status}`);
    const data2 = await resp2.json();

    const p = data2.properties.periods[0];

    res.json({
      conditions: {
        temperature: p.temperature,
        temperatureUnit: p.temperatureUnit,
        windSpeed: p.windSpeed,
        windDirection: p.windDirection,
        shortForecast: p.shortForecast,
      },
      forecast: data2.properties.periods.slice(0, 4).map(x => ({
        time: x.name,
        temperature: x.temperature,
        windSpeed: x.windSpeed,
        windDirection: x.windDirection,
        description: x.detailedForecast,
        condition: 'Good',
      })),
      updated: new Date().toISOString(),
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
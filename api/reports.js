export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { region, zone } = req.query;

  const reports = {
    chesapeake: {
      'upper-bay': [
        {
          species: 'Striped Bass',
          location: 'Eastern Bay Lumps',
          zone: 'Upper Bay',
          date: new Date().toISOString(),
          technique: 'Live herring, deep structure',
          weight: '20-28 lbs',
          action: 'Excellent',
          source: 'Charter Report',
        },
      ],
      'middle-bay': [
        {
          species: 'Largemouth Bass',
          location: 'Wye Island',
          zone: 'Middle Bay',
          date: new Date().toISOString(),
          technique: 'Spinnerbaits in shallow grass',
          weight: '4-6 lbs',
          action: 'Good',
          source: 'Guide Network',
        },
      ],
      'lower-bay': [
        {
          species: 'Striped Bass',
          location: 'North Bay - Sandy Point',
          zone: 'Lower Bay',
          date: new Date().toISOString(),
          technique: 'Live eels, topwater at dawn',
          weight: '18-24 lbs',
          action: 'Good',
          source: 'Tight Lines MD',
        },
        {
          species: 'Bluefish',
          location: 'Sandy Point Shoal',
          zone: 'Lower Bay',
          date: new Date(Date.now() - 3600000).toISOString(),
          technique: 'Metal shad lures, fast retrieve',
          weight: '6-10 lbs',
          action: 'Very Good',
          source: 'Local Report',
        },
      ],
      'eastern-shore': [
        {
          species: 'Speckled Trout',
          location: 'Choptank River',
          zone: 'Eastern Shore',
          date: new Date().toISOString(),
          technique: 'Small soft plastics, shallow water',
          weight: '2-3 lbs',
          action: 'Good',
          source: 'Eastern Shore Guide',
        },
      ],
    },
    potomac: {
      'upper-potomac': [
        {
          species: 'Smallmouth Bass',
          location: 'Sycamore Island',
          zone: 'Upper Potomac',
          date: new Date().toISOString(),
          technique: 'Tube jigs on rocky structure',
          weight: '2-4 lbs',
          action: 'Very Good',
          source: 'Local Guide',
        },
      ],
      'middle-potomac': [
        {
          species: 'Striped Bass',
          location: 'Monitor Run',
          zone: 'Middle Potomac',
          date: new Date().toISOString(),
          technique: 'Live herring in current seams',
          weight: '16-22 lbs',
          action: 'Good',
          source: 'Charter Guide',
        },
      ],
      'lower-potomac': [
        {
          species: 'Striped Bass',
          location: 'Occoquan',
          zone: 'Lower Potomac',
          date: new Date().toISOString(),
          technique: 'Topwater plugs at dawn',
          weight: '14-20 lbs',
          action: 'Very Good',
          source: 'Virginia Guide',
        },
      ],
    },
    paxriver: {
      'upper-pax': [
        {
          species: 'Largemouth Bass',
          location: 'Hunting Creek',
          zone: 'Upper Patuxent',
          date: new Date().toISOString(),
          technique: 'Soft plastics in vegetation',
          weight: '3-5 lbs',
          action: 'Good',
          source: 'Local Angler',
        },
      ],
      'middle-pax': [
        {
          species: 'Channel Catfish',
          location: 'Jug Bay',
          zone: 'Middle Patuxent',
          date: new Date().toISOString(),
          technique: 'Cut shad, chicken liver',
          weight: '15-25 lbs',
          action: 'Excellent',
          source: 'Catfish Report',
        },
      ],
      'lower-pax': [
        {
          species: 'Largemouth Bass',
          location: 'Benedict area',
          zone: 'Lower Patuxent',
          date: new Date().toISOString(),
          technique: 'Soft plastics in weeds',
          weight: '3-5 lbs',
          action: 'Good',
          source: 'Community Report',
        },
      ],
    },
  };

  if (!region || !reports[region]) {
    return res.status(400).json({ error: 'Invalid region' });
  }

  try {
    const zoneReports = zone && reports[region][zone] 
      ? reports[region][zone] 
      : Object.values(reports[region]).flat();

    zoneReports.sort((a, b) => new Date(b.date) - new Date(a.date));

    return res.status(200).json({
      region,
      zone: zone || 'all',
      reports: zoneReports,
      total: zoneReports.length,
      fetchedAt: new Date().toISOString(),
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
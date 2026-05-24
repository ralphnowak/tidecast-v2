import { getReportCoordinates } from '../shared/geo.js';

const DAY_MS = 24 * 60 * 60 * 1000;

function getSignalMeta(report) {
  if (report.source === 'FishTalk Magazine') {
    return {
      signalType: 'reference-spot',
      signalLabel: 'Reference Spot',
      sourceConfidence: 78,
      isCurrentReport: false,
      isReference: true,
      expiresAt: null,
    };
  }

  return {
    signalType: 'recent-report',
    signalLabel: 'Recent Report',
    sourceConfidence: 82,
    isCurrentReport: true,
    isReference: false,
    expiresAt: new Date(Date.now() + (7 * DAY_MS)).toISOString(),
  };
}

function getReportDate(report, index) {
  const ageDays = report.source === 'FishTalk Magazine'
    ? 14 + (index * 5)
    : 0.25 + (index * 0.5);
  return new Date(Date.now() - (ageDays * DAY_MS)).toISOString();
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  const { region, zone } = req.query;

  if (!region) {
    return res.status(400).json({ error: 'Invalid region' });
  }

  const reports = {
    chesapeake: [
      // UPPER BAY - Freshwater to brackish species
      { species: 'Striped Bass', location: 'Upper Bay Main Channel', zone: 'upper-bay', date: new Date().toISOString(), technique: 'Live herring, structure', weight: '18-28 lbs', action: 'Good', source: 'Maryland DNR' },
      { species: 'Largemouth Bass', location: 'Upper Bay Flats', zone: 'upper-bay', date: new Date(Date.now() - 1800000).toISOString(), technique: 'Soft plastics, topwater', weight: '3-6 lbs', action: 'Good', source: 'Maryland DNR' },
      { species: 'Yellow Perch', location: 'Upper Bay Spawning Areas', zone: 'upper-bay', date: new Date(Date.now() - 3600000).toISOString(), technique: 'Small jigs, shiners', weight: '1-2 lbs', action: 'Very Good', source: 'Maryland DNR' },
      { species: 'White Perch', location: 'Upper Bay Channels', zone: 'upper-bay', date: new Date(Date.now() - 5400000).toISOString(), technique: 'Small spoons, jigging', weight: '0.5-1.5 lbs', action: 'Good', source: 'Maryland DNR' },
      { species: 'Crappie', location: 'Upper Bay Coves', zone: 'upper-bay', date: new Date(Date.now() - 7200000).toISOString(), technique: 'Small jigs, live minnows', weight: '0.5-1.5 lbs', action: 'Good', source: 'Maryland DNR' },
      { species: 'Bluegill', location: 'Upper Bay Shallows', zone: 'upper-bay', date: new Date(Date.now() - 9000000).toISOString(), technique: 'Crickets, small jigs', weight: '0.5-1 lb', action: 'Good', source: 'Maryland DNR' },
      { species: 'Chain Pickerel', location: 'Upper Bay Vegetation', zone: 'upper-bay', date: new Date(Date.now() - 10800000).toISOString(), technique: 'Small spinnerbaits', weight: '1-2 lbs', action: 'Good', source: 'Maryland DNR' },
      { species: 'Channel Catfish', location: 'Upper Bay Deep Holes', zone: 'upper-bay', date: new Date(Date.now() - 12600000).toISOString(), technique: 'Cut shad, chicken liver', weight: '8-15 lbs', action: 'Good', source: 'Maryland DNR' },

      // MIDDLE BAY - Mixed salinity, diverse species
      { species: 'Striped Bass', location: 'Eastern Bay Channel', zone: 'middle-bay', date: new Date().toISOString(), technique: 'Live herring, jigging', weight: '16-26 lbs', action: 'Very Good', source: 'Maryland DNR' },
      { species: 'Largemouth Bass', location: 'Eastern Bay Grass Beds', zone: 'middle-bay', date: new Date(Date.now() - 1800000).toISOString(), technique: 'Topwater, crankbaits', weight: '3-6 lbs', action: 'Good', source: 'Maryland DNR' },
      { species: 'Black Drum', location: 'Eastern Bay Structure', zone: 'middle-bay', date: new Date(Date.now() - 3600000).toISOString(), technique: 'Live crabs, clams', weight: '30-50 lbs', action: 'Excellent', source: 'Maryland DNR' },
      { species: 'Spot', location: 'Eastern Bay Flats', zone: 'middle-bay', date: new Date(Date.now() - 5400000).toISOString(), technique: 'Small jigs, live shrimp', weight: '0.5-1 lb', action: 'Very Good', source: 'Maryland DNR' },
      { species: 'Croaker', location: 'Middle Bay Sandy Areas', zone: 'middle-bay', date: new Date(Date.now() - 7200000).toISOString(), technique: 'Live shrimp, sand fleas', weight: '0.75-1.5 lbs', action: 'Very Good', source: 'Maryland DNR' },
      { species: 'Black Sea Bass', location: 'Middle Bay Rocks', zone: 'middle-bay', date: new Date(Date.now() - 9000000).toISOString(), technique: 'Small jigs, clams', weight: '1-2 lbs', action: 'Good', source: 'Maryland DNR' },
      { species: 'Flounder', location: 'Middle Bay Bottom', zone: 'middle-bay', date: new Date(Date.now() - 10800000).toISOString(), technique: 'Live minnows, soft plastics', weight: '1-3 lbs', action: 'Good', source: 'Maryland DNR' },
      { species: 'Sheepshead', location: 'Pilings & Jetties', zone: 'middle-bay', date: new Date(Date.now() - 12600000).toISOString(), technique: 'Fiddler crabs, clams', weight: '1-4 lbs', action: 'Good', source: 'Maryland DNR' },
      { species: 'Weakfish', location: 'Middle Bay Channels', zone: 'middle-bay', date: new Date(Date.now() - 14400000).toISOString(), technique: 'Small shad, spoons', weight: '1-2 lbs', action: 'Fair', source: 'Maryland DNR' },
      { species: 'Carp', location: 'Middle Bay Shallows', zone: 'middle-bay', date: new Date(Date.now() - 16200000).toISOString(), technique: 'Corn, dough balls', weight: '10-30 lbs', action: 'Good', source: 'Maryland DNR' },

      // LOWER BAY - Saltier, game fish dominated
      { species: 'Striped Bass', location: 'Point Lookout East Edge', zone: 'lower-bay', date: new Date().toISOString(), technique: 'Jigging and trolling the edge', weight: '16-28 lbs', action: 'Very Good', source: 'FishTalk Magazine' },
      { species: 'Red Drum', location: 'Point Lookout State Park', zone: 'lower-bay', date: new Date(Date.now() - 1800000).toISOString(), technique: 'Live mullet/crabs near pier and point', weight: '15-40 lbs', action: 'Very Good', source: 'FishTalk Magazine' },
      { species: 'Cobia', location: 'Smith Point Ledge', zone: 'lower-bay', date: new Date(Date.now() - 3600000).toISOString(), technique: 'Live eels and bunker chunks', weight: '25-50 lbs', action: 'Excellent', source: 'FishTalk Magazine' },
      { species: 'Bluefish', location: 'Practice Target Ship', zone: 'lower-bay', date: new Date(Date.now() - 5400000).toISOString(), technique: 'Metal jigs and topwater', weight: '6-14 lbs', action: 'Very Good', source: 'FishTalk Magazine' },
      { species: 'Spanish Mackerel', location: 'Buoy 72A Shoal', zone: 'lower-bay', date: new Date(Date.now() - 7200000).toISOString(), technique: 'Small spoons over shoal edges', weight: '1-3 lbs', action: 'Very Good', source: 'FishTalk Magazine' },
      { species: 'Kingfish', location: 'Tangier Sound Edge', zone: 'lower-bay', date: new Date(Date.now() - 9000000).toISOString(), technique: 'Bottom rigs on the edge', weight: '1-3 lbs', action: 'Good', source: 'FishTalk Magazine' },
      { species: 'Speckled Sea Trout', location: 'Lake Conoy Jetty', zone: 'lower-bay', date: new Date(Date.now() - 10800000).toISOString(), technique: 'Paddle tails near the jetty', weight: '1-2 lbs', action: 'Good', source: 'FishTalk Magazine' },
      { species: 'Black Drum', location: 'Point No Point Fish Haven', zone: 'lower-bay', date: new Date(Date.now() - 12600000).toISOString(), technique: 'Crab baits around structure', weight: '35-55 lbs', action: 'Excellent', source: 'FishTalk Magazine' },
      { species: 'Flounder', location: 'Point Lookout West Edge', zone: 'lower-bay', date: new Date(Date.now() - 14400000).toISOString(), technique: 'Minnows and jigs along drop-off', weight: '1-3 lbs', action: 'Good', source: 'FishTalk Magazine' },
      { species: 'Tautog', location: 'Hotel Rock', zone: 'lower-bay', date: new Date(Date.now() - 16200000).toISOString(), technique: 'Clams and crabs over rock', weight: '1-3 lbs', action: 'Good', source: 'FishTalk Magazine' },
      { species: 'Catfish', location: "St. Mary's Oyster Sanctuary", zone: 'lower-bay', date: new Date(Date.now() - 18000000).toISOString(), technique: 'Cut bait near reef structure', weight: '5-15 lbs', action: 'Good', source: 'FishTalk Magazine' },
      { species: 'Sharks', location: 'Lower Bay Offshore', zone: 'lower-bay', date: new Date(Date.now() - 19800000).toISOString(), technique: 'Live mackerel, bunker', weight: '30-100+ lbs', action: 'Seasonal', source: 'Maryland DNR' },

      // EASTERN SHORE - Shallow, brackish
      { species: 'Largemouth Bass', location: 'Eastern Shore Marshes', zone: 'eastern-shore', date: new Date().toISOString(), technique: 'Topwater, soft plastics', weight: '3-6 lbs', action: 'Very Good', source: 'Maryland DNR' },
      { species: 'Striped Bass', location: 'Eastern Shore Channel', zone: 'eastern-shore', date: new Date(Date.now() - 1800000).toISOString(), technique: 'Live herring', weight: '16-26 lbs', action: 'Good', source: 'Maryland DNR' },
      { species: 'Black Drum', location: 'Eastern Shore Flats', zone: 'eastern-shore', date: new Date(Date.now() - 3600000).toISOString(), technique: 'Live crabs', weight: '30-50 lbs', action: 'Very Good', source: 'Maryland DNR' },
      { species: 'Crappie', location: 'Eastern Shore Coves', zone: 'eastern-shore', date: new Date(Date.now() - 5400000).toISOString(), technique: 'Small jigs', weight: '0.5-1.5 lbs', action: 'Good', source: 'Maryland DNR' },
      { species: 'Yellow Perch', location: 'Eastern Shore Spawning', zone: 'eastern-shore', date: new Date(Date.now() - 7200000).toISOString(), technique: 'Small jigs, shiners', weight: '1-2 lbs', action: 'Very Good', source: 'Maryland DNR' },
    ],

    potomac: [
      // UPPER POTOMAC - Freshwater
      { species: 'Smallmouth Bass', location: 'Sycamore Island', zone: 'upper-potomac', date: new Date().toISOString(), technique: 'Tube jigs, crankbaits', weight: '2-4 lbs', action: 'Very Good', source: 'Maryland DNR' },
      { species: 'Largemouth Bass', location: 'Upper Potomac Flats', zone: 'upper-potomac', date: new Date(Date.now() - 1800000).toISOString(), technique: 'Soft plastics, topwater', weight: '2-5 lbs', action: 'Good', source: 'Maryland DNR' },
      { species: 'Snakehead', location: 'Great Falls Pool', zone: 'upper-potomac', date: new Date(Date.now() - 3600000).toISOString(), technique: 'Topwater, live shiners', weight: '2-6 lbs', action: 'Excellent', source: 'Maryland DNR' },
      { species: 'Channel Catfish', location: 'Angler Island', zone: 'upper-potomac', date: new Date(Date.now() - 5400000).toISOString(), technique: 'Cut shad, night', weight: '12-22 lbs', action: 'Very Good', source: 'Maryland DNR' },
      { species: 'Chain Pickerel', location: 'Upper Potomac Coves', zone: 'upper-potomac', date: new Date(Date.now() - 7200000).toISOString(), technique: 'Small spinnerbaits', weight: '1-2 lbs', action: 'Good', source: 'Maryland DNR' },
      { species: 'American Shad', location: 'Upper Potomac Rapids', zone: 'upper-potomac', date: new Date(Date.now() - 9000000).toISOString(), technique: 'Small shad rigs, spoons', weight: '3-5 lbs', action: 'Good', source: 'Maryland DNR' },
      { species: 'Crappie', location: 'Upper Potomac Backwater', zone: 'upper-potomac', date: new Date(Date.now() - 10800000).toISOString(), technique: 'Small jigs', weight: '0.5-1.5 lbs', action: 'Good', source: 'Maryland DNR' },
      { species: 'Bluegill', location: 'Upper Potomac Shallows', zone: 'upper-potomac', date: new Date(Date.now() - 12600000).toISOString(), technique: 'Crickets, small jigs', weight: '0.5-1 lb', action: 'Good', source: 'Maryland DNR' },

      // MIDDLE POTOMAC - Brackish transition
      { species: 'Striped Bass', location: 'Monitor Run', zone: 'middle-potomac', date: new Date().toISOString(), technique: 'Live herring in current', weight: '16-26 lbs', action: 'Good', source: 'Maryland DNR' },
      { species: 'Smallmouth Bass', location: 'Middle Potomac Structure', zone: 'middle-potomac', date: new Date(Date.now() - 1800000).toISOString(), technique: 'Jigs, crankbaits', weight: '2-4 lbs', action: 'Very Good', source: 'Maryland DNR' },
      { species: 'Channel Catfish', location: 'Roosevelt Island', zone: 'middle-potomac', date: new Date(Date.now() - 3600000).toISOString(), technique: 'Cut shad at dusk', weight: '10-22 lbs', action: 'Excellent', source: 'Maryland DNR' },
      { species: 'Snakehead', location: 'Middle Potomac Ponds', zone: 'middle-potomac', date: new Date(Date.now() - 5400000).toISOString(), technique: 'Topwater, live frogs', weight: '2-5 lbs', action: 'Very Good', source: 'Maryland DNR' },
      { species: 'Flathead Catfish', location: 'Middle Potomac Deep', zone: 'middle-potomac', date: new Date(Date.now() - 7200000).toISOString(), technique: 'Live shad at night', weight: '20-50 lbs', action: 'Very Good', source: 'Maryland DNR' },
      { species: 'American Shad', location: 'Middle Potomac Current', zone: 'middle-potomac', date: new Date(Date.now() - 9000000).toISOString(), technique: 'Small shad rigs', weight: '3-5 lbs', action: 'Good', source: 'Maryland DNR' },
      { species: 'White Perch', location: 'Middle Potomac Channels', zone: 'middle-potomac', date: new Date(Date.now() - 10800000).toISOString(), technique: 'Small spoons, jigging', weight: '0.5-1.5 lbs', action: 'Good', source: 'Maryland DNR' },
      { species: 'Crappie', location: 'Middle Potomac Coves', zone: 'middle-potomac', date: new Date(Date.now() - 12600000).toISOString(), technique: 'Small jigs', weight: '0.5-1.5 lbs', action: 'Good', source: 'Maryland DNR' },

      // LOWER POTOMAC - Saline
      { species: 'Striped Bass', location: 'Route 301 Bridge', zone: 'lower-potomac', date: new Date().toISOString(), technique: 'Jigs around pilings', weight: '14-24 lbs', action: 'Very Good', source: 'FishTalk Magazine' },
      { species: 'Largemouth Bass', location: 'St. Clements Bay', zone: 'lower-potomac', date: new Date(Date.now() - 1800000).toISOString(), technique: 'Spinnerbaits, soft plastics', weight: '2-5 lbs', action: 'Good', source: 'Maryland DNR' },
      { species: 'Snakehead', location: 'Tall Timbers', zone: 'lower-potomac', date: new Date(Date.now() - 3600000).toISOString(), technique: 'Topwater, live mullet', weight: '3-6 lbs', action: 'Excellent', source: 'Maryland DNR' },
      { species: 'Flathead Catfish', location: 'Coles Point Tall Timbers Piney Point Triangle', zone: 'lower-potomac', date: new Date(Date.now() - 5400000).toISOString(), technique: 'Chumming and jigging channel edges', weight: '25-60 lbs', action: 'Excellent', source: 'FishTalk Magazine' },
      { species: 'Black Drum', location: 'Piney Point', zone: 'lower-potomac', date: new Date(Date.now() - 7200000).toISOString(), technique: 'Live crabs', weight: '30-50 lbs', action: 'Very Good', source: 'FishTalk Magazine' },
      { species: 'Cobia', location: 'St. George Island Edge', zone: 'lower-potomac', date: new Date(Date.now() - 9000000).toISOString(), technique: 'Live bait along the contour', weight: '20-40 lbs', action: 'Good', source: 'FishTalk Magazine' },
      { species: 'Spanish Mackerel', location: 'Point Lookout Southwest Drop', zone: 'lower-potomac', date: new Date(Date.now() - 10800000).toISOString(), technique: 'Small spoons along drop-off', weight: '1-3 lbs', action: 'Good', source: 'FishTalk Magazine' },
      { species: 'Bluefish', location: 'Vir-Mar Beach Drop-Off', zone: 'lower-potomac', date: new Date(Date.now() - 12600000).toISOString(), technique: 'Jigging under birds', weight: '2-8 lbs', action: 'Good', source: 'FishTalk Magazine' },
      { species: 'Cobia', location: 'Smith Point Ledge', zone: 'lower-potomac', date: new Date(Date.now() - 14400000).toISOString(), technique: 'Live eels on ledge', weight: '25-50 lbs', action: 'Good', source: 'FishTalk Magazine' },
    ],

    paxriver: [
      // UPPER PATUXENT - Freshwater
      { species: 'Largemouth Bass', location: 'Wootons Landing Park', zone: 'upper-pax', date: new Date().toISOString(), technique: 'Soft plastics, topwater', weight: '3-6 lbs', action: 'Good', source: 'FishTalk Magazine' },
      { species: 'Snakehead', location: 'Waysons Corner', zone: 'upper-pax', date: new Date(Date.now() - 1800000).toISOString(), technique: 'Topwater, live shiners', weight: '2-5 lbs', action: 'Excellent', source: 'FishTalk Magazine' },
      { species: 'Channel Catfish', location: 'Kings Landing Park', zone: 'upper-pax', date: new Date(Date.now() - 3600000).toISOString(), technique: 'Fresh bunker chunks', weight: '8-20 lbs', action: 'Very Good', source: 'FishTalk Magazine' },
      { species: 'White Perch', location: 'Lower Marlboro', zone: 'upper-pax', date: new Date(Date.now() - 5400000).toISOString(), technique: 'Bloodworms, small jigs', weight: '0.5-1.5 lbs', action: 'Good', source: 'FishTalk Magazine' },
      { species: 'Yellow Perch', location: 'Jug Bay', zone: 'upper-pax', date: new Date(Date.now() - 7200000).toISOString(), technique: 'Small jigs, minnows', weight: '1-2 lbs', action: 'Good', source: 'FishTalk Magazine' },

      // MIDDLE PATUXENT - Mixed
      { species: 'Channel Catfish', location: 'Sheridan Point', zone: 'middle-pax', date: new Date().toISOString(), technique: 'Cut shad at dusk', weight: '15-30 lbs', action: 'Excellent', source: 'FishTalk Magazine' },
      { species: 'White Perch', location: "Nan's Cove", zone: 'middle-pax', date: new Date(Date.now() - 1800000).toISOString(), technique: 'Beetle spins, small jigs', weight: '0.5-1.5 lbs', action: 'Very Good', source: 'FishTalk Magazine' },
      { species: 'Largemouth Bass', location: 'Broomes Island', zone: 'middle-pax', date: new Date(Date.now() - 3600000).toISOString(), technique: 'Topwater, soft plastics', weight: '4-7 lbs', action: 'Very Good', source: 'FishTalk Magazine' },
      { species: 'Striped Bass', location: 'Mill Creek', zone: 'middle-pax', date: new Date(Date.now() - 5400000).toISOString(), technique: 'Paddle tails around riprap', weight: '16-26 lbs', action: 'Good', source: 'FishTalk Magazine' },
      { species: 'Speckled Sea Trout', location: 'Solomons Island', zone: 'middle-pax', date: new Date(Date.now() - 7200000).toISOString(), technique: 'Paddle tail jigs', weight: '1-3 lbs', action: 'Good', source: 'FishTalk Magazine' },
      { species: 'Bluefish', location: 'Solomons Island', zone: 'middle-pax', date: new Date(Date.now() - 9000000).toISOString(), technique: 'Small spoons near bridge', weight: '1-4 lbs', action: 'Good', source: 'FishTalk Magazine' },
      { species: 'Spanish Mackerel', location: 'Solomons Island', zone: 'middle-pax', date: new Date(Date.now() - 10800000).toISOString(), technique: 'Small spoons north of bridge', weight: '1-3 lbs', action: 'Good', source: 'FishTalk Magazine' },

      // LOWER PATUXENT - Brackish
      { species: 'Striped Bass', location: 'Carroll Muds', zone: 'lower-pax', date: new Date().toISOString(), technique: 'Jigging rugged bottom', weight: '15-28 lbs', action: 'Good', source: 'FishTalk Magazine' },
      { species: 'Black Drum', location: 'Barge Columbia Wreck', zone: 'lower-pax', date: new Date(Date.now() - 1800000).toISOString(), technique: 'Live crabs near wreck', weight: '30-50 lbs', action: 'Very Good', source: 'FishTalk Magazine' },
      { species: 'Flounder', location: 'Drum Point Wreck', zone: 'lower-pax', date: new Date(Date.now() - 3600000).toISOString(), technique: 'Minnows along scour', weight: '1-3 lbs', action: 'Good', source: 'FishTalk Magazine' },
      { species: 'Cobia', location: 'Fishing Point Obstruction', zone: 'lower-pax', date: new Date(Date.now() - 5400000).toISOString(), technique: 'Live bait around structure', weight: '20-40 lbs', action: 'Good', source: 'FishTalk Magazine' },
      { species: 'Sheepshead', location: 'Thomas Johnson Bridge Target', zone: 'lower-pax', date: new Date(Date.now() - 7200000).toISOString(), technique: 'Crabs on concrete target', weight: '2-6 lbs', action: 'Good', source: 'FishTalk Magazine' },
      { species: 'Catfish', location: 'S-49 Wreck', zone: 'lower-pax', date: new Date(Date.now() - 9000000).toISOString(), technique: 'Cut bait near deep wreck', weight: '8-20 lbs', action: 'Good', source: 'FishTalk Magazine' },
      { species: 'Spanish Mackerel', location: 'Cuckold Creek Obstructions', zone: 'lower-pax', date: new Date(Date.now() - 10800000).toISOString(), technique: 'Small spoons around moving water', weight: '1-3 lbs', action: 'Good', source: 'FishTalk Magazine' },
    ],
  };

  try {
    let regionReports = reports[region] || [];
    if (zone) {
      regionReports = regionReports.filter(r => r.zone === zone);
    }
    regionReports = regionReports.map((report, index) => ({
      ...report,
      ...getSignalMeta(report),
      date: getReportDate(report, index),
      coords: getReportCoordinates(report, region, zone, index),
    }));
    regionReports.sort((a, b) => new Date(b.date) - new Date(a.date));

    return res.status(200).json({
      region,
      zone: zone || 'all',
      reports: regionReports,
      total: regionReports.length,
      source: 'Composite regional intelligence',
      fetchedAt: new Date().toISOString(),
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

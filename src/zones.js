export const zones = {
  chesapeake: [
    { id: 'upper-bay', name: 'Upper Bay', coords: [39.22, -76.19] },        // Susquehanna Flats open water
    { id: 'middle-bay', name: 'Middle Bay', coords: [38.72, -76.28] },       // Mid-bay channel, clear of both shores
    { id: 'lower-bay', name: 'Lower Bay', coords: [37.75, -76.10] },         // Lower Chesapeake open water
    { id: 'eastern-shore', name: 'Eastern Shore', coords: [38.50, -76.05] }, // Nearshore eastern side, in water
  ],
  potomac: [
    { id: 'upper-potomac', name: 'Upper Potomac', coords: [39.08, -77.38] }, // River channel near Point of Rocks
    { id: 'middle-potomac', name: 'Middle Potomac', coords: [38.82, -77.10] }, // River near National Harbor
    { id: 'lower-potomac', name: 'Lower Potomac', coords: [38.15, -76.70] },  // Wide lower river
  ],
  paxriver: [
    { id: 'upper-pax', name: 'Upper Patuxent', coords: [38.80, -76.72] },    // Jug Bay / tidal Patuxent head
    { id: 'middle-pax', name: 'Middle Patuxent', coords: [38.53, -76.67] },  // River channel near Prince Frederick
    { id: 'lower-pax', name: 'Lower Patuxent', coords: [38.31, -76.52] },    // Near Solomons Island mouth
  ],
};

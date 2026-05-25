export const zones = {
  chesapeake: [
    { id: 'upper-bay', name: 'Upper Bay', coords: [39.13, -76.32] },        // Upper Chesapeake water west of the Eastern Shore
    { id: 'middle-bay', name: 'Middle Bay', coords: [38.72, -76.34] },       // Eastern Bay / mid-bay water
    { id: 'lower-bay', name: 'Lower Bay', coords: [37.75, -76.10] },         // Lower Chesapeake open water
    { id: 'eastern-shore', name: 'Eastern Shore', coords: [38.50, -76.15] }, // Nearshore eastern side, in water
  ],
  potomac: [
    { id: 'upper-potomac', name: 'Upper Potomac', coords: [39.00, -77.27] }, // Great Falls to Seneca river corridor
    { id: 'middle-potomac', name: 'Middle Potomac', coords: [38.76, -77.04] }, // DC to National Harbor river corridor
    { id: 'lower-potomac', name: 'Lower Potomac', coords: [38.15, -76.70] },  // Wide lower river
  ],
  paxriver: [
    { id: 'upper-pax', name: 'Upper Patuxent', coords: [38.75, -76.69] },    // Jug Bay / tidal Patuxent head
    { id: 'middle-pax', name: 'Middle Patuxent', coords: [38.48, -76.58] },  // Broomes Island to Benedict river corridor
    { id: 'lower-pax', name: 'Lower Patuxent', coords: [38.31, -76.52] },    // Near Solomons Island mouth
  ],
};

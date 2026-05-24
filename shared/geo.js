export const REGION_CENTERS = {
  chesapeake: [38.2, -76.25],
  potomac: [38.5, -77.0],
  paxriver: [38.45, -76.58],
};

export const ZONE_CENTERS = {
  'upper-bay': [39.18, -76.18],
  'middle-bay': [38.82, -76.28],
  'lower-bay': [37.72, -76.2],
  'eastern-shore': [38.52, -76.05],
  'upper-potomac': [39.05, -77.38],
  'middle-potomac': [38.76, -77.04],
  'lower-potomac': [38.15, -76.7],
  'upper-pax': [38.88, -76.67],
  'middle-pax': [38.62, -76.69],
  'lower-pax': [38.28, -76.43],
};

export const LOCATION_COORDS = {
  'Upper Bay Main Channel': [39.19, -76.18],
  'Upper Bay Flats': [39.12, -76.17],
  'Upper Bay Spawning Areas': [39.23, -76.12],
  'Upper Bay Channels': [39.06, -76.2],
  'Upper Bay Coves': [39.0, -76.2],
  'Upper Bay Shallows': [39.16, -76.15],
  'Upper Bay Vegetation': [39.1, -76.14],
  'Upper Bay Deep Holes': [38.99, -76.24],
  'Eastern Bay Channel': [38.84, -76.22],
  'Eastern Bay Grass Beds': [38.86, -76.17],
  'Eastern Bay Structure': [38.82, -76.2],
  'Eastern Bay Flats': [38.78, -76.19],
  'Middle Bay Sandy Areas': [38.55, -76.3],
  'Middle Bay Rocks': [38.5, -76.25],
  'Middle Bay Bottom': [38.47, -76.22],
  'Pilings & Jetties': [38.72, -76.3],
  'Middle Bay Channels': [38.64, -76.31],
  'Middle Bay Shallows': [38.68, -76.23],
  'Thimble Shoal Light': [37.01, -76.24],
  'Point Lookout': [37.57, -76.31],
  'Hooper Island Light': [38.26, -76.25],
  'Practice Target Ship': [38.04, -76.16],
  'Lower Bay Open Water': [37.78, -76.1],
  'Lower Bay Shelf': [37.68, -76.05],
  'Lower Bay Grass': [37.8, -76.22],
  'Point Lookout Deep': [37.53, -76.32],
  'Lower Bay Sandy Bottom': [37.65, -76.28],
  'Lower Bay Rocks': [37.6, -76.2],
  'Lower Bay Deep Areas': [37.5, -76.16],
  'Lower Bay Offshore': [37.42, -76.0],
  'Eastern Shore Marshes': [38.43, -76.02],
  'Eastern Shore Channel': [38.5, -76.02],
  'Eastern Shore Flats': [38.38, -76.0],
  'Eastern Shore Coves': [38.55, -76.06],
  'Eastern Shore Spawning': [38.62, -76.08],
  'Sycamore Island': [38.94, -77.13],
  'Upper Potomac Flats': [39.07, -77.38],
  'Great Falls Pool': [38.99, -77.25],
  'Angler Island': [38.94, -77.18],
  'Upper Potomac Coves': [39.03, -77.35],
  'Upper Potomac Rapids': [39.0, -77.3],
  'Upper Potomac Backwater': [39.05, -77.36],
  'Upper Potomac Shallows': [39.1, -77.4],
  'Monitor Run': [38.78, -77.05],
  'Middle Potomac Structure': [38.76, -77.04],
  'Roosevelt Island': [38.9, -77.06],
  'Middle Potomac Ponds': [38.69, -77.05],
  'Middle Potomac Deep': [38.62, -77.04],
  'Middle Potomac Current': [38.57, -77.0],
  'Middle Potomac Channels': [38.6, -77.02],
  'Middle Potomac Coves': [38.67, -77.05],
  Occoquan: [38.68, -77.25],
  'Pohick Bay': [38.67, -77.16],
  'Lower Potomac Backwater': [38.18, -76.75],
  'Lower Potomac Deep': [38.05, -76.58],
  'Lower Potomac Structure': [38.1, -76.63],
  'Lower Potomac Open Water': [38.0, -76.5],
  'Lower Potomac Channel': [37.9, -76.42],
  'Hunting Creek': [38.79, -76.7],
  'Upper Patuxent Ponds': [38.85, -76.73],
  'Upper Patuxent Weeds': [38.78, -76.7],
  'Upper Patuxent': [38.74, -76.68],
  'Upper Patuxent Coves': [38.72, -76.67],
  'Jug Bay': [38.77, -76.7],
  'Jug Bay Marsh': [38.75, -76.68],
  'Jug Bay Flats': [38.73, -76.69],
  'Middle Patuxent': [38.56, -76.68],
  'Middle Patuxent Deep': [38.48, -76.61],
  'Middle Patuxent Channel': [38.45, -76.58],
  'Middle Patuxent Spawning': [38.52, -76.65],
  'Benedict Area': [38.51, -76.68],
  'Benedict area': [38.51, -76.68],
  'Lower Patuxent': [38.32, -76.46],
  'Cedar Point': [38.3, -76.39],
  'Lower Patuxent Backwater': [38.24, -76.43],
  'Lower Patuxent Deep': [38.25, -76.45],
  'Lower Patuxent Open': [38.2, -76.4],
  'Lower Patuxent Channel': [38.22, -76.41],
};

const OFFSET_PATTERN = [
  [0, 0],
  [0.012, -0.008],
  [-0.012, 0.008],
  [0.018, 0.006],
  [-0.018, -0.006],
  [0.006, 0.018],
  [-0.006, -0.018],
  [0.024, -0.014],
  [-0.024, 0.014],
];

export function isCoordinate(value) {
  return Array.isArray(value)
    && value.length === 2
    && value.every(Number.isFinite)
    && Math.abs(value[0]) <= 90
    && Math.abs(value[1]) <= 180;
}

export function getLocationCoordinates(location) {
  const coords = LOCATION_COORDS[location];
  return isCoordinate(coords) ? coords : null;
}

export function getRegionCenter(region) {
  return REGION_CENTERS[region] || [38.5, -76.5];
}

export function getZoneCenter(region, zone) {
  return ZONE_CENTERS[zone] || getRegionCenter(region);
}

export function getFallbackCoordinates(region, zone, index = 0) {
  const base = getZoneCenter(region, zone);
  const [latOffset, lonOffset] = OFFSET_PATTERN[index % OFFSET_PATTERN.length];
  return [base[0] + latOffset, base[1] + lonOffset];
}

export function getReportCoordinates(report, region, selectedZone, index = 0) {
  if (isCoordinate(report?.coords)) return report.coords;
  if (isCoordinate(report?.coordinates)) return report.coordinates;

  const locationCoords = getLocationCoordinates(report?.location);
  if (locationCoords) return locationCoords;

  return getFallbackCoordinates(region, report?.zone || selectedZone, index);
}

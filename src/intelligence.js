const ACTION_SCORE = {
  Excellent: 100,
  'Very Good': 88,
  Good: 74,
  Fair: 54,
  Seasonal: 48,
  Slow: 34,
};

const SEASONAL_PRIORITY_BY_MONTH = {
  0: ['Yellow Perch', 'Chain Pickerel', 'Crappie', 'Catfish'],
  1: ['Yellow Perch', 'Chain Pickerel', 'Crappie', 'Catfish'],
  2: ['Yellow Perch', 'White Perch', 'Striped Bass', 'Largemouth Bass'],
  3: ['Striped Bass', 'White Perch', 'Yellow Perch', 'Black Drum', 'Largemouth Bass'],
  4: ['Striped Bass', 'Black Drum', 'Red Drum', 'Largemouth Bass', 'Snakehead'],
  5: ['Striped Bass', 'Cobia', 'Red Drum', 'Bluefish', 'Spanish Mackerel', 'Snakehead'],
  6: ['Cobia', 'Red Drum', 'Spanish Mackerel', 'Bluefish', 'Catfish', 'Snakehead'],
  7: ['Cobia', 'Red Drum', 'Spanish Mackerel', 'Bluefish', 'Spot', 'Croaker'],
  8: ['Striped Bass', 'Red Drum', 'Spanish Mackerel', 'Bluefish', 'Spot', 'Croaker'],
  9: ['Striped Bass', 'Red Drum', 'Speckled Sea Trout', 'Black Drum', 'Largemouth Bass'],
  10: ['Striped Bass', 'Largemouth Bass', 'Catfish', 'White Perch'],
  11: ['Striped Bass', 'Catfish', 'Yellow Perch', 'Chain Pickerel'],
};

const PLAYBOOK_LABELS = ['Primary Target', 'Backup Target', 'Fallback Option'];

function clamp(value, min, max) { return Math.min(Math.max(value, min), max); }
function parseWindMph(windSpeed = '') {
  const speeds = String(windSpeed).match(/\d+/g)?.map(Number) || [];
  if (!speeds.length) return 0;
  return speeds.reduce((sum, value) => sum + value, 0) / speeds.length;
}
function scoreWind(windMph) {
  if (!windMph) return 68;
  if (windMph <= 5) return 78;
  if (windMph <= 12) return 92;
  if (windMph <= 18) return 72;
  if (windMph <= 24) return 48;
  return 28;
}
function scoreWeather(shortForecast = '') {
  const text = String(shortForecast).toLowerCase();
  if (text.includes('thunder') || text.includes('storm')) return 25;
  if (text.includes('rain') || text.includes('showers')) return 55;
  if (text.includes('fog')) return 58;
  if (text.includes('cloud') || text.includes('overcast')) return 86;
  if (text.includes('sun') || text.includes('clear')) return 78;
  return 70;
}
function scoreRecency(date) {
  const ageHours = Math.max(0, (Date.now() - new Date(date).getTime()) / 36e5);
  if (ageHours <= 1) return 100;
  if (ageHours <= 3) return 88;
  if (ageHours <= 6) return 72;
  if (ageHours <= 12) return 55;
  if (ageHours <= 24) return 40;
  return 24;
}
function seasonalScore(species, now = new Date()) {
  const priority = SEASONAL_PRIORITY_BY_MONTH[now.getMonth()] || [];
  const index = priority.indexOf(species);
  if (index === -1) return 58;
  return clamp(96 - index * 7, 60, 96);
}
function describeWind(windMph, direction) {
  if (windMph >= 22) return `${direction || 'Variable'} wind is rough; fish protected structure and coves.`;
  if (windMph >= 14) return `${direction || 'Variable'} wind is workable but favors leeward banks and structure.`;
  if (windMph >= 7) return `${direction || 'Variable'} wind is in the sweet spot for moving bait.`;
  return 'Light wind favors topwater, flats, and visible surface activity.';
}

function getMoonPhase() {
  const knownNewMoon = new Date('2026-01-18T00:00:00Z');
  const cycleDays = 29.53;
  const diffDays = (Date.now() - knownNewMoon.getTime()) / 86400000;
  const age = ((diffDays % cycleDays) + cycleDays) % cycleDays;
  if (age < 2 || age > 27) return 'New Moon';
  if (age > 12 && age < 17) return 'Full Moon';
  if (age < 7) return 'Waxing';
  if (age < 14) return 'First Quarter';
  if (age < 22) return 'Waning';
  return 'Last Quarter';
}

function getPrimeWindows(bestWindow, windScore) {
  const moonPhase = getMoonPhase();
  const lunarBoost = moonPhase === 'Full Moon' || moonPhase === 'New Moon';
  const morning = lunarBoost ? '5:15 AM – 8:30 AM' : '5:45 AM – 8:00 AM';
  const evening = lunarBoost ? '6:00 PM – Sunset' : '6:30 PM – Sunset';
  const tideNote = windScore >= 75
    ? 'Incoming tide + moving water around structure'
    : 'Focus tide changes and protected current breaks';

  return {
    primary: morning,
    secondary: evening,
    moonPhase,
    tideNote,
    migrationNote: 'Seasonal migration and bait movement support active feeding windows.',
    label: bestWindow || 'Today',
  };
}

function getBestWindow(forecast = []) {
  if (!forecast.length) return 'Today';
  const scored = forecast.map((period) => ({
    ...period,
    score: Math.round(scoreWind(parseWindMph(period.windSpeed)) * 0.55 + scoreWeather(period.description || period.shortForecast || period.condition) * 0.45),
  }));
  scored.sort((a, b) => b.score - a.score);
  return scored[0]?.time || 'Today';
}

export function buildFishingIntelligence({ reports = [], forecast, currentZone, currentRegion }) {
  const windMph = parseWindMph(forecast?.conditions?.windSpeed);
  const windDirection = forecast?.conditions?.windDirection || 'Variable';
  const wind = scoreWind(windMph);
  const weather = scoreWeather(forecast?.conditions?.shortForecast);
  const reportDensity = clamp(45 + reports.length * 6, 45, 95);
  const bestWindow = getBestWindow(forecast?.forecast || []);
  const primeWindows = getPrimeWindows(bestWindow, wind);

  const rankedReports = reports.map((report) => {
    const action = ACTION_SCORE[report.action] || 60;
    const recency = scoreRecency(report.date);
    const seasonal = seasonalScore(report.species);
    const zoneMatch = report.zone === currentZone?.id ? 100 : 62;
    const score = Math.round(action * 0.28 + recency * 0.18 + weather * 0.16 + wind * 0.14 + seasonal * 0.14 + zoneMatch * 0.10);
    return { ...report, biteScore: clamp(score, 1, 100), confidence: clamp(Math.round(score * 0.72 + reportDensity * 0.28), 1, 100) };
  }).sort((a, b) => b.biteScore - a.biteScore || b.confidence - a.confidence);

  const best = rankedReports[0];
  const speciesMap = new Map();
  rankedReports.forEach((report) => { if (!speciesMap.has(report.species)) speciesMap.set(report.species, report); });
  const playbook = Array.from(speciesMap.values()).slice(0, 3).map((report, index) => ({
    label: PLAYBOOK_LABELS[index] || `Option ${index + 1}`,
    species: report.species,
    technique: report.technique,
    biteScore: report.biteScore,
    confidence: report.confidence,
    location: report.location,
  }));

  return {
    best,
    playbook,
    primeWindows,
    rankedReports,
    biteIndex: best ? (best.biteScore / 10).toFixed(1) : '—',
    confidence: best?.confidence || 0,
    bestWindow,
    rationale: best ? [
      `${best.action || 'Recent'} ${best.species} reports near ${best.location}.`,
      describeWind(windMph, windDirection),
      `${best.technique} is the recommended starting pattern.`,
    ] : ['No live reports are available for this zone yet.'],
  };
}

export function getFishabilityLabel(score) {
  if (score >= 85) return 'Hot Bite';
  if (score >= 72) return 'Worth Going';
  if (score >= 58) return 'Pick Your Spot';
  if (score >= 42) return 'Tough Conditions';
  return 'Scout Only';
}

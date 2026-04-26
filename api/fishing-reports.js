export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  try {
    // Fetch the St. Mary's County fishing report page
    const response = await fetch('https://www.visitstmarysmd.com/plan/fishing-report/');
    if (!response.ok) throw new Error(`Failed to fetch: ${response.status}`);
    
    const html = await response.text();

    // Extract the first (latest) report URL
    const reportMatch = html.match(/<a\s+href="(https:\/\/www\.visitstmarysmd\.com\/fishing-report\/[^"]+)"/);
    
    if (!reportMatch) {
      return res.status(200).json({
        source: 'St. Marys Tackle Box',
        reports: [],
        message: 'No recent reports found',
      });
    }

    const latestReportUrl = reportMatch[1];

    // Fetch the actual report page
    const reportResponse = await fetch(latestReportUrl);
    const reportHtml = await reportResponse.text();

    // Extract everything between the main content tags
    const contentMatch = reportHtml.match(/<main[^>]*>(.*?)<\/main>/s);
    const mainContent = contentMatch ? contentMatch[1] : reportHtml;

    // Parse species from the content
    const reports = parseReportContent(mainContent);

    return res.status(200).json({
      source: 'St. Marys Tackle Box',
      url: latestReportUrl,
      reports: reports,
      total: reports.length,
      fetchedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Fishing reports scrape error:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch fishing reports',
      message: error.message 
    });
  }
}

function parseReportContent(html) {
  // Remove HTML tags and decode entities
  const text = html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ')
    .toLowerCase()
    .trim();

  const speciesMap = {
    'striped bass': 'Striped Bass',
    'rockfish': 'Striped Bass',
    'bass': 'Largemouth Bass',
    'pickerel': 'Chain Pickerel',
    'perch': 'Perch',
    'crappie': 'Crappie',
    'catfish': 'Catfish',
    'bluefish': 'Bluefish',
    'shad': 'Shad',
    'crab': 'Crab',
  };

  const reports = [];
  const found = new Set();

  for (const [keyword, species] of Object.entries(speciesMap)) {
    if (text.includes(keyword) && !found.has(species)) {
      found.add(species);
      
      let location = 'Chesapeake Bay';
      if (text.includes('potomac')) location = 'Potomac River';
      if (text.includes('patuxent')) location = 'Patuxent River';
      if (text.includes('st.mary')) location = "St. Mary's Lake";
      if (text.includes('eastern bay')) location = 'Eastern Bay';

      reports.push({
        species,
        location,
        source: 'St. Marys Tackle Box',
        date: new Date().toISOString(),
        action: text.includes('excellent') || text.includes('hot') || text.includes('biting') ? 'Very Good' : 'Good',
      });
    }
  }

  return reports;
}
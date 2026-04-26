export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/rss+xml; charset=utf-8');
  res.setHeader('Access-Control-Allow-Origin', '*');

  try {
    const { region } = req.query;
    const regionNames = {
      chesapeake: 'Chesapeake Bay',
      potomac: 'Potomac River',
      paxriver: 'Patuxent River',
    };

    if (!region || !regionNames[region]) {
      return res.status(400).send('<?xml version="1.0"?><rss version="2.0"><channel><title>Error: Invalid region</title></channel></rss>');
    }

    const reports = {
      chesapeake: [
        {
          species: 'Striped Bass',
          location: 'Sandy Point',
          zone: 'Lower Bay',
          date: new Date().toISOString(),
          technique: 'Live eels, topwater',
          weight: '18-24 lbs',
          action: 'Good',
          source: 'Tight Lines MD',
        },
      ],
      potomac: [
        {
          species: 'Smallmouth Bass',
          location: 'Sycamore Island',
          zone: 'Upper Potomac',
          date: new Date().toISOString(),
          technique: 'Tube jigs',
          weight: '2-4 lbs',
          action: 'Very Good',
          source: 'Local Guide',
        },
      ],
      paxriver: [
        {
          species: 'Largemouth Bass',
          location: 'Benedict area',
          zone: 'Lower Patuxent',
          date: new Date().toISOString(),
          technique: 'Soft plastics',
          weight: '3-5 lbs',
          action: 'Good',
          source: 'Community Report',
        },
      ],
    };

    const regionReports = reports[region];

    const items = regionReports.map(r => `
    <item>
      <title>${r.species} - ${r.location}</title>
      <description><![CDATA[
        <strong>Technique:</strong> ${r.technique}<br/>
        <strong>Size:</strong> ${r.weight}<br/>
        <strong>Action:</strong> ${r.action}<br/>
        <strong>Source:</strong> ${r.source}
      ]]></description>
      <pubDate>${new Date(r.date).toUTCString()}</pubDate>
      <category>${r.species}</category>
    </item>`).join('');

    const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>TIDECAST - ${regionNames[region]}</title>
    <link>https://tidecast-kappa.vercel.app</link>
    <description>Real-time fishing reports for ${regionNames[region]}</description>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    ${items}
  </channel>
</rss>`;

    res.send(rss);
  } catch (error) {
    res.status(500).send(`Error: ${error.message}`);
  }
}
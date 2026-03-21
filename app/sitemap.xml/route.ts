export async function GET() {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <url>
      <loc>https://maemaelog.com/</loc>
    </url>
    <url>
      <loc>https://maemaelog.com/trade</loc>
    </url>
    <url>
      <loc>https://maemaelog.com/stocks</loc>
    </url>
    <url>
      <loc>https://maemaelog.com/profit</loc>
    </url>
  </urlset>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml",
    },
  });
}
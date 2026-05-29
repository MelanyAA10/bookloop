const https = require('https');
const http = require('http');
const { URL } = require('url');

module.exports = async function (context, req) {
  const apimUrl = process.env.VITE_API_URL;
  const apimKey = process.env.VITE_API_KEY;       

  // La ruta que pidió el browser: /api/profile → route = "profile"
  const route = context.bindingData.route || '';
  const queryString = req.url.includes('?')
    ? req.url.substring(req.url.indexOf('?'))
    : '';

  const targetUrl = new URL(`${apimUrl}/${route}${queryString}`);


  targetUrl.searchParams.set('subscription-key', apimKey);

  const options = {
    hostname: targetUrl.hostname,
    path: targetUrl.pathname + targetUrl.search,
    method: req.method,
    headers: {
      'Content-Type': 'application/json',
    }
  };

  return new Promise((resolve) => {
    const lib = targetUrl.protocol === 'https:' ? https : http;
    const proxyReq = lib.request(options, (proxyRes) => {
      let data = '';
      proxyRes.on('data', chunk => data += chunk);
      proxyRes.on('end', () => {
        context.res = {
          status: proxyRes.statusCode,
          headers: { 'Content-Type': 'application/json' },
          body: data
        };
        resolve();
      });
    });

    proxyReq.on('error', (err) => {
      context.res = { status: 500, body: JSON.stringify({ error: err.message }) };
      resolve();
    });

    if (req.rawBody) proxyReq.write(req.rawBody);
    proxyReq.end();
  });
};
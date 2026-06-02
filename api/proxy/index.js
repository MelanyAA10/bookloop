// api/proxy/index.js
// Proxy genérico: reenvía todas las llamadas del frontend a Azure API Management
// La API_KEY vive solo aquí (servidor), nunca llega al browser.

const AZURE_URL = process.env.AZURE_URL;
const API_KEY   = process.env.API_KEY;

module.exports = async function (context, req) {
  // restOfPath captura todo lo que viene después de /api/
  // ej: /api/books/123/reviews  →  restOfPath = "books/123/reviews"
  const restOfPath = context.bindingData.restOfPath || '';

  // Construir query string original sin la subscription-key (el frontend no la manda)
  const query = { ...req.query };
  delete query['subscription-key']; // por si acaso
  const qs = new URLSearchParams(query).toString();

  const url = `${AZURE_URL}/${restOfPath}?subscription-key=${API_KEY}${qs ? '&' + qs : ''}`;

  try {
    const response = await fetch(url, {
      method: req.method,
      headers: { 'Content-Type': 'application/json' },
      body: ['GET', 'HEAD'].includes(req.method)
        ? undefined
        : JSON.stringify(req.body),
    });

    const contentType = response.headers.get('content-type') || '';
    const body = contentType.includes('application/json')
      ? await response.json()
      : await response.text();

    context.res = {
      status: response.status,
      headers: { 'Content-Type': 'application/json' },
      body,
    };
  } catch (err) {
    context.log.error('Proxy error:', err.message);
    context.res = {
      status: 500,
      body: { error: 'Error interno del proxy' },
    };
  }
};

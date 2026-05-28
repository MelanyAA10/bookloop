const { app } = require('@azure/functions');

app.http('proxy', {
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  authLevel: 'anonymous',
  route: '{*route}',
  handler: async (request, context) => {
    const APIM_URL = process.env.VITE_API_URL;
    const APIM_KEY = process.env.VITE_API_KEY ;

    if (!APIM_URL || !APIM_KEY) {
      return { status: 500, jsonBody: { error: 'Faltan variables de entorno.' } };
    }

    const route = request.params.route || '';
    const response = await fetch(`${APIM_URL}/${route}`, {
      method: request.method,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Ocp-Apim-Subscription-Key': APIM_KEY
      },
      body: request.method !== 'GET' ? await request.text() : undefined
    });

    const data = await response.json();
    return { status: response.status, jsonBody: data };
  }
});
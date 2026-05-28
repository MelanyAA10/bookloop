module.exports = async function (context, req) {
  try {
    const APIM_URL = process.env.APIM_URL;
    const APIM_KEY = process.env.APIM_SUBSCRIPTION_KEY;

    if (!APIM_URL || !APIM_KEY) {
      context.res = { status: 500, body: { error: 'Faltan variables de entorno.' } };
      return;
    }

    const route = req.params.route || '';
    const response = await fetch(`${APIM_URL}/${route}`, {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Ocp-Apim-Subscription-Key': APIM_KEY
      },
      body: req.method !== 'GET' ? JSON.stringify(req.body) : undefined
    });

    const data = await response.json();
    context.res = {
      status: response.status,
      headers: { 'Content-Type': 'application/json' },
      body: data
    };
  } catch (error) {
    context.log('Error en proxy:', error.message);
    context.res = { status: 500, body: { error: 'Error en el proxy.' } };
  }
};
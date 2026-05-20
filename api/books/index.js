module.exports = async function (context, req) {
  try {
    const APIM_URL = process.env.APIM_URL;
    const APIM_KEY = process.env.APIM_SUBSCRIPTION_KEY;

    if (!APIM_URL || !APIM_KEY) {
      context.res = {
        status: 500,
        body: {
          error: 'Faltan variables de entorno en el servidor.'
        }
      };
      return;
    }

    const response = await fetch(`${APIM_URL}/books`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Ocp-Apim-Subscription-Key': APIM_KEY
      }
    });

    const data = await response.json();

    context.res = {
      status: response.status,
      headers: {
        'Content-Type': 'application/json'
      },
      body: data
    };
  } catch (error) {
    context.log('Error consultando APIM:', error);

    context.res = {
      status: 500,
      body: {
        error: 'Error al consultar libros.'
      }
    };
  }
};
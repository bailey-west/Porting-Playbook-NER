// This is a Netlify serverless function.
// It acts as a secure proxy to the Google AI API.

exports.handler = async function(event) {
  // Only allow POST requests, which is what our app uses.
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    // Securely get the API key from the environment variables you set in Netlify.
    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      // This error will show if the environment variable isn't set correctly.
      throw new Error('Google API key is not configured.');
    }

    // Get the data (the user's prompt) from the website's request.
    const clientPayload = JSON.parse(event.body);

    const modelName = 'gemini-2.5-flash-preview-05-20';
    const googleApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

    // Make the actual, secure call to the Google AI API.
    const response = await fetch(googleApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(clientPayload), // Forward the payload from the website.
    });

    if (!response.ok) {
        const errorBody = await response.text();
        console.error('Google API Error:', errorBody);
        return {
            statusCode: response.status,
            body: `An error occurred with the Google API: ${errorBody}`
        };
    }

    // Get the successful response data from Google.
    const data = await response.json();

    // Send the successful response back to the website.
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    };

  } catch (error) {
    console.error('Proxy Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'An internal server error occurred in the proxy.', details: error.message }),
    };
  }
};

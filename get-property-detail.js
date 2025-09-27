// netlify/functions/get-property-detail.js

const rateLimitStore = {};
const RATE_LIMIT_WINDOW = 60000; // 60 seconds
const MAX_REQUESTS_PER_WINDOW = 10;

const sanitize = (text) => {
    if (!text) return text;
    return text.replace(/<[^>]*>?/gm, '');
};

exports.handler = async (event, context) => {
    const { AIRTABLE_API_KEY, AIRTABLE_BASE_ID, ALLOWED_ORIGINS } = process.env;
    const allowedOrigins = (ALLOWED_ORIGINS || '').split(',');
    const origin = event.headers.origin;
    const headers = { 'Content-Type': 'application/json' };

    if (allowedOrigins.includes(origin)) {
        headers['Access-Control-Allow-Origin'] = origin;
    } else {
        return { statusCode: 403, body: JSON.stringify({ error: 'Origin not allowed' }) };
    }

    // Rate Limiting
    const ip = event.headers['x-nf-client-connection-ip'] || '127.0.0.1';
    const now = Date.now();
    const userRequests = rateLimitStore[ip] || { count: 0, startTime: now };

    if (now - userRequests.startTime > RATE_LIMIT_WINDOW) {
        userRequests.count = 0;
        userRequests.startTime = now;
    }

    userRequests.count += 1;
    rateLimitStore[ip] = userRequests;

    if (userRequests.count > MAX_REQUESTS_PER_WINDOW) {
        return { statusCode: 429, body: JSON.stringify({ error: 'Too many requests' }), headers };
    }

    const tableName = 'Properties';
    const { id } = event.queryStringParameters;

    // --- Input Validation ---
    const idRegex = /^[a-zA-Z0-9]{15,20}$/;
    if (!id || !idRegex.test(id)) {
        return { statusCode: 400, body: JSON.stringify({ error: 'A valid property ID is required.' }), headers };
    }

    const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(tableName)}/${id}`;

    try {
        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
            },
        });

        if (!response.ok) {
            if (response.status === 404) {
                return { statusCode: 404, body: JSON.stringify({ error: 'Property not found.' }), headers };
            }
            console.error(`Airtable API Error: ${response.status}`);
            return { statusCode: response.status, body: JSON.stringify({ error: 'Failed to fetch data from Airtable.' }), headers };
        }

        const record = await response.json();

        // Map the single Airtable record to our desired JSON structure
        const fields = record.fields;
        const imageUrls = (fields.Image || []).map(img => img.url);
        const phoneDigits = fields['Agent Phone'] ? String(fields['Agent Phone']).replace(/\D/g, '') : null;

        const propertyDetails = {
            id: record.id,
            title: sanitize(fields.Title) || 'Untitled Property',
            location: sanitize(fields.Location) || 'Unknown Location',
            price: fields.Price || 0,
            status: sanitize(fields.Status) || 'N/A',
            bedrooms: fields.Bedrooms || null,
            bathrooms: fields.Bathrooms || null,
            sizeSqft: fields['Size (sqft)'] || null,
            propertyType: sanitize(fields['Property Type']) || 'N/A',
            description: sanitize(fields.Description) || 'No detailed description available.',
            amenities: (fields.Amenities || []).map(amenity => sanitize(amenity)),
            images: imageUrls,
            agentName: sanitize(fields['Agent Name']) || 'N/A',
            agentPhone: phoneDigits,
            latitude: fields.Latitude || null,
            longitude: fields.Longitude || null,
        };

        headers['Cache-Control'] = 'public, max-age=300, s-maxage=300'; // Cache for 5 minutes
        return { statusCode: 200, headers, body: JSON.stringify(propertyDetails) };

    } catch (error) {
        console.error('Serverless function error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'An internal server error occurred.' }),
        };
    }
};
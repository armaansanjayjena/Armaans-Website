// netlify/functions/get-listings.js

exports.handler = async (event, context) => {
    const { AIRTABLE_API_KEY, AIRTABLE_BASE_ID } = process.env;
    const headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*' // Keep for debugging, replace with specific origin in production
    };

    if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) {
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: "Missing AIRTABLE_API_KEY or AIRTABLE_BASE_ID in Netlify env" }),
        };
    }

    const tableName = 'Properties';
    const { q, propertyType, offerType, location, maxPrice } = event.queryStringParameters || {};

    let filterClauses = [];

    // Build filter clauses from query parameters
    if (propertyType) filterClauses.push(`{Property Type} = "${propertyType}"`);
    if (offerType) filterClauses.push(`{Offer Type} = "${offerType}"`);
    if (location) filterClauses.push(`{Location} = "${location}"`);
    if (maxPrice && /^\d+$/.test(maxPrice)) filterClauses.push(`{Price} <= ${maxPrice}`);
    if (q) {
        const searchTerm = q.toLowerCase().replace(/"/g, '\\"'); // Sanitize search term
        filterClauses.push(`OR(
            FIND(LOWER("${searchTerm}"), LOWER(Title)),
            FIND(LOWER("${searchTerm}"), LOWER(Location)),
            FIND(LOWER("${searchTerm}"), LOWER(Description))
        )`);
    }

    const filterByFormula = filterClauses.length > 0 ? `AND(${filterClauses.join(',')})` : '';
    let url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(tableName)}?view=Grid%20view`;

    if (filterByFormula) {
        url += `&filterByFormula=${encodeURIComponent(filterByFormula)}`;
    }

    try {
        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
            },
        });

        if (!response.ok) {
            const errorBody = await response.text();
            return {
                statusCode: response.status,
                headers,
                body: JSON.stringify({ error: 'Airtable API Error', status: response.status, details: errorBody }),
            };
        }

        const data = await response.json();

        // Transform the data to match the frontend's expected structure
        const records = data.records.map(record => {
            const fields = record.fields;
            const imageUrl = (fields.Image && fields.Image.length > 0) ? fields.Image[0].url : null;

            return {
                listingId: record.id,
                title: fields.Title || 'Untitled Property',
                propertyType: fields['Property Type'] || 'N/A',
                offerType: fields['Offer Type'] || 'N/A',
                price: fields.Price || 0,
                location: fields.Location || 'Unknown Location',
                status: fields.Status || 'N/A',
                image: imageUrl,
                propertyTypeDescription: fields['Property Type Description'] || '',
                offerTypeDescription: fields['Offer Type Description'] || '',
                locationDescription: fields['Location Description'] || '',
            };
        });

        return { statusCode: 200, headers, body: JSON.stringify({ records }) };

    } catch (error) {
        console.error('Serverless function error:', error);
        return { statusCode: 500, headers, body: JSON.stringify({ error: 'Internal Server Error' }) };
    }
};
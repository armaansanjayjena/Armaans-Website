const fs = require('fs/promises');

const { AIRTABLE_API_KEY, AIRTABLE_BASE_ID } = process.env;
const API_URL = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}`;

const HEADERS = {
  Authorization: `Bearer ${AIRTABLE_API_KEY}`,
};

const THROTTLE_MS = 250;

// --- Utility Functions ---

function sanitize(text) {
  if (typeof text !== 'string') return text;
  return text.replace(/[<>]/g, '');
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchAllRecords(tableName, view, fields) {
  let allRecords = [];
  let offset = null;

  console.log(`Fetching records from ${tableName}...`);

  do {
    const params = new URLSearchParams({
      pageSize: '100',
      view,
    });

    fields.forEach((field, index) => {
        params.append(`fields[${index}]`, field);
    });

    if (offset) {
      params.append('offset', offset);
    }

    const url = `${API_URL}/${tableName}?${params.toString()}`;
    
    try {
      const response = await fetch(url, { headers: HEADERS });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Airtable API error for ${tableName}: ${response.statusText} - ${JSON.stringify(errorData)}`);
      }
      const data = await response.json();
      allRecords.push(...data.records);
      offset = data.offset;

      if (offset) {
        await sleep(THROTTLE_MS);
      }
    } catch (error) {
      console.error(`Failed to fetch from ${tableName}:`, error);
      throw error; // Rethrow to be caught by the main error handler
    }
  } while (offset);

  console.log(`Fetched ${allRecords.length} records from ${tableName}.`);
  return allRecords;
}

function sanitizeObject(obj) {
    const newObj = {};
    for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            const value = obj[key];
            if (typeof value === 'string') {
                newObj[key] = sanitize(value);
            } else {
                newObj[key] = value;
            }
        }
    }
    return newObj;
}


// --- Main Logic ---

async function main() {
  if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) {
    console.error('Error: AIRTABLE_API_KEY and AIRTABLE_BASE_ID must be set in environment variables.');
    process.exit(1);
  }

  try {
    // Fetch Properties
    const propertiesRecords = await fetchAllRecords(
      'Properties',
      'Published',
      ['Title', 'Slug', 'Price', 'Location', 'Property Type', 'Offer Type', 'Status', 'Bedrooms', 'Bathrooms', 'Size (sqft)', 'Description', 'Image attachment URLs']
    );
    
    const listings = propertiesRecords.map(record => sanitizeObject(record.fields));
    await fs.writeFile('./data/listings.json', JSON.stringify(listings, null, 2), 'utf-8');
    console.log('Successfully wrote ./data/listings.json');

    // Fetch Blogs
    const blogsRecords = await fetchAllRecords(
      'Blogs',
      'Published',
      ['Title', 'Slug', 'Author', 'Date Published', 'Excerpt', 'Content', 'Cover Image', 'Tags']
    );

    const blogs = blogsRecords.map(record => sanitizeObject(record.fields));
    await fs.writeFile('./data/blogs.json', JSON.stringify(blogs, null, 2), 'utf-8');
    console.log('Successfully wrote ./data/blogs.json');

    console.log('Airtable data fetch complete.');

  } catch (error) {
    console.error('An error occurred during the Airtable fetch process:', error.message);
    process.exit(1);
  }
}

main();
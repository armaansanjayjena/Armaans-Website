// listings cache helper — stores listings.json for 10 minutes to save backend ops
async function fetchListings() {
  const CACHE_KEY = 'listings_cache_v1';
  const TTL = 10 * 60 * 1000; // 10 minutes
  try {
    const cachedRaw = localStorage.getItem(CACHE_KEY);
    if (cachedRaw) {
      const cached = JSON.parse(cachedRaw);
      if (Date.now() - cached.ts < TTL) {
        return cached.data;
      }
    }
    const res = await fetch('/data/listings.json', { cache: 'no-store' });
    if (!res.ok) throw new Error('Network response not ok ' + res.status);
    const data = await res.json();
    localStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), data }));
    return data;
  } catch (err) {
    console.error('fetchListings error', err);
    // fallback to cached if available
    const fallback = localStorage.getItem(CACHE_KEY);
    if (fallback) return JSON.parse(fallback).data;
    return { records: [] };
  }
}

// listings.js

document.addEventListener('DOMContentLoaded', () => {
    const listingsContainer = document.getElementById('listings');

    if (!listingsContainer) {
        console.error('Error: The container element with id "listings" was not found.');
        return;
    }

    /**
     * Creates an HTML card for a single property listing.
     * @param {object} listing - The property data object from Airtable.
     * @returns {string} The HTML string for the property card.
     */
    const createListingCard = (listing) => {
        // The listing object here is the transformed one from get-listings.js

        const priceFormatted = typeof listing.price === 'number' && listing.price > 0
            ? `₹${listing.price.toLocaleString('en-IN')}`
            : 'Price on request';
        
        const imageUrl = listing.image && listing.image.length > 0 ? listing.image : 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=400&q=80';

        // Intelligently select the first available description
        const description = listing.propertyTypeDescription || listing.offerTypeDescription || listing.locationDescription || '';

        return `
            <div class="bento-card-wrapper">
                <a href="property-detail.html?id=${listing.listingId}" class="bento-card">
                    <div class="listing-image-container">
                        <img data-src="${imageUrl}" alt="${listing.title || 'Property image'}" class="lazy-image">
                        <div class="bento-badge">${listing.offerType}</div>
                    </div>
                    <div class="listing-content">
                        <h3 class="bento-title">${listing.title || 'N/A'}</h3>
                        <p class="bento-location">📍 ${listing.location || 'N/A'}</p>
                        <p class="bento-description">${description}</p>
                        <div class="price-favorite-wrapper">
                            <div class="bento-price">${priceFormatted}</div>
                            <button class="favorite-btn on-card" data-favorite-id="${listing.listingId}" aria-label="Save to Favorites">♡</button>
                        </div>
                    </div>
                </a>
            </div>
        `;
    };

    /**
     * Fetches listings and renders them into the container.
     */
    const fetchAndRenderListings = async () => {
        const urlParams = new URLSearchParams(window.location.search);
        try {
            const data = await fetchListings();

            const q = urlParams.get('q')?.toLowerCase();
            const propertyType = urlParams.get('propertyType');
            const offerType = urlParams.get('offerType');
            const location = urlParams.get('location');
            const maxPrice = urlParams.get('maxPrice');
            const sort = urlParams.get('sort');

            let records = data.records;

            if (q) {
                records = records.filter(r => r.title?.toLowerCase().includes(q) || r.location?.toLowerCase().includes(q));
            }
            if (propertyType) {
                records = records.filter(r => r.propertyType === propertyType);
            }
            if (offerType) {
                records = records.filter(r => r.offerType === offerType);
            }
            if (location) {
                records = records.filter(r => r.location === location);
            }
            if (maxPrice) {
                records = records.filter(r => r.price <= maxPrice);
            }
            if (sort) {
                // implement sort logic if needed
            }
            
            if (records && records.length > 0) {
                listingsContainer.innerHTML = data.records.map(createListingCard).join('');
                if (window.FavoritesManager) {
                    FavoritesManager.initFavoriteButtons();
                }
                // After rendering, initialize the lazy loader
                if (window.initLazyLoader) {
                    window.initLazyLoader();
                }
            } else {
                listingsContainer.innerHTML = '<p>No properties match your search criteria. Please try different filters or check back later.</p>';
            }
        } catch (error) {
            console.error('Failed to fetch listings:', error);
            console.log('Using placeholder data for listings.');
            // Fallback to placeholder data if the fetch fails
            if (typeof placeholderProperties !== 'undefined' && placeholderProperties.length > 0) {
                const mappedPlaceholders = placeholderProperties.map(p => ({
                    ...p.fields, listingId: p.id, image: p.fields.Image?.[0]?.url
                }));
                listingsContainer.innerHTML = mappedPlaceholders.map(createListingCard).join('');
                // Initialize features for placeholder cards
                if (window.FavoritesManager) FavoritesManager.initFavoriteButtons();
                if (window.initLazyLoader) window.initLazyLoader();
            } else {
                listingsContainer.innerHTML = '<p>Sorry, we were unable to load property listings. Please try again later.</p>';
            }
        }
    };

    fetchAndRenderListings();
});

// Placeholder data for local development or if the API fails
const placeholderProperties = [
    {
        id: 'rec001',
        fields: {
            'Listing ID': 'PROP001',
            'Title': 'Modern Apartment in Viman Nagar',
            'Location': 'Viman Nagar, Pune',
            'Price': 12000000,
            'Offer Type': 'Sale',
            'Property Type': 'Apartment',
            'Image': [{ url: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=400&q=80' }],
            'Property Type Description': 'Spacious 3BHK with city views.',
        }
    },
    {
        id: 'rec002',
        fields: {
            'Listing ID': 'PROP002',
            'Title': 'Commercial Office Space in Kharadi',
            'Location': 'Kharadi, Pune',
            'Price': 25000000,
            'Offer Type': 'Sale',
            'Property Type': 'Office',
            'Image': [{ url: 'https://images.unsplash.com/photo-1521791115236-3a131d58a553?auto=format&fit=crop&w=400&q=80' }],
            'Offer Type Description': 'Ideal for IT companies and startups.',
        }
    },
    {
        id: 'rec003',
        fields: {
            'Listing ID': 'PROP003',
            'Title': 'Luxury Bungalow in Koregaon Park',
            'Location': 'Koregaon Park, Pune',
            'Price': 50000000,
            'Offer Type': 'Sale',
            'Property Type': 'Bungalow',
            'Image': [{ url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=400&q=80' }],
            'Location Description': 'Exclusive property in a prime location.',
        }
    },
    {
        id: 'rec004',
        fields: {
            'Listing ID': 'PROP004',
            'Title': 'Retail Showroom on Main Street',
            'Location': 'Viman Nagar, Pune',
            'Price': 300000,
            'Offer Type': 'Rent',
            'Property Type': 'Showroom',
            'Image': [{ url: 'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?auto=format&fit=crop&w=400&q=80' }],
            'Property Type Description': 'High-footfall area, perfect for retail.',
        }
    },
    {
        id: 'rec005',
        fields: {
            'Listing ID': 'PROP005',
            'Title': 'Residential Plot in Wagholi',
            'Location': 'Wagholi, Pune',
            'Price': 8000000,
            'Offer Type': 'Sale',
            'Property Type': 'Plot',
            'Image': [{ url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=400&q=80' }],
            'Offer Type Description': 'Gated community with all amenities.',
        }
    },
    {
        id: 'rec006',
        fields: {
            'Listing ID': 'PROP006',
            'Title': 'Pre-Leased Restaurant Space',
            'Location': 'Kalyani Nagar, Pune',
            'Price': 15000000,
            'Offer Type': 'Pre-Leased',
            'Property Type': 'Restaurant',
            'Image': [{ url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=400&q=80' }],
            'Location Description': 'Leased to a popular restaurant chain.',
        }
    },
];
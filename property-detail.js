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

// /assets/property-detail.js

// Property Detail Page JavaScript - Shelters Realty
document.addEventListener('DOMContentLoaded', function() {
    const mainContent = document.getElementById('property-detail-content');

    // --- Utility Functions ---
    const formatCurrency = (amount) => {
        if (isNaN(amount) || amount === 0) return 'Price on Request';
        return '₹' + amount.toLocaleString('en-IN');
    };

    // --- Data Fetching ---
    const fetchPropertyDetails = async (propertyId) => {
        try {
            // OLD: fetch('/.netlify/functions/get-property-detail?id=' + propertyId)
            const listings = await fetchListings();
            const property = listings.records.find(p => p.listingId === propertyId);

            if (!property) {
                throw new Error(`Property with ID ${propertyId} not found in listings.json`);
            }
            
            const propertyIdToUse = property.id || property.listingId; // Handle both live and placeholder data
            renderPropertyDetails(property, propertyIdToUse);
            fetchAndRenderSimilarProperties(property, propertyIdToUse);
        } catch (error) {
            console.error('Failed to fetch property details:', error);
            // Fallback to placeholder data if the fetch fails
            if (typeof placeholderPropertyDetail !== 'undefined' && placeholderPropertyDetail.listingId === propertyId) {
                renderPropertyDetails(placeholderPropertyDetail, placeholderPropertyDetail.listingId);
                fetchAndRenderSimilarProperties(placeholderPropertyDetail, placeholderPropertyDetail.listingId);
            } else {
                mainContent.innerHTML = `<div class="container"><p>Sorry, we couldn't load the property details. It might not exist or there was a server error.</p></div>`;
                mainContent.style.display = 'block';
            }
        }
    };

    // --- DOM Rendering ---
    const renderPropertyDetails = (property, propertyId) => {
        // Set document title
        document.title = `${property.title} | Shelters Realty`;

        // Populate header and specs
        document.getElementById('breadcrumb-property-title').textContent = property.title;
        document.getElementById('property-title').textContent = property.title;
        document.getElementById('property-location').textContent = property.location;
        document.getElementById('property-bedrooms').textContent = property.bedrooms ? `${property.bedrooms} BHK` : 'N/A';
        document.getElementById('property-size').textContent = property.sizeSqft ? `${property.sizeSqft} sqft` : 'N/A';
        document.getElementById('property-status').textContent = property.status;
        document.getElementById('property-price').textContent = formatCurrency(property.price);

        // Populate description
        document.getElementById('property-description').innerHTML = property.description.replace(/\n/g, '<br>');

        // Populate amenities
        const amenitiesGrid = document.getElementById('amenities-grid');
        amenitiesGrid.innerHTML = property.amenities.length > 0
            ? property.amenities.map(amenity => `
                <div class="feature-item">
                    <span class="feature-icon">✅</span>
                    <span>${amenity}</span>
                </div>`).join('')
            : '<p>No specific amenities listed.</p>';

        // Populate gallery
        const galleryCarousel = document.getElementById('gallery-carousel');
        if (property.images && property.images.length > 0) {
            galleryCarousel.innerHTML = property.images.map((imgUrl, index) => `
                <div class="gallery-image-wrapper">
                    <img src="${imgUrl}" alt="Property image ${index + 1}">
                </div>
            `).join('');
        } else {
            galleryCarousel.innerHTML = `<div class="gallery-image-wrapper"><img src="https://via.placeholder.com/800x600/E2E8F0/4A5568?text=No+Image+Available" alt="No image available"></div>`;
        }

        // Populate map
        document.getElementById('map-location-title').textContent = `📍 ${property.location}`;

        // Set up the favorite button with the correct ID
        const savePropertyBtn = document.getElementById('save-property');
        savePropertyBtn.dataset.favoriteId = propertyId;

        // Add event listeners after rendering
        setupEventListeners(property, propertyId);

        // Show the content
        mainContent.style.display = 'block';
    };

    /**
     * Fetches and renders properties similar to the one being viewed.
     * @param {object} currentProperty - The main property being displayed.
     * @param {string} currentPropertyId - The ID of the main property.
     */
    const fetchAndRenderSimilarProperties = async (currentProperty, currentPropertyId) => {
        const similarContainer = document.getElementById('similar-properties-list');
        const similarTitle = document.getElementById('similar-properties-title');

        try {
            const data = await fetchListings();
            renderSimilar(data.records || data);
        } catch (error) {
            console.error('Failed to fetch live similar properties, using placeholders:', error);
            if (typeof placeholderProperties !== 'undefined' && placeholderProperties.length > 0) {
                renderSimilar(placeholderProperties);
            } else {
                similarTitle.style.display = 'none';
                similarContainer.innerHTML = '';
            }
        }

        function renderSimilar(allProperties) {
            const similar = allProperties
                .filter(p => {
                    // The data from get-listings is already transformed
                    const idToCheck = p.listingId || p.id;
                    return (p.location === currentProperty.location || p.propertyType === currentProperty.propertyType) &&
                           idToCheck !== currentPropertyId;
                }
                )
                .slice(0, 4); // Show up to 4 similar properties

            if (similar.length > 0) {
                similarTitle.style.display = 'block';
                similarContainer.innerHTML = similar.map(p => createSimilarCard(p, p.listingId)).join('');
            } else {
                similarTitle.style.display = 'none';
                similarContainer.innerHTML = '';
            }
        }
    };

    /**
     * Creates an HTML card for a single "similar property" item.
     * @param {object} property - The transformed property data object.
     * @param {string} id - The property id.
     * @returns {string} The HTML string for the similar property card.
     */
    const createSimilarCard = (property, id) => {
        const imageUrl = property.image || 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=400&q=80';
        const priceFormatted = formatCurrency(property.price);

        return `
            <a href="property-detail.html?id=${id}" class="similar-item">
                <img src="${imageUrl}" alt="${property.title}">
                <div class="similar-info">
                    <h4>${property.title}</h4>
                    <p class="similar-location">${property.location}</p>
                    <p class="similar-price">${priceFormatted}</p>
                </div>
            </a>
        `;
    };


    // --- Event Listeners Setup ---
    const setupEventListeners = (property, propertyId) => {
        // The new gallery is pure CSS, so no JS listeners are needed for it.
        // Action buttons
        const contactAgentBtn = document.getElementById('contact-agent');
        const savePropertyBtn = document.getElementById('save-property');
        const sharePropertyBtn = document.getElementById('share-property');
        const mapButton = document.getElementById('map-button');

        // Contact agent
        contactAgentBtn.addEventListener('click', () => {
            if (property.agentPhone && property.agentName) {
                const message = `Hi ${property.agentName}, I'm interested in the property "${property.title}" (ID: ${property.id}). Can we connect?`;
                const whatsappUrl = `https://wa.me/91${property.agentPhone}?text=${encodeURIComponent(message)}`;
                window.open(whatsappUrl, '_blank');
            } else {
                alert('Agent contact information is not available for this property.');
            }
        });

        // Save to Favorites
        savePropertyBtn.dataset.favoriteId = propertyId;
        if (window.FavoritesManager) {
            FavoritesManager.updateButtonState(savePropertyBtn, FavoritesManager.isFavorite(propertyId));
            savePropertyBtn.addEventListener('click', () => {
                FavoritesManager.toggleFavorite(propertyId);
            });
        }

        // Share property
        sharePropertyBtn.addEventListener('click', () => {
            if (navigator.share) {
                navigator.share({
                    title: `${property.title} | Shelters Realty`,
                    text: `Check out this amazing property: ${property.title}`,
                    url: window.location.href
                }).catch(console.error);
            } else {
                navigator.clipboard.writeText(window.location.href).then(() => {
                    alert('Property link copied to clipboard!');
                });
            }
        });

        // Map button
        mapButton.addEventListener('click', () => {
            const query = property.latitude && property.longitude
                ? `${property.latitude},${property.longitude}`
                : property.location;
            const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
            window.open(googleMapsUrl, '_blank');
        });
    };

    // --- Initialization ---
    const init = () => {
        const urlParams = new URLSearchParams(window.location.search);
        const propertyId = urlParams.get('id');

        if (propertyId) {
            fetchPropertyDetails(propertyId);
        } else {
            console.error('No property ID found in URL.');
            mainContent.innerHTML = `<div class="container"><p>No property was selected. Please go back to the <a href="listings.html">listings page</a> and choose a property.</p></div>`;
            mainContent.style.display = 'block';
        }
    }

    init();
});


// Placeholder data for a single property detail view
const placeholderPropertyDetail = {
    listingId: 'PROP-DETAIL-001',
    title: 'Luxury 3BHK in Kharadi',
    location: 'Kharadi, East Pune',
    price: 18500000,
    bedrooms: 3,
    sizeSqft: 1500,
    status: 'Ready to Move',
    description: `
        Discover modern living in this stunning 3BHK apartment located in the heart of Kharadi, one of East Pune's most vibrant neighborhoods. This property boasts a spacious 1500 sqft layout with contemporary interiors and high-end finishes.
        <br><br>
        The apartment features an open-plan living and dining area, a modular kitchen with premium fittings, and three well-appointed bedrooms with attached balconies offering panoramic city views. Residents will enjoy access to a range of exclusive amenities, including a swimming pool, a fully-equipped gymnasium, landscaped gardens, and a dedicated children's play area.
        <br><br>
        Situated just minutes away from major IT parks, international schools, and world-class hospitals, this property is an ideal choice for families and professionals seeking a perfect blend of comfort and convenience.
    `,
    amenities: [
        'Swimming Pool',
        'Gymnasium',
        'Landscaped Gardens',
        '24/7 Security',
        'Clubhouse',
        'Children\'s Play Area',
        'Reserved Parking',
        'Power Backup'
    ],
    images: [
        'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=800&q=80'
    ],
    agentName: 'Armaan',
    agentPhone: '9860826918',
    latitude: 18.551,
    longitude: 73.951
};

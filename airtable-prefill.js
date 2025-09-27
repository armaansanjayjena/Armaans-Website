/*
 * Airtable Form Prefill Helper
 *
 * This script provides a function to render a pre-filled Airtable form in an iframe.
 *
 * Required Airtable Field Names for Prefilling:
 * - "Listing ID" (Text): For the listing record ID.
 * - "Source" (Text): For the lead source (e.g., 'property-detail').
 * - "UTM Source" (Text): For the utm_source URL parameter.
 * - "UTM Medium" (Text): For the utm_medium URL parameter.
 * - "UTM Campaign" (Text): For the utm_campaign URL parameter.
 *
 * CSS Note:
 * The iframe is created with width="100%". For responsive behavior, ensure the
 * container element has a responsive width.
 */

function renderAirtableForm(containerId, embedBaseUrl, options = {}) {
  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`Airtable form container with id "${containerId}" not found.`);
    return;
  }

  const prefillParams = new URLSearchParams();

  // Prefill from options
  if (options.listingId) {
    prefillParams.append('prefill_Listing ID', options.listingId);
  }
  if (options.source) {
    prefillParams.append('prefill_Source', options.source);
  }

  // Prefill from UTM parameters in the window URL
  const urlParams = new URLSearchParams(window.location.search);
  const utmSource = urlParams.get('utm_source');
  const utmMedium = urlParams.get('utm_medium');
  const utmCampaign = urlParams.get('utm_campaign');

  if (utmSource) {
    prefillParams.append('prefill_UTM Source', utmSource);
  }
  if (utmMedium) {
    prefillParams.append('prefill_UTM Medium', utmMedium);
  }
  if (utmCampaign) {
    prefillParams.append('prefill_UTM Campaign', utmCampaign);
  }

  // Construct the final iframe URL
  const finalUrl = `${embedBaseUrl}?${prefillParams.toString()}`;

  // Create and inject the iframe
  const iframe = document.createElement('iframe');
  iframe.setAttribute('src', finalUrl);
  iframe.setAttribute('frameborder', '0');
  iframe.setAttribute('onmousewheel', '');
  iframe.setAttribute('width', '100%');
  iframe.setAttribute('height', options.height || 650);
  iframe.style.background = 'transparent';
  iframe.style.border = '1px solid #ccc';

  container.innerHTML = ''; // Clear container
  container.appendChild(iframe);
}

// Attach to window to make it globally accessible
window.renderAirtableForm = renderAirtableForm;

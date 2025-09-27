// assets/lazy-images.js

document.addEventListener('DOMContentLoaded', () => {
    /**
     * Initializes the IntersectionObserver to lazy-load images.
     * Looks for all images with the class 'lazy-image'.
     */
    const initLazyLoader = () => {
        const lazyImages = document.querySelectorAll('img.lazy-image');

        if (!("IntersectionObserver" in window)) {
            // Fallback for older browsers: load all images immediately.
            console.warn("IntersectionObserver not supported. Loading all images.");
            lazyImages.forEach(img => loadImage(img));
            return;
        }

        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const image = entry.target;
                    loadImage(image);
                    // Stop observing the image once it has been loaded.
                    observer.unobserve(image);
                }
            });
        });

        lazyImages.forEach(image => {
            imageObserver.observe(image);
        });
    };

    /**
     * Replaces the data-src attribute with src to trigger image loading.
     * @param {HTMLImageElement} image - The image element to load.
     */
    const loadImage = (image) => {
        if (image.dataset.src) {
            image.src = image.dataset.src;
            image.onload = () => {
                // Optional: add a class to fade in the loaded image
                image.classList.add('loaded');
            };
            image.onerror = () => {
                // Optional: handle image loading errors, e.g., show a placeholder
                console.error(`Failed to load image: ${image.dataset.src}`);
                // image.src = '/path/to/placeholder-error-image.png';
            };
        }
    };

    // Expose the initializer to the global scope so it can be called
    // from other scripts after dynamic content is loaded.
    window.initLazyLoader = initLazyLoader;

    // Initial call in case there are any static lazy images on the page.
    initLazyLoader();
});
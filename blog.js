// Blog Page JavaScript - Shelters Realty
document.addEventListener('DOMContentLoaded', function() {
    
    // Blog search and filter functionality
    const blogSearch = document.getElementById('blog-search');
    const categoryFilter = document.getElementById('category-filter');
    const dateFilter = document.getElementById('date-filter');
    const blogGrid = document.getElementById('blog-grid');
    const loadMoreBtn = document.getElementById('load-more-blog');
    
    let currentFilters = {
        search: '',
        category: 'all',
        date: 'all'
    };
    
    let displayedArticles = 6; // Initial number of articles to show
    let allArticles = []; // Will be populated with all articles
    
    // Sample blog articles data (replace with CMS integration)
    const blogArticles = [
        {
            id: 'featured-1',
            title: 'East Pune Real Estate Market Trends 2024: What Buyers & Sellers Need to Know',
            excerpt: 'Discover the latest market insights, price trends, and investment opportunities in East Pune\'s booming real estate sector. Our comprehensive analysis covers Viman Nagar, Kharadi, Koregaon Park, and emerging areas.',
            category: 'market-trends',
            date: '2024-12-15',
            readTime: '5 min read',
            image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&h=500&fit=crop',
            featured: true
        },
        {
            id: 'article-1',
            title: 'Complete Guide to Property Investment in East Pune',
            excerpt: 'Everything you need to know about investing in East Pune real estate, from choosing the right location to maximizing returns.',
            category: 'investment',
            date: '2024-12-10',
            readTime: '4 min read',
            image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&h=250&fit=crop'
        },
        {
            id: 'article-2',
            title: 'First-Time Home Buyer\'s Checklist: 15 Essential Steps',
            excerpt: 'Navigate your first home purchase with confidence using our comprehensive checklist designed specifically for East Pune buyers.',
            category: 'home-buying',
            date: '2024-12-08',
            readTime: '6 min read',
            image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&h=250&fit=crop'
        },
        {
            id: 'article-3',
            title: 'Essential Property Documents: What You Need to Know',
            excerpt: 'A complete guide to property documentation in Maharashtra, including RERA compliance, title verification, and legal requirements.',
            category: 'legal',
            date: '2024-12-05',
            readTime: '7 min read',
            image: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=400&h=250&fit=crop'
        },
        {
            id: 'article-4',
            title: 'How to Determine the Right Price for Your Property',
            excerpt: 'Learn the key factors that influence property valuation in East Pune and how to price your property competitively in the market.',
            category: 'tips',
            date: '2024-12-03',
            readTime: '5 min read',
            image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&h=250&fit=crop'
        },
        {
            id: 'article-5',
            title: 'Commercial Real Estate Boom in East Pune: Opportunities & Challenges',
            excerpt: 'Explore the growing commercial real estate sector in East Pune, including IT parks, retail spaces, and office complexes.',
            category: 'market-trends',
            date: '2024-11-28',
            readTime: '6 min read',
            image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=250&fit=crop'
        },
        {
            id: 'article-6',
            title: 'Home Staging Secrets: Sell Your Property Faster',
            excerpt: 'Professional home staging tips to make your property more appealing to potential buyers and increase its market value.',
            category: 'tips',
            date: '2024-11-25',
            readTime: '4 min read',
            image: 'https://images.unsplash.com/photo-1570129476810-cd312e6535b9?w=400&h=250&fit=crop'
        },
        {
            id: 'article-7',
            title: 'RERA Guidelines: What Every Property Buyer Should Know',
            excerpt: 'Understanding RERA regulations and how they protect property buyers in Maharashtra. Essential information for safe property transactions.',
            category: 'legal',
            date: '2024-11-20',
            readTime: '8 min read',
            image: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=400&h=250&fit=crop'
        },
        {
            id: 'article-8',
            title: 'Property Tax in Pune: Complete Guide for Homeowners',
            excerpt: 'Everything about property tax in Pune, including calculation methods, payment procedures, and how to reduce your tax burden.',
            category: 'tips',
            date: '2024-11-15',
            readTime: '5 min read',
            image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&h=250&fit=crop'
        },
        {
            id: 'article-9',
            title: 'Emerging Areas in East Pune: Future Investment Hotspots',
            excerpt: 'Discover the next big areas for real estate investment in East Pune, including infrastructure developments and growth projections.',
            category: 'investment',
            date: '2024-11-10',
            readTime: '6 min read',
            image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&h=250&fit=crop'
        }
    ];
    
    // Initialize
    allArticles = blogArticles;
    renderArticles();
    
    // Search functionality
    blogSearch.addEventListener('input', function() {
        currentFilters.search = this.value.toLowerCase();
        filterArticles();
    });
    
    // Category filter
    categoryFilter.addEventListener('change', function() {
        currentFilters.category = this.value;
        filterArticles();
    });
    
    // Date filter
    dateFilter.addEventListener('change', function() {
        currentFilters.date = this.value;
        filterArticles();
    });
    
    // Load more functionality
    loadMoreBtn.addEventListener('click', function() {
        displayedArticles += 6;
        renderArticles();
    });
    
    // Filter articles based on current filters
    function filterArticles() {
        displayedArticles = 6; // Reset count on new filter
        let filtered = allArticles.filter(article => {
            const matchesSearch = !currentFilters.search || 
                article.title.toLowerCase().includes(currentFilters.search) ||
                article.excerpt.toLowerCase().includes(currentFilters.search);
            
            const matchesCategory = currentFilters.category === 'all' || 
                article.category === currentFilters.category;
            
            const matchesDate = currentFilters.date === 'all' || 
                isWithinDateRange(article.date, currentFilters.date);
            
            return matchesSearch && matchesCategory && matchesDate;
        });
        
        renderArticles(filtered);
    }
    
    // Check if article is within date range
    function isWithinDateRange(articleDate, dateFilter) {
        const article = new Date(articleDate);
        const now = new Date();
        
        switch(dateFilter) {
            case 'week':
                const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                return article >= weekAgo;
            case 'month':
                const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                return article >= monthAgo;
            case 'quarter':
                const quarterAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
                return article >= quarterAgo;
            case 'year':
                const yearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
                return article >= yearAgo;
            default:
                return true;
        }
    }
    
    // Render articles
    function renderArticles(articles = allArticles) {
        const articlesToShow = articles.slice(0, displayedArticles);
        
        // Clear existing articles (except featured)
        const existingArticles = blogGrid.querySelectorAll('.blog-card:not(.featured-article)');
        existingArticles.forEach(article => article.remove());
        
        if (articlesToShow.length === 0) {
            blogGrid.innerHTML = `
                <div class="no-results">
                    <div class="no-results-content glass-panel">
                        <h3>No articles found</h3>
                        <p>Try adjusting your search criteria or filters</p>
                        <button class="clear-filters-btn" onclick="clearAllFilters()">Clear Filters</button>
                    </div>
                </div>
            `;
            loadMoreBtn.style.display = 'none';
            return;
        }
        
        // Render articles
        articlesToShow.forEach(article => {
            if (!article.featured) {
                const articleCard = createArticleCard(article);
                blogGrid.appendChild(articleCard);
            }
        });
        
        // Show/hide load more button
        if (articles.length > displayedArticles) {
            loadMoreBtn.style.display = 'block';
        } else {
            loadMoreBtn.style.display = 'none';
        }
    }
    
    // Create article card element
    function createArticleCard(article) {
        const card = document.createElement('article');
        card.className = 'blog-card fade-in';
        card.setAttribute('data-category', article.category);
        card.setAttribute('data-date', article.date);
        
        const categoryLabels = {
            'market-trends': 'Market Trends',
            'investment': 'Investment Guide',
            'home-buying': 'Home Buying',
            'legal': 'Legal',
            'tips': 'Tips & Advice'
        };
        
        card.innerHTML = `
            <div class="blog-image">
                <img src="${article.image}" alt="${article.title}">
                <div class="blog-category">${categoryLabels[article.category]}</div>
            </div>
            <div class="blog-content">
                <div class="blog-meta">
                    <span class="blog-date">${formatDate(article.date)}</span>
                    <span class="blog-read-time">${article.readTime}</span>
                </div>
                <h3 class="blog-title">${article.title}</h3>
                <p class="blog-excerpt">${article.excerpt}</p>
                <div class="blog-actions">
                    <a href="#" class="read-more-btn">Read More</a>
                </div>
            </div>
        `;
        
        return card;
    }
    
    // Format date for display
    function formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        });
    }
    
    // Clear all filters
    function clearAllFilters() {
        currentFilters = {
            search: '',
            category: 'all',
            date: 'all'
        };
        
        blogSearch.value = '';
        categoryFilter.value = 'all';
        dateFilter.value = 'all';
        
        filterArticles();
    }
    
    // Newsletter form
    const newsletterForm = document.getElementById('newsletter-form');
    newsletterForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const email = this.querySelector('.newsletter-input').value;
        
        // Simulate newsletter subscription
        showNotification('Thank you for subscribing! You\'ll receive our latest updates soon.', 'success');
        this.reset();
        
        // In a real implementation, this would send the email to your backend
        console.log('Newsletter subscription:', email);
    });
    
    // Show notification
    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        // Add styles
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--electric-blue);
            color: var(--obsidian);
            padding: 1rem 1.5rem;
            border-radius: var(--radius-md);
            font-weight: 600;
            z-index: 10000;
            transform: translateX(100%);
            transition: transform 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
    }
    
    // Blog card hover effects
    const blogCards = document.querySelectorAll('.blog-card');
    blogCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-8px)';
            this.style.boxShadow = '0 20px 40px rgba(15, 240, 252, 0.2)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = '';
        });
    });
    
    // Intersection Observer for scroll animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);
    
    // Observe elements for scroll animations
    const animateElements = document.querySelectorAll('.blog-card, .newsletter-section, .featured-article');
    animateElements.forEach(el => {
        el.classList.add('fade-in');
        observer.observe(el);
    });
    
    // Search suggestions
    const searchSuggestions = [
        'property investment',
        'home buying tips',
        'market trends',
        'legal documents',
        'property valuation',
        'RERA guidelines',
        'property tax',
        'home staging'
    ];
    
    // Add search suggestions (optional enhancement)
    blogSearch.addEventListener('focus', function() {
        // Could implement search suggestions dropdown here
    });
});

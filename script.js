// iOS 26-style smooth animations and interactions
document.addEventListener('DOMContentLoaded', function() {
    
    // Intersection Observer for scroll animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                
                // Animate skill bars when they come into view
                if (entry.target.classList.contains('skill-progress')) {
                    const width = entry.target.getAttribute('data-width');
                    setTimeout(() => {
                        entry.target.style.width = width;
                    }, 200);
                }
            }
        });
    }, observerOptions);

    // Observe elements for scroll animations
    const animateElements = document.querySelectorAll('.timeline-item, .education-card, .contact-item, .skill-progress, .project-card, .research-card');
    animateElements.forEach(el => {
        el.classList.add('fade-in');
        observer.observe(el);
    });

    // Smooth navigation with iOS-style easing
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                const offsetTop = targetSection.offsetTop - 80; // Account for fixed nav
                
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Parallax effect for hero stats
    const heroStats = document.querySelectorAll('.stat-item');
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const rate = scrolled * -0.1;
        
        heroStats.forEach((stat, index) => {
            const speed = 0.1 + (index * 0.02);
            stat.style.transform = `translateY(${rate * speed}px)`;
        });
    });

    // Dynamic navigation background on scroll
    const nav = document.querySelector('.nav-container');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 100) {
            nav.style.background = 'rgba(255, 255, 255, 0.95)';
            nav.style.backdropFilter = 'blur(20px)';
        } else {
            nav.style.background = 'rgba(255, 255, 255, 0.08)';
            nav.style.backdropFilter = 'blur(20px)';
        }
    });

    // iOS-style button interactions
    const buttons = document.querySelectorAll('.cta-button, .contact-button');
    buttons.forEach(button => {
        button.addEventListener('mousedown', function() {
            this.style.transform = 'scale(0.98)';
        });
        
        button.addEventListener('mouseup', function() {
            this.style.transform = '';
        });
        
        button.addEventListener('mouseleave', function() {
            this.style.transform = '';
        });
    });

    // Typing animation for hero title
    const titleLines = document.querySelectorAll('.title-line');
    titleLines.forEach((line, index) => {
        const text = line.textContent;
        line.textContent = '';
        line.style.opacity = '1';
        
        setTimeout(() => {
            let i = 0;
            const typeWriter = () => {
                if (i < text.length) {
                    line.textContent += text.charAt(i);
                    i++;
                    setTimeout(typeWriter, 50);
                }
            };
            typeWriter();
        }, index * 500);
    });

    // Animation for hero stats
    const statItems = document.querySelectorAll('.stat-item');
    statItems.forEach((stat, index) => {
        const randomDelay = Math.random() * 1;
        const randomDuration = 4 + Math.random() * 2;
        
        stat.style.animationDelay = `${randomDelay}s`;
        stat.style.animationDuration = `${randomDuration}s`;
    });

    // Hover effects for cards
    const cards = document.querySelectorAll('.timeline-content, .education-card, .contact-item, .project-card, .research-card');
    cards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-8px) scale(1.02)';
            this.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });

    // Smooth reveal animation for sections
    const sections = document.querySelectorAll('section');
    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.1 });

    sections.forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(30px)';
        section.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
        sectionObserver.observe(section);
    });

    // iOS-style scroll indicator
    const scrollIndicator = document.createElement('div');
    scrollIndicator.className = 'scroll-indicator';
    scrollIndicator.innerHTML = `
        <div class="scroll-line"></div>
        <div class="scroll-progress"></div>
    `;
    document.body.appendChild(scrollIndicator);

    // Add scroll indicator styles
    const indicatorStyles = `
        .scroll-indicator {
            position: fixed;
            right: 20px;
            top: 50%;
            transform: translateY(-50%);
            width: 2px;
            height: 100px;
            background: rgba(0, 0, 0, 0.1);
            border-radius: 1px;
            z-index: 1000;
        }
        
        .scroll-progress {
            width: 100%;
            background: linear-gradient(180deg, #2d5a87, #4a9b8e);
            border-radius: 1px;
            height: 0%;
            transition: height 0.1s ease;
        }
        
        @media (max-width: 768px) {
            .scroll-indicator {
                display: none;
            }
        }
    `;
    
    const styleSheet = document.createElement('style');
    styleSheet.textContent = indicatorStyles;
    document.head.appendChild(styleSheet);

    // Update scroll progress
    window.addEventListener('scroll', () => {
        const scrollTop = window.pageYOffset;
        const docHeight = document.body.scrollHeight - window.innerHeight;
        const scrollPercent = (scrollTop / docHeight) * 100;
        
        const progressBar = document.querySelector('.scroll-progress');
        if (progressBar) {
            progressBar.style.height = scrollPercent + '%';
        }
    });

    // Add subtle cursor trail effect
    const cursor = document.createElement('div');
    cursor.className = 'cursor-trail';
    document.body.appendChild(cursor);

    const cursorStyles = `
        .cursor-trail {
            position: fixed;
            width: 20px;
            height: 20px;
            background: radial-gradient(circle, rgba(45, 90, 135, 0.3), transparent);
            border-radius: 50%;
            pointer-events: none;
            z-index: 9999;
            transition: transform 0.1s ease;
            opacity: 0;
        }
        
        .cursor-trail.active {
            opacity: 1;
        }
        
        @media (max-width: 768px) {
            .cursor-trail {
                display: none;
            }
        }
    `;
    
    const cursorStyleSheet = document.createElement('style');
    cursorStyleSheet.textContent = cursorStyles;
    document.head.appendChild(cursorStyleSheet);

    // Mouse movement tracking
    document.addEventListener('mousemove', (e) => {
        cursor.style.left = e.clientX - 10 + 'px';
        cursor.style.top = e.clientY - 10 + 'px';
        cursor.classList.add('active');
    });

    document.addEventListener('mouseleave', () => {
        cursor.classList.remove('active');
    });

    // Add loading animation
    window.addEventListener('load', () => {
        document.body.classList.add('loaded');
        
        // Animate hero elements
        const heroElements = document.querySelectorAll('.hero-title, .hero-subtitle, .hero-cta');
        heroElements.forEach((el, index) => {
            setTimeout(() => {
                el.style.opacity = '1';
                el.style.transform = 'translateY(0)';
            }, index * 200);
        });
    });

    // Add loading styles
    const loadingStyles = `
        body {
            opacity: 0;
            transition: opacity 0.5s ease;
        }
        
        body.loaded {
            opacity: 1;
        }
        
        .hero-title, .hero-subtitle, .hero-cta {
            opacity: 0;
            transform: translateY(30px);
            transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
        }
    `;
    
    const loadingStyleSheet = document.createElement('style');
    loadingStyleSheet.textContent = loadingStyles;
    document.head.appendChild(loadingStyleSheet);

    // Performance optimization: Throttle scroll events
    let ticking = false;
    
    function updateOnScroll() {
        // Scroll-based animations here
        ticking = false;
    }
    
    function requestTick() {
        if (!ticking) {
            requestAnimationFrame(updateOnScroll);
            ticking = true;
        }
    }
    
    window.addEventListener('scroll', requestTick);

    // Add subtle page transitions
    const pageTransition = {
        init() {
            this.createTransition();
            this.bindEvents();
        },
        
        createTransition() {
            const transition = document.createElement('div');
            transition.className = 'page-transition';
            transition.innerHTML = `
                <div class="transition-overlay"></div>
            `;
            document.body.appendChild(transition);
            
            const transitionStyles = `
                .page-transition {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    z-index: 9999;
                    pointer-events: none;
                }
                
                .transition-overlay {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: linear-gradient(135deg, #2d5a87, #4a9b8e);
                    transform: scaleX(0);
                    transform-origin: left;
                    transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
                }
                
                .page-transition.active .transition-overlay {
                    transform: scaleX(1);
                }
            `;
            
            const styleSheet = document.createElement('style');
            styleSheet.textContent = transitionStyles;
            document.head.appendChild(styleSheet);
        },
        
        bindEvents() {
            const links = document.querySelectorAll('a[href^="#"]');
            links.forEach(link => {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.animateTransition(() => {
                        const target = document.querySelector(link.getAttribute('href'));
                        if (target) {
                            target.scrollIntoView({ behavior: 'smooth' });
                        }
                    });
                });
            });
        },
        
        animateTransition(callback) {
            const transition = document.querySelector('.page-transition');
            transition.classList.add('active');
            
            setTimeout(() => {
                if (callback) callback();
                setTimeout(() => {
                    transition.classList.remove('active');
                }, 300);
            }, 300);
        }
    };
    
    // Initialize page transitions
    pageTransition.init();

    console.log('🚀 Portfolio loaded with iOS 26-style animations!');
});

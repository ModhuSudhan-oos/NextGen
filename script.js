// Mobile menu toggle
document.addEventListener('DOMContentLoaded', () => {
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    
    if (mobileMenuButton && mobileMenu) {
        mobileMenuButton.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
        });
    }
    
    // Hide mobile menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!mobileMenu.contains(e.target) && e.target !== mobileMenuButton) {
            mobileMenu.classList.add('hidden');
        }
    });
    
    // Tool search functionality
    const toolSearch = document.getElementById('tool-search');
    if (toolSearch) {
        toolSearch.addEventListener('input', () => {
            const searchTerm = toolSearch.value.toLowerCase();
            const toolCards = document.querySelectorAll('.tool-card');
            let visibleCount = 0;
            
            toolCards.forEach(card => {
                const name = card.querySelector('h3').textContent.toLowerCase();
                const desc = card.querySelector('p').textContent.toLowerCase();
                const categories = card.dataset.categories.toLowerCase();
                
                if (name.includes(searchTerm) || desc.includes(searchTerm) || categories.includes(searchTerm)) {
                    card.classList.remove('hidden');
                    visibleCount++;
                } else {
                    card.classList.add('hidden');
                }
            });
            
            const noResults = document.getElementById('no-results');
            if (visibleCount === 0 && searchTerm.length > 0) {
                noResults.classList.remove('hidden');
            } else {
                noResults.classList.add('hidden');
            }
        });
    }
    
    // Tool category filtering
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            const category = button.dataset.category;
            
            // Update active button
            document.querySelectorAll('.filter-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            button.classList.add('active');
            
            // Filter tools
            const toolCards = document.querySelectorAll('.tool-card');
            toolCards.forEach(card => {
                if (category === 'all' || card.dataset.categories.includes(category)) {
                    card.classList.remove('hidden');
                } else {
                    card.classList.add('hidden');
                }
            });
            
            // Show/hide no results message
            const visibleTools = document.querySelectorAll('.tool-card:not(.hidden)');
            const noResults = document.getElementById('no-results');
            if (visibleTools.length === 0) {
                noResults.classList.remove('hidden');
            } else {
                noResults.classList.add('hidden');
            }
        });
    });
    
    // FAQ search functionality
    const faqSearch = document.getElementById('faq-search');
    if (faqSearch) {
        faqSearch.addEventListener('input', () => {
            const searchTerm = faqSearch.value.toLowerCase();
            const faqItems = document.querySelectorAll('.faq-item');
            let visibleCount = 0;
            
            faqItems.forEach(item => {
                const question = item.querySelector('h3').textContent.toLowerCase();
                const answer = item.querySelector('.faq-answer').textContent.toLowerCase();
                
                if (question.includes(searchTerm) || answer.includes(searchTerm)) {
                    item.classList.remove('hidden');
                    visibleCount++;
                } else {
                    item.classList.add('hidden');
                }
            });
            
            const noResults = document.getElementById('no-faq-results');
            if (visibleCount === 0 && searchTerm.length > 0) {
                noResults.classList.remove('hidden');
            } else {
                noResults.classList.add('hidden');
            }
        });
    }
    
    // FAQ category filtering
    const faqCategoryButtons = document.querySelectorAll('.faq-category-btn');
    faqCategoryButtons.forEach(button => {
        button.addEventListener('click', () => {
            const category = button.dataset.category;
            
            // Update active button
            document.querySelectorAll('.faq-category-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            button.classList.add('active');
            
            // Filter FAQs
            const faqItems = document.querySelectorAll('.faq-item');
            faqItems.forEach(item => {
                if (category === 'all' || item.dataset.category === category) {
                    item.classList.remove('hidden');
                } else {
                    item.classList.add('hidden');
                }
            });
            
            // Show/hide no results message
            const visibleFaqs = document.querySelectorAll('.faq-item:not(.hidden)');
            const noResults = document.getElementById('no-faq-results');
            if (visibleFaqs.length === 0) {
                noResults.classList.remove('hidden');
            } else {
                noResults.classList.add('hidden');
            }
        });
    });
    
    // FAQ accordion functionality
    const faqQuestions = document.querySelectorAll('.faq-question');
    faqQuestions.forEach(question => {
        question.addEventListener('click', () => {
            const answer = question.nextElementSibling;
            const icon = question.querySelector('i');
            
            // Toggle answer visibility
            answer.classList.toggle('hidden');
            
            // Rotate icon
            if (answer.classList.contains('hidden')) {
                icon.classList.remove('fa-chevron-up');
                icon.classList.add('fa-chevron-down');
            } else {
                icon.classList.remove('fa-chevron-down');
                icon.classList.add('fa-chevron-up');
            }
        });
    });
    
    // Testimonials carousel
    const testimonialPrev = document.getElementById('testimonial-prev');
    const testimonialNext = document.getElementById('testimonial-next');
    const testimonialDots = document.querySelectorAll('.testimonial-dot');
    
    if (testimonialPrev && testimonialNext) {
        let currentSlide = 0;
        const slides = document.querySelectorAll('.testimonial-slide');
        
        function showSlide(index) {
            slides.forEach((slide, i) => {
                slide.classList.toggle('hidden', i !== index);
            });
            
            testimonialDots.forEach((dot, i) => {
                dot.classList.toggle('bg-indigo-600', i === index);
                dot.classList.toggle('bg-gray-300', i !== index);
            });
            
            currentSlide = index;
        }
        
        testimonialPrev.addEventListener('click', () => {
            const newIndex = (currentSlide - 1 + slides.length) % slides.length;
            showSlide(newIndex);
        });
        
        testimonialNext.addEventListener('click', () => {
            const newIndex = (currentSlide + 1) % slides.length;
            showSlide(newIndex);
        });
        
        testimonialDots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                showSlide(index);
            });
        });
        
        // Auto-rotate every 5 seconds
        setInterval(() => {
            const newIndex = (currentSlide + 1) % slides.length;
            showSlide(newIndex);
        }, 5000);
    }
    
    // Tool iframe fullscreen toggle
    const fullscreenBtn = document.getElementById('fullscreen-btn');
    if (fullscreenBtn) {
        fullscreenBtn.addEventListener('click', () => {
            const iframe = document.getElementById('tool-iframe');
            
            if (!document.fullscreenElement) {
                iframe.requestFullscreen().catch(err => {
                    console.error(`Error attempting to enable fullscreen: ${err.message}`);
                });
                fullscreenBtn.innerHTML = '<i class="fas fa-compress"></i>';
            } else {
                document.exitFullscreen();
                fullscreenBtn.innerHTML = '<i class="fas fa-expand"></i>';
            }
        });
    }
    
    // Hero animation (Lottie)
    if (document.getElementById('hero-animation')) {
        lottie.loadAnimation({
            container: document.getElementById('hero-animation'),
            renderer: 'svg',
            loop: true,
            autoplay: true,
            path: 'assets/animations/hero-animation.json'
        });
    }
    
    // Scroll reveal animations
    const animateOnScroll = () => {
        const elements = document.querySelectorAll('.scroll-animate');
        const windowHeight = window.innerHeight;
        
        elements.forEach(element => {
            const elementPosition = element.getBoundingClientRect().top;
            const elementVisible = 100;
            
            if (elementPosition < windowHeight - elementVisible) {
                element.classList.add('animate-fadeInUp');
            }
        });
    };
    
    window.addEventListener('scroll', animateOnScroll);
    animateOnScroll(); // Run once on load
    
    // Dark mode toggle (if implemented)
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    if (darkModeToggle) {
        darkModeToggle.addEventListener('click', () => {
            document.documentElement.classList.toggle('dark');
            localStorage.setItem('darkMode', document.documentElement.classList.contains('dark'));
        });
        
        // Check for saved preference
        if (localStorage.getItem('darkMode') === 'true') {
            document.documentElement.classList.add('dark');
        }
    }
});

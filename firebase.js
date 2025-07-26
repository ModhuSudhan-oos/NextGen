// Firebase configuration (replace with your actual config)
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// Function to fetch data from Firebase
async function fetchData(path) {
    try {
        const snapshot = await database.ref(path).once('value');
        return snapshot.val();
    } catch (error) {
        console.error("Error fetching data:", error);
        return null;
    }
}

// Load featured tools for homepage
async function loadFeaturedTools() {
    const tools = await fetchData('tools');
    if (!tools) return;
    
    const featuredTools = Object.values(tools).filter(tool => tool.featured);
    const container = document.getElementById('featured-tools');
    
    if (container) {
        container.innerHTML = featuredTools.slice(0, 6).map(tool => `
            <div class="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition duration-300">
                <div class="p-6">
                    <div class="flex items-center mb-4">
                        <img src="${tool.icon}" alt="${tool.name}" class="h-10 w-10 mr-3">
                        <h3 class="text-xl font-bold text-gray-800">${tool.name}</h3>
                    </div>
                    <p class="text-gray-600 mb-6">${tool.shortDescription}</p>
                    <a href="tool.html?id=${tool.id}" class="inline-block text-indigo-600 hover:text-indigo-800 font-medium">
                        Learn More <i class="fas fa-arrow-right ml-1"></i>
                    </a>
                </div>
            </div>
        `).join('');
    }
}

// Load all tools for tools directory
async function loadAllTools() {
    const tools = await fetchData('tools');
    if (!tools) return;
    
    const container = document.getElementById('tools-container');
    const categories = new Set();
    
    if (container) {
        container.innerHTML = Object.values(tools).map(tool => {
            // Add categories for filtering
            tool.categories.forEach(cat => categories.add(cat));
            
            return `
                <div class="tool-card bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition duration-300" data-categories="${tool.categories.join(',')}">
                    <div class="p-6">
                        <div class="flex items-center mb-4">
                            <img src="${tool.icon}" alt="${tool.name}" class="h-10 w-10 mr-3">
                            <h3 class="text-xl font-bold text-gray-800">${tool.name}</h3>
                        </div>
                        <p class="text-gray-600 mb-6">${tool.shortDescription}</p>
                        <div class="flex flex-wrap gap-2 mb-4">
                            ${tool.categories.map(cat => `<span class="bg-indigo-100 text-indigo-800 text-xs font-medium px-2.5 py-0.5 rounded">${cat}</span>`).join('')}
                        </div>
                        <a href="tool.html?id=${tool.id}" class="inline-block w-full bg-indigo-600 hover:bg-indigo-700 text-white text-center font-bold py-2 px-4 rounded-lg transition duration-300">
                            Open Tool
                        </a>
                    </div>
                </div>
            `;
        }).join('');
    }
    
    // Add category filters
    const categoriesContainer = document.getElementById('tool-categories');
    if (categoriesContainer) {
        categoriesContainer.innerHTML = `
            <button class="filter-btn active" data-category="all">All</button>
            ${Array.from(categories).map(cat => `
                <button class="filter-btn" data-category="${cat}">${cat}</button>
            `).join('')}
        `;
    }
}

// Load tool details
async function loadToolDetails() {
    const urlParams = new URLSearchParams(window.location.search);
    const toolId = urlParams.get('id');
    
    if (!toolId) {
        document.getElementById('tool-not-found').classList.remove('hidden');
        document.getElementById('tool-loading').classList.add('hidden');
        return;
    }
    
    const tool = await fetchData(`tools/${toolId}`);
    
    if (!tool) {
        document.getElementById('tool-not-found').classList.remove('hidden');
        document.getElementById('tool-loading').classList.add('hidden');
        return;
    }
    
    // Populate tool details
    document.getElementById('tool-name').textContent = tool.name;
    document.getElementById('tool-icon').src = tool.icon;
    document.getElementById('tool-preview').src = tool.previewImage;
    document.getElementById('tool-description').textContent = tool.description;
    document.getElementById('tool-launch-btn').href = tool.url;
    
    // Categories
    const categoriesContainer = document.getElementById('tool-categories');
    categoriesContainer.innerHTML = tool.categories.map(cat => `
        <span class="bg-indigo-100 text-indigo-800 text-sm font-medium px-3 py-1 rounded-full">${cat}</span>
    `).join('');
    
    // Features
    const featuresContainer = document.getElementById('tool-features');
    featuresContainer.innerHTML = tool.features.map(feat => `
        <div class="flex items-start">
            <div class="bg-indigo-100 p-2 rounded-full mr-4 mt-1">
                <i class="fas fa-check text-indigo-600"></i>
            </div>
            <div>
                <h4 class="font-semibold text-gray-800">${feat.title}</h4>
                <p class="text-gray-600">${feat.description}</p>
            </div>
        </div>
    `).join('');
    
    // Details
    document.getElementById('tool-category').textContent = tool.categories[0];
    document.getElementById('tool-updated').textContent = new Date(tool.updatedAt).toLocaleDateString();
    document.getElementById('tool-usage').textContent = tool.usage || 'Free to use';
    
    // Iframe (if applicable)
    if (tool.embedUrl) {
        document.getElementById('tool-iframe-container').classList.remove('hidden');
        document.getElementById('tool-iframe').src = tool.embedUrl;
    }
    
    // Load reviews
    loadToolReviews(toolId);
    
    // Show content
    document.getElementById('tool-loading').classList.add('hidden');
    document.getElementById('tool-details').classList.remove('hidden');
}

// Load tool reviews
async function loadToolReviews(toolId, limit = 3) {
    const reviews = await fetchData(`reviews/${toolId}`);
    const container = document.getElementById('tool-reviews');
    
    if (!reviews || Object.keys(reviews).length === 0) {
        container.innerHTML = '<p class="text-gray-500">No reviews yet. Be the first to review!</p>';
        return;
    }
    
    const reviewList = Object.values(reviews);
    container.innerHTML = reviewList.slice(0, limit).map(review => `
        <div class="bg-gray-50 p-4 rounded-lg">
            <div class="flex items-center mb-3">
                <div class="bg-indigo-100 text-indigo-800 w-10 h-10 rounded-full flex items-center justify-center font-bold mr-3">
                    ${review.userName.charAt(0).toUpperCase()}
                </div>
                <div>
                    <h4 class="font-semibold">${review.userName}</h4>
                    <div class="flex items-center">
                        ${Array(5).fill().map((_, i) => `
                            <i class="fas fa-star ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'}"></i>
                        `).join('')}
                    </div>
                </div>
            </div>
            <p class="text-gray-700">${review.comment}</p>
            <p class="text-sm text-gray-500 mt-2">${new Date(review.date).toLocaleDateString()}</p>
        </div>
    `).join('');
    
    // Show "Load More" if there are more reviews
    if (reviewList.length > limit) {
        document.getElementById('load-more-reviews').classList.remove('hidden');
        document.getElementById('load-more-reviews').onclick = () => loadToolReviews(toolId, limit + 3);
    }
}

// Load features
async function loadFeatures() {
    const features = await fetchData('features');
    if (!features) return;
    
    const container = document.getElementById('features-container');
    if (container) {
        container.innerHTML = Object.values(features).map(feature => `
            <div class="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition duration-300">
                <div class="p-6">
                    <div class="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-6">
                        <i class="${feature.icon} text-indigo-600 text-2xl"></i>
                    </div>
                    <h3 class="text-xl font-bold text-gray-800 mb-3">${feature.title}</h3>
                    <p class="text-gray-600">${feature.description}</p>
                </div>
            </div>
        `).join('');
    }
    
    // Load feature highlights
    const highlights = await fetchData('featureHighlights');
    const highlightsContainer = document.getElementById('feature-highlights');
    
    if (highlights && highlightsContainer) {
        highlightsContainer.innerHTML = Object.values(highlights).map(highlight => `
            <div class="flex flex-col md:flex-row gap-6">
                <div class="md:w-1/3 flex-shrink-0">
                    <div class="w-full aspect-video bg-indigo-100 rounded-xl flex items-center justify-center">
                        <i class="${highlight.icon} text-indigo-600 text-4xl"></i>
                    </div>
                </div>
                <div class="md:w-2/3">
                    <h3 class="text-2xl font-bold text-gray-800 mb-3">${highlight.title}</h3>
                    <p class="text-gray-600 mb-4">${highlight.description}</p>
                    <ul class="space-y-2">
                        ${highlight.bullets.map(bullet => `
                            <li class="flex items-start">
                                <i class="fas fa-check text-indigo-600 mt-1 mr-2"></i>
                                <span>${bullet}</span>
                            </li>
                        `).join('')}
                    </ul>
                </div>
            </div>
        `).join('');
    }
}

// Load testimonials
async function loadTestimonials() {
    const testimonials = await fetchData('testimonials');
    if (!testimonials) return;
    
    const container = document.getElementById('testimonials-container');
    const dotsContainer = document.getElementById('testimonial-dots');
    
    if (container && dotsContainer) {
        const testimonialList = Object.values(testimonials);
        
        container.innerHTML = testimonialList.map((testimonial, index) => `
            <div class="testimonial-slide w-full flex-shrink-0 px-4 ${index === 0 ? 'block' : 'hidden'}">
                <div class="bg-white p-8 rounded-xl shadow-md">
                    <div class="flex items-center mb-6">
                        <img src="${testimonial.avatar}" alt="${testimonial.name}" class="w-12 h-12 rounded-full mr-4">
                        <div>
                            <h4 class="font-bold">${testimonial.name}</h4>
                            <p class="text-gray-600 text-sm">${testimonial.position} at ${testimonial.company}</p>
                        </div>
                    </div>
                    <p class="text-gray-700 mb-4">"${testimonial.quote}"</p>
                    <div class="flex items-center">
                        ${Array(5).fill().map((_, i) => `
                            <i class="fas fa-star ${i < testimonial.rating ? 'text-yellow-400' : 'text-gray-300'}"></i>
                        `).join('')}
                    </div>
                </div>
            </div>
        `).join('');
        
        dotsContainer.innerHTML = testimonialList.map((_, index) => `
            <button class="testimonial-dot w-3 h-3 rounded-full ${index === 0 ? 'bg-indigo-600' : 'bg-gray-300'}" data-index="${index}"></button>
        `).join('');
    }
}

// Load FAQs
async function loadFAQs() {
    const faqs = await fetchData('faqs');
    if (!faqs) return;
    
    const container = document.getElementById('faq-container');
    const categories = new Set();
    
    if (container) {
        container.innerHTML = Object.values(faqs).map(faq => {
            // Add categories for filtering
            categories.add(faq.category);
            
            return `
                <div class="faq-item bg-white rounded-xl shadow-md overflow-hidden" data-category="${faq.category}">
                    <button class="faq-question w-full flex justify-between items-center p-6 text-left focus:outline-none">
                        <h3 class="text-lg font-medium text-gray-800">${faq.question}</h3>
                        <i class="fas fa-chevron-down text-indigo-600 transition-transform duration-300"></i>
                    </button>
                    <div class="faq-answer px-6 pb-6 hidden">
                        <div class="prose text-gray-600">${faq.answer}</div>
                    </div>
                </div>
            `;
        }).join('');
    }
    
    // Add category filters
    const categoriesContainer = document.getElementById('faq-categories');
    if (categoriesContainer) {
        categoriesContainer.innerHTML = `
            <button class="faq-category-btn active" data-category="all">All</button>
            ${Array.from(categories).map(cat => `
                <button class="faq-category-btn" data-category="${cat}">${cat}</button>
            `).join('')}
        `;
    }
}

// Load about page content
async function loadAboutContent() {
    const about = await fetchData('about');
    if (!about) return;
    
    // Our Story
    const storyContainer = document.getElementById('our-story');
    if (storyContainer) storyContainer.innerHTML = about.story;
    
    // Mission, Vision, Values
    if (about.mission) document.getElementById('mission-content').innerHTML = about.mission;
    if (about.vision) document.getElementById('vision-content').innerHTML = about.vision;
    if (about.values) document.getElementById('values-content').innerHTML = about.values;
    
    // Team
    const team = await fetchData('team');
    const teamContainer = document.getElementById('team-container');
    
    if (team && teamContainer) {
        teamContainer.innerHTML = Object.values(team).map(member => `
            <div class="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition duration-300">
                <img src="${member.photo}" alt="${member.name}" class="w-full h-48 object-cover">
                <div class="p-6">
                    <h3 class="text-xl font-bold text-gray-800 mb-1">${member.name}</h3>
                    <p class="text-indigo-600 font-medium mb-3">${member.position}</p>
                    <p class="text-gray-600 mb-4">${member.bio}</p>
                    <div class="flex space-x-3">
                        ${member.socials.twitter ? `<a href="${member.socials.twitter}" class="text-gray-500 hover:text-indigo-600"><i class="fab fa-twitter"></i></a>` : ''}
                        ${member.socials.linkedin ? `<a href="${member.socials.linkedin}" class="text-gray-500 hover:text-indigo-600"><i class="fab fa-linkedin-in"></i></a>` : ''}
                        ${member.socials.github ? `<a href="${member.socials.github}" class="text-gray-500 hover:text-indigo-600"><i class="fab fa-github"></i></a>` : ''}
                    </div>
                </div>
            </div>
        `).join('');
    }
}

// Load contact info
async function loadContactInfo() {
    const contact = await fetchData('contact');
    if (!contact) return;
    
    if (contact.address) document.getElementById('office-address').textContent = contact.address;
    if (contact.email) {
        document.getElementById('support-email').textContent = contact.email;
        document.getElementById('support-email').href = `mailto:${contact.email}`;
    }
    if (contact.phone) document.getElementById('phone-number').textContent = contact.phone;
    if (contact.hours) document.getElementById('working-hours').textContent = contact.hours;
    if (contact.mapEmbedUrl) document.getElementById('company-map').src = contact.mapEmbedUrl;
}

// Initialize page-specific content
function initPageContent() {
    const path = window.location.pathname.split('/').pop() || 'index.html';
    
    switch(path) {
        case 'index.html':
            loadFeaturedTools();
            loadTestimonials();
            // Load other homepage-specific content
            break;
        case 'tools.html':
            loadAllTools();
            break;
        case 'tool.html':
            loadToolDetails();
            break;
        case 'features.html':
            loadFeatures();
            break;
        case 'about.html':
            loadAboutContent();
            break;
        case 'contact.html':
            loadContactInfo();
            break;
        case 'faq.html':
            loadFAQs();
            break;
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initPageContent();
    
    // Initialize cookie consent
    if (!localStorage.getItem('cookieConsent')) {
        document.getElementById('cookie-consent').classList.remove('hidden');
    }
    
    document.getElementById('accept-cookies').addEventListener('click', () => {
        localStorage.setItem('cookieConsent', 'true');
        document.getElementById('cookie-consent').classList.add('hidden');
    });
});

// Handle contact form submission
if (document.getElementById('contact-form')) {
    document.getElementById('contact-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const form = e.target;
        const formData = {
            name: form.name.value,
            email: form.email.value,
            subject: form.subject.value,
            message: form.message.value,
            timestamp: new Date().toISOString()
        };
        
        try {
            // Save to Firebase
            await database.ref('contactSubmissions').push(formData);
            
            // Show success message
            document.getElementById('form-success').classList.remove('hidden');
            document.getElementById('form-error').classList.add('hidden');
            form.reset();
            
            // Hide success message after 5 seconds
            setTimeout(() => {
                document.getElementById('form-success').classList.add('hidden');
            }, 5000);
        } catch (error) {
            console.error("Error submitting form:", error);
            document.getElementById('form-error').classList.remove('hidden');
            document.getElementById('error-message').textContent = 'There was an error submitting your message. Please try again.';
        }
    });
}

// Handle newsletter subscription
if (document.getElementById('newsletter-form')) {
    document.getElementById('newsletter-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = e.target.querySelector('input[type="email"]').value;
        const messageEl = document.getElementById('newsletter-message');
        
        try {
            // Save to Firebase
            await database.ref('newsletterSubscribers').push({
                email,
                timestamp: new Date().toISOString()
            });
            
            // Show success message
            messageEl.textContent = 'Thank you for subscribing!';
            messageEl.classList.add('opacity-100', 'text-green-600');
            e.target.reset();
            
            // Hide message after 5 seconds
            setTimeout(() => {
                messageEl.classList.remove('opacity-100');
            }, 5000);
        } catch (error) {
            console.error("Error subscribing:", error);
            messageEl.textContent = 'Subscription failed. Please try again.';
            messageEl.classList.add('opacity-100', 'text-red-600');
        }
    });
  }

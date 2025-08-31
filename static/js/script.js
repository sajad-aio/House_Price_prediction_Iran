// Global variables
let isLoading = false;
let animationObserver;
let statsLoaded = false;
let availableAddresses = [];
let selectedAddress = null;
let addressSearchTimeout = null;

// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

// Initialize Application
function initializeApp() {
    setupLoadingScreen();
    setupNavigation();
    setupScrollAnimations();
    setupFormHandlers();
    setupHeroAnimations();
    loadStatistics();
    setupIntersectionObserver();
    setupParallaxEffects();
}

// Loading Screen
function setupLoadingScreen() {
    const loadingScreen = document.getElementById('loading-screen');
    
    // Simulate loading time
    setTimeout(() => {
        loadingScreen.classList.add('hidden');
        
        // Remove from DOM after transition
        setTimeout(() => {
            loadingScreen.style.display = 'none';
        }, 500);
    }, 3000);
}

// Navigation
function setupNavigation() {
    const navbar = document.querySelector('.navbar');
    const navLinks = document.querySelectorAll('.nav-link');
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');

    // Scroll effect
    window.addEventListener('scroll', () => {
        if (window.scrollY > 100) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Active link highlighting
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href').substring(1);
            scrollToSection(targetId);
            
            // Update active link
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
        });
    });

    // Mobile menu toggle
    navToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        navToggle.classList.toggle('active');
    });

    // Update active link on scroll
    window.addEventListener('scroll', updateActiveNavLink);
}

function updateActiveNavLink() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    
    let current = '';
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (window.scrollY >= sectionTop - 200) {
            current = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
}

// Smooth scrolling
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        const offsetTop = section.offsetTop - 80;
        window.scrollTo({
            top: offsetTop,
            behavior: 'smooth'
        });
    }
}

// Hero Animations
function setupHeroAnimations() {
    // Animated price counter
    const priceElement = document.getElementById('animated-price');
    if (priceElement) {
        animateCounter(priceElement, 0, 250000, 2000);
    }

    // Floating shapes animation
    const shapes = document.querySelectorAll('.shape');
    shapes.forEach((shape, index) => {
        shape.style.animationDelay = `${index * 2}s`;
    });
}

// Form Handlers
function setupFormHandlers() {
    const form = document.getElementById('prediction-form');
    const inputs = form.querySelectorAll('input, select');

    // Form submission
    form.addEventListener('submit', handlePredictionSubmit);

    // Input animations
    inputs.forEach(input => {
        input.addEventListener('focus', () => {
            input.parentElement.classList.add('focused');
        });

        input.addEventListener('blur', () => {
            if (!input.value) {
                input.parentElement.classList.remove('focused');
            }
        });

        input.addEventListener('input', () => {
            validateInput(input);
        });
    });

    // Setup address input functionality
    setupAddressInput();
    
    // Load available addresses
    loadAvailableAddresses();
}

// Setup Address Input
function setupAddressInput() {
    const addressInput = document.getElementById('address');
    const suggestionsContainer = document.getElementById('address-suggestions');
    
    if (!addressInput || !suggestionsContainer) return;

    // Input event handler with debouncing
    addressInput.addEventListener('input', debounce(handleAddressInput, 300));
    
    // Focus and blur handlers
    addressInput.addEventListener('focus', () => {
        if (addressInput.value.trim()) {
            handleAddressInput();
        }
    });
    
    addressInput.addEventListener('blur', () => {
        // Delay hiding suggestions to allow for clicks
        setTimeout(() => {
            hideSuggestions();
        }, 200);
    });
    
    // Keyboard navigation
    addressInput.addEventListener('keydown', handleAddressKeydown);
    
    // Click outside to hide suggestions
    document.addEventListener('click', (e) => {
        if (!addressInput.contains(e.target) && !suggestionsContainer.contains(e.target)) {
            hideSuggestions();
        }
    });
}

// Handle Address Input
async function handleAddressInput() {
    const addressInput = document.getElementById('address');
    const query = addressInput.value.trim();
    
    if (!query) {
        hideSuggestions();
        clearAddressValidation();
        return;
    }
    
    if (query.length < 2) {
        hideSuggestions();
        return;
    }
    
    try {
        const response = await fetch(`/api/search-address/${encodeURIComponent(query)}`);
        const result = await response.json();
        
        if (result.success && result.matches.length > 0) {
            showSuggestions(result.matches);
        } else {
            hideSuggestions();
        }
        
        // Validate address
        validateAddress(query);
        
    } catch (error) {
        console.error('Error searching addresses:', error);
        hideSuggestions();
    }
}

// Show Address Suggestions
function showSuggestions(matches) {
    const suggestionsContainer = document.getElementById('address-suggestions');
    
    suggestionsContainer.innerHTML = '';
    
    matches.forEach((match, index) => {
        const suggestionItem = document.createElement('div');
        suggestionItem.className = 'suggestion-item';
        suggestionItem.textContent = match.address;
        suggestionItem.setAttribute('data-address', match.address);
        suggestionItem.setAttribute('data-index', index);
        
        suggestionItem.addEventListener('click', () => {
            selectAddress(match.address);
        });
        
        suggestionsContainer.appendChild(suggestionItem);
    });
    
    suggestionsContainer.classList.add('show');
}

// Hide Address Suggestions
function hideSuggestions() {
    const suggestionsContainer = document.getElementById('address-suggestions');
    suggestionsContainer.classList.remove('show');
}

// Select Address
function selectAddress(address) {
    const addressInput = document.getElementById('address');
    addressInput.value = address;
    selectedAddress = address;
    hideSuggestions();
    
    // Mark as valid
    addressInput.classList.remove('invalid');
    addressInput.classList.add('valid');
    
    // Show address stats
    showAddressStatsForSelected(address);
    
    // Add visual indicator
    addAddressIndicator(true);
}

// Handle Address Keydown (for keyboard navigation)
function handleAddressKeydown(e) {
    const suggestionsContainer = document.getElementById('address-suggestions');
    const suggestions = suggestionsContainer.querySelectorAll('.suggestion-item');
    
    if (!suggestionsContainer.classList.contains('show') || suggestions.length === 0) {
        return;
    }
    
    const currentHighlighted = suggestionsContainer.querySelector('.suggestion-item.highlighted');
    let currentIndex = currentHighlighted ? parseInt(currentHighlighted.getAttribute('data-index')) : -1;
    
    switch (e.key) {
        case 'ArrowDown':
            e.preventDefault();
            currentIndex = Math.min(currentIndex + 1, suggestions.length - 1);
            highlightSuggestion(currentIndex);
            break;
            
        case 'ArrowUp':
            e.preventDefault();
            currentIndex = Math.max(currentIndex - 1, 0);
            highlightSuggestion(currentIndex);
            break;
            
        case 'Enter':
            e.preventDefault();
            if (currentHighlighted) {
                const address = currentHighlighted.getAttribute('data-address');
                selectAddress(address);
            }
            break;
            
        case 'Escape':
            hideSuggestions();
            break;
    }
}

// Highlight Suggestion
function highlightSuggestion(index) {
    const suggestionsContainer = document.getElementById('address-suggestions');
    const suggestions = suggestionsContainer.querySelectorAll('.suggestion-item');
    
    suggestions.forEach(suggestion => suggestion.classList.remove('highlighted'));
    
    if (index >= 0 && index < suggestions.length) {
        suggestions[index].classList.add('highlighted');
    }
}

// Validate Address
async function validateAddress(address) {
    if (!address.trim()) {
        clearAddressValidation();
        return;
    }
    
    try {
        const response = await fetch('/api/validate-address', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ address: address })
        });
        
        const result = await response.json();
        const addressInput = document.getElementById('address');
        
        if (result.success && result.valid) {
            addressInput.classList.remove('invalid');
            addressInput.classList.add('valid');
            selectedAddress = result.matched_address;
            addAddressIndicator(true);
            
            if (result.confidence < 100) {
                showNotification(`Address matched: "${result.matched_address}" (${result.confidence}% confidence)`, 'info', 3000);
            }
        } else {
            addressInput.classList.remove('valid');
            addressInput.classList.add('invalid');
            selectedAddress = null;
            addAddressIndicator(false);
            
            if (result.message) {
                showNotification(result.message, 'warning', 4000);
            }
        }
        
    } catch (error) {
        console.error('Error validating address:', error);
        clearAddressValidation();
    }
}

// Clear Address Validation
function clearAddressValidation() {
    const addressInput = document.getElementById('address');
    addressInput.classList.remove('valid', 'invalid');
    selectedAddress = null;
    removeAddressIndicator();
}

// Add Address Indicator
function addAddressIndicator(isValid) {
    removeAddressIndicator();
    
    const addressInput = document.getElementById('address');
    const indicator = document.createElement('div');
    indicator.className = `address-match-indicator ${isValid ? 'valid' : 'invalid'}`;
    indicator.innerHTML = `<i class="fas fa-${isValid ? 'check' : 'times'}"></i>`;
    
    addressInput.parentElement.appendChild(indicator);
}

// Remove Address Indicator
function removeAddressIndicator() {
    const existingIndicator = document.querySelector('.address-match-indicator');
    if (existingIndicator) {
        existingIndicator.remove();
    }
}

// Load Available Addresses
async function loadAvailableAddresses() {
    try {
        const response = await fetch('/api/addresses');
        const result = await response.json();
        
        if (result.success) {
            availableAddresses = result.addresses;
        }
    } catch (error) {
        console.error('Error loading addresses:', error);
    }
}

// Show Address Statistics for Selected Address
async function showAddressStatsForSelected(address) {
    try {
        const response = await fetch(`/api/address-stats/${encodeURIComponent(address)}`);
        const stats = await response.json();

        if (!stats.error) {
            const notification = `
                <strong>${address}</strong><br>
                ${stats.count} properties • Avg: ${stats.avg_price} Toman<br>
                Area: ${stats.avg_area} sq m • Rooms: ${stats.avg_rooms}
            `;
            showNotification(notification, 'info', 5000);
        }
    } catch (error) {
        console.error('Error fetching address stats:', error);
    }
}

// Form Validation
function validateInput(input) {
    const value = input.value;
    const type = input.type;
    let isValid = true;

    // Remove previous error styling
    input.classList.remove('error');

    switch (input.name) {
        case 'area':
            isValid = value > 0 && value <= 10000;
            break;
        case 'rooms':
            isValid = value > 0 && value <= 20;
            break;
        case 'parking':
            isValid = value >= 0 && value <= 10;
            break;
        case 'warehouse':
        case 'elevator':
            isValid = value !== '';
            break;
        case 'address':
            isValid = value !== '';
            break;
    }

    if (!isValid) {
        input.classList.add('error');
        showNotification('Please enter valid values', 'error');
    }

    return isValid;
}

// Handle Prediction Form Submit
async function handlePredictionSubmit(e) {
    e.preventDefault();
    
    if (isLoading) return;

    const form = e.target;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);

    // Use the selected address if available
    if (selectedAddress) {
        data.address = selectedAddress;
    }

    // Validate all inputs
    const inputs = form.querySelectorAll('input, select');
    let isValid = true;
    
    inputs.forEach(input => {
        if (!validateInput(input)) {
            isValid = false;
        }
    });

    // Special validation for address
    if (!selectedAddress && data.address) {
        // Try to validate the address one more time
        try {
            const response = await fetch('/api/validate-address', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ address: data.address })
            });
            
            const result = await response.json();
            if (result.success && result.valid) {
                selectedAddress = result.matched_address;
                data.address = selectedAddress;
            } else {
                showNotification('Please enter a valid address from the suggestions', 'error');
                return;
            }
        } catch (error) {
            showNotification('Please enter a valid address', 'error');
            return;
        }
    }

    if (!selectedAddress) {
        showNotification('Please select a valid address from the suggestions', 'error');
        return;
    }

    if (!isValid) {
        showNotification('Please fill all fields correctly', 'error');
        return;
    }

    // Show loading state
    setLoadingState(true);

    try {
        const response = await fetch('/predict', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (result.success) {
            displayPredictionResult(result);
            showNotification('Prediction completed successfully!', 'success');
        } else {
            throw new Error(result.error || 'Prediction failed');
        }
    } catch (error) {
        console.error('Prediction error:', error);
        showNotification('Failed to get prediction. Please try again.', 'error');
    } finally {
        setLoadingState(false);
    }
}

// Set Loading State
function setLoadingState(loading) {
    isLoading = loading;
    const button = document.querySelector('.btn-predict');
    
    if (loading) {
        button.classList.add('loading');
        button.disabled = true;
    } else {
        button.classList.remove('loading');
        button.disabled = false;
    }
}

// Display Prediction Result
function displayPredictionResult(result) {
    const resultContainer = document.getElementById('prediction-result');
    const priceToomanElement = document.getElementById('price-toman');
    const priceUsdElement = document.getElementById('price-usd');

    // Animate result container
    resultContainer.classList.add('show');

    // Animate price counters
    setTimeout(() => {
        animateCounter(priceToomanElement, 0, parseInt(result.price_toman.replace(/,/g, '')), 1500);
        animateCounter(priceUsdElement, 0, parseInt(result.price_usd.replace(/,/g, '')), 1500);
    }, 300);

    // Animate confidence bar
    setTimeout(() => {
        const confidenceFill = document.querySelector('.confidence-fill');
        confidenceFill.style.width = '92%';
    }, 800);
}

// Handle Address Change
async function handleAddressChange(e) {
    const address = e.target.value;
    if (!address) return;

    try {
        const response = await fetch(`/api/address-stats/${encodeURIComponent(address)}`);
        const stats = await response.json();

        if (!stats.error) {
            showAddressStats(stats);
        }
    } catch (error) {
        console.error('Error fetching address stats:', error);
    }
}

// Show Address Statistics
function showAddressStats(stats) {
    const notification = `
        <strong>${stats.count}</strong> properties found<br>
        Average price: <strong>${stats.avg_price}</strong> Toman<br>
        Average area: <strong>${stats.avg_area}</strong> sq m
    `;
    showNotification(notification, 'info', 5000);
}

// Load Statistics
async function loadStatistics() {
    if (statsLoaded) return;

    try {
        const response = await fetch('/api/stats');
        const stats = await response.json();

        if (!stats.error) {
            updateStatistics(stats);
            statsLoaded = true;
        }
    } catch (error) {
        console.error('Error loading statistics:', error);
    }
}

// Update Statistics Display
function updateStatistics(stats) {
    // Update stat cards
    const statCards = document.querySelectorAll('.stat-card');
    const statNumbers = document.querySelectorAll('.stat-number');

    if (statNumbers.length >= 4) {
        statNumbers[0].setAttribute('data-target', stats.total_properties);
        statNumbers[1].setAttribute('data-target', parseInt(stats.avg_price.replace(/,/g, '')));
        statNumbers[2].setAttribute('data-target', stats.total_addresses);
        statNumbers[3].setAttribute('data-target', parseInt(stats.avg_area));
    }

    // Update price distribution
    updatePriceDistribution(stats.price_ranges);
}

// Update Price Distribution Chart
function updatePriceDistribution(priceRanges) {
    const total = Object.values(priceRanges).reduce((sum, val) => sum + val, 0);
    const chartBars = document.querySelectorAll('.chart-bar');

    const ranges = ['under_1b', '1b_to_5b', '5b_to_10b', 'over_10b'];
    
    chartBars.forEach((bar, index) => {
        const count = priceRanges[ranges[index]] || 0;
        const percentage = total > 0 ? (count / total) * 100 : 0;
        
        bar.setAttribute('data-percentage', percentage);
        bar.querySelector('.bar-value').textContent = count;
        
        // Animate bar fill
        setTimeout(() => {
            bar.querySelector('.bar-fill').style.width = `${percentage}%`;
        }, index * 200);
    });
}

// Intersection Observer for Animations
function setupIntersectionObserver() {
    animationObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const element = entry.target;
                
                if (element.classList.contains('feature-card')) {
                    element.classList.add('animate');
                } else if (element.classList.contains('stat-card')) {
                    element.classList.add('animate');
                    animateStatNumber(element.querySelector('.stat-number'));
                } else if (element.classList.contains('chart-bar')) {
                    animateChartBar(element);
                }
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    // Observe elements
    const elementsToObserve = document.querySelectorAll('.feature-card, .stat-card, .chart-bar');
    elementsToObserve.forEach(el => animationObserver.observe(el));
}

// Animate Stat Numbers
function animateStatNumber(element) {
    const target = parseInt(element.getAttribute('data-target'));
    if (target > 0) {
        animateCounter(element, 0, target, 2000);
    }
}

// Animate Chart Bars
function animateChartBar(element) {
    const percentage = parseFloat(element.getAttribute('data-percentage'));
    const barFill = element.querySelector('.bar-fill');
    
    setTimeout(() => {
        barFill.style.width = `${percentage}%`;
    }, 100);
}

// Counter Animation
function animateCounter(element, start, end, duration) {
    const startTime = performance.now();
    const range = end - start;

    function updateCounter(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        const current = Math.floor(start + (range * easeOutQuart));
        
        element.textContent = formatNumber(current);
        
        if (progress < 1) {
            requestAnimationFrame(updateCounter);
        } else {
            element.textContent = formatNumber(end);
        }
    }
    
    requestAnimationFrame(updateCounter);
}

// Format Number with Commas
function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

// Parallax Effects
function setupParallaxEffects() {
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const parallaxElements = document.querySelectorAll('.hero-shapes .shape');
        
        parallaxElements.forEach((element, index) => {
            const speed = 0.5 + (index * 0.1);
            const yPos = -(scrolled * speed);
            element.style.transform = `translateY(${yPos}px)`;
        });
    });
}

// Scroll Animations
function setupScrollAnimations() {
    const scrollElements = document.querySelectorAll('[data-aos]');
    
    const scrollObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const element = entry.target;
                const animation = element.getAttribute('data-aos');
                const delay = element.getAttribute('data-delay') || 0;
                
                setTimeout(() => {
                    element.classList.add('aos-animate');
                }, delay);
            }
        });
    });
    
    scrollElements.forEach(el => scrollObserver.observe(el));
}

// Notification System
function showNotification(message, type = 'success', duration = 3000) {
    const container = document.getElementById('notification-container');
    const notification = document.createElement('div');
    
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${getNotificationIcon(type)}"></i>
            <span>${message}</span>
        </div>
    `;
    
    container.appendChild(notification);
    
    // Show notification
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    // Hide notification
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            container.removeChild(notification);
        }, 300);
    }, duration);
}

function getNotificationIcon(type) {
    switch (type) {
        case 'success': return 'check-circle';
        case 'error': return 'exclamation-circle';
        case 'warning': return 'exclamation-triangle';
        case 'info': return 'info-circle';
        default: return 'check-circle';
    }
}

// Utility Functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    }
}

// Enhanced Form Interactions
function setupEnhancedFormInteractions() {
    const inputs = document.querySelectorAll('input, select');
    
    inputs.forEach(input => {
        // Add floating label effect
        input.addEventListener('focus', () => {
            input.parentElement.classList.add('focused');
        });
        
        input.addEventListener('blur', () => {
            if (!input.value) {
                input.parentElement.classList.remove('focused');
            }
        });
        
        // Add ripple effect on click
        input.addEventListener('click', createRipple);
    });
}

function createRipple(e) {
    const button = e.currentTarget;
    const ripple = document.createElement('span');
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;
    
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    ripple.classList.add('ripple');
    
    button.appendChild(ripple);
    
    setTimeout(() => {
        ripple.remove();
    }, 600);
}

// Advanced Animations
function setupAdvancedAnimations() {
    // Stagger animations for feature cards
    const featureCards = document.querySelectorAll('.feature-card');
    featureCards.forEach((card, index) => {
        card.style.animationDelay = `${index * 0.1}s`;
    });
    
    // Morphing shapes in hero
    const shapes = document.querySelectorAll('.shape');
    shapes.forEach(shape => {
        shape.addEventListener('mouseenter', () => {
            shape.style.transform += ' scale(1.1)';
        });
        
        shape.addEventListener('mouseleave', () => {
            shape.style.transform = shape.style.transform.replace(' scale(1.1)', '');
        });
    });
}

// Performance Optimizations
function optimizePerformance() {
    // Lazy load images
    const images = document.querySelectorAll('img[data-src]');
    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                imageObserver.unobserve(img);
            }
        });
    });
    
    images.forEach(img => imageObserver.observe(img));
    
    // Throttle scroll events
    window.addEventListener('scroll', throttle(() => {
        updateActiveNavLink();
    }, 100));
}

// Initialize enhanced features
document.addEventListener('DOMContentLoaded', () => {
    setupEnhancedFormInteractions();
    setupAdvancedAnimations();
    optimizePerformance();
});

// Export functions for global access
window.scrollToSection = scrollToSection;
window.showNotification = showNotification;
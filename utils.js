// Utility functions

// Email validation
window.validateEmail = function(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

// Mobile E.164 format validation (+91xxxxxxxxxx)
window.validateMobileE164 = function(mobile) {
    const mobileRegex = /^\+91[0-9]{10}$/;
    return mobileRegex.test(mobile);
};

// URL validation
window.validateUrl = function(url) {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
};

// Escape HTML to prevent XSS
window.escapeHtml = function(text) {
    if (typeof text !== 'string') return text;
    
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    
    return text.replace(/[&<>"']/g, function(m) { return map[m]; });
};

// Show loading spinner
window.showLoading = function() {
    const loading = document.getElementById('loading');
    if (loading) {
        loading.classList.add('show');
    }
};

// Hide loading spinner
window.hideLoading = function() {
    const loading = document.getElementById('loading');
    if (loading) {
        loading.classList.remove('show');
    }
};

// Screen management
window.showScreen = function(screenId) {
    // Hide all screens
    const screens = document.querySelectorAll('.screen');
    screens.forEach(screen => screen.classList.remove('active'));
    
    // Show selected screen
    const targetScreen = document.getElementById(screenId + '-screen');
    if (targetScreen) {
        targetScreen.classList.add('active');
        
        // Load data for specific screens
        if (screenId === 'dashboard') {
            window.loadDashboardData();
        } else if (screenId === 'clients-list') {
            window.loadClientsList();
        }
    }
};

// Show error message
window.showError = function(elementId, message) {
    const errorElement = document.getElementById(elementId);
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
    }
};

// Clear errors
window.clearErrors = function(errorIds) {
    errorIds.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = '';
            element.style.display = 'none';
        }
    });
};

// Show success message
window.showSuccess = function(elementId, message) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = message;
        element.className = 'success-message';
        element.style.display = 'block';
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            element.style.display = 'none';
        }, 5000);
    }
};

// Format date for display
window.formatDate = function(date) {
    if (!date) return '-';
    
    try {
        const dateObj = date instanceof Date ? date : new Date(date);
        return dateObj.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch (error) {
        console.error('Error formatting date:', error);
        return '-';
    }
};

// Debounce function for search
window.debounce = function(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

// Copy text to clipboard
window.copyToClipboard = function(text) {
    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(() => {
            console.log('Text copied to clipboard');
        }).catch(err => {
            console.error('Failed to copy text: ', err);
        });
    } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
            document.execCommand('copy');
            console.log('Text copied to clipboard (fallback)');
        } catch (err) {
            console.error('Failed to copy text (fallback): ', err);
        }
        document.body.removeChild(textArea);
    }
};

// Local storage helpers
window.setLocalStorage = function(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
    } catch (error) {
        console.error('Error setting localStorage:', error);
        return false;
    }
};

window.getLocalStorage = function(key, defaultValue = null) {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
        console.error('Error getting localStorage:', error);
        return defaultValue;
    }
};

window.removeLocalStorage = function(key) {
    try {
        localStorage.removeItem(key);
        return true;
    } catch (error) {
        console.error('Error removing localStorage:', error);
        return false;
    }
};

// Session storage helpers
window.setSessionStorage = function(key, value) {
    try {
        sessionStorage.setItem(key, JSON.stringify(value));
        return true;
    } catch (error) {
        console.error('Error setting sessionStorage:', error);
        return false;
    }
};

window.getSessionStorage = function(key, defaultValue = null) {
    try {
        const item = sessionStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
        console.error('Error getting sessionStorage:', error);
        return defaultValue;
    }
};

// Handle network errors
window.handleNetworkError = function(error) {
    console.error('Network error:', error);
    
    if (!navigator.onLine) {
        alert('No internet connection. Please check your network and try again.');
        return;
    }
    
    if (error.code === 'permission-denied') {
        alert('Permission denied. Please check your access rights.');
        return;
    }
    
    if (error.code === 'unavailable') {
        alert('Service temporarily unavailable. Please try again later.');
        return;
    }
    
    alert('Network error occurred. Please try again.');
};

// Simple logger
window.logger = {
    info: (message, data = null) => {
        console.log(`[INFO] ${message}`, data || '');
    },
    warn: (message, data = null) => {
        console.warn(`[WARN] ${message}`, data || '');
    },
    error: (message, error = null) => {
        console.error(`[ERROR] ${message}`, error || '');
    }
};

// Mobile Navigation Functions
window.toggleMobileNav = function() {
    const navMenu = document.getElementById('nav-menu');
    const navToggle = document.querySelector('.nav-toggle i');
    
    if (navMenu) {
        navMenu.classList.toggle('active');
        
        // Change hamburger to X and vice versa
        if (navMenu.classList.contains('active')) {
            navToggle.className = 'fas fa-times';
        } else {
            navToggle.className = 'fas fa-bars';
        }
    }
};

window.closeMobileNav = function() {
    const navMenu = document.getElementById('nav-menu');
    const navToggle = document.querySelector('.nav-toggle i');
    
    if (navMenu) {
        navMenu.classList.remove('active');
        navToggle.className = 'fas fa-bars';
    }
};

// Initialize utility functions
document.addEventListener('DOMContentLoaded', function() {
    // Close mobile menu when clicking outside
    document.addEventListener('click', function(event) {
        const navMenu = document.getElementById('nav-menu');
        const navToggle = document.querySelector('.nav-toggle');
        
        if (navMenu && navToggle && 
            !navMenu.contains(event.target) && 
            !navToggle.contains(event.target) &&
            navMenu.classList.contains('active')) {
            closeMobileNav();
        }
    });
    
    // Add escape key handler
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            // Close mobile menu
            const navMenu = document.getElementById('nav-menu');
            if (navMenu && navMenu.classList.contains('active')) {
                closeMobileNav();
            }
            
            // Close any open modals or dropdowns
            const activeElements = document.querySelectorAll('.active');
            activeElements.forEach(element => {
                if (element.classList.contains('modal') || 
                    element.classList.contains('dropdown')) {
                    element.classList.remove('active');
                }
            });
        }
    });
    
    // Handle orientation change
    window.addEventListener('orientationchange', function() {
        // Close mobile menu on orientation change
        setTimeout(() => {
            closeMobileNav();
        }, 100);
    });
    
    // Handle resize
    window.addEventListener('resize', function() {
        // Close mobile menu on resize to desktop
        if (window.innerWidth > 768) {
            closeMobileNav();
        }
    });
});

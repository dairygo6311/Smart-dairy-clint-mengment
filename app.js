import { initAuth } from './auth.js';

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    console.log('Smart Dairy Client Management System initializing...');
    
    // Initialize Firebase Authentication
    initAuth();
    
    // Add keyboard shortcuts
    addKeyboardShortcuts();
    
    // Add form validation helpers
    addFormValidationHelpers();
    
    // Initialize theme toggle in header
    initializeThemeToggle();
    
    // Make functions globally available
    window.showThemeDemo = showThemeDemo;
    window.closeThemeDemo = closeThemeDemo;
    
    console.log('Smart Dairy Application initialized successfully');
});

// Add keyboard shortcuts
function addKeyboardShortcuts() {
    document.addEventListener('keydown', function(event) {
        // Ctrl/Cmd + K for search
        if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
            event.preventDefault();
            focusSearchInput();
        }
        
        // Ctrl/Cmd + N for new client
        if ((event.ctrlKey || event.metaKey) && event.key === 'n') {
            event.preventDefault();
            if (window.isAuthenticated && window.isAuthenticated()) {
                showScreen('add-client');
            }
        }
        
        // Ctrl/Cmd + D for dashboard
        if ((event.ctrlKey || event.metaKey) && event.key === 'd') {
            event.preventDefault();
            if (window.isAuthenticated && window.isAuthenticated()) {
                showScreen('dashboard');
            }
        }
        
        // Ctrl/Cmd + L for clients list
        if ((event.ctrlKey || event.metaKey) && event.key === 'l') {
            event.preventDefault();
            if (window.isAuthenticated && window.isAuthenticated()) {
                showScreen('clients-list');
            }
        }
        
        // ESC to go back or cancel
        if (event.key === 'Escape') {
            const activeScreen = document.querySelector('.screen.active');
            if (activeScreen) {
                const screenId = activeScreen.id.replace('-screen', '');
                handleEscapeKey(screenId);
            }
        }
    });
}

// Focus search input
function focusSearchInput() {
    const searchInputs = [
        document.getElementById('dashboard-search'),
        document.getElementById('clients-search')
    ];
    
    for (const input of searchInputs) {
        if (input && input.offsetParent !== null) { // Check if visible
            input.focus();
            input.select();
            break;
        }
    }
}

// Handle escape key based on current screen
function handleEscapeKey(screenId) {
    switch (screenId) {
        case 'add-client':
            if (confirm('Are you sure you want to cancel? Any unsaved changes will be lost.')) {
                showScreen('dashboard');
            }
            break;
        case 'edit-client':
            if (confirm('Are you sure you want to cancel? Any unsaved changes will be lost.')) {
                showScreen('client-details');
            }
            break;
        case 'client-details':
            showScreen('clients-list');
            break;
        case 'clients-list':
            showScreen('dashboard');
            break;
    }
}

// Add form validation helpers
function addFormValidationHelpers() {
    // Clear existing validation listeners to prevent memory leaks
    clearValidationListeners();
    
    // Real-time validation for mobile numbers
    const mobileInputs = document.querySelectorAll('input[type="tel"]');
    mobileInputs.forEach(input => {
        // Remove existing listener if any
        if (input.validationHandler) {
            input.removeEventListener('input', input.validationHandler);
        }
        
        input.validationHandler = function() {
            const value = this.value;
            if (value && !window.validateMobileE164(value)) {
                this.style.borderColor = '#dc3545';
            } else {
                this.style.borderColor = '#e1e5e9';
            }
        };
        input.addEventListener('input', input.validationHandler);
    });
    
    // Real-time validation for email addresses
    const emailInputs = document.querySelectorAll('input[type="email"]');
    emailInputs.forEach(input => {
        // Remove existing listener if any
        if (input.emailValidationHandler) {
            input.removeEventListener('blur', input.emailValidationHandler);
        }
        
        input.emailValidationHandler = function() {
            const value = this.value;
            if (value && !window.validateEmail(value)) {
                this.style.borderColor = '#dc3545';
            } else {
                this.style.borderColor = '#e1e5e9';
            }
        };
        input.addEventListener('blur', input.emailValidationHandler);
    });
    
    // Real-time validation for URL fields
    const urlInputs = document.querySelectorAll('input[type="url"]');
    urlInputs.forEach(input => {
        // Remove existing listener if any
        if (input.urlValidationHandler) {
            input.removeEventListener('blur', input.urlValidationHandler);
        }
        
        input.urlValidationHandler = function() {
            const value = this.value;
            if (value && !window.validateUrl(value)) {
                this.style.borderColor = '#dc3545';
            } else {
                this.style.borderColor = '#e1e5e9';
            }
        };
        input.addEventListener('blur', input.urlValidationHandler);
    });
}

// Clear validation listeners to prevent memory leaks
function clearValidationListeners() {
    const allInputs = document.querySelectorAll('input[type="tel"], input[type="email"], input[type="url"]');
    allInputs.forEach(input => {
        if (input.validationHandler) {
            input.removeEventListener('input', input.validationHandler);
            input.validationHandler = null;
        }
        if (input.emailValidationHandler) {
            input.removeEventListener('blur', input.emailValidationHandler);
            input.emailValidationHandler = null;
        }
        if (input.urlValidationHandler) {
            input.removeEventListener('blur', input.urlValidationHandler);
            input.urlValidationHandler = null;
        }
    });
}

// Add auto-save functionality for forms
function addAutoSave() {
    const forms = ['add-client-form', 'edit-client-form'];
    
    forms.forEach(formId => {
        const form = document.getElementById(formId);
        if (form) {
            const inputs = form.querySelectorAll('input');
            inputs.forEach(input => {
                input.addEventListener('input', window.debounce(() => {
                    saveFormData(formId);
                }, 1000));
            });
        }
    });
}

// Save form data to session storage
function saveFormData(formId) {
    const form = document.getElementById(formId);
    if (!form) return;
    
    const formData = {};
    const inputs = form.querySelectorAll('input');
    
    inputs.forEach(input => {
        formData[input.id] = input.value;
    });
    
    window.setSessionStorage(`${formId}-draft`, formData);
    console.log(`Form data saved for ${formId}`);
}

// Restore form data from session storage
function restoreFormData(formId) {
    const formData = window.getSessionStorage(`${formId}-draft`);
    if (!formData) return;
    
    Object.keys(formData).forEach(inputId => {
        const input = document.getElementById(inputId);
        if (input && formData[inputId]) {
            input.value = formData[inputId];
        }
    });
    
    console.log(`Form data restored for ${formId}`);
}

// Clear saved form data
window.clearSavedFormData = function(formId) {
    window.removeSessionStorage(`${formId}-draft`);
    console.log(`Saved form data cleared for ${formId}`);
};

// Add notification system
window.showNotification = function(message, type = 'info', duration = 5000) {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${getNotificationIcon(type)}"></i>
            <span>${message}</span>
            <button class="notification-close" onclick="this.parentElement.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    
    // Add styles if not already present
    if (!document.querySelector('#notification-styles')) {
        const styles = document.createElement('style');
        styles.id = 'notification-styles';
        styles.textContent = `
            .notification {
                position: fixed;
                top: 80px;
                right: 20px;
                max-width: 400px;
                z-index: 10000;
                border-radius: 6px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                animation: slideInRight 0.3s ease-out;
            }
            
            .notification-content {
                padding: 15px;
                display: flex;
                align-items: center;
                gap: 10px;
            }
            
            .notification-info { background: #d1ecf1; color: #0c5460; border-left: 4px solid #17a2b8; }
            .notification-success { background: #d4edda; color: #155724; border-left: 4px solid #28a745; }
            .notification-warning { background: #fff3cd; color: #856404; border-left: 4px solid #ffc107; }
            .notification-error { background: #f8d7da; color: #721c24; border-left: 4px solid #dc3545; }
            
            .notification-close {
                background: none;
                border: none;
                color: inherit;
                cursor: pointer;
                margin-left: auto;
                opacity: 0.7;
            }
            
            .notification-close:hover {
                opacity: 1;
            }
            
            @keyframes slideInRight {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(styles);
    }
    
    // Add to document
    document.body.appendChild(notification);
    
    // Auto-remove after duration
    if (duration > 0) {
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, duration);
    }
};

// Get notification icon based on type
function getNotificationIcon(type) {
    const icons = {
        'info': 'info-circle',
        'success': 'check-circle',
        'warning': 'exclamation-triangle',
        'error': 'exclamation-circle'
    };
    return icons[type] || 'info-circle';
}

// Add confirmation dialogs
window.confirmAction = function(message, callback) {
    if (confirm(message)) {
        callback();
    }
};

// Add data export functionality
window.exportClientData = async function(format = 'csv') {
    try {
        showLoading();
        
        // Get all clients data (assuming this function exists)
        const clients = window.allClients || [];
        
        if (clients.length === 0) {
            showNotification('No client data to export', 'warning');
            return;
        }
        
        let content = '';
        let filename = '';
        let mimeType = '';
        
        switch (format) {
            case 'csv':
                content = convertToCSV(clients);
                filename = `clients_${getCurrentDateString()}.csv`;
                mimeType = 'text/csv';
                break;
            case 'json':
                content = JSON.stringify(clients, null, 2);
                filename = `clients_${getCurrentDateString()}.json`;
                mimeType = 'application/json';
                break;
            default:
                throw new Error('Unsupported export format');
        }
        
        // Download file
        downloadFile(content, filename, mimeType);
        showNotification(`Client data exported successfully as ${format.toUpperCase()}`, 'success');
        
    } catch (error) {
        console.error('Export error:', error);
        showNotification('Failed to export client data', 'error');
    } finally {
        hideLoading();
    }
};

// Convert array to CSV
function convertToCSV(data) {
    if (!data.length) return '';
    
    const headers = ['Name', 'Mobile', 'Email', 'Admin Link', 'Firebase Email/ID', 'Status', 'Created At', 'Updated At'];
    const csvContent = [headers.join(',')];
    
    data.forEach(client => {
        const row = [
            escapeCSV(client.name),
            escapeCSV(client.mobile),
            escapeCSV(client.email),
            escapeCSV(client.adminLink || ''),
            escapeCSV(client.firebaseEmail || ''),
            escapeCSV(client.status),
            escapeCSV(formatTimestamp(client.createdAt)),
            escapeCSV(formatTimestamp(client.updatedAt))
        ];
        csvContent.push(row.join(','));
    });
    
    return csvContent.join('\n');
}

// Escape CSV values
function escapeCSV(value) {
    if (typeof value !== 'string') value = String(value);
    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
        return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
}

// Download file
function downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
}

// Get current date string
function getCurrentDateString() {
    const now = new Date();
    return now.toISOString().split('T')[0]; // YYYY-MM-DD format
}

// Format timestamp for export
function formatTimestamp(timestamp) {
    if (!timestamp) return '';
    
    try {
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return date.toISOString();
    } catch (error) {
        return '';
    }
}

// Error boundary for the application
window.addEventListener('error', function(event) {
    console.error('Global error:', event.error);
    window.logger.error('Unhandled error occurred', event.error);
    
    // Show user-friendly error message
    showNotification('An unexpected error occurred. Please refresh the page and try again.', 'error');
});

// Unhandled promise rejection handler
window.addEventListener('unhandledrejection', function(event) {
    console.error('Unhandled promise rejection:', event.reason);
    window.logger.error('Unhandled promise rejection', event.reason);
    
    // Show user-friendly error message
    showNotification('An unexpected error occurred. Please try again.', 'error');
});

// Performance monitoring
window.addEventListener('load', function() {
    // Log performance metrics
    if (window.performance && window.performance.timing) {
        const timing = window.performance.timing;
        const loadTime = timing.loadEventEnd - timing.navigationStart;
        console.log(`Page load time: ${loadTime}ms`);
    }
});

// Initialize theme toggle
function initializeThemeToggle() {
    // Create main theme toggle for header
    createThemeToggle({
        showLabel: false,
        variant: 'circle',
        start: 'center',
        container: '#header-theme-toggle'
    });
}

// Add demo page functionality
function showThemeDemo() {
    // Create a demo container
    const demoContainer = document.createElement('div');
    demoContainer.innerHTML = `
        <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: var(--bg-primary); z-index: 10000; overflow-y: auto;">
            <div style="max-width: 1200px; margin: 0 auto; padding: 20px;">
                <div style="display: flex; justify-content: between; align-items: center; margin-bottom: 30px;">
                    <h1 style="color: var(--text-primary); font-size: 2rem; font-weight: bold;">Animated Theme Toggles Demo</h1>
                    <button onclick="closeThemeDemo()" style="background: var(--bg-secondary); border: 2px solid var(--border-color); color: var(--text-primary); padding: 10px 20px; border-radius: 25px; cursor: pointer; margin-left: auto;">
                        <i class="fas fa-times"></i> Close Demo
                    </button>
                </div>
                <p style="color: var(--text-secondary); margin-bottom: 30px; font-size: 1.1rem;">
                    Click any toggle to switch between light and dark themes with beautiful animations
                </p>
                <div id="theme-demo-container">
                    <!-- Demo toggles will be inserted here -->
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(demoContainer);
    
    // Create all demo toggles
    createThemeTogglesDemo('#theme-demo-container');
};

function closeThemeDemo() {
    const demoContainer = document.querySelector('div[style*="z-index: 10000"]');
    if (demoContainer) {
        demoContainer.remove();
    }
};

console.log('App.js loaded successfully');

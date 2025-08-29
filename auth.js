import { 
    signInWithEmailAndPassword, 
    signOut, 
    sendPasswordResetEmail,
    onAuthStateChanged 
} from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js';

// Get auth instance from global
const auth = window.firebaseAuth;

// Authentication state management
let currentUser = null;

// Initialize auth state listener
export function initAuth() {
    showLoading();
    
    onAuthStateChanged(auth, (user) => {
        hideLoading();
        currentUser = user;
        
        if (user) {
            // User is signed in
            console.log('User signed in:', user.email);
            showAuthenticatedApp();
        } else {
            // User is signed out
            console.log('User signed out');
            showLoginScreen();
        }
    });
}

// Show authenticated app (dashboard by default)
function showAuthenticatedApp() {
    document.getElementById('nav-header').style.display = 'block';
    showScreen('dashboard');
    loadDashboardData();
}

// Show login screen
function showLoginScreen() {
    document.getElementById('nav-header').style.display = 'none';
    showScreen('login');
}

// Handle login form submission
window.handleLogin = async function(event) {
    event.preventDefault();
    
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const loginBtn = document.getElementById('login-btn');
    const errorDiv = document.getElementById('login-error');
    
    // Clear previous errors
    clearErrors(['email-error', 'password-error']);
    errorDiv.textContent = '';
    
    // Validate inputs
    if (!validateEmail(email)) {
        showError('email-error', 'Please enter a valid email address');
        return;
    }
    
    if (password.length < 8) {
        showError('password-error', 'Password must be at least 8 characters');
        return;
    }
    
    // Show loading state
    loginBtn.disabled = true;
    loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Signing In...';
    
    try {
        await signInWithEmailAndPassword(auth, email, password);
        // Success - onAuthStateChanged will handle navigation
    } catch (error) {
        console.error('Login error:', error);
        
        let errorMessage = 'Login failed. Please try again.';
        
        switch (error.code) {
            case 'auth/user-not-found':
                errorMessage = 'No account found with this email address.';
                break;
            case 'auth/wrong-password':
                errorMessage = 'Incorrect password. Please try again.';
                break;
            case 'auth/invalid-email':
                errorMessage = 'Invalid email address format.';
                break;
            case 'auth/user-disabled':
                errorMessage = 'This account has been disabled.';
                break;
            case 'auth/too-many-requests':
                errorMessage = 'Too many failed attempts. Please try again later.';
                break;
            case 'auth/network-request-failed':
                errorMessage = 'Network error. Please check your connection.';
                break;
            default:
                errorMessage = error.message || 'Login failed. Please try again.';
        }
        
        errorDiv.textContent = errorMessage;
    } finally {
        // Reset button state
        loginBtn.disabled = false;
        loginBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Sign In';
    }
};

// Handle forgot password
window.handleForgotPassword = async function() {
    const email = document.getElementById('email').value.trim();
    
    if (!email) {
        showError('email-error', 'Please enter your email address first');
        return;
    }
    
    if (!validateEmail(email)) {
        showError('email-error', 'Please enter a valid email address');
        return;
    }
    
    try {
        await sendPasswordResetEmail(auth, email);
        showNotification('Password reset email sent! Check your inbox.', 'success');
    } catch (error) {
        console.error('Password reset error:', error);
        
        let errorMessage = 'Failed to send reset email. Please try again.';
        
        switch (error.code) {
            case 'auth/user-not-found':
                errorMessage = 'No account found with this email address.';
                break;
            case 'auth/invalid-email':
                errorMessage = 'Invalid email address format.';
                break;
            default:
                errorMessage = error.message || 'Failed to send reset email.';
        }
        
        document.getElementById('login-error').textContent = errorMessage;
    }
};

// Logout function
window.logout = async function() {
    try {
        await signOut(auth);
        // onAuthStateChanged will handle navigation
    } catch (error) {
        console.error('Logout error:', error);
        showNotification('Failed to logout. Please try again.', 'error');
    }
};

// Get current user
export function getCurrentUser() {
    return currentUser;
}

// Check if user is authenticated
export function isAuthenticated() {
    return currentUser !== null;
}

// Expose isAuthenticated function globally for keyboard shortcuts
window.isAuthenticated = isAuthenticated;

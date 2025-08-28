// Firebase configuration
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';

const firebaseConfig = {
    apiKey: "AIzaSyAxYqPEavO5ClFF6zh2BcgjMqLuXMVLVb8",
    authDomain: "uptimerbot-659e2.firebaseapp.com",
    databaseURL: "https://uptimerbot-659e2-default-rtdb.firebaseio.com",
    projectId: "uptimerbot-659e2",
    storageBucket: "uptimerbot-659e2.firebasestorage.app",
    messagingSenderId: "807458766865",
    appId: "1:807458766865:web:348e24920f0717bbb371b0",
    measurementId: "G-09HVD0WHK2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
const db = getFirestore(app);

// Export for use in other modules
window.firebaseAuth = auth;
window.firebaseDb = db;

export { auth, db };

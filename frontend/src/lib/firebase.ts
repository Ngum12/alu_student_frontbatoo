// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAol6UJmKpY5S4fihD1veMR-x7NE-S4SfI",
  authDomain: "nypthoria.firebaseapp.com",
  projectId: "nypthoria",
  storageBucket: "nypthoria.firebasestorage.app",
  messagingSenderId: "889533985009",
  appId: "1:889533985009:web:6ec9a3b735426ab2917950"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Set up Google provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Ignore the Cross-Origin-Opener-Policy warnings - they're just browser safety mechanisms
console.warn = (originalWarn => {
  return function(...args) {
    if (typeof args[0] === 'string' && args[0].includes('Cross-Origin-Opener-Policy')) {
      return; // Suppress these warnings
    }
    originalWarn.apply(console, args);
  };
})(console.warn);
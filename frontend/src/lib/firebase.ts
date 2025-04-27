// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCYczl7GoyQmAGoboMDy963_hKjQ0xejKQ",
  authDomain: "nythorian-5a0ab.firebaseapp.com",
  projectId: "nythorian-5a0ab",
  storageBucket: "nythorian-5a0ab.firebasestorage.app",
  messagingSenderId: "732854927198",
  appId: "1:732854927198:web:f40e2172a21c55f3cfd9cf"
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
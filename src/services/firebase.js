import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getStorage, connectStorageEmulator } from "firebase/storage";

// Firebase configuration using environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID, // Optional
};

// Validate configuration
const requiredKeys = ['apiKey', 'authDomain', 'projectId', 'storageBucket', 'messagingSenderId', 'appId'];
const missingKeys = requiredKeys.filter(key => !firebaseConfig[key]);

if (missingKeys.length > 0) {
  console.error(
    `❌ Missing required Firebase config keys: ${missingKeys.join(", ")}. 
    Please check your .env file and restart the dev server.
    
    Required environment variables:
    - VITE_FIREBASE_API_KEY
    - VITE_FIREBASE_AUTH_DOMAIN
    - VITE_FIREBASE_PROJECT_ID
    - VITE_FIREBASE_STORAGE_BUCKET
    - VITE_FIREBASE_MESSAGING_SENDER_ID
    - VITE_FIREBASE_APP_ID
    - VITE_FIREBASE_MEASUREMENT_ID (optional)`
  );
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
export const storage = getStorage(app);

// Configure Google Auth Provider
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Development emulator setup (optional)
// Uncomment these lines if you're using Firebase emulators for development
/*
if (import.meta.env.DEV) {
  try {
    connectAuthEmulator(auth, "http://localhost:9099", { disableWarnings: true });
    connectFirestoreEmulator(db, 'localhost', 8080);
    connectStorageEmulator(storage, "localhost", 9199);
    console.log("🔧 Connected to Firebase emulators");
  } catch (error) {
    console.log("ℹ️ Emulators not available or already connected");
  }
}
*/

// Enhanced connection test functions
export const testFirebaseConnection = async () => {
  const results = {
    auth: false,
    firestore: false,
    storage: false,
    overall: false
  };

  try {
    // Test Auth
    if (auth) {
      results.auth = true;
      console.log("✅ Firebase Auth connected successfully");
    }

    // Test Firestore
    if (db) {
      results.firestore = true;
      console.log("✅ Firebase Firestore connected successfully");
    }

    // Test Storage
    if (storage) {
      results.storage = true;
      console.log("✅ Firebase Storage connected successfully");
    }

    results.overall = results.auth && results.firestore && results.storage;
    
    if (results.overall) {
      console.log("🎉 All Firebase services connected successfully!");
    }
    
  } catch (error) {
    console.error("❌ Firebase connection test failed:", error);
    results.overall = false;
  }

  return results;
};

// Test storage connection specifically
export const testStorageConnection = () => {
  try {
    const storageInstance = getStorage(app);
    console.log("✅ Firebase Storage connected successfully");
    return storageInstance;
  } catch (error) {
    console.error("❌ Firebase Storage connection failed:", error);
    return null;
  }
};

// Enhanced error handling for common Firebase issues
export const handleFirebaseError = (error) => {
  console.error("Firebase Error:", error);
  
  switch (error.code) {
    case 'permission-denied':
      return "Access denied. Please check your authentication status and permissions.";
    case 'unavailable':
      return "Service temporarily unavailable. Please try again later.";
    case 'unauthenticated':
      return "Please sign in to access this feature.";
    case 'failed-precondition':
      return "Operation failed due to system constraints. Please try again.";
    case 'resource-exhausted':
      return "Too many requests. Please wait a moment and try again.";
    default:
      return error.message || "An unexpected error occurred.";
  }
};

// Initialize connection test on load
if (import.meta.env.DEV) {
  testFirebaseConnection();
}
// Import the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAHPdlMC6RWpomckmTSApyS1QzZz-YOWoc",
  authDomain: "m1xpos.firebaseapp.com",
  projectId: "m1xpos",
  storageBucket: "m1xpos.firebasestorage.app",
  messagingSenderId: "936062028411",
  appId: "1:936062028411:web:c6ffb86545124aaf95b0de",
  measurementId: "G-KZZMCV488B"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;
const db = getFirestore(app);
const auth = getAuth(app);
auth.languageCode = 'it';
// To apply the default browser preference instead of explicitly setting it.
// auth.useDeviceLanguage();

// Export instances to use throughout the app
export { app, analytics, db, auth };
export default app;

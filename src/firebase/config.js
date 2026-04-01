// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDoAEQjwRXqQWq0pDN-Q7AqawgBaG6acvI",
  authDomain: "captivate-media-hub.firebaseapp.com",
  projectId: "captivate-media-hub",
  storageBucket: "captivate-media-hub.firebasestorage.app",
  messagingSenderId: "264392988364",
  appId: "1:264392988364:web:fa02bd76b766f7356d1469"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
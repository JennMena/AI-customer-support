// Import the necessary functions from the Firebase SDK
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore"; 

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBN1F0_mcaClQfm5X_d28TKtUn2_rXds30",
    authDomain: "customer-support-app-d9851.firebaseapp.com",
    projectId: "customer-support-app-d9851",
    storageBucket: "customer-support-app-d9851.appspot.com",
    messagingSenderId: "181815183001",
    appId: "1:181815183001:web:8003fdd1a43bb9d6385a08",
    measurementId: "G-VKWGS6FS82"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore (or other services you plan to use)
const db = getFirestore(app);

// Export the initialized Firebase app and Firestore instance
export { app, db };

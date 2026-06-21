import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  projectId: "comet-db-c8090",
  appId: "1:395792982867:web:351333f5378b83b5b6b7a6",
  apiKey: "AIzaSyAPnoSr-ysfi3oAZJclsBYnP076bLd-4es",
  authDomain: "comet-db-c8090.firebaseapp.com",
  storageBucket: "comet-db-c8090.firebasestorage.app",
  messagingSenderId: "395792982867"
};

// Initialize app
const app = initializeApp(firebaseConfig);

// Initialize Firestore with custom databaseId
const db = getFirestore(app, "ai-studio-97045bd3-44f2-46c3-9e0e-bf492f13c2c1");

// Initialize Auth
const auth = getAuth(app);

// Providers
const googleProvider = new GoogleAuthProvider();

export { app, db, auth, googleProvider };

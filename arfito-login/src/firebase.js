import { initializeApp } from "firebase/app";
/*import { getAuth } from "firebase/auth";import { getAuth, GoogleAuthProvider } from "firebase/auth";*/
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyArTJfRPCrwZGPkwByh8-u5KpXauBfyu7E",
    authDomain: "arfitoteam.firebaseapp.com",
    projectId: "arfitoteam",
    storageBucket: "arfitoteam.firebasestorage.app",
    messagingSenderId: "963625606207",
    appId: "1:963625606207:web:42c69e7524816a25a0ac8a"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const db = getFirestore(app);

export { auth, db, provider };






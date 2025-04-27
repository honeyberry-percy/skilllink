import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// TODO: Replace the following with your app's Firebase project configuration
const firebaseConfig = {
  apiKey: "AIzaSyC8dE9ZiEbSTQwJUbqC7DDPesI3ozu3Z54",
  authDomain: "skilllink-65cc7.firebaseapp.com",
  projectId: "skilllink-65cc7",
  storageBucket: "skilllink-65cc7.firebasestorage.app",
  messagingSenderId: "907756571710",
  appId: "1:907756571710:web:bcca8fbe3788915b1f156f",
};



const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db }; 
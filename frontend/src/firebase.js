import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyDheRW8yX_KzvSGn7BRqpOh3F-hZ5gVhpY",
  authDomain: "pravah-78419.firebaseapp.com",
  databaseURL: "https://pravah-78419-default-rtdb.firebaseio.com",
  projectId: "pravah-78419",
  storageBucket: "pravah-78419.firebasestorage.app",
  messagingSenderId: "1052914702690",
  appId: "1:1052914702690:web:7ac03f072b7d0faa0cb43b",
  measurementId: "G-WRC51W5PJN"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const analytics = typeof window !== "undefined" ? getAnalytics(app) : null;

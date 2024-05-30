// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC8WUaDOX9zCixf1pQFCgQHQh9krmYJ2W0",
  authDomain: "timewarp-70c56.firebaseapp.com",
  projectId: "timewarp-70c56",
  storageBucket: "timewarp-70c56.appspot.com",
  messagingSenderId: "1092100389352",
  appId: "1:1092100389352:web:050a0158da693bd8718c5d",
  measurementId: "G-3ZQ7EF8LN3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const auth = firebase.auth();
const firestore = firebase.firestore();
const storage = firebase.storage();



const analytics = getAnalytics(app);
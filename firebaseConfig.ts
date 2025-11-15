import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCT_eyUOfgyPz39rw3_C-jJOL5WjhvqQcY",
  authDomain: "prjreactnative-4e826.firebaseapp.com",
  projectId: "prjreactnative-4e826",
  storageBucket: "prjreactnative-4e826.firebasestorage.app",
  messagingSenderId: "845873343771",
  appId: "1:845873343771:web:15dd2a7f389f3c08faf7be"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);
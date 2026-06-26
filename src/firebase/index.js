import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
	apiKey: "AIzaSyAMLl4Dj1Amwj75ovRxnurIvOsByTx_Lzg",
	authDomain: "selfassessment-ogestudio.firebaseapp.com",
	projectId: "selfassessment-ogestudio",
	storageBucket: "selfassessment-ogestudio.firebasestorage.app",
	messagingSenderId: "468651529560",
	appId: "1:468651529560:web:ba2bc8644e5eb290c0412d",
	measurementId: "G-JG7TY0WZCJ",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

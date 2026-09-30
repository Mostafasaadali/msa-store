import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// تم إضافة استيراد GoogleAuthProvider هنا
import { getAuth, GoogleAuthProvider } from "firebase/auth"; 
import { getAnalytics, isSupported } from "firebase/analytics";

// إعدادات الاتصال بقاعدة البيانات
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID 
};

// تهيئة تطبيق فايربيز
const app = initializeApp(firebaseConfig);

// تهيئة الخدمات
const db = getFirestore(app);
const auth = getAuth(app);

// --- تم إضافة تهيئة مزود خدمة جوجل هنا ---
const provider = new GoogleAuthProvider();

export const ADMIN_UID = import.meta.env.VITE_FIREBASE_ADMIN_UID;

// تهيئة Google Analytics بأمان تام (100%)
let analytics = null;
isSupported().then((supported) => {
  if (supported) {
    analytics = getAnalytics(app);
    console.log("Google Analytics initialized successfully.");
  }
}).catch((err) => console.error("Analytics not supported:", err));

// تم إضافة 'provider' إلى قائمة التصدير
export { db, auth, analytics, provider };
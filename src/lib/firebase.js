import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// 선생님! 
// 파이어베이스 홈페이지(console.firebase.google.com)에서 프로젝트를 생성하신 뒤,
// 제공받으신 firebaseConfig 설정값으로 아래를 덮어쓰기 해주세요!
const firebaseConfig = {
  apiKey: "AIzaSyCMeXU2wrPoYkB9DfSddpgX0LY8p9fgGU4",
  authDomain: "mumueglish800.firebaseapp.com",
  projectId: "mumueglish800",
  storageBucket: "mumueglish800.firebasestorage.app",
  messagingSenderId: "467405238731",
  appId: "1:467405238731:web:97e8daab35f2c110f3464e",
  measurementId: "G-HZKXK7GZ34"
};

// 키값이 올바르게 들어왔는지 확인하는 안전장치
const isFirebaseConfigured = firebaseConfig.apiKey !== "YOUR_API_KEY";

const app = isFirebaseConfigured ? initializeApp(firebaseConfig) : null;
const dbFirestore = isFirebaseConfigured ? getFirestore(app) : null;

export { app, dbFirestore, isFirebaseConfigured };

import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// 선생님! 
// 파이어베이스 홈페이지(console.firebase.google.com)에서 프로젝트를 생성하신 뒤,
// 제공받으신 firebaseConfig 설정값으로 아래를 덮어쓰기 해주세요!
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// 키값이 올바르게 들어왔는지 확인하는 안전장치
const isFirebaseConfigured = firebaseConfig.apiKey !== "YOUR_API_KEY";

const app = isFirebaseConfigured ? initializeApp(firebaseConfig) : null;
const dbFirestore = isFirebaseConfigured ? getFirestore(app) : null;

export { app, dbFirestore, isFirebaseConfigured };

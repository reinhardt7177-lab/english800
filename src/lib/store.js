import wordsData from '../data/words.json';
import { dbFirestore, isFirebaseConfigured } from './firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const USER_KEY = 'ghibli_user';

export const auth = {
  login: (username, password) => {
    // Simple mock login / identifier
    localStorage.setItem(USER_KEY, JSON.stringify({ username, id: `user_${username}` }));
    return Promise.resolve({ username });
  },
  logout: () => {
    localStorage.removeItem(USER_KEY);
    return Promise.resolve();
  },
  getCurrentUser: () => {
    const user = localStorage.getItem(USER_KEY);
    return user ? JSON.parse(user) : null;
  }
};

export const db = {
  getUserProgress: async () => {
    const user = auth.getCurrentUser();
    if (!user) return null;

    const PROGRESS_KEY = `ghibli_progress_${user.username}`;
    let dataToReturn = null;

    // 1. 파이어베이스가 연결되어 있다면 클라우드에서 불러옵니다.
    if (isFirebaseConfigured) {
      try {
        const docRef = doc(dbFirestore, "users", user.username);
        // 안전장치: 데이터베이스가 미생성된 상태에서 무한 로딩되는 것을 막기 위한 3초 타임아웃
        const docSnap = await Promise.race([
          getDoc(docRef),
          new Promise((_, reject) => setTimeout(() => reject(new Error("Firebase Timeout")), 3000))
        ]);
        if (docSnap.exists()) {
          dataToReturn = docSnap.data();
        }
      } catch (err) {
        console.error("Firebase Load Error (Database might not exist yet):", err);
      }
    } 
    // 2. 파이어베이스 연결이 없다면 로컬 스토리지에서 불러옵니다.
    else {
      const progress = localStorage.getItem(PROGRESS_KEY);
      if (progress) {
        dataToReturn = JSON.parse(progress);
      }
    }

    if (dataToReturn) {
      if (dataToReturn.score === undefined) dataToReturn.score = 0;
      if (!dataToReturn.playedDays) dataToReturn.playedDays = [];
      return dataToReturn;
    }

    // 완전히 처음인 학생의 기본 데이터 설정
    const initProgress = {
      day: 1,
      score: 0,
      playedDays: [],
      completedWords: [],
      wrongWordsQueue: [] 
    };
    
    await db.saveUserProgress(initProgress);
    return initProgress;
  },
  
  saveUserProgress: async (progress) => {
    const user = auth.getCurrentUser();
    if (!user) return;

    if (isFirebaseConfigured) {
      try {
        const docRef = doc(dbFirestore, "users", user.username);
        // 서버 DB에 덮어쓰기
        await setDoc(docRef, progress);
      } catch (err) {
        console.error("Firebase Save Error:", err);
      }
    } else {
      const PROGRESS_KEY = `ghibli_progress_${user.username}`;
      localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
    }
  },
  
  getDailyWords: async () => {
    const progress = await db.getUserProgress();
    if (!progress) return [];
    
    const DAILY_LIMIT = 10;
    let wordsToTest = [];
    
    // 1. 이전 날짜의 오답 단어 우선 배정
    if (progress.wrongWordsQueue) {
      wordsToTest = [...progress.wrongWordsQueue];
    }
    
    // 2. 남은 자리를 새로운 단어로 채우기
    const needed = DAILY_LIMIT - wordsToTest.length;
    let newWordsAdded = 0;
    
    for (const w of wordsData) {
      if (newWordsAdded >= needed) break;
      
      const alreadyCompleted = progress.completedWords && progress.completedWords.includes(w.id);
      const alreadyInQueue = wordsToTest.find(q => q.id === w.id);
      
      if (!alreadyCompleted && !alreadyInQueue) {
        wordsToTest.push(w);
        newWordsAdded++;
      }
    }
    
    return wordsToTest;
  }
};

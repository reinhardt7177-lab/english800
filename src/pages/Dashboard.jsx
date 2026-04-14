import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db, auth } from '../lib/store';

import wordsData from '../data/words.json';

function FairyDictionary() {
  const [word, setWord] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showMeaning, setShowMeaning] = useState(false);

  const playAudio = (textToSpeak, audioUrl) => {
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audio.play();
    } else {
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.lang = 'en-US';
      window.speechSynthesis.speak(utterance);
    }
  };

  const searchWord = async (e) => {
    e.preventDefault();
    if (!word.trim()) return;
    setLoading(true);
    setResult(null);
    setShowMeaning(false);
    
    // Look up Korean meaning from local data
    const localWord = wordsData.find(w => w.word.toLowerCase() === word.trim().toLowerCase());
    const korMeaning = localWord ? localWord.meaning : '알 수 없음';

    try {
      const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word.trim().toLowerCase())}`);
      if (!res.ok) throw new Error('Not found');
      const data = await res.json();
      
      const meanings = data[0].meanings;
      let exampleFound = null;
      for (let m of meanings) {
        for (let def of m.definitions) {
          if (def.example) {
            exampleFound = def.example;
            break;
          }
        }
        if (exampleFound) break;
      }
      
      let finalExample = "";
      let sentenceTranslated = "";
      
      if (exampleFound) {
        finalExample = exampleFound;
        // Try to translate the native example sentence!
        try {
          const transRes = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(exampleFound)}&langpair=en|ko`);
          const transData = await transRes.json();
          sentenceTranslated = transData.responseData.translatedText;
        } catch(e) {
          sentenceTranslated = "요정의 번역 마법이 실패했어요 ㅠㅠ";
        }
      } else {
        const templates = [
          { en: "Look at that **word**!", ko: "저 **kor** 좀 봐!" },
          { en: "I really like the **word**.", ko: "나는 **kor**(을)를 정말 좋아해." },
          { en: "This **word** is very interesting.", ko: "이 **kor**(은)는 정말 흥미로워." },
          { en: "Can you spell '**word**' for me?", ko: "**kor**의 스펠링을 말해줄래?" },
          { en: "Do you have a **word**?", ko: "너도 **kor**(을)를 가지고 있어?" }
        ];
        const picked = templates[Math.floor(Math.random() * templates.length)];
        finalExample = picked.en.replace(/\*\*word\*\*/g, data[0].word);
        sentenceTranslated = picked.ko.replace(/\*\*kor\*\*/g, korMeaning !== '알 수 없음' ? korMeaning : data[0].word);
      }
      
      // Find valid audio URL
      let validAudio = '';
      if (data[0].phonetics) {
        const phoneticWithAudio = data[0].phonetics.find(p => p.audio && p.audio.length > 0);
        if (phoneticWithAudio) validAudio = phoneticWithAudio.audio;
      }
      
      setResult({
        found: true,
        word: data[0].word,
        phonetics: data[0].phonetic || '',
        kor: korMeaning,
        example: finalExample,
        translatedExample: sentenceTranslated,
        audio: validAudio
      });
    } catch (err) {
      setResult({ found: false, word: word, example: "요정이 단어를 찾지 못했어요. 스펠링을 확인해주세요!", kor: korMeaning, translatedExample: "" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="widget-card" style={{ gridColumn: '1 / -1', background: 'linear-gradient(135deg, rgba(239, 246, 255, 0.9), rgba(219, 234, 254, 0.9))' }}>
      <h3 className="widget-title">🧚‍♀️ 마법 요정의 돋보기 (원어민 예문)</h3>
      <form onSubmit={searchWord} style={{ display: 'flex', gap: '10px', marginTop: '1rem' }}>
        <input 
          type="text" 
          value={word} 
          onChange={e => setWord(e.target.value)} 
          placeholder="궁금한 영어 단어 검색!" 
          className="input-magic" 
          style={{ padding: '0.8rem', fontSize: '1.2rem', flex: 1 }} 
        />
        <button type="submit" className="btn btn-primary" style={{ padding: '0.8rem 1.5rem', whiteSpace: 'nowrap' }}>
          {loading ? '검색 중...' : '마법 걸기!'}
        </button>
      </form>

      {result && (
        <div className="mt-1" style={{ background: 'rgba(255,255,255,0.8)', padding: '1.5rem', borderRadius: '15px', border: '2px dashed #74b9ff', textAlign: 'left', display: 'flex', flexDirection: 'column' }}>
          {result.found ? (
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h2 style={{ color: '#0984e3' }}>{result.word}</h2>
                <span style={{ fontSize: '1.1rem', color: '#636e72' }}>{result.phonetics}</span>
                <button 
                  onClick={() => playAudio(result.word, result.audio)} 
                  style={{ background: 'transparent', border: 'none', fontSize: '1.5rem', cursor: 'pointer', outline: 'none' }}
                  title="단어 발음 듣기"
                >
                  🔊
                </button>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '0.5rem' }}>
                <p style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#2d3436', margin: 0 }}>"{result.example}"</p>
                <button 
                  className="btn btn-primary"
                  onClick={() => playAudio(result.example, null)} 
                  style={{ padding: '0.4rem 0.8rem', fontSize: '0.9rem' }}
                >
                  예문 듣기 🎵
                </button>
              </div>
              
              <div style={{ marginTop: '1.5rem', borderTop: '2px dashed rgba(0,0,0,0.1)', paddingTop: '1.5rem' }}>
                {!showMeaning ? (
                  <button className="btn btn-warning" onClick={() => setShowMeaning(true)} style={{ width: '100%', padding: '0.8rem' }}>
                    이 마법 주문의 뜻과 예문 해석 확인하기 👀
                  </button>
                ) : (
                  <div className="animate-pop" style={{ background: '#fef6e4', padding: '1rem', borderRadius: '10px', textAlign: 'center', border: '2px solid #ffb142' }}>
                    <h3 style={{ color: '#d35400', marginBottom: '0.5rem' }}>✨ {result.word} : {result.kor} ✨</h3>
                    <p style={{ color: '#2d3436', fontSize: '1.2rem', fontWeight: 'bold' }}>{result.translatedExample}</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div>
              <p style={{ fontSize: '1.2rem', color: '#e17055', fontWeight: 'bold' }}>{result.example}</p>
              {result.kor !== '알 수 없음' && (
                <div style={{ marginTop: '1rem' }}>
                  {!showMeaning ? (
                    <button className="btn btn-warning" onClick={() => setShowMeaning(true)} style={{ width: '100%', padding: '0.8rem' }}>
                      뜻 확인하기 👀
                    </button>
                  ) : (
                    <div className="animate-pop" style={{ background: '#fef6e4', padding: '1rem', borderRadius: '10px', textAlign: 'center', border: '2px solid #ffb142' }}>
                      <h3 style={{ color: '#d35400' }}>✨ {result.word} : {result.kor} ✨</h3>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function Dashboard() {
  const [progress, setProgress] = useState(null);
  const [todayWords, setTodayWords] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const loadProgress = async () => {
      const prog = await db.getUserProgress();
      const words = await db.getDailyWords();
      setProgress(prog);
      setTodayWords(words);
    };
    loadProgress();
  }, []);

  const handleLogout = async () => {
    await auth.logout();
    window.location.reload();
  };

  if (!progress) return <div className="container text-center mt-2" style={{ color: 'white' }}>마법의 숲을 부르는 중... 🔮</div>;

  const totalWords = progress.completedWords.length;
  // Create an array of 15 days for the stamp board
  const stampDays = Array.from({ length: 15 }).map((_, i) => i + 1);

  let rankText = "🌱 초보 마법사";
  if (totalWords >= 101 && totalWords <= 300) rankText = "🪄 견습 마법사";
  else if (totalWords >= 301 && totalWords <= 700) rankText = "🔮 대마법사";
  else if (totalWords >= 701) rankText = "👑 수정탑 구원자";

  return (
    <div className="container animate-pop">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} className="mb-1">
        <h2 style={{ color: 'var(--color-text-white)', textShadow: '0 2px 5px rgba(0,0,0,0.5)' }}>📜 {rankText} {auth.getCurrentUser()?.username}의 캠프</h2>
        <button className="btn btn-accent" style={{ padding: '0.5rem 1rem', fontSize: '1rem' }} onClick={handleLogout}>
          종료
        </button>
      </div>

      <div className="dashboard-grid">
        {/* Widget 1: Today's Quest */}
        <div className="widget-card" style={{ gridColumn: '1 / -1' }}>
          <h3 className="widget-title">🔥 오늘의 마법 수련</h3>
          <p style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>
            새로운 요정 {todayWords.length}마리가 기다리고 있어요!
          </p>
          <button className="btn btn-primary" style={{ width: '100%', fontSize: '1.5rem', padding: '1.2rem' }} onClick={() => navigate('/learn')}>
            오늘의 모험 떠나기 🏹
          </button>
        </div>

        {/* Widget 2: Wrong Answers Note */}
        <div className="widget-card" style={{ background: 'linear-gradient(135deg, #ffeaa7, #fff)'}}>
          <h3 className="widget-title">📓 어둠의 숲 (오답노트)</h3>
          <h1 style={{ fontSize: '4rem', color: '#d35400', margin: '0.5rem 0' }}>{progress.wrongWordsQueue.length}</h1>
          <p style={{ color: '#636e72', marginBottom: '1rem' }}>기억을 잃은 단어들</p>
          <button 
            className="btn btn-warning" 
            style={{ width: '100%' }} 
            onClick={() => navigate('/review')}
            disabled={progress.wrongWordsQueue.length === 0}
          >
            복습하러 가기 💡
          </button>
        </div>

        {/* Widget 3: Scoreboard */}
        <div className="widget-card">
          <h3 className="widget-title">🏆 마법 점수표</h3>
          <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', flex: 1 }}>
            <div>
              <p style={{ color: 'var(--color-text-muted)' }}>누적 마력</p>
              <h2 style={{ color: 'var(--color-primary)', fontSize: '2.5rem' }}>{progress.score}</h2>
            </div>
            <div>
              <p style={{ color: 'var(--color-text-muted)' }}>정복 단어</p>
              <h2 style={{ color: 'var(--color-primary)', fontSize: '2.5rem' }}>{totalWords}</h2>
            </div>
          </div>
        </div>

        {/* Widget 4: Stamp Board */}
        <div className="widget-card" style={{ gridColumn: '1 / -1' }}>
          <h3 className="widget-title">📅 모험 출석부</h3>
          <div className="stamp-grid">
            {stampDays.map(dayNum => {
              const played = progress.playedDays && progress.playedDays.includes(dayNum);
              return (
                <div key={dayNum} className={`stamp ${played ? 'active' : ''}`}>
                  {played ? '🍎' : dayNum}
                </div>
              );
            })}
          </div>
        </div>

        {/* Widget 5: Fairy Dictionary */}
        <FairyDictionary />
      </div>
    </div>
  );
}

import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../lib/store';
import confetti from 'canvas-confetti';

export default function Learn() {
  const [words, setWords] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [inputVal, setInputVal] = useState('');
  const [status, setStatus] = useState('idle'); // idle, correct, wrong, finished
  const [progress, setProgress] = useState(null);
  
  const [sessionResults, setSessionResults] = useState({ correct: [], wrong: [] });
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const init = async () => {
      const prog = await db.getUserProgress();
      const dailyWords = await db.getDailyWords();
      setProgress(prog);
      setWords(dailyWords);
      
      if (dailyWords.length === 0) {
        setStatus('finished');
      }
    };
    init();
  }, []);

  useEffect(() => {
    if (status === 'idle' && inputRef.current) {
      inputRef.current.focus();
    }
  }, [status, currentIndex]);

  const currentWord = words[currentIndex];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputVal.trim() || status !== 'idle') return;

    const isMatch = inputVal.trim().toLowerCase() === currentWord.word.toLowerCase();
    
    if (isMatch) {
      setStatus('correct');
      setSessionResults(prev => ({ ...prev, correct: [...prev.correct, currentWord] }));
      
      setTimeout(() => {
        handleNext();
      }, 700);
    } else {
      setStatus('wrong');
      setSessionResults(prev => ({ ...prev, wrong: [...prev.wrong, currentWord] }));
    }
  };

  const handleNext = () => {
    if (currentIndex + 1 < words.length) {
      setCurrentIndex(prev => prev + 1);
      setInputVal('');
      setStatus('idle');
    } else {
      finishSession();
    }
  };

  const finishSession = async () => {
    setStatus('finished');
    
    // 🔥 Trigger Confetti Celebration!
    if (sessionResults.wrong.length === 0) {
      // 100% Perfect Score Effect
      confetti({
        particleCount: 200,
        spread: 160,
        origin: { y: 0.4 },
        colors: ['#ffb142', '#55efc4', '#74b9ff', '#ff5252']
      });
      setTimeout(() => {
        confetti({ particleCount: 150, spread: 100, origin: { y: 0.5, x: 0.2 } });
        confetti({ particleCount: 150, spread: 100, origin: { y: 0.5, x: 0.8 } });
      }, 500);
    } else {
      // Normal Finished Effect
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.5 }
      });
    }
    
    const newCompletedObj = {};
    progress.completedWords.forEach(id => newCompletedObj[id] = true);
    
    sessionResults.correct.forEach(w => {
      newCompletedObj[w.id] = true;
    });
    
    let newWrongQueue = progress.wrongWordsQueue.filter(w => !sessionResults.correct.find(cw => cw.id === w.id));
    
    sessionResults.wrong.forEach(w => {
      if (!newWrongQueue.find(qw => qw.id === w.id)) {
        newWrongQueue.push(w);
      }
    });
    
    const earnedScore = sessionResults.correct.length * 10;
    const currentPlayedDays = progress.playedDays || [];

    const newProgress = {
      day: progress.day + 1,
      score: (progress.score || 0) + earnedScore,
      playedDays: [...currentPlayedDays, progress.day],
      completedWords: Object.keys(newCompletedObj).map(Number),
      wrongWordsQueue: newWrongQueue
    };

    await db.saveUserProgress(newProgress);

    // Auto-navigate after 3 seconds
    setTimeout(() => {
      navigate('/dashboard');
    }, 3000);
  };

  if (!progress || words.length === 0) {
    return status === 'finished' ? (
      <div className="container text-center mt-2 animate-pop">
        <div className="glass-card">
          <h1 style={{ color: 'var(--color-secondary)' }}>오늘의 수정탑 정화 완료! 💎</h1>
          <p className="mt-1" style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>축하합니다! 3초 후 양피지로 자동으로 이동합니다...</p>
        </div>
      </div>
    ) : <div className="container text-center mt-2" style={{ color: 'white' }}>마법봉 충전 중... 🪄</div>;
  }

  const playAudio = () => {
    const utterance = new SpeechSynthesisUtterance(currentWord.word);
    utterance.lang = 'en-US';
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="container text-center animate-pop" style={{ position: 'relative' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-text-white)', textShadow: '0 2px 2px rgba(0,0,0,0.5)', fontSize: '1.2rem' }}>
        <div>진행: {currentIndex + 1} / {words.length}</div>
        <div style={{ fontWeight: 'bold', color: 'var(--color-secondary)' }}>⭐ {sessionResults.correct.length}</div>
      </div>

      <div className={`glass-card mt-2 ${status === 'wrong' ? 'animate-shake' : ''}`} style={{ padding: '3rem 2rem' }}>
        <h2 style={{ color: 'var(--color-text-muted)', marginBottom: '1rem' }}>이 요정의 마법 주문은?</h2>
        
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '2rem 0', gap: '15px' }}>
          <h1 style={{ fontSize: '3.5rem', color: 'var(--color-bg-deep)', margin: 0 }}>
            {currentWord.meaning}
          </h1>
          <button 
            onClick={playAudio} 
            title="발음 듣기 힌트!"
            style={{ 
              background: 'linear-gradient(135deg, #ffeaa7, #fdcb6e)', 
              border: 'none', 
              borderRadius: '50%',
              width: '50px',
              height: '50px',
              fontSize: '1.8rem', 
              cursor: 'pointer', 
              outline: 'none',
              boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'transform 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            🔊
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <input
            ref={inputRef}
            type="text"
            className="input-magic"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            disabled={status !== 'idle'}
            autoComplete="off"
            style={{
              borderColor: status === 'correct' ? 'var(--color-success, #00b894)' : status === 'wrong' ? 'var(--color-accent)' : undefined
            }}
          />
        </form>

        <div style={{ minHeight: '80px', marginTop: '1rem' }}>
          {status === 'wrong' && (
            <div className="animate-pop" style={{ color: 'var(--color-accent)' }}>
              <p style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>문이 열리지 않습니다... 막힌 주문은 <strong>{currentWord.word}</strong> 에요!</p>
              <button className="btn btn-warning mt-1" onClick={handleNext}>어둠의 숲에 기록하기 📝</button>
            </div>
          )}
          
          {status === 'correct' && (
            <div className="animate-pop" style={{ color: 'var(--color-primary)', fontWeight: 'bold', fontSize: '2rem' }}>
              ✨ 주문 성공! ✨
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

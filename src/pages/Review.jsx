import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../lib/store';

export default function Review() {
  const [wrongWords, setWrongWords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [flippedCards, setFlippedCards] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      const prog = await db.getUserProgress();
      setWrongWords(prog.wrongWordsQueue);
      setLoading(false);
    };
    load();
  }, []);

  const toggleFlip = (id) => {
    setFlippedCards(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  if (loading) return <div className="container text-center text-white">어둠의 숲을 파헤치는 중...</div>;

  return (
    <div className="container animate-pop">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} className="mb-2">
        <h2 style={{ color: 'var(--color-text-white)', textShadow: '0 2px 5px rgba(0,0,0,0.5)' }}>어둠의 숲 (오답노트) 🌲</h2>
        <button className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '1rem' }} onClick={() => navigate('/dashboard')}>
          돌아가기
        </button>
      </div>

      <div className="glass-card mb-2 text-center" style={{ padding: '1.5rem' }}>
        <h3 style={{ color: 'var(--color-bg-deep)' }}>총 {wrongWords.length}개의 마법 주문</h3>
        <p style={{ color: 'var(--color-text-muted)' }}>카드를 클릭하여 뜻과 스펠링을 확인하세요. 다음 시험에 100% 다시 출제됩니다!</p>
      </div>

      {wrongWords.length === 0 ? (
        <div className="glass-card text-center mt-2">
          <h2>놀랍습니다! 오답이 하나도 없네요! 🎉</h2>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: '1.5rem',
          marginTop: '2rem'
        }}>
          {wrongWords.map(word => (
            <div 
              key={word.id} 
              className={`flip-card ${flippedCards[word.id] ? 'flipped' : ''}`}
              onClick={() => toggleFlip(word.id)}
            >
              <div className="flip-card-inner">
                <div className="flip-card-front">
                  <h2 style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>{word.meaning}</h2>
                  <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>터치하여 뒤집기</p>
                </div>
                <div className="flip-card-back">
                  <h1 style={{ fontSize: '2.2rem', marginBottom: '0.5rem', color: 'white' }}>{word.word}</h1>
                  <p style={{ opacity: 0.8, fontSize: '0.9rem' }}>{word.meaning}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

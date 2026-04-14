import { useState, useEffect } from 'react';
import { auth } from '../lib/store';

export default function Login({ setUser }) {
  const [name, setName] = useState('');
  const [pin, setPin] = useState('');
  const [errorStatus, setErrorStatus] = useState('');

  // Generate floating fireflies
  const fireflies = Array.from({ length: 15 }).map((_, i) => (
    <div key={i} className="firefly" style={{
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      animationDelay: `${Math.random() * 5}s`,
      animationDuration: `${10 + Math.random() * 10}s`
    }}></div>
  ));

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!name.trim() || !pin.trim()) {
      setErrorStatus("이름과 마법의 숫자(PIN)를 모두 입력하세요!");
      return;
    }
    
    try {
      const user = await auth.login(name, pin);
      setUser(user);
    } catch (err) {
      setErrorStatus(err.message);
    }
  };

  return (
    <div className="container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', position: 'relative' }}>
      {fireflies}
      
      <div className={`glass-card animate-float ${errorStatus ? 'animate-shake' : 'animate-pop'}`} style={{ maxWidth: '420px', width: '100%', textAlign: 'center', zIndex: 10 }}>
        <h1 style={{ color: 'var(--color-primary)', marginBottom: '0.5rem', textShadow: '2px 2px 4px rgba(0,0,0,0.1)' }}>마법의 숲 영단어</h1>
        <p className="mb-2" style={{ color: 'var(--color-text-main)', fontSize: '1.1rem', fontWeight: 'bold' }}>이름과 나만의 <span style={{color:'#ff4757'}}>마법의 숫자 4자리</span>를 새기세요! ✨</p>
        
        {errorStatus && (
          <div style={{ color: '#ff4757', marginBottom: '1rem', fontWeight: 'bold', background: 'rgba(255,255,255,0.8)', padding: '0.5rem', borderRadius: '10px' }}>
            🚨 {errorStatus}
          </div>
        )}
        
        <form onSubmit={handleLogin}>
          <input 
            type="text" 
            placeholder="마법사 이름" 
            className="input-magic mb-1"
            value={name}
            onChange={(e) => {setName(e.target.value); setErrorStatus('');}}
          />
          <input 
            type="password" 
            inputMode="numeric"
            placeholder="비밀번호(4자리 숫자)" 
            className="input-magic mb-2"
            value={pin}
            onChange={(e) => {
              const val = e.target.value.replace(/[^0-9]/g, '').slice(0, 4);
              setPin(val);
              setErrorStatus('');
            }}
            style={{ letterSpacing: '0.2rem', textAlign: 'center', fontSize: '1.4rem' }}
          />
          <button type="submit" className="btn btn-primary" style={{ width: '100%', fontSize: '1.4rem' }}>
            모험 세계로 입장 🔮
          </button>
        </form>
      </div>
    </div>
  );
}

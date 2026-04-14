import { useState, useEffect } from 'react';
import { auth } from '../lib/store';

export default function Login({ setUser }) {
  const [name, setName] = useState('');

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
    if (!name.trim()) return;
    const user = await auth.login(name, 'password123');
    setUser(user);
  };

  return (
    <div className="container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', position: 'relative' }}>
      {fireflies}
      
      <div className="glass-card animate-float animate-pop" style={{ maxWidth: '420px', width: '100%', textAlign: 'center', zIndex: 10 }}>
        <h1 style={{ color: 'var(--color-primary)', marginBottom: '0.5rem', textShadow: '2px 2px 4px rgba(0,0,0,0.1)' }}>마법의 숲 영단어</h1>
        <p className="mb-2" style={{ color: 'var(--color-text-main)', fontSize: '1.1rem', fontWeight: 'bold' }}>이름을 새기고 환상적인 모험을 떠나세요! ✨</p>
        
        <form onSubmit={handleLogin}>
          <input 
            type="text" 
            placeholder="마법사 이름" 
            className="input-magic mb-2"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <button type="submit" className="btn btn-primary" style={{ width: '100%', fontSize: '1.4rem' }}>
            모험 세계로 입장 🔮
          </button>
        </form>
      </div>
    </div>
  );
}

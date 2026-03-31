import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../services/firebase';
import { FaTimes, FaUser, FaLock } from 'react-icons/fa';
import './AuthModal.css';

const LoginModal = ({ isOpen, onClose, onSwitchToRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log('Вход успешен:', userCredential.user.email);
      onClose();
    } catch (err) {
      console.error('Ошибка входа:', err.code, err.message);
      
      if (err.code === 'auth/user-not-found') {
        setError('Пользователь не найден');
      } else if (err.code === 'auth/wrong-password') {
        setError('Неверный пароль');
      } else if (err.code === 'auth/invalid-email') {
        setError('Неверный формат email');
      } else if (err.code === 'auth/invalid-credential') {
        setError('Неверный email или пароль');
      } else {
        setError('Ошибка входа: ' + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          <FaTimes />
        </button>
        
        <h2>Добро пожаловать!</h2>
        <p className="modal-subtitle">Войдите в свой аккаунт</p>
        
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <FaUser className="input-icon" />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div className="input-group">
            <FaLock className="input-icon" />
            <input
              type="password"
              placeholder="Пароль"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          {error && <div className="error-message">{error}</div>}
          
          <button type="submit" className="modal-btn" disabled={loading}>
            {loading ? 'Вход...' : 'Войти'}
          </button>
        </form>
        
        <p className="modal-footer">
          Нет аккаунта?{' '}
          <button type="button" onClick={onSwitchToRegister} className="modal-link">
            Регистрация
          </button>
        </p>
      </div>
    </div>
  );
};

export default LoginModal;
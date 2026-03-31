import React, { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../../services/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { FaTimes, FaUser, FaLock, FaEnvelope } from 'react-icons/fa';
import './AuthModal.css';

const RegisterModal = ({ isOpen, onClose, onSwitchToLogin }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      console.log('Регистрация успешна:', user.email);
      

      await setDoc(doc(db, 'users', user.uid), {
        displayName: name,
        email: email,
        role: 'user',
        createdAt: new Date()
      });
      
      onClose();
    } catch (err) {
      console.error('Ошибка регистрации:', err.code, err.message);
      
      if (err.code === 'auth/email-already-in-use') {
        setError('Этот email уже используется');
      } else if (err.code === 'auth/weak-password') {
        setError('Пароль должен быть минимум 6 символов');
      } else {
        setError('Ошибка регистрации: ' + err.message);
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
        
        <h2>Создать аккаунт</h2>
        <p className="modal-subtitle">Присоединяйтесь к ФОТИК.UZ</p>
        
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <FaUser className="input-icon" />
            <input
              type="text"
              placeholder="Имя"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          
          <div className="input-group">
            <FaEnvelope className="input-icon" />
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
              minLength={6}
            />
          </div>
          
          {error && <div className="error-message">{error}</div>}
          
          <button type="submit" className="modal-btn" disabled={loading}>
            {loading ? 'Регистрация...' : 'Зарегистрироваться'}
          </button>
        </form>
        
        <p className="modal-footer">
          Уже есть аккаунт?{' '}
          <button type="button" onClick={onSwitchToLogin} className="modal-link">
            Войти
          </button>
        </p>
      </div>
    </div>
  );
};

export default RegisterModal;
// /^[^\s@]@[^\s@]/.[^\s@]
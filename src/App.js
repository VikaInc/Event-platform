import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Layout from './components/layout/Layout';
import HomePage from './pages/HomePage';
import LoginModal from './components/auth/LoginModal';
import RegisterModal from './components/auth/RegisterModal';
import { auth } from './services/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import ProfilePage from './pages/ProfilePage';
import AdminPage from './pages/AdminPage';
import EventPage from './pages/EventPage';
import CartPage from './pages/CartPage';

import './App.css';

function App() {
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  console.log('Текущий пользователь:', user?.email);

  return (
    <BrowserRouter>
      <Layout 
        onOpenLogin={() => setShowLogin(true)}
      >
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/event/:id" element={<EventPage />} />
          <Route path="/cart" element={<CartPage />} />
        </Routes>
      </Layout>

      <LoginModal 
        isOpen={showLogin}
        onClose={() => setShowLogin(false)}
        onSwitchToRegister={() => {
          setShowLogin(false);
          setShowRegister(true);
        }}
      />

      <RegisterModal 
        isOpen={showRegister}
        onClose={() => setShowRegister(false)}
        onSwitchToLogin={() => {
          setShowRegister(false);
          setShowLogin(true);
        }}
      />
    </BrowserRouter>
  );
}

export default App;
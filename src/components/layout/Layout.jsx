import React from 'react';
import Header from './Header';
import Footer from './Footer';

const Layout = ({ children, onOpenLogin }) => { 
  return (
    <>
      <Header onOpenLogin={onOpenLogin} /> 
      <main className="main-content">
        {children}
      </main>
      <Footer />
    </>
  );
};

export default Layout;
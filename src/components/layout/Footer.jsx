import React from 'react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-section">
          <h4>ФОТИК.UZ</h4>
          <p>Билеты на лучшие мероприятия в Ташкенте</p>
          <p>+998 458 254 45</p>
          <p>info@fotik.uz</p>
        </div>

        <div className="footer-section">
          <h4>Мероприятия</h4>
          <ul>
            <li><a href="#">Концерты</a></li>
            <li><a href="#">Выставки</a></li>
            <li><a href="#">Вечеринки</a></li>
            <li><a href="#">Мастер-классы</a></li>
          </ul>
        </div>

        <div className="footer-section">
          <h4>Информация</h4>
          <ul>
            <li><a href="#">О нас</a></li>
            <li><a href="#">Возврат билетов</a></li>
            <li><a href="#">Контакты</a></li>
          </ul>
        </div>
      </div>
      
      <div className="footer-bottom">
        <p>&copy; 2026 ФОТИК.UZ. Все права защищены.</p>
      </div>
    </footer>
  );
};

export default Footer;
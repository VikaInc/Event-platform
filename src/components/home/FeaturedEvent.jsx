import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../../services/firebase';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import './FeaturedEvent.css';

const FeaturedEvent = () => {
  const [featuredEvent, setFeaturedEvent] = useState(null);
  const [rightEvents, setRightEvents] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);


  const bannerImages = [
    'https://i.pinimg.com/1200x/ed/c2/45/edc24504d49bfc7d0b8daba330c3efb4.jpg',
    'https://images.pexels.com/photos/6782039/pexels-photo-6782039.jpeg',
    'https://images.pexels.com/photos/4209096/pexels-photo-4209096.png',
  ];

  useEffect(() => {
    const loadEvents = async () => {
      try {
        const eventsRef = collection(db, 'events');
        const eventsQuery = query(eventsRef, orderBy('date'), limit(6));
        const snapshot = await getDocs(eventsQuery);
        const events = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        if (events.length > 0) {
          setFeaturedEvent(events[0]);
          setRightEvents(events.slice(1, 4));
        }
      } catch (error) {
        console.error('Ошибка загрузки:', error);
      }
    };
    
    loadEvents();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % bannerImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const formatDate = (timestamp) => {
    if (!timestamp) return { dayName: '', dayNumber: '', month: '' };
    if (timestamp.seconds) {
      const date = new Date(timestamp.seconds * 1000);
      const days = ['воскресенье', 'понедельник', 'вторник', 'среда', 'четверг', 'пятница', 'суббота'];
      return {
        dayName: days[date.getDay()],
        dayNumber: date.getDate(),
        month: date.toLocaleDateString('ru-RU', { month: 'long' })
      };
    }
    return { dayName: '', dayNumber: '', month: '' };
  };

  if (!featuredEvent) {
    return <div className="loading">Загрузка...</div>;
  }

  const featuredDate = formatDate(featuredEvent.date);

  return (
    <section className="featured-section">

      <div className="featured-left">
        <div className="featured-banner">
          <img 
            src={bannerImages[currentImageIndex]} 
            alt={featuredEvent.title}
            className="featured-image"
          />
          
          <div className="image-dots">
            {bannerImages.map((_, index) => (
              <button
                key={index}
                className={`dot ${index === currentImageIndex ? 'active' : ''}`}
                onClick={() => setCurrentImageIndex(index)}
              />
            ))}
          </div>

          <div className="featured-info">
            <span className="event-date-large">
              {featuredDate.dayName}, {featuredDate.dayNumber} {featuredDate.month}
            </span>
            <h2>{featuredEvent.title}</h2>
            <p className="event-description">
              {featuredEvent.description || 'Очарование, волшебство, обволакивающая чувственность'}
            </p>
            <div className="event-meta">
              <span className="event-day">{featuredDate.dayNumber} {featuredDate.month}</span>
              <span className="event-name">{featuredEvent.title}</span>
              <span className="event-venue">{featuredEvent.venue || featuredEvent.location || 'Buddha Bar'}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="featured-right">
        <h3>Ближайшие события</h3>
        <div className="upcoming-cards">
          {rightEvents.map(event => {
            const date = formatDate(event.date);
            return (
              <div key={event.id} className="upcoming-card">
                <img 
                  src={event.imageUrl || 'https://images.unsplash.com/photo-1571266028248-3716c02ad34d?w=400'} 
                  alt={event.title} 
                  className="upcoming-image" 
                />
                <div className="upcoming-card-content">
                  <span className="upcoming-day">{date.dayName}</span>
                  <h4>{event.title}</h4>
                  <p>{event.description?.substring(0, 50) || event.venue || 'Скоро'}</p>
                </div>
              </div>
            );
          })}
        </div>
        <Link to="/events" className="view-all-events">
          Фотоотчеты смотреть все 
        </Link>
      </div>
    </section>
  );
};

export default FeaturedEvent;
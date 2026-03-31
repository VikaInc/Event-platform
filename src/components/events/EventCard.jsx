import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaCalendarAlt, FaMapMarkerAlt, FaTag, FaHeart, FaRegHeart } from 'react-icons/fa';
import { db, auth } from '../../services/firebase';
import { collection, query, where, getDocs, addDoc, deleteDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import './EventCard.css';

const EventCard = ({ event }) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const checkFavorite = async () => {
      if (user && event) {
        try {
          const q = query(
            collection(db, 'favorites'),
            where('userId', '==', user.uid),
            where('eventId', '==', event.id)
          );
          const snapshot = await getDocs(q);
          setIsFavorite(!snapshot.empty);
        } catch (error) {
          console.error('Ошибка проверки избранного:', error);
        }
      }
    };
    checkFavorite();
  }, [user, event]);

  const toggleFavorite = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      alert('Войдите, чтобы добавить в избранное');
      return;
    }

    
    setIsFavorite(!isFavorite);

    try {
      if (!isFavorite) {
        await addDoc(collection(db, 'favorites'), {
          userId: user.uid,
          eventId: event.id,
          eventTitle: event.title,
          eventDate: event.date,
          eventImage: event.imageUrl,
          addedAt: new Date()
        });
      } else {
        const q = query(
          collection(db, 'favorites'),
          where('userId', '==', user.uid),
          where('eventId', '==', event.id)
        );
        const snapshot = await getDocs(q);
        const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
        await Promise.all(deletePromises);
      }
    } catch (error) {
      console.error('Ошибка с избранным:', error);
      setIsFavorite(isFavorite);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Скоро';
    if (timestamp.seconds) {
      const date = new Date(timestamp.seconds * 1000);
      return date.toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long'
      });
    }
    return String(timestamp);
  };

  return (
    <div className="event-card">
      <Link to={`/event/${event.id}`} className="event-card-link">
        <div className="event-card-image">
          <img 
            src={event.imageUrl || 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=400'} 
            alt={event.title} 
          />

          <div className="event-card-overlay">
            <h3 className="event-title-overlay">{event.title || 'Без названия'}</h3>
            <div className="event-details-overlay">
              <div className="event-info-overlay">
                <FaCalendarAlt className="icon-overlay" />
                <span>{formatDate(event.date)}</span>
              </div>
              <div className="event-info-overlay">
                <FaMapMarkerAlt className="icon-overlay" />
                <span>{event.location || event.venue || 'Ташкент'}</span>
              </div>
              <div className="event-info-overlay price-overlay">
                <FaTag className="icon-overlay" />
                <span>{event.price ? `${event.price} тенге` : 'Бесплатно'}</span>
              </div>
            </div>
          </div>
          
          <span className="event-category-overlay">{event.category || 'Концерт'}</span>

          {/* меегааа обновление сердечка без задержки */}
          <button 
            onClick={toggleFavorite}
            className={`favorite-btn ${isFavorite ? 'active' : ''}`}
            title={isFavorite ? 'Удалить из избранного' : 'Добавить в избранное'}
          >
            {isFavorite ? <FaHeart /> : <FaRegHeart />}
          </button>
        </div>
      </Link>
    </div>
  );
};

export default EventCard;
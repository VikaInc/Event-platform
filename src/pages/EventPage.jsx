import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { db, auth } from '../services/firebase';
import { 
  collection, 
  getDocs, 
  doc, 
  getDoc, 
  addDoc, 
  query, 
  where, 
  limit,     
  orderBy    
} from 'firebase/firestore';
import { FaCalendarAlt, FaMapMarkerAlt, FaTag, FaUser, FaStar, FaRegStar } from 'react-icons/fa';
import { onAuthStateChanged } from 'firebase/auth';
import './EventPage.css';

const EventPage = () => {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [similarEvents, setSimilarEvents] = useState([]);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [bookingTickets, setBookingTickets] = useState(1);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Не указана';
    if (timestamp?.seconds) {
      const date = new Date(timestamp.seconds * 1000);
      return date.toLocaleDateString('ru-RU', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
    return String(timestamp);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const loadEventData = async () => {
      try {
        const eventDoc = await getDoc(doc(db, 'events', id));
        if (eventDoc.exists()) {
          const eventData = { id: eventDoc.id, ...eventDoc.data() };
          setEvent(eventData);

          const similarQuery = query(
            collection(db, 'events'),
            where('category', '==', eventData.category),
            where('__name__', '!=', id),
            limit(3)
          );
          const similarSnapshot = await getDocs(similarQuery);
          const similarData = similarSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setSimilarEvents(similarData);

          const commentsQuery = query(
            collection(db, 'comments'),                 
            where('eventId', '==', id),
            orderBy('createdAt', 'desc')
          );
      
          const commentsSnapshot = await getDocs(commentsQuery);
          const commentsData = commentsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setComments(commentsData);
        }
      } catch (error) {
        console.error('Ошибка загрузки:', error);
      } finally {
        setLoading(false);
      }
    };

    loadEventData();
  }, [id]);

  const handleBooking = async () => {
    if (!user) {
      alert('Войдите в систему, чтобы забронировать билет');
      return;
    }

    try {
      const bookingData = {
        userId: user.uid,
        customerName: user.displayName || user.email,
        customerEmail: user.email,
        eventId: event.id,
        eventTitle: event.title,
        eventDate: event.date,
        ticketsCount: bookingTickets,
        totalAmount: event.price * bookingTickets,
        status: 'pending',
        bookingDate: new Date()
      };

      await addDoc(collection(db, 'bookings'), bookingData);
      setBookingSuccess(true);
      setTimeout(() => setBookingSuccess(false), 3000);
      setShowBookingForm(false);
    } catch (error) {
      console.error('Ошибка бронирования:', error);
      alert('Ошибка при бронировании');
    }
  };

  if (loading) return <div className="loading">Загрузка...</div>;
  if (!event) return <div className="error">Мероприятие не найдено</div>;

  return (
    <div className="event-page">
      {bookingSuccess && (
        <div className="success-message">
           Билет успешно забронирован! Перейдите в личный кабинет для подтверждения.
        </div>
      )}

      <div className="event-header">
        <div className="event-image-large">
          <img src={event.imageUrl || 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=1200'} alt={event.title} />
        </div>
        <div className="event-info-large">
          <h1>{event.title}</h1>
          <p className="event-description">{event.description}</p>
          
          <div className="event-details">
            <div className="detail-item">
              <FaCalendarAlt className="detail-icon" />
              <span>{formatDate(event.date)}</span>
            </div>
            <div className="detail-item">
              <FaMapMarkerAlt className="detail-icon" />
              <span>{event.location}</span>
            </div>
            <div className="detail-item">
              <FaTag className="detail-icon" />
              <span className="event-price">{event.price} тенге</span>
            </div>
          </div>

          <div className="booking-section">
            {!showBookingForm ? (
              <button 
                className="book-btn"
                onClick={() => setShowBookingForm(true)}
              >
                Забронировать билет
              </button>
            ) : (
              <div className="booking-form">
                <h3>Количество билетов</h3>
                <div className="ticket-counter">
                  <button 
                    onClick={() => setBookingTickets(Math.max(1, bookingTickets - 1))}
                    className="counter-btn"
                  >-</button>
                  <span className="ticket-count">{bookingTickets}</span>
                  <button 
                    onClick={() => setBookingTickets(bookingTickets + 1)}
                    className="counter-btn"
                  >+</button>
                </div>
                <div className="booking-total">
                  Итого: <span className="total-price">{event.price * bookingTickets} тенге</span>
                </div>
                <div className="booking-actions">
                  <button onClick={handleBooking} className="confirm-btn">
                    Подтвердить
                  </button>
                  <button onClick={() => setShowBookingForm(false)} className="cancel-btn">
                    Отмена
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {similarEvents.length > 0 && (
        <div className="similar-events">
          <h2>Похожие мероприятия</h2>
          <div className="similar-grid">
            {similarEvents.map(similar => (
              <Link to={`/event/${similar.id}`} key={similar.id} className="similar-card">
                <img src={similar.imageUrl} alt={similar.title} />
                <h3>{similar.title}</h3>
                <p>{formatDate(similar.date)}</p>
                <span className="similar-price">{similar.price} тенге</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="comments-section">
        <h2>Отзывы и комментарии</h2>
        {comments.length === 0 ? (
          <p className="no-comments">Пока нет комментариев</p>
        ) : (
          <div className="comments-list">
            {comments.map(comment => (
              <div key={comment.id} className="comment">
                <div className="comment-header">
                  <span className="comment-author">{comment.userName}</span>
                  <span className="comment-date">{formatDate(comment.createdAt)}</span>
                </div>
                <div className="comment-rating">
                  {[...Array(5)].map((_, i) => (
                    i < (comment.rating || 5) ? 
                      <FaStar key={i} className="star filled" /> : 
                      <FaRegStar key={i} className="star" />
                  ))}
                </div>
                <p className="comment-text">{comment.text}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
                        
export default EventPage;
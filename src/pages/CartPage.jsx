import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { db, auth } from '../services/firebase';
import { collection, query, where, getDocs, deleteDoc, doc, addDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { FaTrash, FaTicketAlt, FaCalendarAlt, FaHeart, FaMapMarkerAlt, FaTag, FaCheckCircle } from 'react-icons/fa';
import './CartPage.css';

const CartPage = () => {
  const [cartItems, setCartItems] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookingId, setBookingId] = useState(null);
  const [ticketCount, setTicketCount] = useState(1);
  const [showBookingForm, setShowBookingForm] = useState(null);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const loadCart = async () => {
      if (user) {
        try {
          const q = query(
            collection(db, 'favorites'),
            where('userId', '==', user.uid)
          );
          const snapshot = await getDocs(q);
          
          const items = await Promise.all(snapshot.docs.map(async (favDoc) => {
            const favData = favDoc.data();
            
            const eventDoc = await getDocs(query(
              collection(db, 'events'),
              where('__name__', '==', favData.eventId)
            ));
            
            let eventPrice = 0;
            if (!eventDoc.empty) {
              const eventData = eventDoc.docs[0].data();
              eventPrice = eventData.price || 0;
            }
            
            return {
              id: favDoc.id,
              ...favData,
              price: eventPrice
            };
          }));
          
          setCartItems(items);
        } catch (error) {
          console.error('Ошибка загрузки корзины:', error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    loadCart();
  }, [user]);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const removeFromCart = async (itemId) => {
    try {
      await deleteDoc(doc(db, 'favorites', itemId));
      setCartItems(cartItems.filter(item => item.id !== itemId));
      showNotification('Товар удален из корзины', 'info');
    } catch (error) {
      console.error('Ошибка удаления:', error);
      showNotification('Ошибка при удалении', 'error');
    }
  };

  const handleBooking = async (item) => {
    try {
      setBookingId(item.id);
      
      await addDoc(collection(db, 'bookings'), {
        userId: user.uid,
        customerName: user.displayName || user.email,
        customerEmail: user.email,
        eventId: item.eventId,
        eventTitle: item.eventTitle,
        eventDate: item.eventDate,
        ticketsCount: ticketCount,
        totalAmount: item.price * ticketCount,
        status: 'pending',
        bookingDate: new Date()
      });

      await deleteDoc(doc(db, 'favorites', item.id));
      
      setCartItems(cartItems.filter(cartItem => cartItem.id !== item.id));
      setShowBookingForm(null);
      setTicketCount(1);
      
      showNotification('Билет успешно забронирован! Отслеживайте в профиле');
    } catch (error) {
      console.error('Ошибка бронирования:', error);
      showNotification('Ошибка при бронировании', 'error');
    } finally {
      setBookingId(null);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Скоро';
    if (timestamp?.seconds) {
      const date = new Date(timestamp.seconds * 1000);
      return date.toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
    return String(timestamp);
  };

  if (!user) {
    return (
      <div className="cart-container">
        <div className="cart-empty-state">
          <FaHeart className="empty-icon" />
          <h2>Войдите в аккаунт</h2>
          <p>Чтобы увидеть избранное, нужно авторизоваться</p>
          <Link to="/login" className="cart-action-btn">Войти</Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return <div className="cart-loading">Загрузка...</div>;
  }

  return (
    <div className="cart-container">
      {notification && (
        <div className={`cart-notification cart-notification-${notification.type}`}>
          <FaCheckCircle className="cart-notification-icon" />
          <span className="cart-notification-message">{notification.message}</span>
        </div>
      )}

      <div className="cart-header">
        <h1>Корзина</h1>
        <span className="cart-count">{cartItems.length} {cartItems.length === 1 ? 'товар' : 'товаров'}</span>
      </div>

      {cartItems.length === 0 ? (
        <div className="cart-empty-state">
          <FaHeart className="empty-icon" />
          <h2>Корзина пуста</h2>
          <p>Добавляйте понравившиеся мероприятия в избранное</p>
          <Link to="/" className="cart-action-btn">К мероприятиям</Link>
        </div>
      ) : (
        <div className="cart-items-list">
          {cartItems.map(item => (
            <div key={item.id} className="cart-item">
              <div className="cart-item-image">
                <img 
                  src={item.eventImage || 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=200'} 
                  alt={item.eventTitle}
                />
              </div>
              
              <div className="cart-item-info">
                <div className="cart-item-header">
                  <h3>{item.eventTitle}</h3>
                  <button 
                    onClick={() => removeFromCart(item.id)}
                    className="cart-item-remove"
                    title="Удалить"
                  >
                    <FaTrash />
                  </button>
                </div>
                
                <div className="cart-item-details">
                  <p className="cart-item-date">
                    <FaCalendarAlt /> {formatDate(item.eventDate)}
                  </p>
                  <p className="cart-item-location">
                    <FaMapMarkerAlt /> Алматы
                  </p>
                  <p className="cart-item-price">
                    <FaTag /> {item.price.toLocaleString()} тенге
                  </p>
                </div>

                {showBookingForm === item.id ? (
                  <div className="booking-form">
                    <h4>Количество билетов</h4>
                    <div className="ticket-counter">
                      <button 
                        onClick={() => setTicketCount(Math.max(1, ticketCount - 1))}
                        className="counter-btn"
                      >−</button>
                      <span className="ticket-count">{ticketCount}</span>
                      <button 
                        onClick={() => setTicketCount(ticketCount + 1)}
                        className="counter-btn"
                      >+</button>
                    </div>
                    <div className="booking-total">
                      Итого: <span className="total-price">{(item.price * ticketCount).toLocaleString()} тенге</span>
                    </div>
                    <div className="booking-actions">
                      <button 
                        onClick={() => handleBooking(item)}
                        disabled={bookingId === item.id}
                        className="confirm-btn"
                      >
                        {bookingId === item.id ? 'Бронирование...' : 'Подтвердить'}
                      </button>
                      <button 
                        onClick={() => {
                          setShowBookingForm(null);
                          setTicketCount(1);
                        }}
                        className="cancel-btn"
                      >
                        Отмена
                      </button>
                    </div>
                  </div>
                ) : (
                  <button 
                    onClick={() => setShowBookingForm(item.id)}
                    className="cart-item-book"
                  >
                    <FaTicketAlt /> Забронировать
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CartPage;
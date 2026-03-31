import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { auth, db } from '../services/firebase';
import { 
  doc, getDoc, updateDoc, collection, query, where, getDocs, deleteDoc 
} from 'firebase/firestore';
import { 
  FaUser, FaEnvelope, FaPhone, FaCalendar, FaEdit, FaSave, FaTimes, 
  FaHeart, FaStar, FaTicketAlt, FaCrown, FaSignOutAlt, FaTrash, 
  FaMapMarkerAlt, FaCalendarAlt, FaTag
} from 'react-icons/fa';
import { onAuthStateChanged } from 'firebase/auth';
import './ProfilePage.css';

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [bookings, setBookings] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [comments, setComments] = useState([]);
  const [formData, setFormData] = useState({
    displayName: '',
    phone: ''
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const loadUserData = async () => {
      if (user) {
        try {
          console.log('Загрузка данных для пользователя:', user.uid);
          
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            setUserData(data);
            setFormData({
              displayName: data.displayName || '',
              phone: data.phone || ''
            });
          }

          const bookingsQuery = query(
            collection(db, 'bookings'),
            where('userId', '==', user.uid)
          );
          const bookingsSnapshot = await getDocs(bookingsQuery);
          const bookingsData = [];
          bookingsSnapshot.forEach(doc => {
            bookingsData.push({ id: doc.id, ...doc.data() });
          });
          console.log('Найдено бронирований:', bookingsData.length);
          setBookings(bookingsData);

          const favoritesQuery = query(
            collection(db, 'favorites'),
            where('userId', '==', user.uid)
          );
          const favoritesSnapshot = await getDocs(favoritesQuery);
          const favoritesData = [];
          favoritesSnapshot.forEach(doc => {
            favoritesData.push({ id: doc.id, ...doc.data() });
          });
          console.log('Найдено избранных:', favoritesData.length);
          setFavorites(favoritesData);

          const commentsQuery = query(
            collection(db, 'comments'),
            where('userId', '==', user.uid)
          );
          const commentsSnapshot = await getDocs(commentsQuery);
          const commentsData = [];
          commentsSnapshot.forEach(doc => {
            commentsData.push({ id: doc.id, ...doc.data() });
          });
          setComments(commentsData);

        } catch (error) {
          console.error('Ошибка загрузки данных:', error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    loadUserData();
  }, [user]);

  const handleEdit = () => setEditing(true);
  
  const handleCancel = () => {
    setFormData({
      displayName: userData?.displayName || '',
      phone: userData?.phone || ''
    });
    setEditing(false);
  };

  const handleSave = async () => {
    try {
      if (user) {
        await updateDoc(doc(db, 'users', user.uid), {
          displayName: formData.displayName,
          phone: formData.phone
        });
        setUserData({ ...userData, ...formData });
        setEditing(false);
      }
    } catch (error) {
      console.error('Ошибка обновления:', error);
    }
  };

  const handleLogout = async () => {
    await auth.signOut();
  };

  const handleDeleteComment = async (commentId) => {
    if (window.confirm('Удалить комментарий?')) {
      await deleteDoc(doc(db, 'comments', commentId));
      setComments(comments.filter(c => c.id !== commentId));
    }
  };

  const handleRemoveFavorite = async (favoriteId) => {
    await deleteDoc(doc(db, 'favorites', favoriteId));
    setFavorites(favorites.filter(f => f.id !== favoriteId));
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Не указана';
    if (timestamp?.seconds) {
      const date = new Date(timestamp.seconds * 1000);
      return date.toLocaleDateString('ru-RU', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
    return String(timestamp);
  };

  const getStatusText = (status) => {
    switch(status) {
      case 'pending': return 'Ожидает';
      case 'confirmed': return 'Подтверждено';
      case 'cancelled': return 'Отменено';
      case 'completed': return 'Завершено';
      default: return status;
    }
  };

  if (loading) {
    return <div className="profile-loading">Загрузка...</div>;
  }

  if (!user) {
    return (
      <div className="profile-container">
        <div className="profile-empty-state">
          <FaUser className="empty-icon" />
          <h2>Войдите в аккаунт</h2>
          <p>Чтобы просмотреть профиль, необходимо авторизоваться</p>
          <Link to="/login" className="profile-action-btn">Войти</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="profile-cover">
          <div className="profile-avatar">
            <span className="avatar-letter">
              {userData?.displayName?.charAt(0) || user?.email?.charAt(0) || 'U'}
            </span>
          </div>
          <div className="profile-title">
            <h1>{userData?.displayName || 'Пользователь'}</h1>
            <p>{user?.email}</p>
          </div>
          <button onClick={handleLogout} className="logout-btn" title="Выйти">
            <FaSignOutAlt />
          </button>
        </div>
      </div>

      <div className="profile-tabs">
        <button 
          className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          <FaUser /> Профиль
        </button>
        <button 
          className={`tab-btn ${activeTab === 'bookings' ? 'active' : ''}`}
          onClick={() => setActiveTab('bookings')}
        >
          <FaTicketAlt /> Бронирования ({bookings.length})
        </button>
        <button 
          className={`tab-btn ${activeTab === 'favorites' ? 'active' : ''}`}
          onClick={() => setActiveTab('favorites')}
        >
          <FaHeart /> Избранное ({favorites.length})
        </button>
        <button 
          className={`tab-btn ${activeTab === 'comments' ? 'active' : ''}`}
          onClick={() => setActiveTab('comments')}
        >
          <FaStar /> Отзывы ({comments.length})
        </button>
        {userData?.role === 'admin' && (
          <Link to="/admin" className="tab-btn admin-tab">
            <FaCrown /> Админка
          </Link>
        )}
      </div>

      <div className="profile-content">
        {activeTab === 'profile' && (
          <div className="profile-section">
            <div className="section-header">
              <h2>Мои данные</h2>
              {!editing ? (
                <button onClick={handleEdit} className="edit-profile-btn">
                  <FaEdit /> Редактировать
                </button>
              ) : (
                <div className="edit-actions">
                  <button onClick={handleSave} className="save-profile-btn">
                    <FaSave /> Сохранить
                  </button>
                  <button onClick={handleCancel} className="cancel-profile-btn">
                    <FaTimes /> Отмена
                  </button>
                </div>
              )}
            </div>

            <div className="info-grid">
              <div className="info-card">
                <FaUser className="info-icon" />
                <div className="info-content">
                  <span className="info-label">Имя</span>
                  {editing ? (
                    <input
                      type="text"
                      value={formData.displayName}
                      onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                      className="info-input"
                      placeholder="Введите имя"
                    />
                  ) : (
                    <span className="info-value">{userData?.displayName || 'Не указано'}</span>
                  )}
                </div>
              </div>

              <div className="info-card">
                <FaEnvelope className="info-icon" />
                <div className="info-content">
                  <span className="info-label">Email</span>
                  <span className="info-value">{user?.email}</span>
                </div>
              </div>

              <div className="info-card">
                <FaPhone className="info-icon" />
                <div className="info-content">
                  <span className="info-label">Телефон</span>
                  {editing ? (
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="info-input"
                      placeholder="+7 (___) ___-__-__"
                    />
                  ) : (
                    <span className="info-value">{userData?.phone || 'Не указан'}</span>
                  )}
                </div>
              </div>

              <div className="info-card">
                <FaCalendar className="info-icon" />
                <div className="info-content">
                  <span className="info-label">На сайте с</span>
                  <span className="info-value">
                    {userData?.createdAt 
                      ? new Date(userData.createdAt.seconds * 1000).toLocaleDateString('ru-RU', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })
                      : 'Недавно'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'bookings' && (
          <div className="profile-section">
            <h2>Мои бронирования</h2>
            {bookings.length === 0 ? (
              <div className="empty-state">
                <FaTicketAlt className="empty-icon" />
                <h3>У вас пока нет бронирований</h3>
                <p>Перейдите в корзину и забронируйте билеты</p>
                <Link to="/cart" className="action-btn">В корзину</Link>
              </div>
            ) : (
              <div className="bookings-list">
                {bookings.map(booking => (
                  <div key={booking.id} className="booking-item">
                    <div className="booking-item-header">
                      <h3>{booking.eventTitle}</h3>
                      <span className={`booking-status status-${booking.status}`}>
                        {getStatusText(booking.status)}
                      </span>
                    </div>
                    <div className="booking-item-details">
                      <p><FaCalendarAlt /> {formatDate(booking.eventDate)}</p>
                      <p><FaTicketAlt /> Билетов: {booking.ticketsCount}</p>
                      <p className="booking-price">Сумма: {booking.totalAmount?.toLocaleString()} тенге</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'favorites' && (
          <div className="profile-section">
            <h2>Избранное</h2>
            {favorites.length === 0 ? (
              <div className="empty-state">
                <FaHeart className="empty-icon" />
                <h3>В избранном пока пусто</h3>
                <p>Добавляйте понравившиеся мероприятия с помощью сердечка ❤️</p>
                <Link to="/" className="action-btn">К мероприятиям</Link>
              </div>
            ) : (
              <div className="favorites-grid">
                {favorites.map(item => (
                  <div key={item.id} className="favorite-card">
                    <img 
                      src={item.eventImage || 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=400'} 
                      alt={item.eventTitle}
                    />
                    <div className="favorite-card-content">
                      <h4>{item.eventTitle}</h4>
                      <p><FaCalendarAlt /> {formatDate(item.eventDate)}</p>
                      <div className="favorite-card-actions">
                        <Link to={`/event/${item.eventId}`} className="favorite-view-btn">
                          Подробнее
                        </Link>
                        <button 
                          onClick={() => handleRemoveFavorite(item.id)}
                          className="favorite-remove-btn"
                          title="Удалить"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'comments' && (
          <div className="profile-section">
            <h2>Мои отзывы</h2>
            {comments.length === 0 ? (
              <div className="empty-state">
                <FaStar className="empty-icon" />
                <h3>Вы еще не оставили отзывов</h3>
                <p>Поделитесь впечатлениями о посещенных мероприятиях</p>
                <Link to="/" className="action-btn">К мероприятиям</Link>
              </div>
            ) : (
              <div className="comments-list">
                {comments.map(comment => (
                  <div key={comment.id} className="profile-comment-item">
                    <div className="profile-comment-header">
                      <span className="profile-comment-event">{comment.eventTitle}</span>
                      <span className="profile-comment-date">{formatDate(comment.createdAt)}</span>
                    </div>
                    <p className="profile-comment-text">{comment.text}</p>
                    <div className="profile-comment-actions">
                      <button 
                        onClick={() => handleDeleteComment(comment.id)}
                        className="profile-comment-delete"
                      >
                        <FaTrash /> Удалить
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { db, auth } from '../services/firebase';
import { 
  collection, 
  getDocs, 
  doc, 
  deleteDoc, 
  updateDoc, 
  addDoc,
  getDoc,
  query,
  orderBy,
  limit
} from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { 
  FaEdit, FaTrash, FaPlus, FaSave, FaTimes, FaCrown,
  FaUsers, FaTicketAlt, FaCalendarAlt, FaStar, FaCheck,
  FaBan, FaUserCog, FaChartBar, FaComments
} from 'react-icons/fa';
import './AdminPage.css';

const AdminPage = () => {
  const [events, setEvents] = useState([]);
  const [users, setUsers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('stats');
  const [editingEvent, setEditingEvent] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [stats, setStats] = useState({
    totalEvents: 0,
    totalUsers: 0,
    totalBookings: 0,
    totalComments: 0,
    recentBookings: []
  });
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    date: '',
    location: '',
    category: 'concert',
    imageUrl: ''
  });

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

  // Проверка админа
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        setIsAdmin(userDoc.data()?.role === 'admin');
      }
    });
    return () => unsubscribe();
  }, []);

  // Загрузка всех данных
  useEffect(() => {
    const loadData = async () => {
      try {
        const eventsSnapshot = await getDocs(collection(db, 'events'));
        const eventsData = eventsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setEvents(eventsData);

        const usersSnapshot = await getDocs(collection(db, 'users'));
        const usersData = usersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setUsers(usersData);

        const bookingsSnapshot = await getDocs(collection(db, 'bookings'));
        const bookingsData = bookingsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setBookings(bookingsData);

        const commentsSnapshot = await getDocs(collection(db, 'comments'));
        const commentsData = commentsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setComments(commentsData);

        setStats({
          totalEvents: eventsData.length,
          totalUsers: usersData.length,
          totalBookings: bookingsData.length,
          totalComments: commentsData.length,
          recentBookings: bookingsData.slice(0, 5)
        });

      } catch (error) {
        console.error('Ошибка загрузки:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Изменение роли пользователя
  const handleRoleChange = async (userId, currentRole) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    if (window.confirm(`Сделать пользователя ${newRole === 'admin' ? 'админом' : 'обычным пользователем'}?`)) {
      await updateDoc(doc(db, 'users', userId), { role: newRole });
      setUsers(users.map(u => 
        u.id === userId ? { ...u, role: newRole } : u
      ));
    }
  };

  // Изменение статуса бронирования
  const handleBookingStatus = async (bookingId, currentStatus) => {
    const statuses = ['pending', 'confirmed', 'cancelled', 'completed'];
    const nextStatus = statuses[(statuses.indexOf(currentStatus) + 1) % statuses.length];
    await updateDoc(doc(db, 'bookings', bookingId), { status: nextStatus });
    setBookings(bookings.map(b => 
      b.id === bookingId ? { ...b, status: nextStatus } : b
    ));
  };

  // Удаление комментария (модерация)
  const handleDeleteComment = async (commentId) => {
    if (window.confirm('Удалить комментарий?')) {
      await deleteDoc(doc(db, 'comments', commentId));
      setComments(comments.filter(c => c.id !== commentId));
    }
  };

  const handleDeleteEvent = async (id) => {
    if (window.confirm('Удалить мероприятие?')) {
      await deleteDoc(doc(db, 'events', id));
      setEvents(events.filter(event => event.id !== id));
    }
  };

  const handleEditEvent = (event) => {
    setEditingEvent(event.id);
    // Форматируем дату для input type="date"
    let dateValue = '';
    if (event.date?.seconds) {
      const d = new Date(event.date.seconds * 1000);
      dateValue = d.toISOString().split('T')[0];
    } else if (event.date) {
      dateValue = event.date;
    }
    
    setFormData({
      title: event.title || '',
      description: event.description || '',
      price: event.price || '',
      date: dateValue,
      location: event.location || '',
      category: event.category || 'concert',
      imageUrl: event.imageUrl || ''
    });
  };

  const handleSaveEvent = async (id) => {
    // Преобразуем строку даты в timestamp для сортировки
    const eventDate = formData.date ? new Date(formData.date) : new Date();
    
    await updateDoc(doc(db, 'events', id), {
      title: formData.title,
      description: formData.description,
      price: Number(formData.price),
      date: eventDate,
      location: formData.location,
      category: formData.category,
      imageUrl: formData.imageUrl
    });
    
    setEditingEvent(null);
    setEvents(events.map(e => 
      e.id === id ? { 
        ...e, 
        ...formData, 
        price: Number(formData.price),
        date: eventDate 
      } : e
    ));
  };

  const handleAddEvent = async () => {
    // Преобразуем строку даты в timestamp для сортировки
    const eventDate = formData.date ? new Date(formData.date) : new Date();
    
    const docRef = await addDoc(collection(db, 'events'), {
      title: formData.title,
      description: formData.description,
      price: Number(formData.price),
      date: eventDate,
      location: formData.location,
      category: formData.category,
      imageUrl: formData.imageUrl,
      createdAt: new Date()
    });
    
    setEvents([...events, { 
      id: docRef.id, 
      ...formData, 
      price: Number(formData.price),
      date: eventDate 
    }]);
    
    setShowAddForm(false);
    setFormData({
      title: '',
      description: '',
      price: '',
      date: '',
      location: '',
      category: 'concert',
      imageUrl: ''
    });
  };

  if (!isAdmin) {
    return (
      <div className="admin-access-denied">
        <FaCrown className="denied-icon" />
        <h2>Доступ запрещен</h2>
        <p>Эта страница только для администраторов</p>
        <Link to="/" className="back-home">Вернуться на главную</Link>
      </div>
    );
  }

  if (loading) {
    return <div className="admin-loading">Загрузка...</div>;
  }

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1>Админ-панель</h1>
        <div className="admin-tabs">
          <button className={`admin-tab ${activeTab === 'stats' ? 'active' : ''}`} onClick={() => setActiveTab('stats')}>
            <FaChartBar /> Статистика
          </button>
          <button className={`admin-tab ${activeTab === 'events' ? 'active' : ''}`} onClick={() => setActiveTab('events')}>
            <FaCalendarAlt /> Мероприятия
          </button>
          <button className={`admin-tab ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('users')}>
            <FaUsers /> Пользователи
          </button>
          <button className={`admin-tab ${activeTab === 'bookings' ? 'active' : ''}`} onClick={() => setActiveTab('bookings')}>
            <FaTicketAlt /> Бронирования
          </button>
          <button className={`admin-tab ${activeTab === 'comments' ? 'active' : ''}`} onClick={() => setActiveTab('comments')}>
            <FaComments /> Модерация
          </button>
        </div>
      </div>

      {/* СТАТИСТИКА */}
      {activeTab === 'stats' && (
        <div className="stats-section">
          <div className="stats-grid">
            <div className="stat-card">
              <FaCalendarAlt className="stat-icon" />
              <div className="stat-info">
                <span className="stat-value">{stats.totalEvents}</span>
                <span className="stat-label">Мероприятий</span>
              </div>
            </div>
            <div className="stat-card">
              <FaUsers className="stat-icon" />
              <div className="stat-info">
                <span className="stat-value">{stats.totalUsers}</span>
                <span className="stat-label">Пользователей</span>
              </div>
            </div>
            <div className="stat-card">
              <FaTicketAlt className="stat-icon" />
              <div className="stat-info">
                <span className="stat-value">{stats.totalBookings}</span>
                <span className="stat-label">Бронирований</span>
              </div>
            </div>
            <div className="stat-card">
              <FaComments className="stat-icon" />
              <div className="stat-info">
                <span className="stat-value">{stats.totalComments}</span>
                <span className="stat-label">Комментариев</span>
              </div>
            </div>
          </div>

          {/* ПОСЛЕДНИЕ БРОНИРОВАНИЯ */}
          <div className="recent-section">
            <h3>Последние бронирования</h3>
            <div className="recent-list">
              {stats.recentBookings.map(booking => (
                <div key={booking.id} className="recent-item">
                  <span className="recent-user">{booking.customerName || 'Пользователь'}</span>
                  <span className="recent-event">{booking.eventTitle || 'Мероприятие'}</span>
                  <span className={`recent-status status-${booking.status}`}>
                    {booking.status === 'pending' ? 'Ожидание' :
                     booking.status === 'confirmed' ? 'Подтверждено' :
                     booking.status === 'cancelled' ? 'Отменено' :
                     booking.status === 'completed' ? 'Завершено' : 'Ожидание'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* УПРАВЛЕНИЕ МЕРОПРИЯТИЯМИ */}
      {activeTab === 'events' && (
        <div className="admin-section">
          <div className="section-header">
            <h2>Мероприятия</h2>
            <button className="add-btn" onClick={() => setShowAddForm(true)}>
              <FaPlus /> Добавить
            </button>
          </div>

          {showAddForm && (
            <div className="edit-form">
              <h3>Новое мероприятие</h3>
              <input 
                type="text" 
                placeholder="Название" 
                value={formData.title} 
                onChange={(e) => setFormData({...formData, title: e.target.value})} 
              />
              <textarea 
                placeholder="Описание" 
                value={formData.description} 
                onChange={(e) => setFormData({...formData, description: e.target.value})} 
              />
              <input 
                type="number" 
                placeholder="Цена (тенге)" 
                value={formData.price} 
                onChange={(e) => setFormData({...formData, price: e.target.value})} 
              />
              <input 
                type="date" 
                placeholder="Дата" 
                value={formData.date} 
                onChange={(e) => setFormData({...formData, date: e.target.value})} 
              />
              <input 
                type="text" 
                placeholder="Место" 
                value={formData.location} 
                onChange={(e) => setFormData({...formData, location: e.target.value})} 
              />
              <select 
                value={formData.category} 
                onChange={(e) => setFormData({...formData, category: e.target.value})}
              >
                <option value="concert">Концерт</option>
                <option value="exhibition">Выставка</option>
                <option value="party">Вечеринка</option>
                <option value="workshop">Мастер-класс</option>
              </select>
              <input 
                type="text" 
                placeholder="Ссылка на картинку" 
                value={formData.imageUrl} 
                onChange={(e) => setFormData({...formData, imageUrl: e.target.value})} 
              />
              <div className="form-actions">
                <button onClick={handleAddEvent} className="save-btn">Сохранить</button>
                <button onClick={() => setShowAddForm(false)} className="cancel-btn">Отмена</button>
              </div>
            </div>
          )}

          <div className="admin-table">
            <table>
              <thead>
                <tr>
                  <th>Название</th>
                  <th>Цена</th>
                  <th>Дата</th>
                  <th>Место</th>
                  <th>Действия</th>
                </tr>
              </thead>
              <tbody>
                {events.map(event => (
                  <tr key={event.id}>
                    {editingEvent === event.id ? (
                      <>
                        <td><input value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} /></td>
                        <td><input value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} /></td>
                        <td><input type="date" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} /></td>
                        <td><input value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} /></td>
                        <td className="actions">
                          <button onClick={() => handleSaveEvent(event.id)} className="icon-btn save"><FaSave /></button>
                          <button onClick={() => setEditingEvent(null)} className="icon-btn cancel"><FaTimes /></button>
                        </td>
                      </>
                    ) : (
                      <>
                        <td>{event.title}</td>
                        <td>{event.price} тенге</td>
                        <td>{formatDate(event.date)}</td>
                        <td>{event.location}</td>
                        <td className="actions">
                          <button onClick={() => handleEditEvent(event)} className="icon-btn edit"><FaEdit /></button>
                          <button onClick={() => handleDeleteEvent(event.id)} className="icon-btn delete"><FaTrash /></button>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* УПРАВЛЕНИЕ ПОЛЬЗОВАТЕЛЯМИ */}
      {activeTab === 'users' && (
        <div className="admin-section">
          <h2>Пользователи</h2>
          <div className="admin-table">
            <table>
              <thead>
                <tr>
                  <th>Имя</th>
                  <th>Email</th>
                  <th>Роль</th>
                  <th>Телефон</th>
                  <th>Действия</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id}>
                    <td>{user.displayName || '—'}</td>
                    <td>{user.email}</td>
                    <td>
                      <span className={`role-badge ${user.role}`}>
                        {user.role === 'admin' ? 'Админ' : 'Пользователь'}
                      </span>
                    </td>
                    <td>{user.phone || '—'}</td>
                    <td>
                      <button 
                        onClick={() => handleRoleChange(user.id, user.role)}
                        className="role-btn"
                        title="Изменить роль"
                      >
                        <FaUserCog />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* УПРАВЛЕНИЕ БРОНИРОВАНИЯМИ */}
      {activeTab === 'bookings' && (
        <div className="admin-section">
          <h2>Бронирования</h2>
          <div className="admin-table">
            <table>
              <thead>
                <tr>
                  <th>Пользователь</th>
                  <th>Мероприятие</th>
                  <th>Билетов</th>
                  <th>Сумма</th>
                  <th>Статус</th>
                  <th>Действия</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map(booking => (
                  <tr key={booking.id}>
                    <td>{booking.customerName || booking.userId}</td>
                    <td>{booking.eventTitle || '—'}</td>
                    <td>{booking.ticketsCount || 1}</td>
                    <td>{booking.totalAmount || 0} тенге</td>
                    <td>
                      <span className={`status-badge ${booking.status}`}>
                        {booking.status === 'pending' ? 'Ожидание' :
                         booking.status === 'confirmed' ? 'Подтверждено' :
                         booking.status === 'cancelled' ? 'Отменено' :
                         booking.status === 'completed' ? 'Завершено' : 'Ожидание'}
                      </span>
                    </td>
                    <td>
                      <button 
                        onClick={() => handleBookingStatus(booking.id, booking.status)}
                        className="status-btn"
                        title="Изменить статус"
                      >
                        <FaCheck />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* МОДЕРАЦИЯ КОММЕНТАРИЕВ */}
      {activeTab === 'comments' && (
        <div className="admin-section">
          <h2>Модерация комментариев</h2>
          <div className="comments-list">
            {comments.map(comment => (
              <div key={comment.id} className="comment-item">
                <div className="comment-header">
                  <span className="comment-author">{comment.userName || 'Пользователь'}</span>
                  <span className="comment-event">на {comment.eventTitle || 'мероприятии'}</span>
                  <span className="comment-date">{formatDate(comment.createdAt)}</span>
                </div>
                <p className="comment-text">{comment.text}</p>
                <div className="comment-actions">
                  <button 
                    onClick={() => handleDeleteComment(comment.id)}
                    className="delete-comment-btn"
                  >
                    <FaTrash /> Удалить
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;
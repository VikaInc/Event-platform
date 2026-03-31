import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaSearch, FaUser, FaShoppingCart, FaSun, FaMoon, FaCrown, FaSignOutAlt, FaTimes, FaCalendarAlt, FaMapMarkerAlt } from 'react-icons/fa';
import { useTheme } from '../../context/ThemeContext';
import { auth, db } from '../../services/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, collection, query, where, onSnapshot, getDocs } from 'firebase/firestore';
import './Header.css';

const Header = ({ onOpenLogin }) => {
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  
  // Поиск
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [eventsCache, setEventsCache] = useState([]);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const searchRef = useRef(null);

  // Загружаем события один раз
  useEffect(() => {
    const loadEvents = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'events'));
        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setEventsCache(data);
      } catch (error) {
        console.error('Ошибка загрузки событий:', error);
      }
    };
    loadEvents();
  }, []);

  // Обновляем позицию dropdown
  const updateDropdownPosition = () => {
    if (searchRef.current) {
      const rect = searchRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + 8,
        left: rect.left,
        width: rect.width
      });
    }
  };

  // Закрытие поиска при клике вне
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Следим за пользователем
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            setUserData(data);
            setIsAdmin(data?.role === 'admin');
          }
        } catch (error) {
          console.error('Ошибка загрузки данных:', error);
        }
      } else {
        setUserData(null);
        setIsAdmin(false);
        setCartCount(0);
      }
    });
    return () => unsubscribe();
  }, []);

  // Счетчик корзины
  useEffect(() => {
    let unsubscribeFavorites = () => {};

    const setupFavoritesListener = async () => {
      if (user) {
        const q = query(
          collection(db, 'favorites'),
          where('userId', '==', user.uid)
        );
        
        unsubscribeFavorites = onSnapshot(q, (snapshot) => {
          setCartCount(snapshot.size);
        });
      }
    };

    setupFavoritesListener();
    return () => unsubscribeFavorites();
  }, [user]);

  // 🔥 ПОИСК с debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.length >= 2) {
        performSearch();
      } else {
        setSearchResults([]);
        setShowResults(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const performSearch = () => {
    const query = searchQuery.toLowerCase();

    const results = eventsCache
      .filter(event =>
        event.title?.toLowerCase().includes(query) ||
        event.location?.toLowerCase().includes(query) ||
        event.description?.toLowerCase().includes(query)
      )
      .slice(0, 5)
      .map(event => ({
        id: event.id,
        type: 'event',
        title: event.title,
        subtitle: event.location || 'Место не указано',
        imageUrl: event.imageUrl,
        price: event.price,
        date: event.date,
        link: `/event/${event.id}`
      }));

    setSearchResults(results);
    setShowResults(true);
    updateDropdownPosition(); // Обновляем позицию
  };

  // 🔥 Подсветка текста
  const highlightMatch = (text, query) => {
    if (!query) return text;

    const parts = text.split(new RegExp(`(${query})`, 'gi'));

    return parts.map((part, i) =>
      part.toLowerCase() === query.toLowerCase()
        ? <span key={i} className="search-highlight">{part}</span>
        : part
    );
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setShowResults(false);
  };

  const handleResultClick = (link) => {
    navigate(link);
    clearSearch();
  };

  const handleLogout = async () => {
    await auth.signOut();
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    if (timestamp?.seconds) {
      const date = new Date(timestamp.seconds * 1000);
      return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });
    }
    return timestamp;
  };

  return (
    <header className="header">
      <div className="header-top">
        <div className="header-container">
          <Link to="/" className="logo">ФОТИК.KZ</Link>

          {/* ПОИСК */}
          <div className="search-wrapper" ref={searchRef}>
            <div className="search-input-container">
              <input 
                type="text" 
                placeholder="Поиск мероприятий..." 
                className="search-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => searchResults.length > 0 && setShowResults(true)}
              />
              {searchQuery && (
                <button className="search-clear" onClick={clearSearch}>
                  <FaTimes />
                </button>
              )}
              <FaSearch className="search-icon" />
            </div>

            {/* РЕЗУЛЬТАТЫ ПОИСКА */}
            {showResults && (
              <div
                className="search-results"
                style={{
                  top: dropdownPosition.top,
                  left: dropdownPosition.left,
                  width: dropdownPosition.width
                }}
              >
                {searchResults.length > 0 ? (
                  <>
                    <div className="search-label">
                      Найдено {searchResults.length} результатов
                    </div>
                    {searchResults.map((result, index) => (
                      <div
                        key={index}
                        className="search-result-item"
                        onClick={() => handleResultClick(result.link)}
                      >
                        {result.imageUrl && (
                          <img 
                            src={result.imageUrl} 
                            alt={result.title}
                            className="search-result-image"
                          />
                        )}
                        <div className="search-result-info">
                          <div className="search-result-title">
                            {highlightMatch(result.title, searchQuery)}
                            <span className="search-result-type">🎫</span>
                          </div>
                          <div className="search-result-subtitle">
                            {highlightMatch(result.subtitle, searchQuery)}
                          </div>
                          {result.price && (
                            <div className="search-result-price">
                              {result.price} тенге
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </>
                ) : (
                  <div className="search-no-results">
                    Ничего не найдено
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="header-icons">
            <button onClick={toggleTheme} className="theme-toggle">
              {isDark ? <FaSun /> : <FaMoon />}
            </button>
            
            {user ? (
              <>
                <Link to="/profile" className="user-name-link">
                  <span className="user-name">
                    {userData?.displayName || user.email?.split('@')[0]}
                    {isAdmin && <FaCrown className="admin-crown" />}
                  </span>
                </Link>
                
                <Link to="/profile" className="icon-link">
                  <FaUser />
                </Link>

                <button onClick={handleLogout} className="icon-link logout-icon">
                  <FaSignOutAlt />
                </button>
              </>
            ) : (
              <button onClick={onOpenLogin} className="icon-link">
                <FaUser />
              </button>
            )}
            
            <Link to="/cart" className="cart-icon-container">
              <FaShoppingCart />
              {cartCount > 0 && (
                <span className="cart-badge">{cartCount}</span>
              )}
            </Link>
          </div>
        </div>
      </div>

      <nav className="header-nav">
        <div className="nav-container">
          <Link to="/" className="nav-link active">Главная</Link>
          <Link to="/photos" className="nav-link">Фотоотчеты</Link>
          <Link to="/events" className="nav-link">Анонсы</Link>
          <Link to="/venues" className="nav-link">Заведения</Link>
          <Link to="/articles" className="nav-link">Статьи</Link>
          <Link to="/videos" className="nav-link">Видео</Link>
          <Link to="/contacts" className="nav-link">Контакты</Link>
        </div>
      </nav>
    </header>
  );
};

export default Header;
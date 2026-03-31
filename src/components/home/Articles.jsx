import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../../services/firebase';
import { collection, getDocs, query, orderBy, limit, doc, getDoc } from 'firebase/firestore';
import { FaCalendarAlt, FaUser, FaClock, FaTimes } from 'react-icons/fa';
import './Articles.css';

const Articles = () => {
  const [articles, setArticles] = useState([]);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [fullArticle, setFullArticle] = useState(null);
  const [loadingModal, setLoadingModal] = useState(false);

  useEffect(() => {
    const loadArticles = async () => {
      const snapshot = await getDocs(
        query(collection(db, 'articles'), orderBy('date', 'desc'), limit(3))
      );
      
      const articlesData = snapshot.docs.map(doc => {
        const data = doc.data();
        
        const formatDate = (timestamp) => {
          if (!timestamp) return 'Январь 2026';
          if (timestamp && typeof timestamp === 'object' && timestamp.seconds) {
            const date = new Date(timestamp.seconds * 1000);
            return date.toLocaleDateString('ru-RU', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            });
          }
          return String(timestamp);
        };

        return {
          id: doc.id,
          title: data.title || 'Новая статья',
          excerpt: data.excerpt || data.description || 'Интересные новости из мира музыки и искусства',
          imageUrl: data.imageUrl || 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=600',
          date: formatDate(data.date),
          author: data.author || 'Редакция',
          readTime: data.readTime || 3
        };
      });
      
      setArticles(articlesData);
    };
    loadArticles();
  }, []);

  const openArticleModal = async (article) => {
    setSelectedArticle(article);
    setLoadingModal(true);
    
    document.body.style.overflow = 'hidden';
    
    try {
      const articleDoc = await getDoc(doc(db, 'articles', article.id));
      if (articleDoc.exists()) {
        const data = articleDoc.data();
        setFullArticle({
          content: data.content || data.excerpt || 'Полный текст статьи отсутствует'
        });
      }
    } catch (error) {
      console.error('Ошибка загрузки полной статьи:', error);
    } finally {
      setLoadingModal(false);
    }
  };

  const closeModal = () => {
    setSelectedArticle(null);
    setFullArticle(null);
    document.body.style.overflow = 'unset';
  };

  return (
    <section className="articles-section">
      <div className="section-header">
        <h2>Статьи</h2>
        <Link to="/articles" className="view-all">Смотреть все →</Link>
      </div>

      <div className="articles-grid">
        {articles.map(article => (
          <div 
            key={article.id} 
            className="article-card"
            onClick={() => openArticleModal(article)}
          >
            <div className="article-image">
              <img src={article.imageUrl} alt={article.title} />
              
              <div className="article-overlay">
                <h3 className="article-title">{article.title}</h3>
                
                <div className="article-excerpt">
                  <p>{article.excerpt}</p>
                </div>
                
                <div className="article-meta">
                  <span><FaCalendarAlt /> {article.date}</span>
                  <span><FaUser /> {article.author}</span>
                  <span><FaClock /> {article.readTime} мин</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedArticle && (
        <div className="article-modal-overlay" onClick={closeModal}>
          <div className="article-modal" onClick={(e) => e.stopPropagation()}>
            <button className="article-modal-close" onClick={closeModal}>
              <FaTimes />
            </button>
            
            {loadingModal ? (
              <div className="article-modal-loading">Загрузка...</div>
            ) : (
              <>
                <div className="article-modal-image">
                  <img src={selectedArticle.imageUrl} alt={selectedArticle.title} />
                </div>
                
                <div className="article-modal-content">
                  <h2 className="article-modal-title">{selectedArticle.title}</h2>
                  
                  <div className="article-modal-meta">
                    <span><FaUser /> {selectedArticle.author}</span>
                    <span><FaCalendarAlt /> {selectedArticle.date}</span>
                    <span><FaClock /> {selectedArticle.readTime} мин</span>
                  </div>
                  
                  <div className="article-modal-text">
                    <p className="article-modal-fulltext">
                      {fullArticle?.content || selectedArticle.excerpt}
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </section>
  );
};

export default Articles;
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../../services/firebase';
import { collection, getDocs } from 'firebase/firestore';
import './PhotoReports.css';

const PhotoReports = () => {
  const [reports, setReports] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const loadReports = async () => {
      const snapshot = await getDocs(collection(db, 'photoreports'));
      setReports(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };
    loadReports();
  }, []);

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    if (timestamp && timestamp.seconds) {
      const date = new Date(timestamp.seconds * 1000);
      return date.toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long'
      });
    }
    return String(timestamp);
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % reports.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + reports.length) % reports.length);
  };

  if (reports.length === 0) {
    return null;
  }

  return (
    <section className="photo-reports">
      <div className="section-header">
        <h2>Фотоотчеты</h2>
        <Link to="/photos" className="view-all">Смотреть все →</Link>
      </div>
      
      <div className="carousel-container">
        <button className="carousel-arrow left" onClick={prevSlide}>
          ←
        </button>

        <div className="carousel-slides">
          {reports.map((report, index) => (
            <div 
              key={report.id} 
              className={`carousel-slide ${index === currentIndex ? 'active' : ''}`}
              style={{ display: index === currentIndex ? 'block' : 'none' }}
            >
              <div className="report-card">
                <img 
                  src={report.imageUrl || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400'} 
                  alt={report.title}
                />
                <div className="report-info">
                  <h3>{report.title}</h3>
                  <p>{report.venue}</p>
                  <span>{formatDate(report.date)} · {report.photosCount || 0} фото</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <button className="carousel-arrow right" onClick={nextSlide}>
          →
        </button>
        
        <div className="carousel-dots">
          {reports.map((_, index) => (
            <button
              key={index}
              className={`dot ${index === currentIndex ? 'active' : ''}`}
              onClick={() => setCurrentIndex(index)}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default PhotoReports;
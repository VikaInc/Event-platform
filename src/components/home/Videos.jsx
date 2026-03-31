import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../../services/firebase';
import { collection, getDocs } from 'firebase/firestore';
import './Videos.css';

const Videos = () => {
  const [videos, setVideos] = useState([]);
  const videoRefs = useRef([]);

  useEffect(() => {
    const loadVideos = async () => {
      const snapshot = await getDocs(collection(db, 'videos'));
      const videosData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setVideos(videosData);
      videoRefs.current = videoRefs.current.slice(0, videosData.length);
    };
    loadVideos();
  }, []);

  const handleMouseEnter = (index) => {
    videoRefs.current[index]?.play();
  };

  const handleMouseLeave = (index) => {
    const video = videoRefs.current[index];
    if (video) {
      video.pause();
      video.currentTime = 0;
    }
  };

  if (videos.length === 0) {
    return null;
  }

  return (
    <section className="videos-section">
      <div className="section-header">
        <h2>Видео</h2>
        <Link to="/videos" className="view-all">Смотреть все →</Link>
      </div>

      <div className="videos-grid">
        {videos.map((video, index) => (
          <div 
            key={video.id} 
            className="video-card"
            onMouseEnter={() => handleMouseEnter(index)}
            onMouseLeave={() => handleMouseLeave(index)}
          >
            <div className="video-thumbnail">
              <video
                ref={el => videoRefs.current[index] = el}
                src={video.videoUrl}
                muted
                loop
                playsInline
                poster={video.thumbnail}
                className="video-player"
              />
              
              <img 
                src={video.thumbnail} 
                alt={video.title}
                className="video-poster"
              />
          
              <div className="video-overlay">
                <h4>{video.title}</h4>
                <p>{video.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Videos;
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { db } from '../services/firebase';
import { collection, getDocs, query, orderBy, limit, startAfter } from 'firebase/firestore';

import FeaturedEvent from '../components/home/FeaturedEvent';
import AdBanner from '../components/home/AdBanner';
import Testimonials from '../components/home/Testimonials'; 
import Articles from '../components/home/Articles';
import Videos from '../components/home/Videos';
import Announcements from '../components/events/Announcements';
import CategoryFilter from '../components/events/CategoryFilter';

import './HomePage.css';

const HomePage = () => {
  const [events, setEvents] = useState([]);
  const [allEvents, setAllEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastDoc, setLastDoc] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const search = params.get('search');
    if (search) {
      setSearchQuery(search);
    } else {
      setSearchQuery('');
    }
  }, [location]);

  useEffect(() => {
    const loadAllEvents = async () => {
      try {
        const eventsRef = collection(db, 'events');
        const eventsSnapshot = await getDocs(eventsRef);
        const eventsData = eventsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setAllEvents(eventsData);
      } catch (error) {
        console.error('Ошибка загрузки всех событий:', error);
      }
    };
    loadAllEvents();
  }, []);

  useEffect(() => {
    const loadEvents = async () => {
      try {
        setLoading(true);
        
        const eventsRef = collection(db, 'events');
        const eventsQuery = query(eventsRef, orderBy('date'), limit(8));
        const eventsSnapshot = await getDocs(eventsQuery);
        const eventsData = eventsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setEvents(eventsData);
        setLastDoc(eventsSnapshot.docs[eventsSnapshot.docs.length - 1]);
        setHasMore(eventsSnapshot.docs.length === 8);
      } catch (error) {
        console.error('Ошибка загрузки:', error);
      } finally {
        setLoading(false);
      }
    };

    loadEvents();
  }, []);

  const loadMoreEvents = async () => {
    if (!lastDoc || !hasMore) return;

    try {
      const eventsRef = collection(db, 'events');
      const eventsQuery = query(
        eventsRef,
        orderBy('date'),
        startAfter(lastDoc),
        limit(8)
      );
      
      const eventsSnapshot = await getDocs(eventsQuery);
      const eventsData = eventsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setEvents(prev => [...prev, ...eventsData]);
      setLastDoc(eventsSnapshot.docs[eventsSnapshot.docs.length - 1]);
      setHasMore(eventsSnapshot.docs.length === 8);
    } catch (error) {
      console.error('Ошибка загрузки:', error);
    }
  };

  if (loading) {
    return <div className="loading">Загрузка...</div>;
  }

  return (
    <div className="home-page">
      <FeaturedEvent />
      
      <CategoryFilter 
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
      />
      
      <Announcements 
        events={events}
        allEvents={allEvents} 
        loadMore={loadMoreEvents} 
        hasMore={hasMore} 
        searchQuery={searchQuery}
        selectedCategory={selectedCategory}
      />
      
      <AdBanner />
      
      <div className="bottom-row">
        <Articles />
      </div>

      <Videos />
      <Testimonials />
    </div>
  );
};

export default HomePage;
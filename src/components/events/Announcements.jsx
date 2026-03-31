import React from 'react';
import { Link } from 'react-router-dom';
import EventCard from './EventCard';

const Announcements = ({ events, allEvents, loadMore, hasMore, selectedCategory }) => {
  
  const categoryMapping = {
    'concert': 'concert', 'Концерты': 'concert',
    'exhibition': 'exhibition', 'Выставки': 'exhibition',
    'party': 'party', 'Вечеринки': 'party',
    'workshop': 'workshop', 'Мастер-классы': 'workshop',
    'theatre': 'theatre', 'Театр': 'theatre',
    'sports': 'sports', 'Спорт': 'sports',
    'other': 'other', 'Другое': 'other'
  };

  const totalFiltered = allEvents.filter(event => {
    if (!selectedCategory || selectedCategory === 'all') return true;
    const selectedId = categoryMapping[selectedCategory] || selectedCategory;
    const eventId = categoryMapping[event.category] || event.category;
    return eventId === selectedId;
  }).length;

  const filteredEvents = events.filter(event => {
    if (!selectedCategory || selectedCategory === 'all') return true;
    const selectedId = categoryMapping[selectedCategory] || selectedCategory;
    const eventId = categoryMapping[event.category] || event.category;
    return eventId === selectedId;
  });

  const getDisplayName = (categoryId) => {
    const names = {
      concert: 'Концерты',
      exhibition: 'Выставки',
      party: 'Вечеринки',
      workshop: 'Мастер-классы',
      theatre: 'Театр',
      sports: 'Спорт',
      other: 'Другое'
    };
    return names[categoryId] || categoryId;
  };

  return (
    <section className="announcements">
      <div className="section-header">
        <h2>Анонсы</h2>
        <Link to="/events" className="view-all">смотреть все</Link>
      </div>

      {/* Информация о фильтре */}
      {selectedCategory && selectedCategory !== 'all' && (
        <div className="filter-info">
          <span className="filter-badge">
            {getDisplayName(selectedCategory)}
          </span>
          <span className="filter-results">
            Найдено: {totalFiltered} {totalFiltered === 1 ? 'мероприятие' : 
                    totalFiltered < 5 ? 'мероприятия' : 'мероприятий'}
          </span>
        </div>
      )}
      
      {/* Сетка */}
      <div className="announcements-grid">
        {filteredEvents.map(event => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>

      {/* Если ничего не найдено в загруженных, но есть в общих */}
      {filteredEvents.length === 0 && totalFiltered > 0 && (
        <div className="load-more-prompt">
          <p>Еще {totalFiltered} {totalFiltered === 1 ? 'мероприятие' : 
                  totalFiltered < 5 ? 'мероприятия' : 'мероприятий'} в этой категории</p>
          <button onClick={loadMore} className="load-more-btn">
            Загрузить еще
          </button>
        </div>
      )}

      {/* Если совсем нет мероприятий */}
      {totalFiltered === 0 && selectedCategory && selectedCategory !== 'all' && (
        <div className="no-results">
          В категории {getDisplayName(selectedCategory)} пока нет мероприятий
        </div>
      )}
      
      {hasMore && filteredEvents.length === events.length && totalFiltered > filteredEvents.length && (
        <div className="load-more">
          <button onClick={loadMore} className="load-more-btn">
            Показать еще
          </button>
        </div>
      )}
    </section>
  );
};

export default Announcements;
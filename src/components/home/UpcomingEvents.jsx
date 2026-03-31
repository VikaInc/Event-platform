import React from 'react';
import { Link } from 'react-router-dom';

const UpcomingEvents = ({ events }) => {

  if (!events || !Array.isArray(events)) {
    return null;
  }

  return (
    <section className="upcoming">
      <div className="section-header">
        <h2>Ближайшие события</h2>
        <Link to="/events" className="view-all">Смотреть все →</Link>
      </div>
      <div className="upcoming-list">
        {events.slice(0, 5).map(event => (
          <div key={event.id} className="upcoming-item">
            <span className="event-date">Скоро</span>
            <div>
              <h4>{event.title || 'Без названия'}</h4>
              <p>{event.location || event.venue || 'Место не указано'}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default UpcomingEvents;
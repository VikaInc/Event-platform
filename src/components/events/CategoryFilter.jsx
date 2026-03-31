import React, { useState } from 'react';
import './CategoryFilter.css';

const categories = [
  { id: 'all', name: 'Все категории' },
  { id: 'concert', name: 'Концерты' },
  { id: 'exhibition', name: 'Выставки' },
  { id: 'party', name: 'Вечеринки' },
  { id: 'workshop', name: 'Мастер-классы' },
  { id: 'theatre', name: 'Театр' },
  { id: 'sports', name: 'Спорт' },
  { id: 'other', name: 'Другое' }
];

const CategoryFilter = ({ selectedCategory, onCategoryChange }) => {
  const [isOpen, setIsOpen] = useState(false);

  const selectedCat = categories.find(c => c.id === selectedCategory) || categories[0];

  return (
    <div className="category-filter-wrapper">
      <button className="filter-button" onClick={() => setIsOpen(!isOpen)}>
        <span className="filter-button-text">{selectedCat.name}</span>
        <span className={`filter-arrow ${isOpen ? 'open' : ''}`}>▼</span>
      </button>

      {isOpen && (
        <div className="filter-dropdown">
          {categories.map(category => (
            <button
              key={category.id}
              className={`filter-option ${selectedCategory === category.id ? 'active' : ''}`}
              onClick={() => {
                onCategoryChange(category.id);
                setIsOpen(false);
              }}
            >
              {category.name}
              {selectedCategory === category.id && <span className="option-check">✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default CategoryFilter;
import React from 'react';

const CATEGORIES = [
  {
    name: 'All',
    label: 'All Cuisines',
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=200'
  },
  {
    name: 'Pizza',
    label: 'Artisan Pizza',
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=200'
  },
  {
    name: 'Burgers',
    label: 'Smash Burgers',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200'
  },
  {
    name: 'Indian',
    label: 'North Indian',
    image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=200'
  },
  {
    name: 'Chinese',
    label: 'Chinese & Wok',
    image: 'https://images.unsplash.com/photo-1541696432-82c6da8ce7bf?w=200'
  },
  {
    name: 'South Indian',
    label: 'Crispy Dosa',
    image: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=200'
  },
  {
    name: 'Desserts',
    label: 'Waffles & Cakes',
    image: 'https://images.unsplash.com/photo-1562376552-0d160a2f238d?w=200'
  },
  {
    name: 'Healthy Food',
    label: 'Salads & Keto',
    image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=200'
  },
  {
    name: 'Beverages',
    label: 'Coffee & Shakes',
    image: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=200'
  }
];

export default function CategoryPills({ selectedCategory, onSelectCategory }) {
  return (
    <div className="categories-carousel-wrapper">
      <div className="categories-scroll-track">
        {CATEGORIES.map((cat, idx) => {
          const isSelected =
            selectedCategory === cat.name ||
            (!selectedCategory && cat.name === 'All');

          return (
            <button
              key={idx}
              className={`category-pill-card ${isSelected ? 'active' : ''}`}
              onClick={() => onSelectCategory(cat.name === 'All' ? '' : cat.name)}
            >
              <div className="cat-img-wrapper">
                <img src={cat.image} alt={cat.label} className="cat-img" loading="lazy" />
              </div>
              <span className="cat-name">{cat.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}


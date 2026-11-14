import React, { useState } from 'react';
import { SlidersHorizontal, X, Check, Star, Clock, Tag, ArrowUpDown } from 'lucide-react';

export default function RestaurantFilters({ filters, onFilterChange, onReset }) {
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  const activeCount = Object.keys(filters).filter((k) => {
    if (k === 'sort' && filters[k] === 'rating_desc') return false;
    return !!filters[k] && filters[k] !== 'All';
  }).length;

  const content = (
    <div className="filter-controls-group">
      {/* Pure Veg Toggle */}
      <button
        className={`filter-pill ${filters.vegOnly ? 'active' : ''}`}
        onClick={() => onFilterChange('vegOnly', !filters.vegOnly)}
      >
        <span className="diet-icon veg" style={{ width: 14, height: 14 }} />
        <span>Pure Veg</span>
      </button>

      {/* 4.0+ Rating */}
      <button
        className={`filter-pill ${filters.rating === '4.0' ? 'active' : ''}`}
        onClick={() => onFilterChange('rating', filters.rating === '4.0' ? '' : '4.0')}
      >
        <Star size={14} fill={filters.rating === '4.0' ? '#F97316' : 'none'} />
        <span>Rating 4.0+</span>
      </button>

      {/* Fastest Delivery */}
      <button
        className={`filter-pill ${filters.deliveryMax === '30' ? 'active' : ''}`}
        onClick={() => onFilterChange('deliveryMax', filters.deliveryMax === '30' ? '' : '30')}
      >
        <Clock size={14} />
        <span>Fast Delivery (&le;30 min)</span>
      </button>

      {/* Has Offers */}
      <button
        className={`filter-pill ${filters.hasOffers ? 'active' : ''}`}
        onClick={() => onFilterChange('hasOffers', !filters.hasOffers)}
      >
        <Tag size={14} />
        <span>Great Offers</span>
      </button>

      {/* Sort Dropdown */}
      <div className="sort-dropdown-container">
        <ArrowUpDown size={14} className="sort-icon" />
        <select
          className="sort-select"
          value={filters.sort || 'rating_desc'}
          onChange={(e) => onFilterChange('sort', e.target.value)}
        >
          <option value="rating_desc">Highest Rated</option>
          <option value="popular">Most Popular</option>
          <option value="delivery_fastest">Fastest Delivery</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
        </select>
      </div>

      {/* Clear All Filters */}
      {activeCount > 0 && (
        <button className="btn-clear-filters" onClick={onReset}>
          <X size={14} />
          <span>Clear All ({activeCount})</span>
        </button>
      )}
    </div>
  );

  return (
    <div className="filters-wrapper">
      {/* Mobile Filter Button */}
      <div className="mobile-filter-bar">
        <button
          className="btn btn-outline btn-sm mobile-filter-btn"
          onClick={() => setIsMobileDrawerOpen(true)}
        >
          <SlidersHorizontal size={15} />
          <span>Filters {activeCount > 0 ? `(${activeCount})` : ''}</span>
        </button>

        <div className="sort-dropdown-container">
          <select
            className="sort-select"
            value={filters.sort || 'rating_desc'}
            onChange={(e) => onFilterChange('sort', e.target.value)}
          >
            <option value="rating_desc">Highest Rated</option>
            <option value="popular">Most Popular</option>
            <option value="delivery_fastest">Fastest Delivery</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
          </select>
        </div>
      </div>

      {/* Desktop Filter Pills */}
      <div className="desktop-filters">{content}</div>

      {/* Mobile Drawer */}
      {isMobileDrawerOpen && (
        <div className="modal-overlay" onClick={() => setIsMobileDrawerOpen(false)}>
          <div
            className="modal-content mobile-filter-drawer"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3 className="modal-title">Filter Restaurants</h3>
              <button
                className="btn-close"
                onClick={() => setIsMobileDrawerOpen(false)}
              >
                <X size={20} />
              </button>
            </div>
            <div className="modal-body" style={{ padding: '1.25rem' }}>
              {content}
            </div>
            <div className="modal-footer" style={{ padding: '1rem 1.25rem' }}>
              <button
                className="btn btn-primary"
                style={{ width: '100%' }}
                onClick={() => setIsMobileDrawerOpen(false)}
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, Utensils, Store, X, Frown } from 'lucide-react';
import api from '../../services/api';
import RestaurantCard from '../../components/restaurant/RestaurantCard';
import FoodCard from '../../components/food/FoodCard';
import RestaurantFilters from '../../components/restaurant/RestaurantFilters';

export default function RestaurantsPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [activeTab, setActiveTab] = useState('restaurants'); // 'restaurants' or 'dishes'
  const [restaurants, setRestaurants] = useState([]);
  const [dishes, setDishes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  // Filters State
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    cuisine: searchParams.get('cuisine') || '',
    vegOnly: searchParams.get('vegOnly') === 'true',
    rating: searchParams.get('rating') || '',
    deliveryMax: searchParams.get('deliveryMax') || '',
    hasOffers: searchParams.get('hasOffers') === 'true',
    sort: searchParams.get('sort') || 'rating_desc'
  });

  // Fetch Restaurants
  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        if (filters.search) params.append('search', filters.search);
        if (filters.cuisine && filters.cuisine !== 'All') params.append('cuisine', filters.cuisine);
        if (filters.vegOnly) params.append('vegOnly', 'true');
        if (filters.rating) params.append('rating', filters.rating);
        if (filters.deliveryMax) params.append('deliveryMax', filters.deliveryMax);
        if (filters.hasOffers) params.append('hasOffers', 'true');
        if (filters.sort) params.append('sort', filters.sort);

        const res = await api.get(`/restaurants?${params.toString()}`);
        setRestaurants(res.data.data);
        setTotalCount(res.data.total);

        // Also fetch matched dishes if search query is provided
        if (filters.search) {
          const dishesRes = await api.get(`/menu-items/search?q=${encodeURIComponent(filters.search)}`);
          setDishes(dishesRes.data.data);
        } else {
          setDishes([]);
        }
      } catch (err) {
        console.error('Failed to load restaurants:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurants();
  }, [filters]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value
    }));
  };

  const handleResetFilters = () => {
    setFilters({
      search: '',
      cuisine: '',
      vegOnly: false,
      rating: '',
      deliveryMax: '',
      hasOffers: false,
      sort: 'rating_desc'
    });
    setSearchParams({});
  };

  return (
    <div className="restaurants-page-wrapper">
      <div className="container">
        {/* Page Top Header with Live Search Bar */}
        <div className="discovery-header">
          <div className="discovery-title-area">
            <h1 className="discovery-title">Discover Restaurants & Food</h1>
            <p className="discovery-sub">
              {loading
                ? 'Curating top verified kitchens...'
                : `Showing ${totalCount} restaurants delivering to your area`}
            </p>
          </div>

          <div className="discovery-search-wrapper">
            <Search size={18} className="search-icon text-muted" />
            <input
              type="text"
              placeholder="Search dishes, restaurants or cuisines..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="discovery-search-input"
            />
            {filters.search && (
              <button
                className="btn-clear-search"
                onClick={() => handleFilterChange('search', '')}
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Tab switch between Restaurants & Dishes (when searching) */}
        {filters.search && (
          <div className="search-tabs-row">
            <button
              className={`search-tab-btn ${activeTab === 'restaurants' ? 'active' : ''}`}
              onClick={() => setActiveTab('restaurants')}
            >
              <Store size={16} />
              <span>Restaurants ({restaurants.length})</span>
            </button>
            <button
              className={`search-tab-btn ${activeTab === 'dishes' ? 'active' : ''}`}
              onClick={() => setActiveTab('dishes')}
            >
              <Utensils size={16} />
              <span>Dishes ({dishes.length})</span>
            </button>
          </div>
        )}

        {/* Filter Pills & Sorting */}
        <RestaurantFilters
          filters={filters}
          onFilterChange={handleFilterChange}
          onReset={handleResetFilters}
        />

        {/* Active Cuisine Tag indicator if filtered */}
        {filters.cuisine && (
          <div className="active-filter-indicator">
            <span>Filtered by cuisine: <strong>{filters.cuisine}</strong></span>
            <button onClick={() => handleFilterChange('cuisine', '')}>
              <X size={14} />
            </button>
          </div>
        )}

        {/* Results Section */}
        {loading ? (
          <div className="restaurants-grid">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="card restaurant-card" style={{ height: 320 }}>
                <div className="skeleton" style={{ height: 200 }} />
                <div style={{ padding: '1.25rem' }}>
                  <div className="skeleton" style={{ height: 22, width: '65%', marginBottom: 10 }} />
                  <div className="skeleton" style={{ height: 16, width: '45%' }} />
                </div>
              </div>
            ))}
          </div>
        ) : activeTab === 'dishes' && filters.search ? (
          /* Dishes Grid */
          dishes.length > 0 ? (
            <div className="dishes-grid" style={{ marginTop: '1.5rem' }}>
              {dishes.map((dish) => (
                <FoodCard
                  key={dish._id}
                  item={dish}
                  restaurant={dish.restaurant}
                />
              ))}
            </div>
          ) : (
            <div className="empty-results-box">
              <Frown size={48} className="text-muted" strokeWidth={1.5} />
              <h3 className="empty-title">No dishes matched "{filters.search}"</h3>
              <p className="empty-desc">
                Try searching for pizza, biryani, burgers, dosa or reset your filters.
              </p>
              <button className="btn btn-outline" onClick={handleResetFilters}>
                Clear All Filters
              </button>
            </div>
          )
        ) : (
          /* Restaurants Grid */
          restaurants.length > 0 ? (
            <div className="restaurants-grid">
              {restaurants.map((rest) => (
                <RestaurantCard key={rest._id} restaurant={rest} />
              ))}
            </div>
          ) : (
            <div className="empty-results-box">
              <Frown size={48} className="text-muted" strokeWidth={1.5} />
              <h3 className="empty-title">No restaurants found</h3>
              <p className="empty-desc">
                We couldn't find any restaurants matching your current filter criteria.
              </p>
              <button className="btn btn-primary" onClick={handleResetFilters}>
                Reset All Filters
              </button>
            </div>
          )
        )}
      </div>
    </div>
  );
}


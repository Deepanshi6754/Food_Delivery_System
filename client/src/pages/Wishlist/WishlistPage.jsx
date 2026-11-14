import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Heart, Store, Utensils, ArrowRight } from 'lucide-react';
import { fetchWishlist } from '../../features/wishlist/wishlistSlice';
import RestaurantCard from '../../components/restaurant/RestaurantCard';
import FoodCard from '../../components/food/FoodCard';

export default function WishlistPage() {
  const dispatch = useDispatch();
  const { restaurants, menuItems, loading } = useSelector((state) => state.wishlist);
  const [activeTab, setActiveTab] = useState('restaurants'); // 'restaurants' or 'dishes'

  useEffect(() => {
    dispatch(fetchWishlist());
  }, [dispatch]);

  const hasAnyItems = (restaurants && restaurants.length > 0) || (menuItems && menuItems.length > 0);

  return (
    <div className="wishlist-page-wrapper">
      <div className="container">
        <div className="page-header-row">
          <div>
            <h1 className="page-heading">My Wishlist & Favourites</h1>
            <p className="page-sub">Quickly re-order your most loved restaurants and curated dishes</p>
          </div>
        </div>

        {/* Wishlist Navigation Tabs */}
        <div className="orders-filter-tabs">
          <button
            className={`order-tab-btn ${activeTab === 'restaurants' ? 'active' : ''}`}
            onClick={() => setActiveTab('restaurants')}
          >
            <Store size={16} />
            <span>Favourite Restaurants ({restaurants?.length || 0})</span>
          </button>
          <button
            className={`order-tab-btn ${activeTab === 'dishes' ? 'active' : ''}`}
            onClick={() => setActiveTab('dishes')}
          >
            <Utensils size={16} />
            <span>Favourite Dishes ({menuItems?.length || 0})</span>
          </button>
        </div>

        {loading ? (
          <div className="restaurants-grid">
            {[1, 2, 3].map((n) => (
              <div key={n} className="skeleton" style={{ height: 280 }} />
            ))}
          </div>
        ) : !hasAnyItems ? (
          <div className="empty-results-box" style={{ padding: '5rem 1.5rem' }}>
            <Heart size={54} className="text-muted" strokeWidth={1.5} />
            <h3 className="empty-title">Your wishlist is empty</h3>
            <p className="empty-desc">
              Tap the heart icon on any restaurant or dish to save it here for fast ordering!
            </p>
            <Link to="/restaurants" className="btn btn-primary" style={{ marginTop: '1rem' }}>
              Discover Top Restaurants
            </Link>
          </div>
        ) : activeTab === 'restaurants' ? (
          /* Favourite Restaurants Tab */
          restaurants && restaurants.length > 0 ? (
            <div className="restaurants-grid">
              {restaurants.map((rest) => (
                <RestaurantCard key={rest._id} restaurant={rest} />
              ))}
            </div>
          ) : (
            <div className="empty-results-box">
              <p className="empty-title">No favourite restaurants saved yet.</p>
              <Link to="/restaurants" className="btn btn-outline btn-sm">
                Explore Restaurants
              </Link>
            </div>
          )
        ) : (
          /* Favourite Dishes Tab */
          menuItems && menuItems.length > 0 ? (
            <div className="dishes-grid">
              {menuItems.map((item) => (
                <FoodCard
                  key={item._id}
                  item={item}
                  restaurant={item.restaurant}
                />
              ))}
            </div>
          ) : (
            <div className="empty-results-box">
              <p className="empty-title">No favourite dishes saved yet.</p>
              <Link to="/restaurants" className="btn btn-outline btn-sm">
                Explore Dishes
              </Link>
            </div>
          )
        )}
      </div>
    </div>
  );
}


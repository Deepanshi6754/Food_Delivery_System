import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  Star,
  Clock,
  Bike,
  Heart,
  Search,
  Tag,
  Info,
  ChevronLeft,
  MessageSquare,
  ShieldCheck,
  CheckCircle2,
  Calendar
} from 'lucide-react';
import api from '../../services/api';
import FoodCard from '../../components/food/FoodCard';
import { toggleRestaurantWishlist } from '../../features/wishlist/wishlistSlice';

export default function RestaurantDetailsPage() {
  const { id } = useParams();
  const dispatch = useDispatch();

  const { restaurants: wishlistedRestaurants } = useSelector((state) => state.wishlist);
  const { isAuthenticated } = useSelector((state) => state.auth);

  const [restaurant, setRestaurant] = useState(null);
  const [menuByCategory, setMenuByCategory] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('menu'); // 'menu' or 'reviews'

  // Menu Search & Filter
  const [menuSearch, setMenuSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [vegOnly, setVegOnly] = useState(false);

  useEffect(() => {
    const fetchRestaurantDetails = async () => {
      try {
        setLoading(true);
        const [res, reviewsRes] = await Promise.all([
          api.get(`/restaurants/${id}`),
          api.get(`/reviews/restaurant/${id}`)
        ]);
        setRestaurant(res.data.data.restaurant);
        setMenuByCategory(res.data.data.menuByCategory);
        setReviews(reviewsRes.data.data);
      } catch (err) {
        console.error('Failed to load restaurant details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurantDetails();
  }, [id]);

  const isWishlisted = wishlistedRestaurants?.some((r) => {
    const rId = r._id || r;
    return restaurant && rId.toString() === restaurant._id.toString();
  });

  const handleWishlistToggle = () => {
    if (!isAuthenticated) {
      window.dispatchEvent(
        new CustomEvent('show_toast', {
          detail: 'Please sign in to save restaurants to your favourites.'
        })
      );
      return;
    }
    if (restaurant) dispatch(toggleRestaurantWishlist(restaurant._id));
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '3rem 1.5rem' }}>
        <div className="skeleton" style={{ height: 280, borderRadius: 'var(--radius-xl)', marginBottom: '1.5rem' }} />
        <div className="skeleton" style={{ height: 40, width: '40%', marginBottom: '1rem' }} />
        <div className="skeleton" style={{ height: 20, width: '25%', marginBottom: '2rem' }} />
        <div className="dishes-grid">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="skeleton" style={{ height: 180 }} />
          ))}
        </div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="container text-center" style={{ padding: '5rem 1.5rem' }}>
        <h2>Restaurant not found</h2>
        <Link to="/restaurants" className="btn btn-primary" style={{ marginTop: '1rem' }}>
          Back to Restaurants
        </Link>
      </div>
    );
  }

  // Filter menu items by search, category, vegOnly
  const filteredCategories = menuByCategory
    .map((group) => {
      if (selectedCategory !== 'All' && group.category !== selectedCategory) {
        return null;
      }

      const filteredItems = group.items.filter((item) => {
        const matchesSearch =
          !menuSearch ||
          item.name.toLowerCase().includes(menuSearch.toLowerCase()) ||
          item.description?.toLowerCase().includes(menuSearch.toLowerCase());
        const matchesVeg = !vegOnly || item.isVeg;
        return matchesSearch && matchesVeg;
      });

      return {
        ...group,
        items: filteredItems
      };
    })
    .filter((group) => group && group.items.length > 0);

  return (
    <div className="restaurant-details-wrapper">
      {/* Top Cover Banner */}
      <div className="rest-cover-hero">
        <img src={restaurant.coverImage} alt={restaurant.name} className="rest-cover-img" />
        <div className="rest-cover-overlay" />
        <div className="container rest-cover-content">
          <Link to="/restaurants" className="back-link">
            <ChevronLeft size={18} />
            <span>All Restaurants</span>
          </Link>
        </div>
      </div>

      <div className="container">
        {/* Restaurant Header Info Card */}
        <div className="rest-hero-card">
          <div className="rest-hero-main">
            <img
              src={restaurant.image}
              alt={restaurant.name}
              className="rest-avatar-lg"
            />
            <div className="rest-title-group">
              <div className="rest-title-row">
                <h1 className="rest-display-name">{restaurant.name}</h1>
                <button
                  className={`rest-heart-btn ${isWishlisted ? 'active' : ''}`}
                  onClick={handleWishlistToggle}
                  title="Save to favourites"
                >
                  <Heart
                    size={20}
                    fill={isWishlisted ? '#EF4444' : 'none'}
                    color={isWishlisted ? '#EF4444' : '#78716C'}
                  />
                </button>
              </div>

              <p className="rest-cuisines-lg">{restaurant.cuisine.join(' • ')}</p>
              <p className="rest-address-sub">
                {restaurant.address?.street}, {restaurant.address?.area}, {restaurant.address?.city}
              </p>

              {/* Meta Stats Pills */}
              <div className="rest-badges-strip">
                <div className="badge-rating lg">
                  <Star size={14} fill="#FFFFFF" color="#FFFFFF" />
                  <span>{restaurant.rating}</span>
                  <span className="rating-count">({restaurant.reviewCount}+ ratings)</span>
                </div>

                <div className="rest-pill-item">
                  <Clock size={16} className="text-orange" />
                  <span>{restaurant.deliveryTime}</span>
                </div>

                <div className="rest-pill-item">
                  <Bike size={16} className="text-orange" />
                  <span>
                    {restaurant.deliveryFee === 0
                      ? 'Free Delivery'
                      : `₹${Math.round(restaurant.deliveryFee / 100)} Delivery Fee`}
                  </span>
                </div>

                <div className="rest-pill-item">
                  <span>₹{Math.round(restaurant.priceForTwo / 100)} for two</span>
                </div>
              </div>
            </div>
          </div>

          {/* Active Offers at this Restaurant */}
          {restaurant.offers && restaurant.offers.length > 0 && (
            <div className="rest-offers-row">
              {restaurant.offers.map((offer, idx) => (
                <div key={idx} className="rest-offer-card">
                  <Tag size={16} className="text-orange" />
                  <div className="offer-text-box">
                    <span className="offer-code-badge">{offer.code}</span>
                    <span className="offer-desc">{offer.discountText}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Tab Navigation: Menu vs Reviews */}
        <div className="details-tab-bar">
          <button
            className={`details-tab-btn ${activeTab === 'menu' ? 'active' : ''}`}
            onClick={() => setActiveTab('menu')}
          >
            Order Food Menu
          </button>
          <button
            className={`details-tab-btn ${activeTab === 'reviews' ? 'active' : ''}`}
            onClick={() => setActiveTab('reviews')}
          >
            Customer Reviews ({reviews.length})
          </button>
        </div>

        {activeTab === 'menu' ? (
          <>
            {/* Menu Controls: Search & Category Pills & Pure Veg Toggle */}
            <div className="menu-controls-bar">
              {/* Menu Search Box */}
              <div className="menu-search-wrapper">
                <Search size={16} className="text-muted" />
                <input
                  type="text"
                  placeholder={`Search within ${restaurant.name} menu...`}
                  value={menuSearch}
                  onChange={(e) => setMenuSearch(e.target.value)}
                  className="menu-search-input"
                />
              </div>

              {/* Veg Only Toggle */}
              <button
                className={`filter-pill ${vegOnly ? 'active' : ''}`}
                onClick={() => setVegOnly(!vegOnly)}
              >
                <span className="diet-icon veg" style={{ width: 14, height: 14 }} />
                <span>Pure Veg</span>
              </button>

              {/* Category Pills */}
              <div className="category-tabs-scroll">
                <button
                  className={`cat-tab-pill ${selectedCategory === 'All' ? 'active' : ''}`}
                  onClick={() => setSelectedCategory('All')}
                >
                  All Items
                </button>
                {menuByCategory.map((cat, idx) => (
                  <button
                    key={idx}
                    className={`cat-tab-pill ${selectedCategory === cat.category ? 'active' : ''}`}
                    onClick={() => setSelectedCategory(cat.category)}
                  >
                    {cat.category} ({cat.items.length})
                  </button>
                ))}
              </div>
            </div>

            {/* Menu Items by Category */}
            <div className="menu-sections-wrapper">
              {filteredCategories.length > 0 ? (
                filteredCategories.map((group, idx) => (
                  <div key={idx} className="menu-category-group">
                    <h3 className="category-section-title">
                      {group.category} <span className="cat-count">({group.items.length})</span>
                    </h3>

                    <div className="dishes-grid">
                      {group.items.map((item) => (
                        <FoodCard
                          key={item._id}
                          item={item}
                          restaurant={restaurant}
                        />
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-results-box" style={{ margin: '3rem 0' }}>
                  <p className="empty-title">No menu items matched your search.</p>
                  <button
                    className="btn btn-outline btn-sm"
                    onClick={() => {
                      setMenuSearch('');
                      setSelectedCategory('All');
                      setVegOnly(false);
                    }}
                  >
                    Reset Menu Filters
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          /* Customer Reviews Tab */
          <div className="reviews-section-wrapper">
            <div className="reviews-summary-card">
              <div className="reviews-summary-score">
                <span className="big-rating">{restaurant.rating}</span>
                <div className="star-row">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      size={18}
                      fill={s <= Math.round(restaurant.rating) ? '#F97316' : 'none'}
                      color="#F97316"
                    />
                  ))}
                </div>
                <span className="summary-ratings-count">
                  Based on {restaurant.reviewCount}+ verified customer orders
                </span>
              </div>
            </div>

            {/* Reviews List */}
            <div className="reviews-list">
              {reviews.length > 0 ? (
                reviews.map((rev) => (
                  <div key={rev._id} className="review-card">
                    <div className="review-top-row">
                      <div className="reviewer-info">
                        <img
                          src={rev.user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                          alt={rev.user?.name}
                          className="reviewer-avatar"
                        />
                        <div>
                          <h4 className="reviewer-name">{rev.user?.name}</h4>
                          <span className="review-date">
                            {new Date(rev.createdAt).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </span>
                        </div>
                      </div>

                      <div className="badge-rating">
                        <Star size={12} fill="#FFFFFF" color="#FFFFFF" />
                        <span>{rev.rating}.0</span>
                      </div>
                    </div>

                    <p className="review-comment">{rev.comment}</p>

                    {rev.isVerified && (
                      <div className="verified-purchase-tag">
                        <CheckCircle2 size={13} className="text-success" />
                        <span>Verified FoodDelight Customer</span>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="empty-results-box">
                  <MessageSquare size={36} className="text-muted" />
                  <p className="empty-title">No reviews yet for this restaurant.</p>
                  <p className="empty-sub">Order your meal and be the first to leave a review!</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


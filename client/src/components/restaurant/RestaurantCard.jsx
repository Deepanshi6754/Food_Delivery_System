import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Star, Clock, Bike, Heart } from 'lucide-react';
import { toggleRestaurantWishlist } from '../../features/wishlist/wishlistSlice';

export default function RestaurantCard({ restaurant }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { restaurants: wishlistedRestaurants } = useSelector((state) => state.wishlist);
  const { isAuthenticated } = useSelector((state) => state.auth);

  const isWishlisted = wishlistedRestaurants?.some((r) => {
    const id = r._id || r;
    return id.toString() === restaurant._id.toString();
  });

  const handleCardClick = () => {
    navigate(`/restaurants/${restaurant.slug || restaurant._id}`);
  };

  const handleWishlistToggle = (e) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      window.dispatchEvent(
        new CustomEvent('show_toast', {
          detail: 'Please sign in to save restaurants to your favourites.'
        })
      );
      return;
    }
    dispatch(toggleRestaurantWishlist(restaurant._id));
  };

  const isFreeDelivery = restaurant.deliveryFee === 0;

  return (
    <div className="card restaurant-card" onClick={handleCardClick}>
      {/* Image Container */}
      <div className="rest-img-wrapper">
        <img
          src={restaurant.image}
          alt={restaurant.name}
          className="rest-img"
          loading="lazy"
        />

        {/* Wishlist Heart Button */}
        <button
          className={`rest-wishlist-btn ${isWishlisted ? 'active' : ''}`}
          onClick={handleWishlistToggle}
          title={isWishlisted ? 'Remove from favourites' : 'Save to favourites'}
        >
          <Heart
            size={18}
            fill={isWishlisted ? '#EF4444' : 'rgba(0,0,0,0.3)'}
            color={isWishlisted ? '#EF4444' : '#FFFFFF'}
          />
        </button>

        {/* Offer Ribbon or Badge */}
        {restaurant.badge && (
          <div className="rest-offer-ribbon">
            <span>{restaurant.badge}</span>
          </div>
        )}

        {/* Closed overlay if isOpen is false */}
        {!restaurant.isOpen && (
          <div className="rest-closed-overlay">
            <span>Currently Closed • Opens {restaurant.openingTime || '11 AM'}</span>
          </div>
        )}
      </div>

      {/* Restaurant Content */}
      <div className="rest-content">
        <div className="rest-name-row">
          <h3 className="rest-name">{restaurant.name}</h3>
          <div className="badge-rating">
            <Star size={12} fill="#FFFFFF" color="#FFFFFF" />
            <span>{restaurant.rating}</span>
          </div>
        </div>

        {/* Cuisines */}
        <p className="rest-cuisines">
          {restaurant.cuisine?.join(', ')}
        </p>

        {/* Meta Stats Row */}
        <div className="rest-meta-row">
          <div className="meta-item">
            <Clock size={14} className="text-muted" />
            <span>{restaurant.deliveryTime || '30 mins'}</span>
          </div>

          <span className="meta-dot">•</span>

          <div className="meta-item">
            <Bike size={14} className="text-muted" />
            <span>{isFreeDelivery ? 'Free Delivery' : `₹${Math.round(restaurant.deliveryFee / 100)} delivery`}</span>
          </div>

          <span className="meta-dot">•</span>

          <div className="meta-item">
            <span>₹{Math.round((restaurant.priceForTwo || 40000) / 100)} for two</span>
          </div>
        </div>
      </div>
    </div>
  );
}


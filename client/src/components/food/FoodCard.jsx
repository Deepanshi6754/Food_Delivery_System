import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Heart, Plus, Minus, Star } from 'lucide-react';
import { addToCart, updateQuantity } from '../../features/cart/cartSlice';
import { toggleMenuItemWishlist } from '../../features/wishlist/wishlistSlice';
import FoodCustomizationModal from './FoodCustomizationModal';

export default function FoodCard({ item, restaurant }) {
  const dispatch = useDispatch();
  const { items: cartItems } = useSelector((state) => state.cart);
  const { menuItems: wishlistedItems } = useSelector((state) => state.wishlist);
  const { isAuthenticated } = useSelector((state) => state.auth);

  const [isCustomizeOpen, setIsCustomizeOpen] = useState(false);

  // Check if item is wishlisted
  const isWishlisted = wishlistedItems?.some((w) => {
    const id = w._id || w;
    return id.toString() === item._id.toString();
  });

  // Check if already in cart
  const cartItem = cartItems.find(
    (ci) => (ci.menuItem?._id || ci.menuItem) === item._id
  );

  const hasCustomizations =
    (item.customizations?.sizes && item.customizations.sizes.length > 0) ||
    (item.customizations?.addOns && item.customizations.addOns.length > 0);

  const handleAddClick = () => {
    if (hasCustomizations) {
      setIsCustomizeOpen(true);
    } else {
      dispatch(
        addToCart({
          menuItemId: item._id,
          quantity: 1,
          size: undefined,
          addOns: []
        })
      );
    }
  };

  const handleWishlistToggle = (e) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      window.dispatchEvent(new CustomEvent('show_toast', { detail: 'Please sign in to save dishes to your wishlist.' }));
      return;
    }
    dispatch(toggleMenuItemWishlist(item._id));
  };

  return (
    <>
      <div className="food-item-card">
        {/* Left / Info Side */}
        <div className="food-details-side">
          <div className="food-header-row">
            <span className={`diet-icon ${item.isVeg ? 'veg' : 'non-veg'}`} />
            {item.isBestseller && (
              <span className="badge badge-bestseller">Bestseller</span>
            )}
            {item.isJain && (
              <span className="badge badge-offer" style={{ background: '#E0F2FE', color: '#0369A1' }}>
                Jain Friendly
              </span>
            )}
          </div>

          <h4 className="food-name">{item.name}</h4>

          <div className="food-price-row">
            <span className="food-price">₹{Math.round(item.price / 100)}</span>
            {item.rating && (
              <div className="food-rating-pill">
                <Star size={12} fill="#F97316" color="#F97316" />
                <span>{item.rating}</span>
                <span className="food-review-count">({item.reviewCount || 40})</span>
              </div>
            )}
          </div>

          <p className="food-desc">{item.description}</p>

          {hasCustomizations && (
            <span className="customizable-hint">Customisable options available</span>
          )}
        </div>

        {/* Right / Image Side */}
        <div className="food-img-side">
          <div className="food-img-container">
            <img src={item.image} alt={item.name} className="food-dish-img" loading="lazy" />

            <button
              className={`food-heart-btn ${isWishlisted ? 'active' : ''}`}
              onClick={handleWishlistToggle}
              title={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
            >
              <Heart
                size={16}
                fill={isWishlisted ? '#EF4444' : 'none'}
                color={isWishlisted ? '#EF4444' : '#292524'}
              />
            </button>

            {/* Add / Quantity Stepper Button */}
            <div className="food-add-container">
              {cartItem && !hasCustomizations ? (
                <div className="food-qty-stepper">
                  <button
                    className="food-stepper-btn"
                    onClick={() =>
                      dispatch(
                        updateQuantity({
                          itemId: cartItem._id,
                          quantity: cartItem.quantity - 1
                        })
                      )
                    }
                  >
                    <Minus size={14} />
                  </button>
                  <span className="food-stepper-num">{cartItem.quantity}</span>
                  <button
                    className="food-stepper-btn"
                    onClick={() =>
                      dispatch(
                        updateQuantity({
                          itemId: cartItem._id,
                          quantity: cartItem.quantity + 1
                        })
                      )
                    }
                  >
                    <Plus size={14} />
                  </button>
                </div>
              ) : (
                <button
                  className="btn-add-food"
                  onClick={handleAddClick}
                  disabled={!item.available}
                >
                  <span>{item.available ? 'ADD' : 'SOLD OUT'}</span>
                  {hasCustomizations && <span className="add-plus">+</span>}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Customization Details Modal */}
      {isCustomizeOpen && (
        <FoodCustomizationModal
          item={item}
          restaurant={restaurant}
          isOpen={isCustomizeOpen}
          onClose={() => setIsCustomizeOpen(false)}
        />
      )}
    </>
  );
}


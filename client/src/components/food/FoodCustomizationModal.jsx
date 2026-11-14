import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { X, Plus, Minus, Check } from 'lucide-react';
import { addToCart } from '../../features/cart/cartSlice';

export default function FoodCustomizationModal({ item, restaurant, isOpen, onClose }) {
  const dispatch = useDispatch();

  const sizes = item.customizations?.sizes || [];
  const addOns = item.customizations?.addOns || [];

  const [selectedSize, setSelectedSize] = useState(sizes[0] || null);
  const [selectedAddOns, setSelectedAddOns] = useState([]);
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [quantity, setQuantity] = useState(1);

  if (!isOpen) return null;

  // Calculate Unit Price
  let unitPrice = item.price;
  if (selectedSize && selectedSize.priceDelta) {
    unitPrice += selectedSize.priceDelta;
  }
  selectedAddOns.forEach((addon) => {
    unitPrice += addon.price;
  });

  const totalCalculated = unitPrice * quantity;

  const handleToggleAddOn = (addon) => {
    const exists = selectedAddOns.some((a) => a.name === addon.name);
    if (exists) {
      setSelectedAddOns(selectedAddOns.filter((a) => a.name !== addon.name));
    } else {
      setSelectedAddOns([...selectedAddOns, addon]);
    }
  };

  const handleAddToCart = () => {
    dispatch(
      addToCart({
        menuItemId: item._id,
        quantity,
        size: selectedSize ? { name: selectedSize.name, priceDelta: selectedSize.priceDelta } : undefined,
        addOns: selectedAddOns.map((a) => ({ name: a.name, price: a.price })),
        specialInstructions: specialInstructions.trim()
      })
    );
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content customize-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="customize-header">
          <div className="customize-img-wrapper">
            <img src={item.image} alt={item.name} className="customize-hero-img" />
            <button className="customize-close-btn" onClick={onClose}>
              <X size={20} />
            </button>
          </div>
          <div className="customize-title-area">
            <div className="food-header-row">
              <span className={`diet-icon ${item.isVeg ? 'veg' : 'non-veg'}`} />
              <h3 className="customize-dish-name">{item.name}</h3>
            </div>
            <p className="customize-dish-desc">{item.description}</p>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="customize-body">
          {/* Sizes Selection */}
          {sizes.length > 0 && (
            <div className="custom-section">
              <div className="section-title-row">
                <h4 className="custom-section-title">Select Size</h4>
                <span className="required-tag">Required • Choose 1</span>
              </div>
              <div className="options-list">
                {sizes.map((s, idx) => {
                  const isSelected = selectedSize?.name === s.name;
                  return (
                    <label
                      key={idx}
                      className={`option-row ${isSelected ? 'selected' : ''}`}
                      onClick={() => setSelectedSize(s)}
                    >
                      <div className="option-radio-wrap">
                        <div className={`custom-radio ${isSelected ? 'checked' : ''}`}>
                          {isSelected && <div className="radio-dot" />}
                        </div>
                        <span className="option-label-text">{s.name}</span>
                      </div>
                      <span className="option-price-delta">
                        {s.priceDelta > 0 ? `+₹${Math.round(s.priceDelta / 100)}` : 'Base price'}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {/* Add-ons Selection */}
          {addOns.length > 0 && (
            <div className="custom-section">
              <div className="section-title-row">
                <h4 className="custom-section-title">Add Extra Toppings & Dips</h4>
                <span className="optional-tag">Optional</span>
              </div>
              <div className="options-list">
                {addOns.map((addon, idx) => {
                  const isChecked = selectedAddOns.some((a) => a.name === addon.name);
                  return (
                    <label
                      key={idx}
                      className={`option-row ${isChecked ? 'selected' : ''}`}
                      onClick={() => handleToggleAddOn(addon)}
                    >
                      <div className="option-checkbox-wrap">
                        <div className={`custom-checkbox ${isChecked ? 'checked' : ''}`}>
                          {isChecked && <Check size={14} color="#FFFFFF" strokeWidth={3} />}
                        </div>
                        <span className="option-label-text">{addon.name}</span>
                      </div>
                      <span className="option-price-delta">
                        +₹{Math.round(addon.price / 100)}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {/* Special Cooking Instructions */}
          <div className="custom-section">
            <h4 className="custom-section-title">Special Cooking Instructions</h4>
            <p className="instruction-hint">Let the restaurant know if you have allergy or taste preferences.</p>
            <textarea
              className="special-instruction-input"
              placeholder="e.g. Please make it less spicy, extra oregano packets, no onions..."
              rows={3}
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              maxLength={200}
            />
          </div>
        </div>

        {/* Footer CTA */}
        <div className="customize-footer">
          <div className="qty-control-box">
            <button
              className="qty-btn"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
            >
              <Minus size={16} />
            </button>
            <span className="qty-val">{quantity}</span>
            <button
              className="qty-btn"
              onClick={() => setQuantity(quantity + 1)}
            >
              <Plus size={16} />
            </button>
          </div>

          <button className="btn btn-primary btn-add-custom" onClick={handleAddToCart}>
            <span>Add Item to Cart</span>
            <span>•</span>
            <span className="btn-total-price">₹{Math.round(totalCalculated / 100)}</span>
          </button>
        </div>
      </div>
    </div>
  );
}


import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { AlertTriangle, X } from 'lucide-react';
import { closeConflictModal, addToCart } from '../../features/cart/cartSlice';

export default function CartConflictModal() {
  const dispatch = useDispatch();
  const { conflictModal } = useSelector((state) => state.cart);

  if (!conflictModal.isOpen) return null;

  const handleConfirm = () => {
    if (conflictModal.pendingPayload) {
      dispatch(
        addToCart({
          ...conflictModal.pendingPayload,
          clearPrevious: true
        })
      );
    }
    dispatch(closeConflictModal());
  };

  return (
    <div className="modal-overlay" onClick={() => dispatch(closeConflictModal())}>
      <div className="modal-content conflict-modal" onClick={(e) => e.stopPropagation()}>
        <div className="conflict-icon-box">
          <AlertTriangle size={32} className="text-orange" />
        </div>

        <h3 className="conflict-title">Replace cart items?</h3>
        <p className="conflict-desc">
          Your cart already contains delicious items from another restaurant. FoodDelight allows ordering from one restaurant at a time to ensure your food arrives hot and fresh.
        </p>

        <p className="conflict-prompt">
          Would you like to clear your current cart and start an order with this item?
        </p>

        <div className="conflict-actions">
          <button
            className="btn btn-outline"
            onClick={() => dispatch(closeConflictModal())}
          >
            Keep Existing Items
          </button>
          <button className="btn btn-primary" onClick={handleConfirm}>
            Discard & Add New
          </button>
        </div>
      </div>
    </div>
  );
}


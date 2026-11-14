import React, { useState } from 'react';
import { X, Star, CheckCircle, AlertCircle } from 'lucide-react';
import api from '../../services/api';

export default function ReviewModal({ order, isOpen, onClose, onSuccess }) {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [foodRating, setFoodRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !order) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) {
      setError('Please write a short review about your food and experience.');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      await api.post('/reviews', {
        orderId: order._id,
        rating,
        foodRating,
        comment: comment.trim()
      });

      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content review-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h3 className="modal-title">Rate & Review Your Meal</h3>
            <p className="modal-sub">{order.restaurant.name} • #{order.orderNumber}</p>
          </div>
          <button className="btn-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body" style={{ padding: '1.25rem' }}>
          {/* Restaurant Overall Rating */}
          <div className="rating-select-group">
            <span className="rating-label">Overall Experience</span>
            <div className="star-row">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  className="star-btn"
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(star)}
                >
                  <Star
                    size={28}
                    fill={(hoverRating || rating) >= star ? '#F97316' : 'none'}
                    color={(hoverRating || rating) >= star ? '#F97316' : '#D6D3D1'}
                  />
                </button>
              ))}
              <span className="rating-text-hint">
                {['Poor', 'Fair', 'Good', 'Very Good', 'Exceptional!'][rating - 1]}
              </span>
            </div>
          </div>

          {/* Food Quality Rating */}
          <div className="rating-select-group" style={{ marginTop: '1rem' }}>
            <span className="rating-label">Food Quality & Taste</span>
            <div className="star-row">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  className="star-btn"
                  onClick={() => setFoodRating(star)}
                >
                  <Star
                    size={22}
                    fill={foodRating >= star ? '#15803D' : 'none'}
                    color={foodRating >= star ? '#15803D' : '#D6D3D1'}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Review Text */}
          <div className="form-group" style={{ marginTop: '1.25rem' }}>
            <label className="form-label">Write your feedback</label>
            <textarea
              className="form-input"
              rows={4}
              placeholder="What did you love most about the taste, packaging, and delivery?"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              required
            />
          </div>

          {error && (
            <div className="form-error" style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: 6 }}>
              <AlertCircle size={15} />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '0.5rem' }}
            disabled={submitting}
          >
            {submitting ? 'Submitting Review...' : 'Submit Verified Review'}
          </button>
        </form>
      </div>
    </div>
  );
}


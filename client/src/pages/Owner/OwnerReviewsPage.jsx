import React, { useState, useEffect } from 'react';
import {
  Star,
  MessageSquare,
  CornerDownRight,
  Send,
  Flag,
  CheckCircle2,
  X,
  AlertTriangle
} from 'lucide-react';
import ownerApi from '../../services/ownerApi';

export default function OwnerReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(4.5);
  const [breakdown, setBreakdown] = useState({ 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 });
  const [ratingFilter, setRatingFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  // Reply modal
  const [replyReview, setReplyReview] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);

  // Report modal
  const [reportReview, setReportReview] = useState(null);
  const [reportReason, setReportReason] = useState('');
  const [submittingReport, setSubmittingReport] = useState(false);

  const fetchReviews = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (ratingFilter !== 'all') params.append('rating', ratingFilter);

      const res = await ownerApi.get(`/reviews?${params.toString()}`);
      setReviews(res.data.reviews || []);
      if (res.data.breakdown) setBreakdown(res.data.breakdown);
      if (res.data.averageRating) setAverageRating(res.data.averageRating);
    } catch (err) {
      console.error('Error fetching reviews:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [ratingFilter]);

  const handlePostReply = async () => {
    if (!replyReview || !replyText.trim()) return;
    try {
      setSubmittingReply(true);
      await ownerApi.post(`/reviews/${replyReview._id}/reply`, {
        message: replyText
      });
      setReplyReview(null);
      setReplyText('');
      fetchReviews();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to post reply.');
    } finally {
      setSubmittingReply(false);
    }
  };

  const handlePostReport = async () => {
    if (!reportReview || !reportReason.trim()) return;
    try {
      setSubmittingReport(true);
      await ownerApi.post(`/reviews/${reportReview._id}/report`, {
        reason: reportReason
      });
      setReportReview(null);
      setReportReason('');
      fetchReviews();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to report review.');
    } finally {
      setSubmittingReport(false);
    }
  };

  const totalReviewsCount = Object.values(breakdown).reduce((a, b) => a + b, 0);

  return (
    <div>
      {/* Header */}
      <div className="owner-page-header">
        <div className="owner-page-header-text">
          <h1>Customer Reviews & Reputation</h1>
          <p>Read customer dining feedback and build loyalty by replying directly.</p>
        </div>
      </div>

      {/* Ratings Overview Top Grid */}
      <div className="owner-grid-2col" style={{ gridTemplateColumns: '1fr 2fr', marginBottom: '1.5rem' }}>
        {/* Rating Score Banner */}
        <div className="owner-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
          <div style={{ fontSize: '3.5rem', fontWeight: 900, color: '#292524', lineHeight: 1 }}>
            {averageRating}
          </div>
          <div style={{ display: 'flex', gap: '0.25rem', color: '#F59E0B', margin: '0.5rem 0' }}>
            {[1, 2, 3, 4, 5].map((s) => (
              <Star
                key={s}
                size={22}
                fill={s <= Math.round(averageRating) ? '#F59E0B' : 'none'}
              />
            ))}
          </div>
          <div style={{ color: '#78716C', fontSize: '0.85rem' }}>
            Based on {totalReviewsCount} verified dining reviews
          </div>
        </div>

        {/* Rating Breakdown Bars */}
        <div className="owner-card">
          <h3 style={{ margin: '0 0 1rem 0', fontSize: '1rem', fontWeight: 700 }}>
            Rating Breakdown
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {[5, 4, 3, 2, 1].map((stars) => {
              const count = breakdown[stars] || 0;
              const percent = totalReviewsCount > 0 ? (count / totalReviewsCount) * 100 : 0;
              return (
                <div key={stars} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.85rem' }}>
                  <div style={{ width: '45px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                    <span>{stars}</span>
                    <Star size={14} fill="#F59E0B" color="#F59E0B" />
                  </div>
                  <div style={{ flex: 1, background: '#E7E5E4', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${percent}%`, background: '#F59E0B', height: '100%', borderRadius: '4px' }} />
                  </div>
                  <div style={{ width: '35px', textAlign: 'right', color: '#78716C', fontWeight: 600 }}>
                    {count}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', overflowX: 'auto' }}>
        {['all', '5', '4', '3', '2', '1'].map((r) => (
          <button
            key={r}
            onClick={() => setRatingFilter(r)}
            style={{
              padding: '0.45rem 1rem',
              borderRadius: '8px',
              border: ratingFilter === r ? '2px solid #F97316' : '1px solid #E7E5E4',
              background: ratingFilter === r ? '#FFEDD5' : '#ffffff',
              color: ratingFilter === r ? '#EA580C' : '#292524',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer'
            }}
          >
            {r === 'all' ? 'All Ratings' : `${r} Star`}
          </button>
        ))}
      </div>

      {/* Reviews List */}
      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '3rem 0', color: '#F97316', fontWeight: 700 }}>
          Loading reviews...
        </div>
      ) : reviews.length === 0 ? (
        <div className="owner-card" style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
          <Star size={48} color="#D6D3D1" style={{ margin: '0 auto 1rem auto' }} />
          <h3>No customer reviews found</h3>
          <p style={{ color: '#78716C' }}>No reviews match the selected rating filter.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {reviews.map((rev) => (
            <div key={rev._id} className="owner-card">
              {/* Review Header */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <img
                    src={rev.user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
                    alt={rev.user?.name || 'Customer'}
                    style={{ width: '42px', height: '42px', borderRadius: '50%', objectFit: 'cover' }}
                  />
                  <div>
                    <div style={{ fontWeight: 700, color: '#292524' }}>
                      {rev.user?.name || 'FoodDelight Customer'}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#78716C' }}>
                      Reviewed on {new Date(rev.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', color: '#F59E0B' }}>
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      size={16}
                      fill={s <= rev.rating ? '#F59E0B' : 'none'}
                    />
                  ))}
                </div>
              </div>

              {/* Review Comment */}
              <p style={{ margin: '0 0 1rem 0', color: '#292524', fontSize: '0.95rem', lineHeight: 1.5 }}>
                "{rev.comment}"
              </p>

              {/* Existing Restaurant Reply */}
              {rev.reply?.message && (
                <div
                  style={{
                    background: '#FFF8F0',
                    borderLeft: '3px solid #F97316',
                    padding: '0.85rem 1rem',
                    borderRadius: '0 8px 8px 0',
                    marginBottom: '0.75rem'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700, fontSize: '0.85rem', color: '#EA580C', marginBottom: '0.25rem' }}>
                    <CornerDownRight size={14} />
                    <span>Restaurant Owner Reply</span>
                    <span style={{ fontSize: '0.75rem', color: '#78716C', fontWeight: 500 }}>
                      ({new Date(rev.reply.repliedAt).toLocaleDateString()})
                    </span>
                  </div>
                  <div style={{ fontSize: '0.9rem', color: '#292524' }}>{rev.reply.message}</div>
                </div>
              )}

              {/* Actions */}
              <div style={{ display: 'flex', gap: '0.75rem', borderTop: '1px solid #E7E5E4', paddingTop: '0.75rem' }}>
                <button
                  onClick={() => {
                    setReplyReview(rev);
                    setReplyText(rev.reply?.message || '');
                  }}
                  className="owner-btn-secondary"
                  style={{ padding: '0.4rem 0.85rem', fontSize: '0.85rem' }}
                >
                  <MessageSquare size={16} />
                  <span>{rev.reply?.message ? 'Edit Reply' : 'Reply to Customer'}</span>
                </button>

                {!rev.isReported && (
                  <button
                    onClick={() => setReportReview(rev)}
                    className="owner-btn-secondary"
                    style={{ padding: '0.4rem 0.85rem', fontSize: '0.85rem', color: '#DC2626', borderColor: '#FECACA' }}
                  >
                    <Flag size={14} />
                    <span>Report Review</span>
                  </button>
                )}

                {rev.isReported && (
                  <span style={{ fontSize: '0.75rem', color: '#92400E', background: '#FEF3C7', padding: '0.35rem 0.65rem', borderRadius: '6px', fontWeight: 600 }}>
                    Reported to Admin Moderation
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reply Modal */}
      {replyReview && (
        <div className="owner-modal-overlay">
          <div className="owner-modal" style={{ maxWidth: '500px' }}>
            <div className="owner-modal-header">
              <h3>Reply to Customer Review</h3>
              <button onClick={() => setReplyReview(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>
            <div className="owner-modal-body">
              <div style={{ background: '#FAFAF9', padding: '0.85rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.85rem' }}>
                <strong>Customer ({replyReview.user?.name}):</strong> "{replyReview.comment}"
              </div>
              <div className="owner-form-group">
                <label>Your Public Response *</label>
                <textarea
                  rows={4}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Thank the customer for dining with you or address their feedback courteously..."
                  className="owner-form-textarea"
                />
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.25rem' }}>
                <button onClick={() => setReplyReview(null)} className="owner-btn-secondary">
                  Cancel
                </button>
                <button onClick={handlePostReply} disabled={submittingReply} className="owner-btn-primary">
                  <Send size={16} />
                  <span>{submittingReply ? 'Posting...' : 'Publish Response'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Report Modal */}
      {reportReview && (
        <div className="owner-modal-overlay">
          <div className="owner-modal" style={{ maxWidth: '440px' }}>
            <div className="owner-modal-header">
              <h3>Report Review</h3>
              <button onClick={() => setReportReview(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>
            <div className="owner-modal-body">
              <p style={{ margin: '0 0 1rem 0', color: '#78716C', fontSize: '0.875rem' }}>
                If this review contains harassment, offensive language, or false information, submit a flag for administrative moderation:
              </p>
              <div className="owner-form-group">
                <label>Reason for Flagging *</label>
                <textarea
                  rows={3}
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  placeholder="e.g. Abusive language / competitive harassment"
                  className="owner-form-textarea"
                />
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.25rem' }}>
                <button onClick={() => setReportReview(null)} className="owner-btn-secondary">
                  Cancel
                </button>
                <button onClick={handlePostReport} disabled={submittingReport} className="owner-btn-primary" style={{ background: '#DC2626' }}>
                  <span>{submittingReport ? 'Submitting...' : 'Submit Report'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


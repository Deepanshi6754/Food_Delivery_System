import React from 'react';
import {
  CheckCircle2,
  Clock,
  ChefHat,
  PackageCheck,
  Bike,
  Home,
  Check,
  PhoneCall,
  Sparkles,
  Play
} from 'lucide-react';

const STAGES = [
  { key: 'placed', title: 'Order Placed', desc: 'Received by FoodDelight', icon: Clock },
  { key: 'confirmed', title: 'Restaurant Confirmed', desc: 'Kitchen accepted order', icon: CheckCircle2 },
  { key: 'preparing', title: 'Food Preparing', desc: 'Chef cooking with care', icon: ChefHat },
  { key: 'ready_for_pickup', title: 'Ready for Pickup', desc: 'Packed hot & fresh', icon: PackageCheck },
  { key: 'out_for_delivery', title: 'Out for Delivery', desc: 'Rider is on the way', icon: Bike },
  { key: 'delivered', title: 'Delivered', desc: 'Enjoy your hot meal!', icon: Home }
];

export default function OrderTrackingTimeline({ order, onSimulateStatus, isSimulating }) {
  const currentStatus = order.orderStatus || 'placed';
  const currentIndex = STAGES.findIndex((s) => s.key === currentStatus);

  const isDelivered = currentStatus === 'delivered';
  const isCancelled = currentStatus === 'cancelled';

  return (
    <div className="tracking-timeline-card">
      <div className="timeline-header-row">
        <div>
          <span className="live-status-pill">
            <span className="pulsing-dot" />
            LIVE STATUS
          </span>
          <h3 className="tracking-current-status">
            {isCancelled
              ? 'Order Cancelled'
              : STAGES[currentIndex]?.title || 'Order Processing'}
          </h3>
          <p className="tracking-subtext">
            {isCancelled
              ? order.cancellationReason || 'Cancelled by customer'
              : `Estimated delivery by ${order.estimatedDeliveryTime || '30-40 mins'}`}
          </p>
        </div>

        {/* Live Simulation Control for testing */}
        {!isDelivered && !isCancelled && onSimulateStatus && (
          <button
            className="btn btn-secondary btn-sm simulate-btn"
            onClick={onSimulateStatus}
            disabled={isSimulating}
            title="Simulate advancing to the next delivery stage in real-time"
          >
            <Play size={14} />
            <span>{isSimulating ? 'Updating...' : 'Advance Stage (Demo)'}</span>
          </button>
        )}
      </div>

      {/* 6-Stage Timeline Stepper */}
      <div className="timeline-stepper">
        {STAGES.map((stage, idx) => {
          const Icon = stage.icon;
          const isCompleted = idx < currentIndex || isDelivered;
          const isCurrent = idx === currentIndex && !isDelivered;
          const isPending = idx > currentIndex && !isDelivered;

          return (
            <div
              key={stage.key}
              className={`timeline-step ${
                isCompleted ? 'completed' : isCurrent ? 'current' : 'pending'
              }`}
            >
              <div className="step-marker-col">
                <div className="step-icon-circle">
                  {isCompleted ? (
                    <Check size={16} strokeWidth={3} />
                  ) : (
                    <Icon size={16} />
                  )}
                </div>
                {idx < STAGES.length - 1 && <div className="step-connector-line" />}
              </div>

              <div className="step-info-col">
                <div className="step-header">
                  <h4 className="step-title">{stage.title}</h4>
                  {isCurrent && (
                    <span className="step-in-progress-tag">In Progress</span>
                  )}
                </div>
                <p className="step-desc">{stage.desc}</p>
                {/* Status history notes if available */}
                {order.statusHistory?.find((h) => h.status === stage.key) && (
                  <span className="step-timestamp">
                    {new Date(
                      order.statusHistory.find((h) => h.status === stage.key).timestamp
                    ).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Assigned Delivery Rider Profile */}
      {['ready_for_pickup', 'out_for_delivery', 'delivered'].includes(currentStatus) &&
        order.rider && (
          <div className="rider-card">
            <img
              src={order.rider.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'}
              alt={order.rider.name}
              className="rider-avatar"
            />
            <div className="rider-details">
              <span className="rider-role">Assigned Delivery Partner</span>
              <h4 className="rider-name">{order.rider.name}</h4>
              <p className="rider-vehicle">Vehicle: {order.rider.vehicleNumber}</p>
            </div>
            <a
              href={`tel:${order.rider.phone}`}
              className="btn-call-rider"
              title="Call delivery partner"
            >
              <PhoneCall size={18} />
              <span>Call Rider</span>
            </a>
          </div>
        )}
    </div>
  );
}


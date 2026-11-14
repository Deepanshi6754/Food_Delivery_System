import React from 'react';
import { Link } from 'react-router-dom';
import { UtensilsCrossed, ShieldCheck, Clock, Award, Heart, Mail, Phone } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="footer-wrapper">
      {/* Value Proposition Highlights */}
      <div className="features-banner">
        <div className="container features-grid">
          <div className="feature-item">
            <div className="feature-icon">
              <Clock size={24} className="text-orange" />
            </div>
            <div>
              <h4 className="feature-title">Fast Delivery</h4>
              <p className="feature-desc">Hot & fresh food delivered to your door in 30 mins</p>
            </div>
          </div>

          <div className="feature-item">
            <div className="feature-icon">
              <ShieldCheck size={24} className="text-orange" />
            </div>
            <div>
              <h4 className="feature-title">100% Secure Checkout</h4>
              <p className="feature-desc">Razorpay encrypted payments, UPI, and Cash on Delivery</p>
            </div>
          </div>

          <div className="feature-item">
            <div className="feature-icon">
              <Award size={24} className="text-orange" />
            </div>
            <div>
              <h4 className="feature-title">Top Rated Restaurants</h4>
              <p className="feature-desc">Curated certified kitchens with verified customer reviews</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container footer-main">
        <div className="footer-grid">
          {/* Brand Column */}
          <div className="footer-brand-col">
            <Link to="/" className="brand-logo footer-logo">
              <div className="brand-icon">
                <UtensilsCrossed size={20} color="#FFFFFF" strokeWidth={2.5} />
              </div>
              <div className="brand-text">
                <span>Food</span>
                <span className="text-orange">Delight</span>
              </div>
            </Link>
            <p className="footer-about">
              FoodDelight is your premium culinary destination connecting food lovers with top chefs and restaurants for an unforgettable dining experience at home.
            </p>
            <div className="footer-contact">
              <div className="contact-row">
                <Phone size={16} className="text-orange" />
                <span>+91 11 4567 8900</span>
              </div>
              <div className="contact-row">
                <Mail size={16} className="text-orange" />
                <span>support@fooddelight.com</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="footer-col">
            <h4 className="footer-heading">Quick Links</h4>
            <ul className="footer-links">
              <li><Link to="/">Home</Link></li>
              <li><Link to="/restaurants">All Restaurants</Link></li>
              <li><Link to="/offers">Special Offers & Deals</Link></li>
              <li><Link to="/wishlist">My Wishlist</Link></li>
              <li><Link to="/my-orders">Track Orders</Link></li>
              <li><Link to="/owner/login" style={{ color: '#F97316', fontWeight: 700 }}>Restaurant Partner Login</Link></li>
              <li><Link to="/owner/register">Register Your Restaurant</Link></li>
              <li><Link to="/rider/login" style={{ color: '#EA580C', fontWeight: 700 }}>Delivery Rider Login</Link></li>
              <li><Link to="/rider/register">Become a Delivery Partner</Link></li>
            </ul>
          </div>

          {/* Popular Cuisines */}
          <div className="footer-col">
            <h4 className="footer-heading">Popular Cuisines</h4>
            <ul className="footer-links">
              <li><Link to="/restaurants?cuisine=Pizza">Artisanal Pizza</Link></li>
              <li><Link to="/restaurants?cuisine=Indian">North Indian & Curries</Link></li>
              <li><Link to="/restaurants?cuisine=Burgers">Gourmet Burgers</Link></li>
              <li><Link to="/restaurants?cuisine=South%20Indian">Authentic South Indian</Link></li>
              <li><Link to="/restaurants?cuisine=Desserts">Waffles & Desserts</Link></li>
            </ul>
          </div>

          {/* Customer Care */}
          <div className="footer-col">
            <h4 className="footer-heading">Customer Care</h4>
            <ul className="footer-links">
              <li><Link to="/support">Help & Support Center</Link></li>
              <li><Link to="/support">FAQs</Link></li>
              <li><Link to="/support">Cancellation & Refunds</Link></li>
              <li><Link to="/profile">Saved Addresses</Link></li>
              <li><Link to="/support">Raise a Complaint</Link></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} FoodDelight Technologies Private Limited. All rights reserved.</p>
          <div className="footer-badges">
            <span>Made with passion for good food</span>
            <Heart size={14} fill="#F97316" color="#F97316" />
          </div>
        </div>
      </div>
    </footer>
  );
}


import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  ArrowRight,
  Sparkles,
  Flame,
  Star,
  Clock,
  Bike,
  ShieldCheck,
  Percent,
  CheckCircle2,
  ChevronRight
} from 'lucide-react';
import api from '../../services/api';
import RestaurantCard from '../../components/restaurant/RestaurantCard';
import CategoryPills from '../../components/restaurant/CategoryPills';
import FoodCard from '../../components/food/FoodCard';

export default function HomePage() {
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [curatedData, setCuratedData] = useState({
    popular: [],
    topRated: [],
    trending: [],
    offers: []
  });
  const [trendingDishes, setTrendingDishes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [homeRes, dishesRes] = await Promise.all([
          api.get('/restaurants/curated/home'),
          api.get('/menu-items/trending')
        ]);
        setCuratedData(homeRes.data.data);
        setTrendingDishes(dishesRes.data.data);
      } catch (err) {
        console.error('Failed to load homepage data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleHeroSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/restaurants?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/restaurants');
    }
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    if (category) {
      navigate(`/restaurants?cuisine=${encodeURIComponent(category)}`);
    } else {
      navigate('/restaurants');
    }
  };

  return (
    <div className="homepage-wrapper">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="container hero-container">
          <div className="hero-content">
            <div className="hero-badge">
              <Sparkles size={16} className="text-orange" />
              <span>Premium Gourmet Delivery</span>
            </div>

            <h1 className="hero-headline">
              Good Food, <br />
              <span className="text-orange">Great Mood!</span>
            </h1>

            <p className="hero-subtitle">
              Indulge in artisanal pizzas, fragrant dum biryanis, gourmet smash burgers, and decadent desserts delivered fresh and hot to your doorstep.
            </p>

            {/* Direct Hero Search */}
            <form className="hero-search-box" onSubmit={handleHeroSearch}>
              <div className="search-input-group">
                <Search size={20} className="search-icon text-muted" />
                <input
                  type="text"
                  placeholder="Search for restaurants, dishes, or cuisines..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="hero-search-input"
                />
              </div>
              <button type="submit" className="btn btn-primary btn-search-hero">
                <span>Find Food</span>
                <ArrowRight size={18} />
              </button>
            </form>

            {/* Quick Hero Tags */}
            <div className="hero-quick-tags">
              <span className="quick-tag-label">Trending:</span>
              <button className="tag-pill" onClick={() => navigate('/restaurants?cuisine=Pizza')}>Woodfired Pizza</button>
              <button className="tag-pill" onClick={() => navigate('/restaurants?cuisine=Indian')}>Dum Biryani</button>
              <button className="tag-pill" onClick={() => navigate('/restaurants?cuisine=Burgers')}>Smash Burgers</button>
              <button className="tag-pill" onClick={() => navigate('/restaurants?vegOnly=true')}>Pure Veg</button>
            </div>
          </div>

          {/* Hero Visual Imagery */}
          <div className="hero-visual">
            <div className="hero-image-card main-hero-card">
              <img
                src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=900"
                alt="Delicious Gourmet Food"
                className="hero-img-main"
              />
              <div className="hero-floating-badge badge-top-right">
                <Flame size={16} color="#F97316" fill="#F97316" />
                <span>30-min Express Delivery</span>
              </div>
              <div className="hero-floating-badge badge-bottom-left">
                <Star size={16} color="#EAB308" fill="#EAB308" />
                <span>4.8 / 5.0 (2,400+ Reviews)</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Food Categories Carousel */}
      <section className="section-container">
        <div className="container">
          <div className="section-header">
            <div>
              <span className="section-label">INSPIRATION FOR YOUR NEXT ORDER</span>
              <h2 className="section-title">Explore by Cuisine</h2>
            </div>
          </div>

          <CategoryPills
            selectedCategory={selectedCategory}
            onSelectCategory={handleCategorySelect}
          />
        </div>
      </section>

      {/* Exclusive Promotional Banner */}
      <section className="promo-banner-section">
        <div className="container">
          <div className="promo-banner-card">
            <div className="promo-text-group">
              <span className="promo-tag">LIMITED TIME SPECIAL</span>
              <h3 className="promo-title">Get 50% OFF up to ₹100 on your first order!</h3>
              <p className="promo-desc">
                Use promo code <strong className="promo-code-highlight">WELCOME50</strong> during checkout. Minimum order value ₹199.
              </p>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => navigate('/offers')}
              >
                <span>View All Offers</span>
                <ChevronRight size={16} />
              </button>
            </div>
            <div className="promo-img-wrapper">
              <img
                src="https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600"
                alt="Pizza Promo"
                className="promo-pizza-img"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Popular Restaurants Section */}
      <section className="section-container">
        <div className="container">
          <div className="section-header">
            <div>
              <span className="section-label">MOST POPULAR IN YOUR CITY</span>
              <h2 className="section-title">Top Rated Restaurants</h2>
            </div>
            <button
              className="btn btn-outline btn-sm"
              onClick={() => navigate('/restaurants')}
            >
              <span>See All Restaurants</span>
              <ArrowRight size={16} />
            </button>
          </div>

          {loading ? (
            <div className="restaurants-grid">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="card restaurant-card" style={{ height: 320 }}>
                  <div className="skeleton" style={{ height: 200, borderRadius: 0 }} />
                  <div style={{ padding: '1rem' }}>
                    <div className="skeleton" style={{ height: 20, width: '70%', marginBottom: 8 }} />
                    <div className="skeleton" style={{ height: 14, width: '40%' }} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="restaurants-grid">
              {curatedData.popular?.map((restaurant) => (
                <RestaurantCard key={restaurant._id} restaurant={restaurant} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Trending Dishes Section */}
      {trendingDishes && trendingDishes.length > 0 && (
        <section className="section-container" style={{ background: '#FFFDF9', padding: '4rem 0' }}>
          <div className="container">
            <div className="section-header">
              <div>
                <span className="section-label">CUSTOMER FAVOURITES</span>
                <h2 className="section-title">Trending Dishes Near You</h2>
              </div>
              <button
                className="btn btn-outline btn-sm"
                onClick={() => navigate('/restaurants')}
              >
                <span>Explore Full Menu</span>
                <ArrowRight size={16} />
              </button>
            </div>

            <div className="dishes-grid">
              {trendingDishes.slice(0, 4).map((item) => (
                <FoodCard
                  key={item._id}
                  item={item}
                  restaurant={item.restaurant}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Why Choose FoodDelight Feature Grid */}
      <section className="section-container">
        <div className="container">
          <div className="section-header text-center" style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <span className="section-label">THE FOODDELIGHT STANDARD</span>
            <h2 className="section-title">Why Customers Love Us</h2>
          </div>

          <div className="why-us-grid">
            <div className="why-card">
              <div className="why-icon-circle">
                <Clock size={28} className="text-orange" />
              </div>
              <h3 className="why-title">Swift 30-Min Delivery</h3>
              <p className="why-desc">
                Our smart routing and dedicated rider fleet ensures your food arrives piping hot and fresh.
              </p>
            </div>

            <div className="why-card">
              <div className="why-icon-circle">
                <ShieldCheck size={28} className="text-orange" />
              </div>
              <h3 className="why-title">Hygiene Certified Kitchens</h3>
              <p className="why-desc">
                We partner only with rigorously audited restaurants meeting strict culinary and sanitization standards.
              </p>
            </div>

            <div className="why-card">
              <div className="why-icon-circle">
                <Percent size={28} className="text-orange" />
              </div>
              <h3 className="why-title">Transparent Pricing</h3>
              <p className="why-desc">
                No hidden packaging fees or surprise charges. Free delivery on orders above ₹500 with instant coupon savings.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}


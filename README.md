# 🍊 FoodDelight — Customer Portal (Module 01)

FoodDelight is a premium, modern, responsive, commercial-grade online food delivery platform built with the MERN stack (MongoDB, Express, React 18, Node.js), Redux Toolkit, and Socket.IO.

---

## 🎨 1. Light Premium Design System

The application strictly implements the required **Light Premium** visual identity:

- **Background:** Warm Cream (`#FFF8F0`)
- **Primary:** Tangerine Orange (`#F97316`)
- **Primary Hover:** Deep Tangerine (`#EA580C`)
- **Light Accent:** Creamsicle Light (`#FFEDD5`)
- **Secondary / Card Background:** Pure White (`#FFFFFF`)
- **Primary Text:** Charcoal (`#292524`)
- **Secondary Text:** Warm Gray (`#78716C`)
- **Success:** Forest Green (`#15803D`)
- **Error:** Crimson Red (`#DC2626`)
- **Typography:** Plus Jakarta Sans & Inter
- **Icons:** Minimal Lucide React icons
- **Micro-interactions:** Smooth hover effects, subtle elevation, responsive drawers, modal dialogs, and celebratory confetti.

---

## 🚀 2. Key Modules & Features Implemented

### A. Customer Authentication
- Full customer registration (Name, Email, Phone, Password) with client & server-side validation.
- Secure login supporting either **Email** or **Phone Number** with password.
- Show/hide password toggles.
- Forgot password & password reset with secure cryptographic tokens.
- Persistent session management with JWT and Redux store.
- **1-Click Quick Demo Login buttons** on the Sign-In page (`Demo Customer` and `Demo Admin`).

### B. Customer Homepage
- **Navigation Bar:** FoodDelight brand badge, Live Delivery Location selector modal, Cart drawer trigger with badge count, Wishlist badge, Real-time Notification Center, and Profile dropdown.
- **Hero Section:** Headline *"Good Food, Great Mood!"*, supporting text, high-resolution food photography, direct search bar, and popular trending cuisine pills.
- **Explore by Cuisine:** Interactive categories carousel (Pizza, Burgers, Indian, Chinese, South Indian, Desserts, Healthy Food, Beverages).
- **Curated Showcases:** Top Rated Restaurants, Trending Dishes Near You, Limited Time Offers, and Customer Value propositions.

### C. Restaurant Discovery & Advanced Search
- Live search across restaurant names, dishes, and cuisines.
- Tabbed search results switching between **Restaurants** and **Dishes**.
- Comprehensive filter pills:
  - Pure Vegetarian toggle
  - Rating filters (4.0+, 4.5+)
  - Fast Delivery ($\le$ 30 mins)
  - Great Offers only
  - Cuisine selector
- Sorting options: Highest Rated, Most Popular, Fastest Delivery, Price (Low to High), Price (High to Low).
- Empty results handling and shimmer skeleton loading states.

### D. Restaurant Details & Food Menu
- Cover banner with restaurant photo, rating badge, review count, address, opening hours, delivery charges, and minimum order values.
- Active restaurant-specific promo badges.
- In-menu live search & Pure Veg filter.
- Categorized menu items (Starters, Main Course, Pizzas, Desserts, Beverages).
- **Food Customization Modal:**
  - Size selection (Small, Medium, Large with dynamic price deltas).
  - Add-ons and extra toppings with price additions.
  - Special cooking instructions note for chef.
  - Live dynamic price calculation (`Add to Cart • ₹389`).

### E. Smart Shopping Cart
- Single-restaurant-per-cart integrity check:
  - If a user adds an item from another restaurant, a **Cart Conflict Modal** asks whether to discard or keep previous items.
- Item quantity stepper (`+` / `-`) and item removal.
- Free delivery milestone progress meter: *"Add ₹X more for FREE Delivery"*.
- Automatic 5% GST tax and delivery fee calculation.
- Coupon promo code input with instant validation and discount deduction.
- Responsive sliding cart drawer from the right.

### F. Saved Delivery Addresses
- Add, Edit, Delete, and Set Default delivery addresses.
- Labels: `Home`, `Work`, `Other`.
- Full address validation: Recipient name, phone number, flat/house number, street, area, landmark, city, state, and PIN code.
- Custom delivery instructions.

### G. Coupons & Special Offers
- Dedicated Offers & Coupons page (`/offers`).
- Real-time coupon validation on the backend (expiry, minimum order amount, maximum discount, restaurant eligibility).
- 1-click "Apply" to cart or "Copy Code" with instant feedback.
- Pre-seeded coupons: `WELCOME50` (50% off up to ₹100), `FOODDELIGHT` (Flat ₹75 off), `FEAST20` (20% off up to ₹150).

### H. Checkout & Payments
- 5-step checkout:
  1. Select or create delivery address.
  2. Order item review.
  3. Cooking and delivery instructions.
  4. Payment method: **Razorpay Online** (UPI, Cards, Netbanking) and **Cash on Delivery (COD)**.
  5. Server-side payment verification and order creation.
- Confetti celebration upon successful order!

### I. Live Order Tracking (Socket.IO Real-time)
- 6-stage order journey timeline:
  1. `Order Placed`
  2. `Restaurant Confirmed`
  3. `Food Preparing`
  4. `Ready for Pickup`
  5. `Out for Delivery`
  6. `Delivered`
- Live status badge, estimated delivery time, and assigned delivery rider details (Name, photo, phone, vehicle number).
- **Interactive "Advance Stage (Demo)" button** so evaluators can witness real-time status transitions live on screen via Socket.IO!

### J. My Orders & Invoices
- Status tabs: All Orders, Active Orders, Delivered, Cancelled.
- Printable/downloadable **Tax Invoice Receipt Modal**.
- Re-order button with real-time price and availability re-validation.
- Cancel order eligibility check (allowed while in `placed` or `confirmed` status).

### K. Customer Reviews & Ratings
- Verified review submission for delivered orders.
- 5-star rating for overall experience + food quality rating.
- Automatically recalculates restaurant average rating and review counts.

### L. Customer Support & Tickets
- FAQ accordion with answers to common delivery questions.
- Support ticket creation with category, subject, and description.
- Interactive support ticket chat thread with message history.

---

## 🔑 3. Default Demo Accounts

For immediate evaluation, the database is pre-seeded with:

| Account Role | Email | Password |
|---|---|---|
| **Customer** | `demo@fooddelight.com` | `password123` |
| **Restaurant Owner** | `owner@fooddelight.com` | `owner123` |
| **Admin** | `admin@fooddelight.com` | `admin123` |

*(Note: You can also click the "Demo Customer" quick-fill button on the customer Sign In page, or the "One-Click Demo Owner Access" on `/owner/login` for instant testing!)*

---

## 🍳 4. Module 02: Restaurant Owner Portal

The **Restaurant Owner Portal** (`/owner/*`) is a complete, professional, responsive SaaS management dashboard built specifically for food delivery restaurant partners.

### Key Capabilities:
- **Authentication & Onboarding (`/owner/login`, `/owner/register`):**
  - Partner registration with personal and restaurant details (cuisine, address, phone).
  - New restaurants receive a `pending` status requiring administrator approval.
  - Ownership security: Owners can only access orders, items, and revenue for their assigned restaurant.
- **Kitchen Command Center Dashboard (`/owner/dashboard`):**
  - 7 Real-time KPI Cards: Total Orders, Today's Orders, Gross Revenue (₹), Today's Revenue (₹), Active Kitchen Orders, Fulfilled Orders, Store Rating (★).
  - Recharts interactive Sales Area Chart (filtered by Daily, Weekly, Monthly, Yearly).
  - Order status distribution Donut Chart.
  - Recent live incoming kitchen orders table.
  - Top 5 bestselling dishes with unit counts and gross revenue.
- **Live Kitchen Order Board (`/owner/orders`):**
  - Real-time updates via Socket.IO `restaurant_${restaurantId}` rooms.
  - Tabbed workflow: `All`, `New Orders` (`placed`), `Accepted` (`confirmed`), `In Kitchen` (`preparing`), `Ready for Pickup` (`ready_for_pickup`), `Delivered`, `Cancelled`.
  - Step-by-step state machine: Accept (with prep time estimation), Reject (with mandatory reason), Start Cooking, Mark Ready for Pickup.
  - Server-side guard: Owners cannot mark orders as delivered or alter payment statuses (restricted to authorized delivery partner / gateway workflows).
- **Menu Management & Food Catalog (`/owner/menu`, `/owner/menu/add`, `/owner/menu/edit/:id`):**
  - Full CRUD for food items: Name, description, image URL, category, base price (stored in paise, displayed in ₹).
  - Dietary classifications: Pure Veg, Vegan, Jain-friendly, Bestseller badge.
  - Customization builders: Multiple portion sizes with dynamic price deltas, custom toppings/add-ons.
  - Instant stock availability toggle (In Stock / Out of Stock).
- **Restaurant Profile & Operations (`/owner/restaurant`):**
  - Manage brand imagery (logo, cover banner), contact phone, email, and outlet address.
  - Operating hours and weekly schedule (opening/closing times, preparation time).
  - Status indicators showing platform approval and verification badges.
- **Customer Reviews & Moderation (`/owner/reviews`):**
  - Star rating breakdown bars (5★ through 1★) and average score.
  - Filter reviews by star rating.
  - Direct public reply to customer reviews.
  - Flag/report inappropriate reviews for administrative moderation.
- **Promotions & Offers (`/owner/promotions`):**
  - Create and manage restaurant-specific coupon discount codes (% or flat discount, max cap, min order, expiry date).
  - Safety guard: Platform-wide coupons cannot be modified or deleted by individual restaurant owners.
- **Revenue, Commission & Bank Payouts (`/owner/earnings`):**
  - Accounting summary: Gross Store Sales, 15% Platform Commission, Net Kitchen Take-home, Settled Payouts.
  - Recharts Monthly Bar Chart comparing Gross Billing vs Net Kitchen Profit.
  - Payout settlement ledger with transaction reference IDs, date cycles, order counts, and net amounts.
  - **Download Financial Report (CSV):** Generates full itemized CSV export of all orders, commissions, and settlements.
- **Store Controls & Security (`/owner/settings`):**
  - "Pause Online Orders" toggle for temporary closure during rush hours.
  - Change password security form.

---

## 🛠️ 5. Tech Stack & Integration Tests

- **Frontend:** React 18, Vite, React Router 7, Redux Toolkit, Recharts, Lucide React, Pure CSS.
- **Backend:** Node.js, Express 5, MongoDB (Mongoose 9), Socket.IO, JWT, bcryptjs.
- **Test Suites:**
  - Customer API Integration Suite: `server/test/api.test.js` (16/16 passed)
  - Restaurant Owner API Integration Suite: `server/test/owner-api.test.js` (16/16 passed)
- **Port Setup:**
  - Backend API & Socket Server: `http://localhost:5000`
  - Web Client (Customer & Owner Portals): `http://localhost:5174` (or `5173`)


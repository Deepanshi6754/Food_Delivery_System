const restaurants = [
  {
    name: "La Pino'z Gourmet Pizza",
    slug: "la-pinoz-gourmet-pizza",
    description: "Authentic Italian wood-fired artisanal pizzas made with hand-stretched dough and San Marzano tomato sauce.",
    cuisine: ["Pizza", "Italian", "Fast Food"],
    rating: 4.7,
    reviewCount: 384,
    deliveryTime: "25-30 mins",
    deliveryTimeMinutes: 28,
    deliveryFee: 3900,
    minOrderValue: 19900,
    priceForTwo: 55000,
    image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800",
    coverImage: "https://images.unsplash.com/photo-1590846406792-0adc7f938f1d?w=1200",
    isOpen: true,
    openingTime: "11:00 AM",
    closingTime: "11:30 PM",
    address: { street: "42 Connaught Place", area: "Central Delhi", city: "New Delhi", pincode: "110001" },
    tags: ["Bestseller", "Woodfired", "Italian Special"],
    isPureVeg: false,
    badge: "50% OFF up to ₹100",
    offers: [
      { code: "WELCOME50", title: "50% OFF", discountText: "50% off up to ₹100", minOrder: 19900 },
      { code: "FEAST20", title: "20% OFF", discountText: "20% off up to ₹150", minOrder: 49900 }
    ],
    featured: true
  },
  {
    name: "Punjab Grill & Royal Kitchen",
    slug: "punjab-grill-royal-kitchen",
    description: "Rich traditional North Indian curries, aromatic slow-cooked biryanis, and tandoori sizzlers.",
    cuisine: ["Indian", "North Indian", "Biryani"],
    rating: 4.8,
    reviewCount: 512,
    deliveryTime: "30-35 mins",
    deliveryTimeMinutes: 32,
    deliveryFee: 4900,
    minOrderValue: 24900,
    priceForTwo: 65000,
    image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800",
    coverImage: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200",
    isOpen: true,
    openingTime: "12:00 PM",
    closingTime: "11:00 PM",
    address: { street: "15 Defence Colony Market", area: "South Delhi", city: "New Delhi", pincode: "110024" },
    tags: ["Royal Taste", "Pure Ghee", "Trending"],
    isPureVeg: false,
    badge: "Flat ₹75 OFF",
    offers: [
      { code: "FOODDELIGHT", title: "Flat ₹75 OFF", discountText: "Flat ₹75 off on orders above ₹399", minOrder: 39900 }
    ],
    featured: true
  },
  {
    name: "The Smash Burger Bistro",
    slug: "the-smash-burger-bistro",
    description: "Crisp edged smash patties, butter-toasted brioche buns, secret house aioli, and hand-cut fries.",
    cuisine: ["Burgers", "Fast Food", "American"],
    rating: 4.6,
    reviewCount: 290,
    deliveryTime: "20-25 mins",
    deliveryTimeMinutes: 22,
    deliveryFee: 3900,
    minOrderValue: 14900,
    priceForTwo: 40000,
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800",
    coverImage: "https://images.unsplash.com/photo-1550547660-d9450f859349?w=1200",
    isOpen: true,
    openingTime: "11:00 AM",
    closingTime: "01:00 AM",
    address: { street: "Shop 12, Hauz Khas Village", area: "South Delhi", city: "New Delhi", pincode: "110016" },
    tags: ["Juicy Burgers", "Night Delivery", "Bestseller"],
    isPureVeg: false,
    badge: "Free Delivery",
    offers: [
      { code: "WELCOME50", title: "50% OFF", discountText: "50% off up to ₹100", minOrder: 19900 }
    ],
    featured: true
  },
  {
    name: "Golden Dragon Wok & Dimsums",
    slug: "golden-dragon-wok-dimsums",
    description: "Authentic Cantonese noodles, wok-tossed Hakka delicacies, crispy spring rolls, and handmade dumplings.",
    cuisine: ["Chinese", "Asian", "Dimsums"],
    rating: 4.5,
    reviewCount: 220,
    deliveryTime: "25-30 mins",
    deliveryTimeMinutes: 27,
    deliveryFee: 3900,
    minOrderValue: 19900,
    priceForTwo: 50000,
    image: "https://images.unsplash.com/photo-1541696432-82c6da8ce7bf?w=800",
    coverImage: "https://images.unsplash.com/photo-1525755662778-989d0524087e?w=1200",
    isOpen: true,
    openingTime: "12:00 PM",
    closingTime: "11:00 PM",
    address: { street: "Ground Floor, Cyber Hub", area: "DLF Phase 2", city: "Gurgaon", pincode: "122002" },
    tags: ["Authentic Wok", "Steamy Dimsums"],
    isPureVeg: false,
    badge: "20% OFF",
    offers: [
      { code: "FEAST20", title: "20% OFF", discountText: "20% off up to ₹150", minOrder: 49900 }
    ],
    featured: false
  },
  {
    name: "Sagar Ratna Express",
    slug: "sagar-ratna-express",
    description: "Traditional 100% Pure Vegetarian South Indian delicacies: crispy paper dosas, fluffy idlis, and filter coffee.",
    cuisine: ["South Indian", "Pure Veg", "Indian"],
    rating: 4.9,
    reviewCount: 640,
    deliveryTime: "20-25 mins",
    deliveryTimeMinutes: 20,
    deliveryFee: 2900,
    minOrderValue: 12900,
    priceForTwo: 35000,
    image: "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=800",
    coverImage: "https://images.unsplash.com/photo-1610192244261-3f33de3f55e4?w=1200",
    isOpen: true,
    openingTime: "08:00 AM",
    closingTime: "10:30 PM",
    address: { street: "K-15 Outer Circle", area: "Connaught Place", city: "New Delhi", pincode: "110001" },
    tags: ["100% Pure Veg", "Crispy Dosa", "Iconic"],
    isPureVeg: true,
    badge: "Pure Veg Specialist",
    offers: [
      { code: "WELCOME50", title: "50% OFF", discountText: "50% off up to ₹100", minOrder: 19900 }
    ],
    featured: true
  },
  {
    name: "The Belgian Waffle & Sweets",
    slug: "the-belgian-waffle-sweets",
    description: "Freshly baked warm waff-wiches, gourmet Dutch pancakes, rich chocolate sundaes, and artisanal brownies.",
    cuisine: ["Desserts", "Bakery", "Beverages"],
    rating: 4.7,
    reviewCount: 410,
    deliveryTime: "15-20 mins",
    deliveryTimeMinutes: 18,
    deliveryFee: 2900,
    minOrderValue: 9900,
    priceForTwo: 30000,
    image: "https://images.unsplash.com/photo-1562376552-0d160a2f238d?w=800",
    coverImage: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=1200",
    isOpen: true,
    openingTime: "10:00 AM",
    closingTime: "01:00 AM",
    address: { street: "Shop 7, Greater Kailash 1", area: "South Delhi", city: "New Delhi", pincode: "110048" },
    tags: ["Sweet Cravings", "Late Night", "100% Veg"],
    isPureVeg: true,
    badge: "Flat ₹50 OFF",
    offers: [
      { code: "FOODDELIGHT", title: "Flat ₹75 OFF", discountText: "Flat ₹75 off on orders above ₹399", minOrder: 39900 }
    ],
    featured: true
  },
  {
    name: "Green Bowl Salads & Smoothies",
    slug: "green-bowl-salads-smoothies",
    description: "Wholesome organic macro-balanced bowls, cold-pressed raw juices, keto wraps, and protein-packed smoothie bowls.",
    cuisine: ["Healthy Food", "Salads", "Vegan"],
    rating: 4.6,
    reviewCount: 185,
    deliveryTime: "20-25 mins",
    deliveryTimeMinutes: 24,
    deliveryFee: 3900,
    minOrderValue: 19900,
    priceForTwo: 45000,
    image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800",
    coverImage: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=1200",
    isOpen: true,
    openingTime: "08:30 AM",
    closingTime: "09:30 PM",
    address: { street: "Cross Point Mall", area: "DLF Phase 4", city: "Gurgaon", pincode: "122009" },
    tags: ["Keto Friendly", "Organic", "Vegan"],
    isPureVeg: true,
    badge: "Guilt Free Eating",
    offers: [
      { code: "FEAST20", title: "20% OFF", discountText: "20% off up to ₹150", minOrder: 49900 }
    ],
    featured: false
  },
  {
    name: "Brewed Awakenings Café",
    slug: "brewed-awakenings-cafe",
    description: "Specialty single-origin Arabica roasts, iced Spanish lattes, matcha tonics, and freshly baked croissants.",
    cuisine: ["Beverages", "Café", "Desserts"],
    rating: 4.8,
    reviewCount: 330,
    deliveryTime: "15-20 mins",
    deliveryTimeMinutes: 19,
    deliveryFee: 2900,
    minOrderValue: 9900,
    priceForTwo: 35000,
    image: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800",
    coverImage: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1200",
    isOpen: true,
    openingTime: "07:30 AM",
    closingTime: "11:00 PM",
    address: { street: "10 Khan Market", area: "Central Delhi", city: "New Delhi", pincode: "110003" },
    tags: ["Artisanal Coffee", "Fast Delivery"],
    isPureVeg: true,
    badge: "Fresh Brews",
    offers: [
      { code: "WELCOME50", title: "50% OFF", discountText: "50% off up to ₹100", minOrder: 19900 }
    ],
    featured: false
  }
];

const coupons = [
  {
    code: "WELCOME50",
    description: "50% OFF on your order up to ₹100 for all food lovers",
    discountPercentage: 50,
    maxDiscount: 10000, // ₹100
    flatDiscount: 0,
    minOrderValue: 19900, // ₹199
    expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    isActive: true,
    newUserOnly: false
  },
  {
    code: "FOODDELIGHT",
    description: "Flat ₹75 instant discount on orders above ₹399",
    discountPercentage: 0,
    maxDiscount: 7500,
    flatDiscount: 7500, // ₹75
    minOrderValue: 39900, // ₹399
    expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
    isActive: true,
    newUserOnly: false
  },
  {
    code: "FEAST20",
    description: "20% OFF on family feast orders above ₹499",
    discountPercentage: 20,
    maxDiscount: 15000, // ₹150
    flatDiscount: 0,
    minOrderValue: 49900, // ₹499
    expiresAt: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
    isActive: true,
    newUserOnly: false
  },
  {
    code: "SUPERCHEESE",
    description: "Special ₹50 discount on all pizza and Italian orders",
    discountPercentage: 0,
    maxDiscount: 5000,
    flatDiscount: 5000,
    minOrderValue: 24900,
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    isActive: true,
    newUserOnly: false
  }
];

// Helper to generate items for each restaurant
const getRestaurantMenuItems = (restaurantId, slug) => {
  if (slug === 'la-pinoz-gourmet-pizza') {
    return [
      {
        restaurant: restaurantId,
        name: "Margherita Basilico Woodfired Pizza",
        description: "Classic Italian style thin crust topped with San Marzano tomato sauce, fresh mozzarella Fior di Latte, extra virgin olive oil, and sweet basil leaves.",
        price: 29900,
        category: "Pizzas",
        image: "https://images.unsplash.com/photo-1604382355076-af4b0eb60143?w=800",
        isVeg: true,
        isVegan: false,
        isJain: true,
        isBestseller: true,
        rating: 4.8,
        customizations: {
          sizes: [
            { name: "Regular (7 inch)", priceDelta: 0 },
            { name: "Medium (10 inch)", priceDelta: 16000 },
            { name: "Large (12 inch)", priceDelta: 28000 }
          ],
          addOns: [
            { name: "Extra Fresh Mozzarella", price: 5900 },
            { name: "Stuffed Cheese Crust", price: 7900 },
            { name: "Roasted Garlic Dip", price: 3500 }
          ]
        }
      },
      {
        restaurant: restaurantId,
        name: "Truffle Farmhouse Gourmet Pizza",
        description: "Loaded with black olives, grilled portobello mushrooms, bell peppers, golden corn, and aromatic white truffle oil.",
        price: 38900,
        category: "Pizzas",
        image: "https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?w=800",
        isVeg: true,
        isVegan: false,
        isJain: false,
        isBestseller: true,
        rating: 4.9,
        customizations: {
          sizes: [
            { name: "Regular (7 inch)", priceDelta: 0 },
            { name: "Medium (10 inch)", priceDelta: 17000 },
            { name: "Large (12 inch)", priceDelta: 31000 }
          ],
          addOns: [
            { name: "Parmesan Cheese Shavings", price: 6500 },
            { name: "Jalapenos", price: 4000 }
          ]
        }
      },
      {
        restaurant: restaurantId,
        name: "BBQ Smoked Chicken Pizza",
        description: "Tender shredded smoked chicken breast, smoky barbecue sauce, red onions, cilantro, and melted gouda & mozzarella blend.",
        price: 44900,
        category: "Pizzas",
        image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800",
        isVeg: false,
        isVegan: false,
        isJain: false,
        isBestseller: true,
        rating: 4.7,
        customizations: {
          sizes: [
            { name: "Regular (7 inch)", priceDelta: 0 },
            { name: "Medium (10 inch)", priceDelta: 19000 },
            { name: "Large (12 inch)", priceDelta: 35000 }
          ],
          addOns: [
            { name: "Extra Smoked Chicken", price: 8500 },
            { name: "Spicy Peri Peri Dip", price: 3500 }
          ]
        }
      },
      {
        restaurant: restaurantId,
        name: "Artisanal Cheesy Garlic Bread",
        description: "Freshly baked sourdough baguettes slathered with roasted garlic butter, parsley, and melted Italian mozzarella.",
        price: 18900,
        category: "Starters",
        image: "https://images.unsplash.com/photo-1619535860434-ba1d8fa12536?w=800",
        isVeg: true,
        isVegan: false,
        isJain: false,
        isBestseller: true,
        rating: 4.7,
        customizations: {
          sizes: [{ name: "Standard (4 pcs)", priceDelta: 0 }],
          addOns: [{ name: "Extra Cheese Dip", price: 4000 }]
        }
      },
      {
        restaurant: restaurantId,
        name: "Classic Italian Tiramisu Cup",
        description: "Espresso-soaked ladyfingers layered with whipped mascarpone cream and dusted with dark cocoa.",
        price: 21900,
        category: "Desserts",
        image: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=800",
        isVeg: true,
        isVegan: false,
        isJain: true,
        isBestseller: false,
        rating: 4.6
      }
    ];
  } else if (slug === 'punjab-grill-royal-kitchen') {
    return [
      {
        restaurant: restaurantId,
        name: "Dal Makhani Grand Heritage",
        description: "Slow-simmered black urad lentils cooked overnight over charcoal with churned butter and dairy cream.",
        price: 34900,
        category: "Main Course",
        image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800",
        isVeg: true,
        isVegan: false,
        isJain: false,
        isBestseller: true,
        rating: 4.9,
        customizations: {
          sizes: [
            { name: "Half Portion (350ml)", priceDelta: 0 },
            { name: "Full Portion (650ml)", priceDelta: 18000 }
          ],
          addOns: [
            { name: "Extra White Butter Scoop", price: 3500 },
            { name: "Butter Naan (1 pc)", price: 6500 }
          ]
        }
      },
      {
        restaurant: restaurantId,
        name: "Paneer Butter Masala",
        description: "Fresh cottage cheese cubes cooked in a rich, buttery, velvety tomato and cashew gravy spiced with kasuri methi.",
        price: 37900,
        category: "Main Course",
        image: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=800",
        isVeg: true,
        isVegan: false,
        isJain: true,
        isBestseller: true,
        rating: 4.8,
        customizations: {
          sizes: [
            { name: "Regular", priceDelta: 0 },
            { name: "Large Serving", priceDelta: 16000 }
          ],
          addOns: [{ name: "Garlic Naan (1 pc)", price: 7500 }]
        }
      },
      {
        restaurant: restaurantId,
        name: "Royal Dum Pukht Chicken Biryani",
        description: "Fragrant long-grain aged Basmati rice layered with succulent marinated chicken, saffron, mint, and fried onions.",
        price: 44900,
        category: "Main Course",
        image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800",
        isVeg: false,
        isVegan: false,
        isJain: false,
        isBestseller: true,
        rating: 4.9,
        customizations: {
          sizes: [
            { name: "Standard (Serves 1-2)", priceDelta: 0 },
            { name: "Mega Handi (Serves 3-4)", priceDelta: 32000 }
          ],
          addOns: [
            { name: "Boondi Raita (200ml)", price: 4900 },
            { name: "Extra Salan Gravy", price: 3900 }
          ]
        }
      },
      {
        restaurant: restaurantId,
        name: "Amritsari Paneer Tikka",
        description: "Char-grilled cubes of malai paneer marinated in hung curd, carom seeds, and mustard oil, served with mint chutney.",
        price: 32900,
        category: "Starters",
        image: "https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=800",
        isVeg: true,
        isVegan: false,
        isJain: false,
        isBestseller: false,
        rating: 4.6
      },
      {
        restaurant: restaurantId,
        name: "Shahi Gulab Jamun (2 pcs)",
        description: "Warm golden dumplings of khoya soaked in cardamom and saffron-infused sugar syrup.",
        price: 12900,
        category: "Desserts",
        image: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=800",
        isVeg: true,
        isVegan: false,
        isJain: true,
        isBestseller: false,
        rating: 4.7
      }
    ];
  } else if (slug === 'the-smash-burger-bistro') {
    return [
      {
        restaurant: restaurantId,
        name: "Double Truffle Smash Cheeseburger",
        description: "Two 100% prime beef/chicken smashed patties, double American melted cheddar, caramelized onions, and black truffle mayo.",
        price: 32900,
        category: "Burgers",
        image: "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=800",
        isVeg: false,
        isVegan: false,
        isJain: false,
        isBestseller: true,
        rating: 4.8,
        customizations: {
          sizes: [
            { name: "Single Patty", priceDelta: 0 },
            { name: "Double Smash Patty", priceDelta: 10000 },
            { name: "Triple Monster", priceDelta: 18000 }
          ],
          addOns: [
            { name: "Crispy Bacon Strip", price: 6500 },
            { name: "Extra Melted Cheddar", price: 4000 },
            { name: "Pickled Jalapenos", price: 2500 }
          ]
        }
      },
      {
        restaurant: restaurantId,
        name: "Crunchy Paneer Supreme Burger",
        description: "Spicy crumb-fried cottage cheese patty, crunchy iceberg lettuce, chipotle mayo, and melted cheese slice.",
        price: 24900,
        category: "Burgers",
        image: "https://images.unsplash.com/photo-1550547660-d9450f859349?w=800",
        isVeg: true,
        isVegan: false,
        isJain: false,
        isBestseller: true,
        rating: 4.6,
        customizations: {
          sizes: [
            { name: "Standard", priceDelta: 0 },
            { name: "Double Patty", priceDelta: 8900 }
          ],
          addOns: [
            { name: "Peri Peri Fries Upgrade", price: 6900 },
            { name: "Cheese Slice", price: 3000 }
          ]
        }
      },
      {
        restaurant: restaurantId,
        name: "Loaded Peri Peri Crinkle Fries",
        description: "Golden crispy fries tossed in fiery African peri peri spice seasoning, drizzled with warm cheese sauce.",
        price: 15900,
        category: "Starters",
        image: "https://images.unsplash.com/photo-1576107232684-1279f3908594?w=800",
        isVeg: true,
        isVegan: true,
        isJain: true,
        isBestseller: true,
        rating: 4.7
      },
      {
        restaurant: restaurantId,
        name: "Thick Belgian Chocolate Shake",
        description: "Blended with rich dark chocolate, Dutch cocoa, and creamy vanilla soft serve ice cream.",
        price: 19900,
        category: "Beverages",
        image: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=800",
        isVeg: true,
        isVegan: false,
        isJain: true,
        isBestseller: false,
        rating: 4.8
      }
    ];
  } else if (slug === 'sagar-ratna-express') {
    return [
      {
        restaurant: restaurantId,
        name: "Mysore Masala Dosa Supreme",
        description: "Crispy golden fermented crepe layered with spicy red chili-garlic chutney and filled with spiced potato masala.",
        price: 19900,
        category: "South Indian",
        image: "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=800",
        isVeg: true,
        isVegan: false,
        isJain: false,
        isBestseller: true,
        rating: 4.9,
        customizations: {
          sizes: [
            { name: "Standard Ghee Dosa", priceDelta: 0 },
            { name: "Extra Butter Dosa", priceDelta: 4000 }
          ],
          addOns: [
            { name: "Extra Sambhar (300ml)", price: 3500 },
            { name: "Gunpowder Masala Podi", price: 2500 }
          ]
        }
      },
      {
        restaurant: restaurantId,
        name: "Ghee Podi Idli (4 pcs)",
        description: "Mini button idlis tossed generously in aromatic pure desi ghee and fiery home-ground Molagapodi spice blend.",
        price: 16900,
        category: "South Indian",
        image: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=800",
        isVeg: true,
        isVegan: false,
        isJain: true,
        isBestseller: true,
        rating: 4.8
      },
      {
        restaurant: restaurantId,
        name: "South Indian Filter Coffee",
        description: "Traditional chicory blend decoction frothed with fresh boiled whole milk served in authentic brass davarah.",
        price: 8900,
        category: "Beverages",
        image: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800",
        isVeg: true,
        isVegan: false,
        isJain: true,
        isBestseller: true,
        rating: 4.9
      }
    ];
  } else if (slug === 'the-belgian-waffle-sweets') {
    return [
      {
        restaurant: restaurantId,
        name: "Nutella Overload Waffle Sandwich",
        description: "Crispy freshly baked warm vanilla waffle filled with generous warm hazelnut Nutella spread and roasted almond flakes.",
        price: 18900,
        category: "Desserts",
        image: "https://images.unsplash.com/photo-1562376552-0d160a2f238d?w=800",
        isVeg: true,
        isVegan: false,
        isJain: true,
        isBestseller: true,
        rating: 4.9,
        customizations: {
          sizes: [
            { name: "Single Waff-wich", priceDelta: 0 },
            { name: "Double Layer Feast", priceDelta: 10000 }
          ],
          addOns: [
            { name: "Vanilla Ice Cream Scoop", price: 4500 },
            { name: "Crushed Oreo Crumbs", price: 2500 }
          ]
        }
      },
      {
        restaurant: restaurantId,
        name: "Dark Chocolate Triple Fantasy Waffle",
        description: "Dark chocolate batter waffle layered with white chocolate ganache, milk chocolate fudge, and dark chocolate chips.",
        price: 19900,
        category: "Desserts",
        image: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=800",
        isVeg: true,
        isVegan: false,
        isJain: true,
        isBestseller: true,
        rating: 4.8
      }
    ];
  } else if (slug === 'golden-dragon-wok-dimsums') {
    return [
      {
        restaurant: restaurantId,
        name: "Steamed Crystal Veg Dimsums (6 pcs)",
        description: "Translucent dumplings stuffed with water chestnuts, shitake mushrooms, pak choi, and spring onions.",
        price: 26900,
        category: "Starters",
        image: "https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=800",
        isVeg: true,
        isVegan: true,
        isJain: false,
        isBestseller: true,
        rating: 4.7
      },
      {
        restaurant: restaurantId,
        name: "Hakka Chilli Garlic Noodles",
        description: "Wok-tossed hand-pulled noodles with crispy shredded carrots, cabbage, scallions, and toasted red chillies.",
        price: 24900,
        category: "Main Course",
        image: "https://images.unsplash.com/photo-1541696432-82c6da8ce7bf?w=800",
        isVeg: true,
        isVegan: true,
        isJain: false,
        isBestseller: true,
        rating: 4.6,
        customizations: {
          sizes: [
            { name: "Regular Box", priceDelta: 0 },
            { name: "Large Feast Box", priceDelta: 12000 }
          ],
          addOns: [{ name: "Crispy Spring Rolls (2 pcs)", price: 8900 }]
        }
      }
    ];
  } else if (slug === 'green-bowl-salads-smoothies') {
    return [
      {
        restaurant: restaurantId,
        name: "Mediterranean Falafel & Hummus Bowl",
        description: "Crispy baked herbed falafels, creamy garlic tahini hummus, kalamata olives, pickled cucumbers, and mixed salad greens.",
        price: 32900,
        category: "Healthy Food",
        image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800",
        isVeg: true,
        isVegan: true,
        isJain: false,
        isBestseller: true,
        rating: 4.8
      },
      {
        restaurant: restaurantId,
        name: "Acai Berry & Chia Superfood Smoothie",
        description: "Organic Brazilian acai puree blended with blueberries, almond milk, topped with toasted granola and chia seeds.",
        price: 25900,
        category: "Beverages",
        image: "https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=800",
        isVeg: true,
        isVegan: true,
        isJain: true,
        isBestseller: true,
        rating: 4.7
      }
    ];
  } else {
    // Brewed Awakenings Cafe
    return [
      {
        restaurant: restaurantId,
        name: "Signature Spanish Iced Latte",
        description: "Double espresso shot layered with condensed milk, cold whole milk, and served over crystal clear ice.",
        price: 21900,
        category: "Beverages",
        image: "https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=800",
        isVeg: true,
        isVegan: false,
        isJain: true,
        isBestseller: true,
        rating: 4.9,
        customizations: {
          sizes: [
            { name: "Medium (350ml)", priceDelta: 0 },
            { name: "Large (480ml)", priceDelta: 4000 }
          ],
          addOns: [
            { name: "Oat Milk Substitute", price: 4500 },
            { name: "Caramel Drizzle", price: 2500 },
            { name: "Extra Espresso Shot", price: 3500 }
          ]
        }
      },
      {
        restaurant: restaurantId,
        name: "Butter Flaky French Croissant",
        description: "Handcrafted golden baked puff pastry laminated with pure French butter, flaky outside and airy inside.",
        price: 15900,
        category: "Desserts",
        image: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=800",
        isVeg: true,
        isVegan: false,
        isJain: true,
        isBestseller: true,
        rating: 4.7
      }
    ];
  }
};

module.exports = { restaurants, coupons, getRestaurantMenuItems };


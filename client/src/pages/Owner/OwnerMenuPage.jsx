import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Flame,
  Star,
  Check,
  X,
  AlertCircle
} from 'lucide-react';
import ownerApi from '../../services/ownerApi';

export default function OwnerMenuPage() {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [dietary, setDietary] = useState('all');
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const fetchMenuItems = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (selectedCategory !== 'All') params.append('category', selectedCategory);
      if (dietary !== 'all') params.append('dietary', dietary);
      if (search) params.append('search', search);

      const res = await ownerApi.get(`/menu?${params.toString()}`);
      setItems(res.data.items || []);
      setCategories(['All', ...(res.data.categories || [])]);
    } catch (err) {
      console.error('Error fetching menu items:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMenuItems();
  }, [selectedCategory, dietary]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchMenuItems();
  };

  const handleToggleStock = async (itemId) => {
    try {
      const res = await ownerApi.patch(`/menu/${itemId}/availability`);
      setItems(
        items.map((i) =>
          i._id === itemId ? { ...i, isAvailable: res.data.isAvailable } : i
        )
      );
    } catch (err) {
      alert('Failed to update stock status.');
    }
  };

  const handleDeleteItem = async (itemId) => {
    try {
      await ownerApi.delete(`/menu/${itemId}`);
      setItems(items.filter((i) => i._id !== itemId));
      setDeleteConfirmId(null);
    } catch (err) {
      alert('Failed to delete menu item.');
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="owner-page-header">
        <div className="owner-page-header-text">
          <h1>Menu Catalog & Food Management</h1>
          <p>Organize categories, dietary badges, stock, and dish customizations.</p>
        </div>
        <Link to="/owner/menu/add" className="owner-btn-primary">
          <Plus size={18} />
          <span>Add New Dish</span>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          marginBottom: '1.5rem',
          background: '#ffffff',
          padding: '1rem',
          borderRadius: '12px',
          border: '1px solid #E7E5E4'
        }}
      >
        {/* Search */}
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '0.5rem', minWidth: '300px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search dish by name..."
              className="owner-form-input"
              style={{ paddingLeft: '2.4rem' }}
            />
            <Search
              size={18}
              color="#A8A29E"
              style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }}
            />
          </div>
          <button type="submit" className="owner-btn-secondary">
            Search
          </button>
        </form>

        {/* Dietary Filter Buttons */}
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {[
            { id: 'all', label: 'All Dishes' },
            { id: 'veg', label: 'Pure Veg' },
            { id: 'non-veg', label: 'Non-Veg' },
            { id: 'vegan', label: 'Vegan' },
            { id: 'jain', label: 'Jain' }
          ].map((d) => (
            <button
              key={d.id}
              onClick={() => setDietary(d.id)}
              style={{
                padding: '0.4rem 0.85rem',
                borderRadius: '9999px',
                border: dietary === d.id ? '1px solid #F97316' : '1px solid #E7E5E4',
                background: dietary === d.id ? '#FFEDD5' : '#ffffff',
                color: dietary === d.id ? '#EA580C' : '#78716C',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>

      {/* Category Pills */}
      <div
        style={{
          display: 'flex',
          gap: '0.5rem',
          overflowX: 'auto',
          paddingBottom: '0.75rem',
          marginBottom: '1.5rem'
        }}
      >
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              border: selectedCategory === cat ? '2px solid #F97316' : '1px solid #E7E5E4',
              background: selectedCategory === cat ? '#ffffff' : '#fafaf9',
              color: selectedCategory === cat ? '#EA580C' : '#292524',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Menu Items Table / Cards */}
      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '3rem 0', color: '#F97316', fontWeight: 700 }}>
          Loading menu items...
        </div>
      ) : items.length === 0 ? (
        <div
          style={{
            background: '#ffffff',
            borderRadius: '12px',
            border: '1px solid #E7E5E4',
            padding: '3rem 1.5rem',
            textAlign: 'center'
          }}
        >
          <h3>No dishes found in this category</h3>
          <p style={{ color: '#78716C' }}>Try switching filters or add a new food item.</p>
          <Link to="/owner/menu/add" className="owner-btn-primary" style={{ display: 'inline-flex', marginTop: '1rem' }}>
            <Plus size={16} />
            <span>Add First Dish</span>
          </Link>
        </div>
      ) : (
        <div className="owner-card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="owner-table-container">
            <table className="owner-table">
              <thead>
                <tr>
                  <th>Dish</th>
                  <th>Category</th>
                  <th>Price (₹)</th>
                  <th>Dietary</th>
                  <th>Customizations</th>
                  <th>In Stock</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                        <img
                          src={item.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100'}
                          alt={item.name}
                          style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '8px',
                            objectFit: 'cover'
                          }}
                        />
                        <div>
                          <div style={{ fontWeight: 700, color: '#292524', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <span>{item.name}</span>
                            {item.isBestseller && (
                              <span
                                style={{
                                  background: '#FEF3C7',
                                  color: '#B45309',
                                  fontSize: '0.65rem',
                                  padding: '0.1rem 0.4rem',
                                  borderRadius: '4px',
                                  fontWeight: 800
                                }}
                              >
                                Bestseller
                              </span>
                            )}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#78716C', maxWidth: '240px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {item.description || 'No description provided.'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span
                        style={{
                          background: '#F5F5F4',
                          color: '#292524',
                          padding: '0.2rem 0.6rem',
                          borderRadius: '6px',
                          fontSize: '0.8rem',
                          fontWeight: 600
                        }}
                      >
                        {item.category}
                      </span>
                    </td>
                    <td style={{ fontWeight: 800, fontSize: '0.95rem' }}>
                      ₹{(item.price / 100).toFixed(0)}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.35rem' }}>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '18px',
                            height: '18px',
                            borderRadius: '4px',
                            border: `2px solid ${item.isVeg ? '#15803D' : '#991B1B'}`
                          }}
                        >
                          <span
                            style={{
                              width: '8px',
                              height: '8px',
                              borderRadius: '50%',
                              background: item.isVeg ? '#15803D' : '#991B1B'
                            }}
                          />
                        </span>
                        {item.isVegan && (
                          <span style={{ fontSize: '0.7rem', background: '#DCFCE7', color: '#15803D', padding: '0.1rem 0.35rem', borderRadius: '4px', fontWeight: 700 }}>
                            Vegan
                          </span>
                        )}
                        {item.isJain && (
                          <span style={{ fontSize: '0.7rem', background: '#FEF3C7', color: '#B45309', padding: '0.1rem 0.35rem', borderRadius: '4px', fontWeight: 700 }}>
                            Jain
                          </span>
                        )}
                      </div>
                    </td>
                    <td style={{ fontSize: '0.8rem', color: '#78716C' }}>
                      {item.sizes?.length ? `${item.sizes.length} sizes` : 'Single size'}
                      {item.addOns?.length ? ` • ${item.addOns.length} add-ons` : ''}
                    </td>
                    <td>
                      <button
                        onClick={() => handleToggleStock(item._id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.4rem',
                          color: item.isAvailable !== false ? '#15803D' : '#DC2626',
                          fontWeight: 700,
                          fontSize: '0.85rem'
                        }}
                      >
                        {item.isAvailable !== false ? (
                          <>
                            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#15803D' }} />
                            <span>In Stock</span>
                          </>
                        ) : (
                          <>
                            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#DC2626' }} />
                            <span>Out of Stock</span>
                          </>
                        )}
                      </button>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <Link
                          to={`/owner/menu/edit/${item._id}`}
                          className="owner-btn-secondary"
                          style={{ padding: '0.4rem 0.6rem' }}
                          title="Edit Dish"
                        >
                          <Edit2 size={16} />
                        </Link>
                        <button
                          onClick={() => setDeleteConfirmId(item._id)}
                          className="owner-btn-secondary"
                          style={{ padding: '0.4rem 0.6rem', color: '#DC2626', borderColor: '#FECACA' }}
                          title="Delete Dish"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="owner-modal-overlay">
          <div className="owner-modal" style={{ maxWidth: '400px' }}>
            <div className="owner-modal-header">
              <h3>Delete Food Item</h3>
              <button onClick={() => setDeleteConfirmId(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>
            <div className="owner-modal-body">
              <p style={{ margin: '0 0 1.5rem 0', color: '#78716C' }}>
                Are you sure you want to permanently remove this dish from your restaurant menu?
              </p>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                  onClick={() => handleDeleteItem(deleteConfirmId)}
                  className="owner-btn-primary"
                  style={{ flex: 1, justifyContent: 'center', background: '#DC2626' }}
                >
                  Yes, Delete Dish
                </button>
                <button onClick={() => setDeleteConfirmId(null)} className="owner-btn-secondary">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


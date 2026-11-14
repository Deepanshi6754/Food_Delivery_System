import React, { useState, useEffect } from 'react';
import adminApi from '../../services/adminApi';
import {
  Grid,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  Utensils,
  Image,
  X
} from 'lucide-react';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [form, setForm] = useState({
    name: '',
    slug: '',
    description: '',
    image: '',
    iconName: 'Utensils',
    displayOrder: 1,
    isActive: true
  });
  const [modalLoading, setModalLoading] = useState(false);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await adminApi.get('/categories');
      if (res.data.success) {
        setCategories(res.data.data || []);
      }
    } catch (err) {
      console.error('Failed to load categories:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openAddModal = () => {
    setEditingCategory(null);
    setForm({
      name: '',
      slug: '',
      description: '',
      image: '',
      iconName: 'Utensils',
      displayOrder: categories.length + 1,
      isActive: true
    });
    setModalOpen(true);
  };

  const openEditModal = (cat) => {
    setEditingCategory(cat);
    setForm({
      name: cat.name,
      slug: cat.slug,
      description: cat.description || '',
      image: cat.image || '',
      iconName: cat.iconName || 'Utensils',
      displayOrder: cat.displayOrder || 1,
      isActive: cat.isActive !== false
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setModalLoading(true);
    try {
      if (editingCategory) {
        await adminApi.put(`/categories/${editingCategory._id}`, form);
      } else {
        await adminApi.post('/categories', form);
      }
      setModalOpen(false);
      fetchCategories();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save category.');
    } finally {
      setModalLoading(false);
    }
  };

  const handleDelete = async (cat) => {
    if (!window.confirm(`Are you sure you want to delete category "${cat.name}"?`)) return;
    try {
      await adminApi.delete(`/categories/${cat._id}`);
      fetchCategories();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete category.');
    }
  };

  return (
    <div>
      {/* Page Header */}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Global Food Categories</h1>
          <p className="admin-page-subtitle">
            Configure consumer browsing taxonomy, category icons, display sorting, and featured banners
          </p>
        </div>
        <button className="admin-btn admin-btn-primary" onClick={openAddModal}>
          <Plus size={16} />
          <span>Add Category</span>
        </button>
      </div>

      {/* Grid of Categories */}
      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Category</th>
              <th>Slug</th>
              <th>Icon / Key</th>
              <th>Total Dishes</th>
              <th>Display Order</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: '#78716C' }}>
                  Loading food categories...
                </td>
              </tr>
            ) : categories.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: '#78716C' }}>
                  No categories found. Click "Add Category" to create one.
                </td>
              </tr>
            ) : (
              categories.map((c) => (
                <tr key={c._id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <img
                        src={c.image || 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=150'}
                        alt={c.name}
                        style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover' }}
                      />
                      <div>
                        <strong style={{ fontSize: '0.85rem' }}>{c.name}</strong>
                        <span style={{ display: 'block', fontSize: '0.75rem', color: '#78716C' }}>
                          {c.description || 'No description'}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td style={{ fontSize: '0.8rem', fontFamily: 'monospace' }}>{c.slug}</td>
                  <td>
                    <span className="admin-badge admin-badge-neutral">{c.iconName || 'Utensils'}</span>
                  </td>
                  <td>
                    <span className="admin-badge admin-badge-info">{c.itemCount || 0} dishes</span>
                  </td>
                  <td>
                    <strong>#{c.displayOrder || 1}</strong>
                  </td>
                  <td>
                    <span
                      className={`admin-badge ${c.isActive ? 'admin-badge-success' : 'admin-badge-neutral'}`}
                    >
                      {c.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                      <button
                        className="admin-btn admin-btn-secondary admin-btn-sm"
                        onClick={() => openEditModal(c)}
                        title="Edit Category"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        className="admin-btn admin-btn-danger admin-btn-sm"
                        onClick={() => handleDelete(c)}
                        title="Delete Category"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add / Edit Modal */}
      {modalOpen && (
        <div className="admin-modal-overlay">
          <div className="admin-modal">
            <div className="admin-modal-header">
              <h3 className="admin-modal-title">
                {editingCategory ? 'Edit Food Category' : 'Create New Food Category'}
              </h3>
              <button
                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                onClick={() => setModalOpen(false)}
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="admin-modal-body">
                <div className="admin-form-group">
                  <label className="admin-form-label">Category Name *</label>
                  <input
                    type="text"
                    required
                    className="admin-form-control"
                    placeholder="e.g. Gourmet Burgers"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>

                <div className="admin-form-group">
                  <label className="admin-form-label">URL Slug</label>
                  <input
                    type="text"
                    className="admin-form-control"
                    placeholder="e.g. gourmet-burgers (auto-generated if empty)"
                    value={form.slug}
                    onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  />
                </div>

                <div className="admin-form-group">
                  <label className="admin-form-label">Cover Image URL</label>
                  <input
                    type="url"
                    className="admin-form-control"
                    placeholder="https://images.unsplash.com/..."
                    value={form.image}
                    onChange={(e) => setForm({ ...form, image: e.target.value })}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="admin-form-group">
                    <label className="admin-form-label">Icon Name</label>
                    <input
                      type="text"
                      className="admin-form-control"
                      placeholder="e.g. Pizza, Beef, Utensils"
                      value={form.iconName}
                      onChange={(e) => setForm({ ...form, iconName: e.target.value })}
                    />
                  </div>

                  <div className="admin-form-group">
                    <label className="admin-form-label">Display Order</label>
                    <input
                      type="number"
                      min="1"
                      className="admin-form-control"
                      value={form.displayOrder}
                      onChange={(e) => setForm({ ...form, displayOrder: e.target.value })}
                    />
                  </div>
                </div>

                <div className="admin-form-group">
                  <label className="admin-form-label">Description</label>
                  <textarea
                    rows="2"
                    className="admin-form-control"
                    placeholder="Brief description of the category..."
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
                  <input
                    type="checkbox"
                    id="catActive"
                    checked={form.isActive}
                    onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                  />
                  <label htmlFor="catActive" style={{ fontSize: '0.85rem', cursor: 'pointer' }}>
                    Publish category actively on consumer storefront
                  </label>
                </div>
              </div>

              <div className="admin-modal-footer">
                <button
                  type="button"
                  className="admin-btn admin-btn-secondary"
                  onClick={() => setModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="admin-btn admin-btn-primary"
                  disabled={modalLoading}
                >
                  {modalLoading ? 'Saving...' : editingCategory ? 'Update Category' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

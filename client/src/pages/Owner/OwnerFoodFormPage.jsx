import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import ownerApi from '../../services/ownerApi';

export default function OwnerFoodFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const [formData, setFormData] = useState({
    name: '',
    category: 'Main Course',
    price: '', // in Rupees for user input
    description: '',
    image: '',
    isVeg: true,
    isVegan: false,
    isJain: false,
    isBestseller: false,
    preparationTime: 20
  });

  const [sizes, setSizes] = useState([]);
  const [addOns, setAddOns] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // If editing, fetch current item
  useEffect(() => {
    if (isEditing) {
      const fetchItem = async () => {
        try {
          setIsLoading(true);
          const res = await ownerApi.get(`/menu/${id}`);
          const item = res.data.item;
          setFormData({
            name: item.name,
            category: item.category,
            price: (item.price / 100).toString(),
            description: item.description || '',
            image: item.image || '',
            isVeg: item.isVeg,
            isVegan: item.isVegan || false,
            isJain: item.isJain || false,
            isBestseller: item.isBestseller || false,
            preparationTime: item.preparationTime || 20
          });
          setSizes(
            (item.sizes || []).map((s) => ({
              name: s.name,
              priceDelta: (s.priceDelta / 100).toString()
            }))
          );
          setAddOns(
            (item.addOns || []).map((a) => ({
              name: a.name,
              price: (a.price / 100).toString()
            }))
          );
        } catch (err) {
          setError('Failed to fetch food item details.');
        } finally {
          setIsLoading(false);
        }
      };
      fetchItem();
    }
  }, [id, isEditing]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  // Sizes handlers
  const handleAddSize = () => {
    setSizes([...sizes, { name: '', priceDelta: '0' }]);
  };

  const handleSizeChange = (idx, field, val) => {
    const updated = [...sizes];
    updated[idx][field] = val;
    setSizes(updated);
  };

  const handleRemoveSize = (idx) => {
    setSizes(sizes.filter((_, i) => i !== idx));
  };

  // Add-ons handlers
  const handleAddAddOn = () => {
    setAddOns([...addOns, { name: '', price: '0' }]);
  };

  const handleAddOnChange = (idx, field, val) => {
    const updated = [...addOns];
    updated[idx][field] = val;
    setAddOns(updated);
  };

  const handleRemoveAddOn = (idx) => {
    setAddOns(addOns.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!formData.name || !formData.price || !formData.image) {
      setError('Please provide dish name, base price, and an image URL.');
      return;
    }

    try {
      setIsLoading(true);

      const payload = {
        name: formData.name,
        category: formData.category,
        price: Math.round(Number(formData.price) * 100), // convert to paise
        description: formData.description,
        image: formData.image,
        isVeg: formData.isVeg,
        isVegan: formData.isVegan,
        isJain: formData.isJain,
        isBestseller: formData.isBestseller,
        preparationTime: Number(formData.preparationTime),
        sizes: sizes
          .filter((s) => s.name.trim() !== '')
          .map((s) => ({
            name: s.name,
            priceDelta: Math.round(Number(s.priceDelta) * 100)
          })),
        addOns: addOns
          .filter((a) => a.name.trim() !== '')
          .map((a) => ({
            name: a.name,
            price: Math.round(Number(a.price) * 100)
          }))
      };

      if (isEditing) {
        await ownerApi.put(`/menu/${id}`, payload);
      } else {
        await ownerApi.post('/menu', payload);
      }

      navigate('/owner/menu');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save menu item.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      {/* Back button */}
      <div style={{ marginBottom: '1.5rem' }}>
        <Link
          to="/owner/menu"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            color: '#78716C',
            textDecoration: 'none',
            fontWeight: 700,
            fontSize: '0.9rem'
          }}
        >
          <ArrowLeft size={18} />
          <span>Back to Menu Catalog</span>
        </Link>
      </div>

      <div className="owner-card">
        <div className="owner-card-header">
          <h1 className="owner-card-title" style={{ fontSize: '1.4rem' }}>
            {isEditing ? `Edit "${formData.name || 'Dish'}"` : 'Add New Food Item to Menu'}
          </h1>
        </div>

        {error && (
          <div
            style={{
              background: '#FEE2E2',
              border: '1px solid #FECACA',
              padding: '0.85rem 1rem',
              borderRadius: '8px',
              color: '#DC2626',
              fontSize: '0.875rem',
              fontWeight: 600,
              marginBottom: '1.5rem'
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Dish Name & Category */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
            <div className="owner-form-group">
              <label>Dish Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Woodfired Margherita Pizza"
                required
                className="owner-form-input"
              />
            </div>

            <div className="owner-form-group">
              <label>Category *</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="owner-form-select"
              >
                <option value="Starters">Starters</option>
                <option value="Main Course">Main Course</option>
                <option value="Pizza">Pizza</option>
                <option value="Burgers">Burgers</option>
                <option value="Indian Food">Indian Food</option>
                <option value="Chinese Food">Chinese Food</option>
                <option value="Desserts">Desserts</option>
                <option value="Beverages">Beverages</option>
              </select>
            </div>
          </div>

          {/* Base Price & Prep Time */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="owner-form-group">
              <label>Base Price in ₹ *</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                placeholder="299"
                required
                min="0"
                step="1"
                className="owner-form-input"
              />
            </div>

            <div className="owner-form-group">
              <label>Estimated Prep Time (mins)</label>
              <input
                type="number"
                name="preparationTime"
                value={formData.preparationTime}
                onChange={handleChange}
                placeholder="20"
                min="5"
                max="120"
                className="owner-form-input"
              />
            </div>
          </div>

          {/* Image URL & Preview */}
          <div className="owner-form-group">
            <label>Food Photography Image URL *</label>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <input
                type="url"
                name="image"
                value={formData.image}
                onChange={handleChange}
                placeholder="https://images.unsplash.com/photo-..."
                required
                className="owner-form-input"
              />
              {formData.image && (
                <img
                  src={formData.image}
                  alt="Preview"
                  style={{ width: '50px', height: '50px', borderRadius: '8px', objectFit: 'cover' }}
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              )}
            </div>
          </div>

          {/* Description */}
          <div className="owner-form-group">
            <label>Appetizing Dish Description</label>
            <textarea
              name="description"
              rows={3}
              value={formData.description}
              onChange={handleChange}
              placeholder="Fresh San Marzano tomato sauce, hand-torn whole milk mozzarella, and fresh basil leaves on fermented sourdough."
              className="owner-form-textarea"
            />
          </div>

          {/* Dietary Checkboxes */}
          <div
            style={{
              background: '#FAFAF9',
              border: '1px solid #E7E5E4',
              borderRadius: '10px',
              padding: '1.25rem',
              marginBottom: '1.5rem'
            }}
          >
            <div style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.75rem' }}>
              Dietary & Quality Attributes
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.875rem' }}>
                <input
                  type="checkbox"
                  name="isVeg"
                  checked={formData.isVeg}
                  onChange={handleChange}
                  style={{ width: '18px', height: '18px', accentColor: '#15803D' }}
                />
                <span style={{ fontWeight: 600 }}>Pure Veg</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.875rem' }}>
                <input
                  type="checkbox"
                  name="isVegan"
                  checked={formData.isVegan}
                  onChange={handleChange}
                  style={{ width: '18px', height: '18px', accentColor: '#15803D' }}
                />
                <span style={{ fontWeight: 600 }}>Vegan</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.875rem' }}>
                <input
                  type="checkbox"
                  name="isJain"
                  checked={formData.isJain}
                  onChange={handleChange}
                  style={{ width: '18px', height: '18px', accentColor: '#D97706' }}
                />
                <span style={{ fontWeight: 600 }}>Jain Friendly</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.875rem' }}>
                <input
                  type="checkbox"
                  name="isBestseller"
                  checked={formData.isBestseller}
                  onChange={handleChange}
                  style={{ width: '18px', height: '18px', accentColor: '#F97316' }}
                />
                <span style={{ fontWeight: 600, color: '#EA580C' }}>★ Bestseller</span>
              </label>
            </div>
          </div>

          {/* Size Variations Builder */}
          <div style={{ marginBottom: '1.5rem', border: '1px solid #E7E5E4', borderRadius: '10px', padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <div>
                <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700 }}>
                  Portion Sizes (Optional)
                </h4>
                <span style={{ fontSize: '0.75rem', color: '#78716C' }}>
                  e.g. Regular (+₹0), Medium (+₹80), Large (+₹150)
                </span>
              </div>
              <button type="button" onClick={handleAddSize} className="owner-btn-secondary" style={{ padding: '0.35rem 0.65rem', fontSize: '0.8rem' }}>
                <Plus size={14} />
                <span>Add Size</span>
              </button>
            </div>

            {sizes.map((s, idx) => (
              <div key={idx} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.5rem' }}>
                <input
                  type="text"
                  placeholder="Size name (e.g. Large 12 inch)"
                  value={s.name}
                  onChange={(e) => handleSizeChange(idx, 'name', e.target.value)}
                  className="owner-form-input"
                  style={{ flex: 2 }}
                />
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', flex: 1 }}>
                  <span>+₹</span>
                  <input
                    type="number"
                    placeholder="0"
                    value={s.priceDelta}
                    onChange={(e) => handleSizeChange(idx, 'priceDelta', e.target.value)}
                    className="owner-form-input"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveSize(idx)}
                  style={{ background: 'none', border: 'none', color: '#DC2626', cursor: 'pointer', padding: '0.4rem' }}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>

          {/* Add-ons Builder */}
          <div style={{ marginBottom: '2rem', border: '1px solid #E7E5E4', borderRadius: '10px', padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <div>
                <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700 }}>
                  Extra Add-ons / Toppings (Optional)
                </h4>
                <span style={{ fontSize: '0.75rem', color: '#78716C' }}>
                  e.g. Extra Fresh Mozzarella (+₹60), Garlic Dip (+₹30)
                </span>
              </div>
              <button type="button" onClick={handleAddAddOn} className="owner-btn-secondary" style={{ padding: '0.35rem 0.65rem', fontSize: '0.8rem' }}>
                <Plus size={14} />
                <span>Add Topping</span>
              </button>
            </div>

            {addOns.map((a, idx) => (
              <div key={idx} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.5rem' }}>
                <input
                  type="text"
                  placeholder="Add-on name (e.g. Extra Mozzarella)"
                  value={a.name}
                  onChange={(e) => handleAddOnChange(idx, 'name', e.target.value)}
                  className="owner-form-input"
                  style={{ flex: 2 }}
                />
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', flex: 1 }}>
                  <span>+₹</span>
                  <input
                    type="number"
                    placeholder="49"
                    value={a.price}
                    onChange={(e) => handleAddOnChange(idx, 'price', e.target.value)}
                    className="owner-form-input"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveAddOn(idx)}
                  style={{ background: 'none', border: 'none', color: '#DC2626', cursor: 'pointer', padding: '0.4rem' }}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>

          {/* Submit Toolbar */}
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', borderTop: '1px solid #E7E5E4', paddingTop: '1.25rem' }}>
            <Link to="/owner/menu" className="owner-btn-secondary">
              Cancel
            </Link>
            <button type="submit" disabled={isLoading} className="owner-btn-primary">
              <Save size={18} />
              <span>{isLoading ? 'Saving Dish...' : isEditing ? 'Update Dish' : 'Publish Dish to Menu'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  PackagePlus, Image as ImageIcon, Sparkles, AlertCircle, 
  ArrowLeft, CheckCircle2, ShieldAlert 
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const AddEditItem = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    category_id: '1',
    description: '',
    condition: 'Like New',
    location: user?.location || '',
    security_deposit: '0',
    max_duration_days: '7',
    image_url: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&q=80'
  });

  // Preset sample photo options for fast testing
  const samplePresets = [
    { label: 'Camera / DSLR', url: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&q=80' },
    { label: 'Hammer Drill / Tools', url: 'https://images.unsplash.com/photo-1581147036324-c17ac41dfa6c?w=800&q=80' },
    { label: 'Acoustic Guitar', url: 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=800&q=80' },
    { label: 'Camping Tent', url: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800&q=80' },
    { label: 'Academic Textbook', url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&q=80' },
    { label: 'Drone Quadcopter', url: 'https://images.unsplash.com/photo-1527977966376-1c8408f9f108?w=800&q=80' },
    { label: 'Tennis Rackets', url: 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=800&q=80' },
  ];

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const loadData = async () => {
      try {
        const catRes = await api.getCategories();
        setCategories(catRes.categories || []);

        if (isEdit) {
          const itemRes = await api.getItemById(id);
          const it = itemRes.item;
          setFormData({
            title: it.title,
            category_id: String(it.category_id),
            description: it.description,
            condition: it.condition,
            location: it.location,
            security_deposit: String(it.security_deposit),
            max_duration_days: String(it.max_duration_days),
            image_url: it.image_url
          });
        }
      } catch (err) {
        setError(err.message || 'Error loading data.');
      }
    };

    loadData();
  }, [id, isEdit, isAuthenticated, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isEdit) {
        await api.updateItem(id, formData);
        navigate(`/item/${id}`);
      } else {
        const res = await api.createItem(formData);
        navigate(`/item/${res.item.id}`);
      }
    } catch (err) {
      setError(err.message || 'Failed to save item listing.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back</span>
      </button>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-10 space-y-8">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold mb-2">
            <PackagePlus className="w-3.5 h-3.5 text-emerald-600" />
            <span>BorrowBox Listing Studio</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {isEdit ? 'Edit Your Listing' : 'List an Idle Item to Share'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Turn your unused cameras, tools, textbooks, or outdoor gear into helpful community resources.
          </p>
        </div>

        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Item Title *
            </label>
            <input
              type="text"
              name="title"
              required
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. Sony Alpha A7 III Camera / Bosch Rotary Hammer Drill"
              className="w-full text-sm px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>

          {/* Category & Condition */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Category *
              </label>
              <select
                name="category_id"
                value={formData.category_id}
                onChange={handleChange}
                className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Condition *
              </label>
              <select
                name="condition"
                value={formData.condition}
                onChange={handleChange}
                className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              >
                <option value="Brand New">Brand New (Unopened / Pristine)</option>
                <option value="Like New">Like New (Barely used, no scratches)</option>
                <option value="Good">Good (Fully functional, normal cosmetic wear)</option>
                <option value="Fair">Fair (Working, visible wear)</option>
              </select>
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Handover Location / College / Campus *
            </label>
            <input
              type="text"
              name="location"
              required
              value={formData.location}
              onChange={handleChange}
              placeholder="e.g. Model Engg College / Kalamassery Metro / Kakkanad"
              className="w-full text-sm px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>

          {/* Security Deposit & Max Duration */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Refundable Security Deposit (₹)
              </label>
              <input
                type="number"
                min="0"
                step="50"
                name="security_deposit"
                value={formData.security_deposit}
                onChange={handleChange}
                placeholder="0 for zero deposit"
                className="w-full text-sm px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">Set 0 if borrowing without deposit.</span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Maximum Borrowing Duration (Days) *
              </label>
              <input
                type="number"
                min="1"
                max="90"
                name="max_duration_days"
                required
                value={formData.max_duration_days}
                onChange={handleChange}
                className="w-full text-sm px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Image URL & Presets */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Item Photo Image URL *
            </label>
            <input
              type="url"
              name="image_url"
              required
              value={formData.image_url}
              onChange={handleChange}
              placeholder="https://images.unsplash.com/..."
              className="w-full text-xs px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-mono"
            />

            {/* Quick Presets */}
            <div className="mt-2.5">
              <span className="text-[11px] font-semibold text-slate-500 block mb-1">
                Or pick a quick high-res preset photo:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {samplePresets.map((p) => (
                  <button
                    type="button"
                    key={p.label}
                    onClick={() => setFormData((prev) => ({ ...prev, image_url: p.url }))}
                    className={`text-[11px] px-2.5 py-1 rounded-lg border transition-colors ${
                      formData.image_url === p.url
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300 font-bold'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Image Preview */}
            {formData.image_url && (
              <div className="mt-3 w-32 h-24 rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
                <img
                  src={formData.image_url}
                  alt="Preview"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800&q=80';
                  }}
                />
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Detailed Description *
            </label>
            <textarea
              name="description"
              required
              rows={4}
              value={formData.description}
              onChange={handleChange}
              placeholder="Mention what's included (chargers, cases, cables), current physical condition, any special instructions, and best pickup times..."
              className="w-full text-sm px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 leading-relaxed"
            />
          </div>

          {/* Submit */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors shadow-md shadow-emerald-200 disabled:opacity-50"
            >
              {loading ? 'Publishing...' : isEdit ? 'Save Changes' : 'Publish Listing to Community'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};


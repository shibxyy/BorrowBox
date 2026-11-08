import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Search, Filter, MapPin, SlidersHorizontal, RotateCcw, 
  PackageOpen, Sparkles, Check, ChevronDown 
} from 'lucide-react';
import { api } from '../services/api';
import { ItemCard } from '../components/ItemCard';
import { RequestModal } from '../components/RequestModal';

export const ExploreItems = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [location, setLocation] = useState(searchParams.get('location') || '');
  const [condition, setCondition] = useState('');
  const [availableOnly, setAvailableOnly] = useState(false);
  const [sortBy, setSortBy] = useState('newest');

  const [selectedItemForModal, setSelectedItemForModal] = useState(null);

  // Fetch categories once
  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await api.getCategories();
        setCategories(res.categories || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchCats();
  }, []);

  // Fetch items whenever filter changes
  useEffect(() => {
    const fetchItems = async () => {
      setLoading(true);
      try {
        const res = await api.getItems({
          search,
          category: selectedCategory,
          location,
          condition,
          availableOnly,
          sort: sortBy
        });
        setItems(res.items || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, [search, selectedCategory, location, condition, availableOnly, sortBy]);

  const resetFilters = () => {
    setSearch('');
    setSelectedCategory('');
    setLocation('');
    setCondition('');
    setAvailableOnly(false);
    setSortBy('newest');
    setSearchParams({});
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Explore Community Items
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Browse idle items available for borrowing from neighbours, colleges, and local communities.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <label className="text-xs font-semibold text-slate-600 flex items-center gap-1.5 cursor-pointer bg-white px-3 py-2 rounded-xl border border-slate-200 shadow-sm">
            <input
              type="checkbox"
              checked={availableOnly}
              onChange={(e) => setAvailableOnly(e.target.checked)}
              className="rounded text-emerald-600 focus:ring-emerald-500 h-4 w-4"
            />
            <span>Available Now Only</span>
          </label>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="text-xs font-semibold bg-white border border-slate-200 px-3 py-2 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          >
            <option value="newest">Sort: Newest First</option>
            <option value="rating">Sort: Highest Owner Rating</option>
            <option value="deposit_low">Deposit: Low to High</option>
            <option value="deposit_high">Deposit: High to Low</option>
          </select>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        {/* Keyword Search */}
        <div className="relative md:col-span-2">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, brand, or description..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          />
        </div>

        {/* Category Selector */}
        <div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full py-2 px-3 text-xs rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Condition Filter */}
        <div>
          <select
            value={condition}
            onChange={(e) => setCondition(e.target.value)}
            className="w-full py-2 px-3 text-xs rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          >
            <option value="">All Conditions</option>
            <option value="Brand New">Brand New</option>
            <option value="Like New">Like New</option>
            <option value="Good">Good</option>
            <option value="Fair">Fair</option>
          </select>
        </div>
      </div>

      {/* Results Count & Reset */}
      <div className="flex items-center justify-between text-xs text-slate-500">
        <span>
          Showing <strong className="text-slate-800">{items.length}</strong> items available in community
        </span>
        {(search || selectedCategory || condition || availableOnly) && (
          <button
            onClick={resetFilters}
            className="flex items-center gap-1 text-emerald-600 hover:text-emerald-700 font-semibold"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Filters</span>
          </button>
        )}
      </div>

      {/* Items Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="bg-slate-200 rounded-2xl aspect-[4/3] w-full" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm max-w-md mx-auto">
          <PackageOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No items match your criteria</h3>
          <p className="text-xs text-slate-500 mt-1 mb-4">
            Try adjusting your search terms or clearing your filters to see more results.
          </p>
          <button
            onClick={resetFilters}
            className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition-colors"
          >
            Show All Items
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <ItemCard
              key={item.id}
              item={item}
              onRequest={(it) => setSelectedItemForModal(it)}
            />
          ))}
        </div>
      )}

      {/* Borrow Request Modal */}
      {selectedItemForModal && (
        <RequestModal
          item={selectedItemForModal}
          isOpen={!!selectedItemForModal}
          onClose={() => setSelectedItemForModal(null)}
          onSuccess={() => {
            alert('Your borrowing request was sent successfully!');
          }}
        />
      )}
    </div>
  );
};


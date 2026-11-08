import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Search, Package, ArrowRight, ShieldCheck, RefreshCw, Users, Star, 
  Sparkles, Camera, Wrench, BookOpen, Music, Compass, Trophy, CheckCircle2 
} from 'lucide-react';
import { api } from '../services/api';
import { ItemCard } from '../components/ItemCard';
import { RequestModal } from '../components/RequestModal';
import { useAuth } from '../context/AuthContext';

export const Home = () => {
  const [categories, setCategories] = useState([]);
  const [featuredItems, setFeaturedItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItemForModal, setSelectedItemForModal] = useState(null);
  const { demoLogin, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const catRes = await api.getCategories();
        setCategories(catRes.categories || []);

        const itemRes = await api.getItems({ availableOnly: false });
        setFeaturedItems(itemRes.items?.slice(0, 6) || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/explore?search=${encodeURIComponent(searchTerm.trim())}`);
    } else {
      navigate('/explore');
    }
  };

  const categoryIcons = {
    'Cameras & Electronics': Camera,
    'Power Tools & DIY': Wrench,
    'Books & Academics': BookOpen,
    'Musical Instruments': Music,
    'Camping & Outdoors': Compass,
    'Sports & Fitness': Trophy
  };

  return (
    <div className="space-y-16">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden pt-8 pb-12 sm:pt-16 sm:pb-20">
        {/* Background gradient blur shapes */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-emerald-200/50 rounded-full blur-3xl -z-10 pointer-events-none" />
        <div className="absolute top-1/3 right-10 w-[300px] h-[300px] bg-teal-200/40 rounded-full blur-3xl -z-10 pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center px-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs font-semibold mb-6 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Community-Based Sharing & Borrowing Platform</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
            “Don’t Buy It. <span className="text-emerald-600">Borrow It.</span><br />
            Share It. Reuse It.”
          </h1>

          <p className="mt-5 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Why spend money on tools, cameras, camping tents, or textbooks you only use occasionally? 
            BorrowBox connects trusted local community members to lend and borrow idle items safely.
          </p>

          {/* Search Box Bar */}
          <form onSubmit={handleSearchSubmit} className="mt-8 max-w-2xl mx-auto flex items-center bg-white p-2 rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/60 transition-all focus-within:ring-2 focus-within:ring-emerald-500/20 focus-within:border-emerald-500">
            <Search className="w-5 h-5 text-slate-400 ml-3 shrink-0" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search Sony camera, drill, camping tent, guitar, CLRS book..."
              className="w-full px-3 py-2 text-sm text-slate-900 focus:outline-none bg-transparent"
            />
            <button
              type="submit"
              className="px-5 py-3 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors shadow-sm shrink-0"
            >
              Search
            </button>
          </form>

          {/* Quick Category Chips */}
          <div className="mt-6 flex flex-wrap justify-center gap-2 max-w-3xl mx-auto">
            {categories.map((cat) => {
              const Icon = categoryIcons[cat.name] || Package;
              return (
                <Link
                  key={cat.id}
                  to={`/explore?category=${cat.id}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-slate-200 text-xs font-medium text-slate-700 hover:border-emerald-500 hover:text-emerald-700 hover:bg-emerald-50/50 transition-all shadow-sm"
                >
                  <Icon className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{cat.name}</span>
                </Link>
              );
            })}
          </div>

          {/* Fast Demo Switcher Banner for Evaluator */}
          <div className="mt-10 p-3.5 max-w-2xl mx-auto bg-slate-900 text-white rounded-2xl shadow-lg border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="font-semibold text-slate-200">Viva Demo Quick Login:</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => demoLogin('borrower').then(() => navigate('/dashboard'))}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-400 font-medium border border-slate-700 transition-colors"
              >
                Rahul (Borrower)
              </button>
              <button
                onClick={() => demoLogin('owner').then(() => navigate('/dashboard'))}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-teal-400 font-medium border border-slate-700 transition-colors"
              >
                Priya (Owner)
              </button>
              <button
                onClick={() => demoLogin('admin').then(() => navigate('/admin'))}
                className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-semibold border border-amber-500/40 transition-colors"
              >
                Admin Panel
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Featured Available Items */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider block mb-1">
              Community Catalog
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Featured Items to Borrow
            </h2>
          </div>
          <Link
            to="/explore"
            className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 group"
          >
            <span>View All ({featuredItems.length}+ items)</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredItems.map((item) => (
            <ItemCard
              key={item.id}
              item={item}
              onRequest={(it) => setSelectedItemForModal(it)}
            />
          ))}
        </div>
      </section>

      {/* 3. How BorrowBox Works (Interactive Workflow) */}
      <section className="bg-slate-100/70 border-y border-slate-200 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-12">
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider block mb-1">
              Full Transaction Lifecycle
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              How BorrowBox Works
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-2">
              Transparent, digital tracking from request to safe return with verified trust scores.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative">
              <span className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center justify-center mb-4">
                1
              </span>
              <h3 className="font-bold text-slate-900 text-base mb-2">Search & Discover</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Filter nearby items by category, location, condition, and availability. Check the owner's verified rating.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative">
              <span className="w-7 h-7 rounded-full bg-blue-100 text-blue-800 text-xs font-bold flex items-center justify-center mb-4">
                2
              </span>
              <h3 className="font-bold text-slate-900 text-base mb-2">Request & Approve</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Select your required start and return dates. The owner receives instant notification and approves or declines.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative">
              <span className="w-7 h-7 rounded-full bg-teal-100 text-teal-800 text-xs font-bold flex items-center justify-center mb-4">
                3
              </span>
              <h3 className="font-bold text-slate-900 text-base mb-2">Handover & Active Use</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Meet locally, verify the item, and confirm handover. Status updates to Active with return reminders.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative">
              <span className="w-7 h-7 rounded-full bg-purple-100 text-purple-800 text-xs font-bold flex items-center justify-center mb-4">
                4
              </span>
              <h3 className="font-bold text-slate-900 text-base mb-2">Return & Rate Trust</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Return the item safely. Both borrower and owner rate each other, dynamically updating their community Trust Score.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Platform Advantages (From Project Proposal) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-gradient-to-br from-emerald-800 to-teal-950 rounded-3xl p-8 sm:p-12 text-white shadow-xl">
          <div className="max-w-2xl mb-8">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block mb-2">
              Socially Useful Technology
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Why Choose BorrowBox for Community Sharing?
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm mt-2">
              Solving idle resource underutilization while fostering community trust and sustainable reuse.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 text-xs">
            <div className="bg-white/10 backdrop-blur-md p-5 rounded-2xl border border-white/10">
              <div className="w-8 h-8 rounded-xl bg-emerald-400/20 text-emerald-300 flex items-center justify-center mb-3">
                <RefreshCw className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-white text-sm mb-1">Cost-Effective Sharing</h4>
              <p className="text-slate-300">Save hundreds of rupees on items needed only for a few days or hours.</p>
            </div>

            <div className="bg-white/10 backdrop-blur-md p-5 rounded-2xl border border-white/10">
              <div className="w-8 h-8 rounded-xl bg-teal-400/20 text-teal-300 flex items-center justify-center mb-3">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-white text-sm mb-1">Trust-Based Community</h4>
              <p className="text-slate-300">Verified identity badges and two-way ratings build a safe, accountable network.</p>
            </div>

            <div className="bg-white/10 backdrop-blur-md p-5 rounded-2xl border border-white/10">
              <div className="w-8 h-8 rounded-xl bg-emerald-400/20 text-emerald-300 flex items-center justify-center mb-3">
                <Users className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-white text-sm mb-1">Digital Transaction Records</h4>
              <p className="text-slate-300">No messy chat messages or lost items; every handover is recorded with automated alerts.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Borrow Request Modal */}
      {selectedItemForModal && (
        <RequestModal
          item={selectedItemForModal}
          isOpen={!!selectedItemForModal}
          onClose={() => setSelectedItemForModal(null)}
          onSuccess={() => {
            alert('Your request was submitted to the owner successfully!');
            navigate('/dashboard');
          }}
        />
      )}
    </div>
  );
};


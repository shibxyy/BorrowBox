import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  MapPin, Star, ShieldCheck, Clock, ShieldAlert, ArrowLeft, 
  Send, AlertTriangle, CheckCircle2, User, Phone, Mail, Calendar 
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { RequestModal } from '../components/RequestModal';
import { DisputeModal } from '../components/DisputeModal';

export const ItemDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showDisputeModal, setShowDisputeModal] = useState(false);

  useEffect(() => {
    const fetchItem = async () => {
      setLoading(true);
      try {
        const res = await api.getItemById(id);
        setItem(res.item);
      } catch (err) {
        setError(err.message || 'Failed to load item details.');
      } finally {
        setLoading(false);
      }
    };
    fetchItem();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-xs text-slate-500 font-medium">Loading item details...</p>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <h2 className="text-lg font-bold text-slate-900 mb-2">Item Not Found</h2>
        <p className="text-xs text-slate-500 mb-6">{error || 'This listing does not exist or has been removed.'}</p>
        <Link
          to="/explore"
          className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700"
        >
          Return to Explore
        </Link>
      </div>
    );
  }

  const isOwner = user && user.id === item.owner_id;
  const isAvailable = Boolean(item.is_available);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back</span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Cols: Main Item Content */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Main Image Banner */}
          <div className="relative aspect-[16/10] bg-slate-900 rounded-3xl overflow-hidden border border-slate-200 shadow-sm">
            <img
              src={item.image_url}
              alt={item.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-4 left-4 flex gap-2">
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-600 text-white shadow-sm">
                {item.condition}
              </span>
              <span className="text-xs font-medium px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-white">
                {item.category_name}
              </span>
            </div>
            <div className="absolute top-4 right-4">
              <span className={`text-xs font-bold px-3 py-1 rounded-full shadow-md backdrop-blur-md ${
                isAvailable ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'
              }`}>
                {isAvailable ? 'Available Now' : 'Currently On Loan'}
              </span>
            </div>
          </div>

          {/* Title & Metadata */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div>
              <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
                <MapPin className="w-4 h-4 text-slate-400" />
                <span className="font-medium text-slate-700">{item.location}</span>
                <span>• Listed {new Date(item.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
                {item.title}
              </h1>
            </div>

            {/* Item Key Specs Pills */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 py-4 border-y border-slate-100 text-xs">
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Security Deposit</span>
                <span className="text-slate-900 font-extrabold text-sm">
                  {item.security_deposit > 0 ? `₹${item.security_deposit}` : 'Zero Deposit'}
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Max Borrow Duration</span>
                <span className="text-slate-900 font-extrabold text-sm flex items-center gap-1">
                  <Clock className="w-4 h-4 text-emerald-600" />
                  {item.max_duration_days} Days
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Item Condition</span>
                <span className="text-slate-900 font-extrabold text-sm">
                  {item.condition}
                </span>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider text-slate-500">
                Item Description
              </h3>
              <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-line">
                {item.description}
              </p>
            </div>

            {/* Safety & Borrowing Guideline Notice */}
            <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900 flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong className="font-bold block text-amber-950 mb-0.5">Community Borrowing Guidelines:</strong>
                Always inspect the item together during physical handover. Verify functionality and take clear photos if pre-existing wear is noticed. The borrower is responsible for treating the item with care.
              </div>
            </div>

            {/* Report Dispute Button */}
            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowDisputeModal(true)}
                className="text-xs font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Report an issue with this listing</span>
              </button>
            </div>
          </div>

          {/* Item Reviews Section */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">Community Reviews ({item.reviews?.length || 0})</h3>
            </div>

            {item.reviews?.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">
                No reviews recorded for this specific item yet.
              </p>
            ) : (
              <div className="space-y-4 divide-y divide-slate-100">
                {item.reviews.map((r) => (
                  <div key={r.id} className="pt-4 first:pt-0 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <img
                          src={r.reviewer_avatar}
                          alt={r.reviewer_name}
                          className="w-6 h-6 rounded-full object-cover"
                        />
                        <span className="font-bold text-slate-800">{r.reviewer_name}</span>
                      </div>
                      <div className="flex items-center gap-1 text-amber-500">
                        {[...Array(r.rating)].map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                    </div>
                    {r.comment && <p className="text-xs text-slate-600 leading-relaxed">{r.comment}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Col: Owner Profile & Action Box */}
        <div className="space-y-6">
          
          {/* Owner Profile Card */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-5">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Item Owner</div>
            
            <div className="flex items-center gap-3">
              <img
                src={item.owner_avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${item.owner_name}`}
                alt={item.owner_name}
                className="w-14 h-14 rounded-2xl object-cover border-2 border-slate-100 shadow-sm"
              />
              <div>
                <h4 className="font-bold text-slate-900 text-base flex items-center gap-1.5">
                  {item.owner_name}
                  {Boolean(item.owner_verified) && (
                    <ShieldCheck className="w-4 h-4 text-emerald-600" title="Verified Member" />
                  )}
                </h4>
                <div className="flex items-center gap-1 text-amber-600 text-xs font-semibold mt-0.5">
                  <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                  <span>{item.owner_trust_score ? Number(item.owner_trust_score).toFixed(1) : '5.0'} Trust Score</span>
                </div>
              </div>
            </div>

            <div className="space-y-2 text-xs text-slate-600 pt-2 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate">{item.owner_location}</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>{item.owner_verified ? 'Verified Community Identity' : 'Identity Verification Pending'}</span>
              </div>
            </div>

            {/* Action / Request Button */}
            <div className="pt-3">
              {isOwner ? (
                <div className="p-3 bg-slate-100 rounded-xl text-center text-xs font-medium text-slate-600">
                  You own this listing. Manage it from your dashboard.
                </div>
              ) : isAvailable ? (
                <button
                  onClick={() => setShowRequestModal(true)}
                  className="w-full py-3.5 rounded-2xl bg-emerald-600 text-white font-bold text-sm hover:bg-emerald-700 transition-all shadow-md shadow-emerald-500/20 flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>Request to Borrow</span>
                </button>
              ) : (
                <button
                  disabled
                  className="w-full py-3.5 rounded-2xl bg-slate-100 text-slate-400 font-bold text-sm cursor-not-allowed"
                >
                  Currently Borrowed
                </button>
              )}
            </div>
          </div>

          {/* Quick FAQ Card */}
          <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200/80 space-y-3 text-xs text-slate-600">
            <h4 className="font-bold text-slate-900 text-sm">How Borrowing Works</h4>
            <div className="space-y-2.5">
              <p>1. <strong>Send Request:</strong> Submit dates and purpose.</p>
              <p>2. <strong>Owner Confirms:</strong> The owner gets an instant alert.</p>
              <p>3. <strong>Handover:</strong> Meet locally, inspect, and confirm active loan.</p>
              <p>4. <strong>Safe Return:</strong> Return item & rate to build trust score.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showRequestModal && (
        <RequestModal
          item={item}
          isOpen={showRequestModal}
          onClose={() => setShowRequestModal(false)}
          onSuccess={() => {
            alert('Your borrow request has been delivered to the owner!');
            navigate('/dashboard');
          }}
        />
      )}

      {showDisputeModal && (
        <DisputeModal
          itemId={item.id}
          isOpen={showDisputeModal}
          onClose={() => setShowDisputeModal(false)}
        />
      )}
    </div>
  );
};


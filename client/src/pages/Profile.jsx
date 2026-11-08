import React, { useState, useEffect } from 'react';
import { 
  User, ShieldCheck, Star, MapPin, Phone, Mail, Edit3, 
  Layers, Package, CheckCircle2, AlertCircle, X 
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const Profile = () => {
  const { user, refreshUser } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);

  // Edit form state
  const [editForm, setEditForm] = useState({
    name: '',
    phone: '',
    location: '',
    bio: ''
  });
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await api.getMe();
      setProfileData(res.user);
      setEditForm({
        name: res.user.name || '',
        phone: res.user.phone || '',
        location: res.user.location || '',
        bio: res.user.bio || ''
      });

      if (res.user.id) {
        const revRes = await api.getUserReviews(res.user.id);
        setReviews(revRes.reviews || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setEditLoading(true);
    setEditError('');

    try {
      await api.updateProfile(editForm);
      await refreshUser();
      await fetchProfile();
      setShowEditModal(false);
    } catch (err) {
      setEditError(err.message || 'Failed to update profile.');
    } finally {
      setEditLoading(false);
    }
  };

  if (loading || !profileData) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center text-xs text-slate-400">
        Loading profile details...
      </div>
    );
  }

  const stats = profileData.stats || {};

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Profile Header Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <img
            src={profileData.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${profileData.name}`}
            alt={profileData.name}
            className="w-24 h-24 rounded-3xl object-cover border-4 border-slate-100 shadow-md"
          />

          <div className="flex-1 text-center sm:text-left space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h1 className="text-2xl font-extrabold text-slate-900 flex items-center justify-center sm:justify-start gap-2">
                  <span>{profileData.name}</span>
                  {Boolean(profileData.is_verified) && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                      <ShieldCheck className="w-3.5 h-3.5" /> Verified Member
                    </span>
                  )}
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  Member since {new Date(profileData.created_at).toLocaleDateString([], { month: 'short', year: 'numeric' })}
                </p>
              </div>

              <button
                onClick={() => setShowEditModal(true)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold inline-flex items-center justify-center gap-1.5 transition-colors"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Profile</span>
              </button>
            </div>

            <p className="text-xs text-slate-600 max-w-xl leading-relaxed">
              {profileData.bio || 'No bio added yet.'}
            </p>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 pt-2 text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                {profileData.location}
              </span>
              <span className="flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                {profileData.email}
              </span>
              {profileData.phone && (
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  {profileData.phone}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Trust Score & Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-slate-100 text-center">
          <div className="p-3 bg-amber-50 rounded-2xl border border-amber-100">
            <span className="text-[10px] font-bold uppercase text-amber-700 tracking-wider block">Trust Score</span>
            <div className="flex items-center justify-center gap-1 mt-1 text-amber-600 font-extrabold text-lg">
              <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
              <span>{stats.calculatedRating || profileData.trust_score || '5.0'}</span>
            </div>
            <span className="text-[10px] text-amber-600/80">{stats.reviewCount || 0} Reviews</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80">
            <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block">Listed Items</span>
            <span className="block mt-1 font-extrabold text-slate-800 text-lg">{stats.itemsListed || 0}</span>
            <span className="text-[10px] text-slate-400">{stats.itemsActive || 0} Active</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80">
            <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block">Completed Loans</span>
            <span className="block mt-1 font-extrabold text-slate-800 text-lg">{stats.loansCompleted || 0}</span>
            <span className="text-[10px] text-slate-400">As Lender</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80">
            <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block">Completed Borrows</span>
            <span className="block mt-1 font-extrabold text-slate-800 text-lg">{stats.borrowsCompleted || 0}</span>
            <span className="text-[10px] text-slate-400">As Borrower</span>
          </div>
        </div>
      </div>

      {/* Reviews Received Section */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-4">
        <h3 className="font-bold text-slate-900 text-base">Community Trust Reviews ({reviews.length})</h3>

        {reviews.length === 0 ? (
          <p className="text-xs text-slate-400 py-6 text-center">
            No community reviews received yet. Complete borrowing or lending transactions to accumulate ratings!
          </p>
        ) : (
          <div className="space-y-4 divide-y divide-slate-100">
            {reviews.map((r) => (
              <div key={r.id} className="pt-4 first:pt-0 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <img
                      src={r.reviewer_avatar}
                      alt={r.reviewer_name}
                      className="w-6 h-6 rounded-full object-cover"
                    />
                    <span className="font-bold text-slate-800">{r.reviewer_name}</span>
                    <span className="text-[10px] text-slate-400">
                      ({r.review_type === 'borrower_to_owner' ? 'As Borrower' : 'As Lender'})
                    </span>
                  </div>

                  <div className="flex items-center gap-1 text-amber-500">
                    {[...Array(r.rating)].map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                </div>

                {r.comment && <p className="text-xs text-slate-600">{r.comment}</p>}
                <span className="text-[10px] text-slate-400 block">
                  {new Date(r.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 relative">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900">Edit Profile</h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {editError && (
              <div className="my-3 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{editError}</span>
              </div>
            )}

            <form onSubmit={handleUpdate} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
                <input
                  type="text"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Campus / Location</label>
                <input
                  type="text"
                  required
                  value={editForm.location}
                  onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                  className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Short Bio</label>
                <textarea
                  rows={3}
                  value={editForm.bio}
                  onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                  className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 py-2.5 text-xs font-semibold rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editLoading}
                  className="flex-1 py-2.5 text-xs font-semibold rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 shadow-md shadow-emerald-200 disabled:opacity-50"
                >
                  {editLoading ? 'Saving...' : 'Save Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};


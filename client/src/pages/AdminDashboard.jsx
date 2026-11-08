import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, Users, Package, ArrowRightLeft, AlertTriangle, 
  Check, X, Trash2, Plus, RefreshCw, Eye, EyeOff, Flag 
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

export const AdminDashboard = () => {
  const { user, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'users' | 'listings' | 'categories' | 'disputes'

  const [stats, setStats] = useState(null);
  const [recentRequests, setRecentRequests] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [listings, setListings] = useState([]);
  const [categories, setCategories] = useState([]);
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);

  // New category form
  const [newCatName, setNewCatName] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsRes, usersRes, listingsRes, catRes, disputesRes] = await Promise.all([
        api.getAdminStats(),
        api.getAdminUsers(),
        api.getAdminListings(),
        api.getCategories(),
        api.getDisputes()
      ]);

      setStats(statsRes.stats || {});
      setRecentRequests(statsRes.recentRequests || []);
      setUsersList(usersRes.users || []);
      setListings(listingsRes.items || []);
      setCategories(catRes.categories || []);
      setDisputes(disputesRes.disputes || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleVerify = async (userId) => {
    try {
      await api.toggleUserVerification(userId);
      await loadData();
    } catch (err) {
      alert(err.message || 'Verification update failed.');
    }
  };

  const handleDeleteUser = async (userToDelete) => {
    if (window.confirm(`Are you sure you want to permanently delete user "${userToDelete.name}" (${userToDelete.email})? This will remove all their listings and requests.`)) {
      try {
        await api.deleteUser(userToDelete.id);
        await loadData();
      } catch (err) {
        alert(err.message || 'Failed to delete user.');
      }
    }
  };

  const handleUpdateItemStatus = async (itemId, status) => {
    try {
      await api.updateItemStatusAdmin(itemId, status);
      await loadData();
    } catch (err) {
      alert(err.message || 'Failed to update item status.');
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    try {
      await api.addCategory({ name: newCatName.trim(), description: newCatDesc.trim() });
      setNewCatName('');
      setNewCatDesc('');
      await loadData();
    } catch (err) {
      alert(err.message || 'Failed to add category.');
    }
  };

  const handleDeleteCategory = async (catId) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        await api.deleteCategory(catId);
        await loadData();
      } catch (err) {
        alert(err.message || 'Failed to delete category.');
      }
    }
  };

  const handleResolveDispute = async (disputeId, status) => {
    const adminNotes = window.prompt('Add administrative resolution notes:');
    try {
      await api.updateDisputeStatus(disputeId, status, adminNotes || '');
      await loadData();
    } catch (err) {
      alert(err.message || 'Failed to update dispute.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-sm">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              BorrowBox Administration
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Supervise user verification, category taxonomy, listings moderation, and reported community disputes.
          </p>
        </div>

        <button
          onClick={loadData}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 text-xs font-bold overflow-x-auto">
        <button
          onClick={() => setActiveTab('overview')}
          className={`pb-3 px-4 border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'overview'
              ? 'border-amber-600 text-amber-700 font-extrabold'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          Overview & System Stats
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`pb-3 px-4 border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'users'
              ? 'border-amber-600 text-amber-700 font-extrabold'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          User Verification ({usersList.length})
        </button>

        <button
          onClick={() => setActiveTab('listings')}
          className={`pb-3 px-4 border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'listings'
              ? 'border-amber-600 text-amber-700 font-extrabold'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          Listings Moderation ({listings.length})
        </button>

        <button
          onClick={() => setActiveTab('categories')}
          className={`pb-3 px-4 border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'categories'
              ? 'border-amber-600 text-amber-700 font-extrabold'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          Categories ({categories.length})
        </button>

        <button
          onClick={() => setActiveTab('disputes')}
          className={`pb-3 px-4 border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'disputes'
              ? 'border-rose-600 text-rose-700 font-extrabold'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <span>Disputes & Reports</span>
          {stats?.pendingDisputes > 0 && (
            <span className="w-4 h-4 rounded-full bg-rose-600 text-white text-[10px] flex items-center justify-center font-bold">
              {stats.pendingDisputes}
            </span>
          )}
        </button>
      </div>

      {/* TAB 1: OVERVIEW & STATS */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* Stats 5-Card Banner */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Members</span>
              <span className="text-2xl font-black text-slate-900 mt-1 block">{stats?.totalUsers || 0}</span>
              <span className="text-[11px] text-emerald-600 font-semibold">{stats?.verifiedUsers || 0} Verified</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Listed Items</span>
              <span className="text-2xl font-black text-slate-900 mt-1 block">{stats?.totalItems || 0}</span>
              <span className="text-[11px] text-emerald-600 font-semibold">{stats?.activeItems || 0} Ready to Borrow</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Active On-Loan</span>
              <span className="text-2xl font-black text-emerald-700 mt-1 block">{stats?.activeBorrows || 0}</span>
              <span className="text-[11px] text-slate-500">Currently Handed Over</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Completed Loans</span>
              <span className="text-2xl font-black text-teal-700 mt-1 block">{stats?.completedTransactions || 0}</span>
              <span className="text-[11px] text-teal-600 font-semibold">100% Returned Safely</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Pending Reports</span>
              <span className="text-2xl font-black text-rose-600 mt-1 block">{stats?.pendingDisputes || 0}</span>
              <span className="text-[11px] text-rose-600 font-semibold">Needs Investigation</span>
            </div>
          </div>

          {/* Recent System Activity Table */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-base">Recent Platform Activity</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase text-[10px]">
                    <th className="pb-3">Item</th>
                    <th className="pb-3">Borrower</th>
                    <th className="pb-3">Owner</th>
                    <th className="pb-3">Dates</th>
                    <th className="pb-3">Current Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentRequests.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 font-semibold text-slate-900">{r.item_title}</td>
                      <td className="py-3 text-slate-600">{r.borrower_name}</td>
                      <td className="py-3 text-slate-600">{r.owner_name}</td>
                      <td className="py-3 text-slate-500">{r.start_date} to {r.return_date}</td>
                      <td className="py-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-800">
                          {r.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: USER VERIFICATION */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-900 text-base">Community User Directory & Verification</h3>
          <p className="text-xs text-slate-500">
            Administrators can verify users to display a certified trust badge on their profile and listings.
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase text-[10px]">
                  <th className="pb-3">User</th>
                  <th className="pb-3">Contact</th>
                  <th className="pb-3">Campus / Location</th>
                  <th className="pb-3">Trust Score</th>
                  <th className="pb-3">Listings / Loans</th>
                  <th className="pb-3">Verification</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {usersList.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50">
                    <td className="py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-700">
                          {u.name[0]}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{u.name}</p>
                          <span className="text-[10px] uppercase font-bold text-slate-400">{u.role}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 text-slate-600">
                      <div>{u.email}</div>
                      <div className="text-[10px] text-slate-400">{u.phone}</div>
                    </td>
                    <td className="py-3.5 text-slate-600 max-w-[150px] truncate">{u.location}</td>
                    <td className="py-3.5 font-bold text-amber-600">★ {u.trust_score}</td>
                    <td className="py-3.5 text-slate-600">
                      {u.items_listed_count} Listed • {u.lend_count} Lent
                    </td>
                    <td className="py-3.5">
                      {Boolean(u.is_verified) ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                          <Check className="w-3 h-3 text-emerald-600" /> Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                          Unverified
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 text-right space-x-2">
                      <button
                        onClick={() => handleToggleVerify(u.id)}
                        className={`px-3 py-1 rounded-xl text-xs font-semibold border transition-colors ${
                          u.is_verified
                            ? 'border-amber-200 text-amber-700 hover:bg-amber-50'
                            : 'border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                        }`}
                      >
                        {u.is_verified ? 'Unverify' : 'Verify'}
                      </button>
                      {u.role !== 'admin' && (
                        <button
                          onClick={() => handleDeleteUser(u)}
                          className="px-2.5 py-1 rounded-xl text-xs font-semibold border border-rose-200 text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Permanently remove user"
                        >
                          Delete
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: LISTINGS MODERATION */}
      {activeTab === 'listings' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-900 text-base">Moderate Item Listings</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase text-[10px]">
                  <th className="pb-3">Item</th>
                  <th className="pb-3">Category</th>
                  <th className="pb-3">Owner</th>
                  <th className="pb-3">Deposit</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right">Moderation Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {listings.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="py-3.5 font-bold text-slate-900 max-w-[200px] truncate">
                      {item.title}
                    </td>
                    <td className="py-3.5 text-slate-600">{item.category_name}</td>
                    <td className="py-3.5 text-slate-600">{item.owner_name}</td>
                    <td className="py-3.5 font-semibold text-slate-800">
                      {item.security_deposit > 0 ? `₹${item.security_deposit}` : 'Zero'}
                    </td>
                    <td className="py-3.5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        item.status === 'active'
                          ? 'bg-emerald-100 text-emerald-800'
                          : item.status === 'flagged'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="py-3.5 text-right space-x-1.5">
                      {item.status !== 'active' && (
                        <button
                          onClick={() => handleUpdateItemStatus(item.id, 'active')}
                          className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 text-xs font-semibold"
                        >
                          Approve
                        </button>
                      )}
                      {item.status !== 'flagged' && (
                        <button
                          onClick={() => handleUpdateItemStatus(item.id, 'flagged')}
                          className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200 text-xs font-semibold"
                        >
                          Flag
                        </button>
                      )}
                      {item.status !== 'hidden' && (
                        <button
                          onClick={() => handleUpdateItemStatus(item.id, 'hidden')}
                          className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 text-xs font-semibold"
                        >
                          Hide
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: CATEGORY MANAGEMENT */}
      {activeTab === 'categories' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-base">Current Categories</h3>
            <div className="divide-y divide-slate-100">
              {categories.map((c) => (
                <div key={c.id} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <h4 className="font-bold text-slate-900">{c.name}</h4>
                    <p className="text-slate-500 text-[11px]">{c.description || 'No description'}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-semibold text-[10px]">
                      {c.item_count || 0} items
                    </span>
                    <button
                      onClick={() => handleDeleteCategory(c.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                      title="Delete category"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Add Category Card */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-base">Add New Category</h3>
            <form onSubmit={handleAddCategory} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Category Name</label>
                <input
                  type="text"
                  required
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  placeholder="e.g. Board Games & Puzzles"
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={newCatDesc}
                  onChange={(e) => setNewCatDesc(e.target.value)}
                  placeholder="Short summary of items suited for this category..."
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors shadow-sm"
              >
                + Create Category
              </button>
            </form>
          </div>
        </div>
      )}

      {/* TAB 5: DISPUTES & REPORTS */}
      {activeTab === 'disputes' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-900 text-base">Reported Disputes & Issues</h3>
          <p className="text-xs text-slate-500">
            Handle user complaints regarding damaged items, delayed returns, or incorrect listings.
          </p>

          {disputes.length === 0 ? (
            <p className="text-xs text-slate-400 py-8 text-center">
              No disputes or reports have been filed. Platform is running smoothly!
            </p>
          ) : (
            <div className="space-y-4 divide-y divide-slate-100">
              {disputes.map((d) => (
                <div key={d.id} className="pt-4 first:pt-0 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                        {d.reason}
                      </span>
                      <span className="text-slate-500">
                        Reported by <strong>{d.reporter_name}</strong> ({d.reporter_email})
                      </span>
                    </div>

                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      d.status === 'pending'
                        ? 'bg-amber-100 text-amber-800'
                        : d.status === 'resolved'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-slate-100 text-slate-600'
                    }`}>
                      Status: {d.status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                    {d.details}
                  </p>

                  {d.admin_notes && (
                    <p className="text-[11px] text-emerald-800 bg-emerald-50/50 p-2 rounded-lg">
                      Admin Note: {d.admin_notes}
                    </p>
                  )}

                  <div className="flex items-center justify-end gap-2 pt-1 text-xs">
                    <button
                      onClick={() => handleResolveDispute(d.id, 'investigating')}
                      className="px-3 py-1 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold"
                    >
                      Investigating
                    </button>
                    <button
                      onClick={() => handleResolveDispute(d.id, 'resolved')}
                      className="px-3 py-1 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 font-bold shadow-sm"
                    >
                      Mark Resolved
                    </button>
                    <button
                      onClick={() => handleResolveDispute(d.id, 'dismissed')}
                      className="px-3 py-1 rounded-lg border border-rose-200 text-rose-700 hover:bg-rose-50 font-semibold"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};


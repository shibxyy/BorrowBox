import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { 
  ArrowRightLeft, Package, Clock, CheckCircle2, RotateCcw, 
  Star, AlertCircle, PlusCircle, Trash2, Edit3, ShieldAlert, 
  Calendar, Check, X, Handshake, AlertTriangle 
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { StatusBadge } from '../components/StatusBadge';
import { LifecycleStepper } from '../components/LifecycleStepper';
import { ReviewModal } from '../components/ReviewModal';
import { DisputeModal } from '../components/DisputeModal';

export const Dashboard = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'borrowing'; // 'borrowing' | 'lending' | 'items'

  const [borrowerRequests, setBorrowerRequests] = useState([]);
  const [ownerRequests, setOwnerRequests] = useState([]);
  const [myItems, setMyItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [reviewRequest, setReviewRequest] = useState(null);
  const [disputeInfo, setDisputeInfo] = useState(null); // { itemId, requestId }

  const loadData = async () => {
    setLoading(true);
    try {
      const [borrowerRes, ownerRes, itemsRes] = await Promise.all([
        api.getBorrowerRequests(),
        api.getOwnerRequests(),
        api.getMyListings()
      ]);

      setBorrowerRequests(borrowerRes.requests || []);
      setOwnerRequests(ownerRes.requests || []);
      setMyItems(itemsRes.items || []);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleStatusChange = async (requestId, status) => {
    try {
      await api.updateRequestStatus(requestId, status);
      await loadData();
    } catch (err) {
      alert(err.message || 'Action failed.');
    }
  };

  const handleDeleteItem = async (itemId) => {
    if (window.confirm('Are you sure you want to remove this item listing?')) {
      try {
        await api.deleteItem(itemId);
        await loadData();
      } catch (err) {
        alert(err.message || 'Failed to delete listing.');
      }
    }
  };

  const handleToggleItemAvailability = async (item) => {
    try {
      await api.updateItem(item.id, { is_available: !item.is_available });
      await loadData();
    } catch (err) {
      alert(err.message || 'Failed to update availability.');
    }
  };

  const setTab = (tabName) => {
    setSearchParams({ tab: tabName });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Community Exchange Hub
            </h1>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
              Active Dashboard
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage your outgoing borrowing requests, incoming lending loans, and listed idle gear.
          </p>
        </div>

        <Link
          to="/item/new"
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors shadow-sm shadow-emerald-200"
        >
          <PlusCircle className="w-4 h-4" />
          <span>List Another Item</span>
        </Link>
      </div>

      {/* Tabs Bar */}
      <div className="flex items-center gap-2 border-b border-slate-200 text-xs font-bold">
        <button
          onClick={() => setTab('borrowing')}
          className={`pb-3 px-4 flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'borrowing'
              ? 'border-emerald-600 text-emerald-700 font-extrabold'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <span>As Borrower (I Want to Borrow)</span>
          <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-slate-100 text-slate-700">
            {borrowerRequests.length}
          </span>
        </button>

        <button
          onClick={() => setTab('lending')}
          className={`pb-3 px-4 flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'lending'
              ? 'border-emerald-600 text-emerald-700 font-extrabold'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <span>As Lender / Owner (My Items Loaned)</span>
          <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-slate-100 text-slate-700">
            {ownerRequests.length}
          </span>
        </button>

        <button
          onClick={() => setTab('items')}
          className={`pb-3 px-4 flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'items'
              ? 'border-emerald-600 text-emerald-700 font-extrabold'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <span>My Listed Gear</span>
          <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-slate-100 text-slate-700">
            {myItems.length}
          </span>
        </button>
      </div>

      {/* TAB 1: AS BORROWER */}
      {activeTab === 'borrowing' && (
        <div className="space-y-4">
          {loading ? (
            <div className="p-12 text-center text-xs text-slate-400">Loading your borrowing requests...</div>
          ) : borrowerRequests.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
              <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="font-bold text-slate-800 text-base">No Borrowing Requests Yet</h3>
              <p className="text-xs text-slate-500 mt-1 mb-4">
                Explore items listed by other members and send your first request!
              </p>
              <Link
                to="/explore"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700"
              >
                Browse Items
              </Link>
            </div>
          ) : (
            borrowerRequests.map((req) => (
              <div
                key={req.id}
                className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-sm space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={req.item_image}
                      alt={req.item_title}
                      className="w-14 h-14 rounded-2xl object-cover border border-slate-100"
                    />
                    <div>
                      <h3 className="font-bold text-slate-900 text-base">{req.item_title}</h3>
                      <p className="text-xs text-slate-500">
                        Owner: <strong className="text-slate-700">{req.owner_name}</strong> • {req.owner_location}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <StatusBadge status={req.status} />
                  </div>
                </div>

                {/* Stepper Progress */}
                <div className="pt-2">
                  <LifecycleStepper currentStatus={req.status} />
                </div>

                {/* Dates & Purpose */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 text-xs">
                  <div>
                    <span className="text-slate-400 font-semibold block text-[10px] uppercase">Borrowing Period</span>
                    <span className="font-bold text-slate-800">{req.start_date} to {req.return_date}</span>
                  </div>

                  <div>
                    <span className="text-slate-400 font-semibold block text-[10px] uppercase">Security Deposit</span>
                    <span className="font-bold text-slate-800">{req.security_deposit > 0 ? `₹${req.security_deposit}` : 'Zero Deposit'}</span>
                  </div>

                  <div>
                    <span className="text-slate-400 font-semibold block text-[10px] uppercase">Contact Owner</span>
                    <span className="font-medium text-slate-700">{req.owner_phone || req.owner_email}</span>
                  </div>
                </div>

                {req.purpose && (
                  <p className="text-xs text-slate-600 bg-emerald-50/50 p-3 rounded-xl border border-emerald-100 italic">
                    “{req.purpose}”
                  </p>
                )}

                {/* Action buttons based on status */}
                <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-slate-100">
                  {req.status === 'Requested' && (
                    <button
                      onClick={() => handleStatusChange(req.id, 'Cancelled')}
                      className="px-3.5 py-1.5 rounded-xl border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-semibold"
                    >
                      Cancel Request
                    </button>
                  )}

                  {req.status === 'Approved' && (
                    <div className="text-xs text-blue-700 font-medium flex items-center gap-2 bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-200">
                      <Clock className="w-4 h-4 text-blue-600" />
                      <span>Approved! Meet owner to collect the item. Handover will be marked active.</span>
                    </div>
                  )}

                  {req.status === 'Active' && (
                    <div className="flex items-center gap-2 w-full sm:w-auto justify-between">
                      <span className="text-xs font-semibold text-emerald-800">
                        Item currently with you. Return due: {req.return_date}
                      </span>
                    </div>
                  )}

                  {(req.status === 'Returned' || req.status === 'Completed') && !Boolean(req.has_reviewed) && (
                    <button
                      onClick={() => setReviewRequest(req)}
                      className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm"
                    >
                      <Star className="w-3.5 h-3.5 fill-white" />
                      <span>Rate Owner & Experience</span>
                    </button>
                  )}

                  {Boolean(req.has_reviewed) && (
                    <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Review Submitted
                    </span>
                  )}

                  <button
                    onClick={() => setDisputeInfo({ itemId: req.item_id, requestId: req.id })}
                    className="text-xs text-slate-400 hover:text-rose-600 flex items-center gap-1 ml-2"
                    title="Report Issue"
                  >
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Report</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 2: AS LENDER / OWNER */}
      {activeTab === 'lending' && (
        <div className="space-y-4">
          {loading ? (
            <div className="p-12 text-center text-xs text-slate-400">Loading incoming requests...</div>
          ) : ownerRequests.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
              <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="font-bold text-slate-800 text-base">No Lending Requests Yet</h3>
              <p className="text-xs text-slate-500 mt-1 mb-4">
                When borrowers request your listed items, they will appear right here for approval.
              </p>
            </div>
          ) : (
            ownerRequests.map((req) => (
              <div
                key={req.id}
                className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-sm space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={req.item_image}
                      alt={req.item_title}
                      className="w-14 h-14 rounded-2xl object-cover border border-slate-100"
                    />
                    <div>
                      <h3 className="font-bold text-slate-900 text-base">{req.item_title}</h3>
                      <p className="text-xs text-slate-500">
                        Borrower: <strong className="text-slate-800">{req.borrower_name}</strong> (Trust: ★{req.borrower_trust_score}) • {req.borrower_location}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <StatusBadge status={req.status} />
                  </div>
                </div>

                {/* Progress Stepper */}
                <div className="pt-2">
                  <LifecycleStepper currentStatus={req.status} />
                </div>

                {/* Request Details */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 text-xs">
                  <div>
                    <span className="text-slate-400 font-semibold block text-[10px] uppercase">Requested Dates</span>
                    <span className="font-bold text-slate-800">{req.start_date} to {req.return_date}</span>
                  </div>

                  <div>
                    <span className="text-slate-400 font-semibold block text-[10px] uppercase">Deposit Held</span>
                    <span className="font-bold text-slate-800">{req.security_deposit > 0 ? `₹${req.security_deposit}` : 'Zero'}</span>
                  </div>

                  <div>
                    <span className="text-slate-400 font-semibold block text-[10px] uppercase">Borrower Phone</span>
                    <span className="font-medium text-slate-700">{req.borrower_phone || req.borrower_email}</span>
                  </div>
                </div>

                {req.purpose && (
                  <p className="text-xs text-slate-600 bg-slate-100 p-3 rounded-xl italic">
                    “{req.purpose}”
                  </p>
                )}

                {/* Owner Actions */}
                <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-slate-100">
                  {req.status === 'Requested' && (
                    <>
                      <button
                        onClick={() => handleStatusChange(req.id, 'Rejected')}
                        className="px-3.5 py-1.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold"
                      >
                        Decline
                      </button>
                      <button
                        onClick={() => handleStatusChange(req.id, 'Approved')}
                        className="px-4 py-1.5 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 text-xs font-bold shadow-sm shadow-emerald-200"
                      >
                        Approve Request
                      </button>
                    </>
                  )}

                  {req.status === 'Approved' && (
                    <button
                      onClick={() => handleStatusChange(req.id, 'Active')}
                      className="px-4 py-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 text-xs font-bold flex items-center gap-1.5 shadow-sm"
                    >
                      <Handshake className="w-4 h-4" />
                      <span>Confirm Physical Handover (Mark Active)</span>
                    </button>
                  )}

                  {req.status === 'Active' && (
                    <button
                      onClick={() => handleStatusChange(req.id, 'Returned')}
                      className="px-4 py-2 rounded-xl bg-purple-600 text-white hover:bg-purple-700 text-xs font-bold flex items-center gap-1.5 shadow-sm"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>Confirm Item Safely Returned</span>
                    </button>
                  )}

                  {req.status === 'Returned' && (
                    <button
                      onClick={() => handleStatusChange(req.id, 'Completed')}
                      className="px-4 py-2 rounded-xl bg-teal-600 text-white hover:bg-teal-700 text-xs font-bold flex items-center gap-1.5 shadow-sm"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Close Transaction (Completed)</span>
                    </button>
                  )}

                  {(req.status === 'Returned' || req.status === 'Completed') && !Boolean(req.has_reviewed) && (
                    <button
                      onClick={() => setReviewRequest(req)}
                      className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm"
                    >
                      <Star className="w-3.5 h-3.5 fill-white" />
                      <span>Rate Borrower</span>
                    </button>
                  )}

                  {Boolean(req.has_reviewed) && (
                    <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Rating Submitted
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 3: MY LISTED ITEMS */}
      {activeTab === 'items' && (
        <div className="space-y-4">
          {loading ? (
            <div className="p-12 text-center text-xs text-slate-400">Loading your listings...</div>
          ) : myItems.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
              <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="font-bold text-slate-800 text-base">You haven't listed any items yet</h3>
              <p className="text-xs text-slate-500 mt-1 mb-4">
                Have power tools, camera gear, camping tents, or textbooks idle at home? Share them with the community!
              </p>
              <Link
                to="/item/new"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700"
              >
                + List First Item
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {myItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm flex flex-col justify-between"
                >
                  <div className="relative aspect-[16/10] bg-slate-100">
                    <img
                      src={item.image_url}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 left-2 flex gap-1">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-black/60 text-white backdrop-blur-md">
                        {item.category_name}
                      </span>
                    </div>
                    <div className="absolute top-2 right-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full text-white ${
                        item.is_available ? 'bg-emerald-600' : 'bg-amber-600'
                      }`}>
                        {item.is_available ? 'Available' : 'Unavailable'}
                      </span>
                    </div>
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm line-clamp-1">{item.title}</h4>
                      <p className="text-xs text-slate-500 line-clamp-2 mt-1">{item.description}</p>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-semibold">Deposit</span>
                        <span className="font-bold text-slate-800">
                          {item.security_deposit > 0 ? `₹${item.security_deposit}` : 'Zero'}
                        </span>
                      </div>

                      <label className="flex items-center gap-1.5 cursor-pointer text-xs font-semibold text-slate-700">
                        <span>Available</span>
                        <input
                          type="checkbox"
                          checked={Boolean(item.is_available)}
                          onChange={() => handleToggleItemAvailability(item)}
                          className="rounded text-emerald-600 h-4 w-4"
                        />
                      </label>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                      <Link
                        to={`/item/${item.id}/edit`}
                        className="flex-1 py-1.5 px-3 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold text-center flex items-center justify-center gap-1"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </Link>
                      <button
                        onClick={() => handleDeleteItem(item.id)}
                        className="py-1.5 px-3 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-semibold flex items-center justify-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      {reviewRequest && (
        <ReviewModal
          request={reviewRequest}
          isOpen={!!reviewRequest}
          onClose={() => setReviewRequest(null)}
          onSuccess={() => {
            alert('Review submitted successfully!');
            loadData();
          }}
        />
      )}

      {disputeInfo && (
        <DisputeModal
          itemId={disputeInfo.itemId}
          requestId={disputeInfo.requestId}
          isOpen={!!disputeInfo}
          onClose={() => setDisputeInfo(null)}
        />
      )}
    </div>
  );
};


import React, { useState } from 'react';
import { X, Calendar, AlertCircle, CheckCircle2, ShieldAlert } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export const RequestModal = ({ item, isOpen, onClose, onSuccess }) => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Tomorrow as default start date
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const defaultStart = tomorrow.toISOString().split('T')[0];

  const defaultEnd = new Date(tomorrow);
  defaultEnd.setDate(defaultEnd.getDate() + 3);
  const defaultEndStr = defaultEnd.toISOString().split('T')[0];

  const [startDate, setStartDate] = useState(defaultStart);
  const [returnDate, setReturnDate] = useState(defaultEndStr);
  const [purpose, setPurpose] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !item) return null;

  // Calculate days
  const start = new Date(startDate);
  const end = new Date(returnDate);
  const diffTime = end - start;
  const durationDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (item.owner_id === user.id) {
      setError('You are the owner of this item and cannot borrow it.');
      return;
    }

    if (durationDays < 1) {
      setError('Return date must be on or after start date.');
      return;
    }

    if (item.max_duration_days && durationDays > item.max_duration_days) {
      setError(`Maximum borrowing duration allowed is ${item.max_duration_days} days.`);
      return;
    }

    setLoading(true);
    setError('');

    try {
      await api.createRequest({
        item_id: item.id,
        start_date: startDate,
        return_date: returnDate,
        purpose
      });
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to submit request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 overflow-hidden relative">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Request to Borrow</h2>
            <p className="text-xs text-slate-500">Sent directly to owner for confirmation</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Item Summary Bar */}
        <div className="my-4 p-3 bg-slate-50 rounded-2xl flex items-center gap-3 border border-slate-200">
          <img
            src={item.image_url}
            alt={item.title}
            className="w-14 h-14 rounded-xl object-cover"
          />
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-slate-900 text-sm truncate">{item.title}</h4>
            <p className="text-xs text-slate-500">Owner: {item.owner_name} • {item.location}</p>
            <div className="flex items-center gap-2 mt-1 text-xs">
              <span className="font-semibold text-emerald-700">
                Deposit: {item.security_deposit > 0 ? `₹${item.security_deposit}` : 'Zero'}
              </span>
              <span className="text-slate-400">• Max {item.max_duration_days} days</span>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                required
                value={startDate}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Return Date
              </label>
              <input
                type="date"
                required
                value={returnDate}
                min={startDate}
                onChange={(e) => setReturnDate(e.target.value)}
                className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Duration calculation banner */}
          <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 flex items-center justify-between text-xs">
            <span className="text-emerald-800 font-medium">Estimated Duration:</span>
            <span className="font-bold text-emerald-700">
              {durationDays > 0 ? `${durationDays} Days` : 'Invalid Date Range'}
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Purpose / Message to Owner
            </label>
            <textarea
              rows={3}
              required
              placeholder="Explain how you plan to use this item and confirm you will take great care of it..."
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>

          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-800 flex items-start gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
            <span>
              By requesting this item, you agree to return it in identical condition by the agreed date. Security deposit (if applicable) is returned upon physical inspection.
            </span>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 text-xs font-semibold rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 text-xs font-semibold rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-md shadow-emerald-200 disabled:opacity-50"
            >
              {loading ? 'Submitting...' : 'Send Borrow Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};


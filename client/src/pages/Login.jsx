import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Package, Lock, Mail, AlertCircle, Sparkles, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const [error, setError] = useState('');

  const { login, demoLogin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemo = async (role) => {
    setDemoLoading(true);
    setError('');
    try {
      await demoLogin(role);
      navigate(role === 'admin' ? '/admin' : '/dashboard');
    } catch (err) {
      setError(err.message || 'Demo login failed.');
    } finally {
      setDemoLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-xl shadow-slate-100 space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-1">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white flex items-center justify-center mx-auto shadow-md shadow-emerald-500/20 mb-3">
            <Package className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Sign In to BorrowBox</h1>
          <p className="text-xs text-slate-500">Access your borrowings, listings, and community trust score</p>
        </div>

        {/* Viva Evaluator Quick Demo Box */}
        <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span>Viva Demo Mode (1-Click Login)</span>
          </div>
          <p className="text-[11px] text-emerald-800 leading-tight">
            Click any demo profile to test role-based features immediately without manual typing:
          </p>

          <div className="grid grid-cols-3 gap-1.5 pt-1">
            <button
              type="button"
              disabled={demoLoading}
              onClick={() => handleDemo('borrower')}
              className="py-1.5 px-2 bg-white rounded-xl border border-emerald-200 text-emerald-800 hover:bg-emerald-100 font-semibold text-[11px] transition-colors shadow-sm"
            >
              Borrower (Rahul)
            </button>
            <button
              type="button"
              disabled={demoLoading}
              onClick={() => handleDemo('owner')}
              className="py-1.5 px-2 bg-white rounded-xl border border-teal-200 text-teal-800 hover:bg-teal-100 font-semibold text-[11px] transition-colors shadow-sm"
            >
              Owner (Priya)
            </button>
            <button
              type="button"
              disabled={demoLoading}
              onClick={() => handleDemo('admin')}
              className="py-1.5 px-2 bg-amber-500 text-white hover:bg-amber-600 font-bold text-[11px] rounded-xl transition-colors shadow-sm"
            >
              Admin Panel
            </button>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Regular Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors shadow-md shadow-emerald-200 disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-xs text-slate-500">
          New to BorrowBox?{' '}
          <Link to="/register" className="text-emerald-600 font-bold hover:underline">
            Create an Account
          </Link>
        </p>
      </div>
    </div>
  );
};


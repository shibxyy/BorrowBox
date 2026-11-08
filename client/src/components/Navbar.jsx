import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Package, Search, PlusCircle, Bell, User, LogOut, ShieldCheck, 
  Layers, CheckCircle2, ChevronDown, Sparkles, Menu, X, ArrowRightLeft
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';

export const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout, demoLogin } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const navigate = useNavigate();
  const location = useLocation();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [demoSwitchLoading, setDemoSwitchLoading] = useState(false);

  const notifRef = useRef(null);
  const userRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
      if (userRef.current && !userRef.current.contains(e.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDemoSwitch = async (role) => {
    try {
      setDemoSwitchLoading(true);
      await demoLogin(role);
      setShowUserMenu(false);
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
    } finally {
      setDemoSwitchLoading(false);
    }
  };

  return (
    <nav className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-extrabold text-slate-900 tracking-tight">Borrow<span className="text-emerald-600">Box</span></span>
                <span className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-bold uppercase rounded bg-emerald-100 text-emerald-800 tracking-wider">FYUGP</span>
              </div>
              <span className="hidden sm:block text-[10px] text-slate-400 font-medium -mt-0.5">Community Sharing & Borrowing</span>
            </div>
          </Link>

          {/* Center Navigation Links */}
          <div className="hidden md:flex items-center gap-1">
            <Link
              to="/explore"
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                location.pathname === '/explore'
                  ? 'bg-slate-100 text-emerald-700'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Explore Items
            </Link>

            {isAuthenticated && (
              <Link
                to="/dashboard"
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                  location.pathname.startsWith('/dashboard')
                    ? 'bg-slate-100 text-emerald-700'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <ArrowRightLeft className="w-3.5 h-3.5 text-emerald-600" />
                My Exchanges
              </Link>
            )}

            {isAdmin && (
              <Link
                to="/admin"
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                  location.pathname.startsWith('/admin')
                    ? 'bg-amber-100 text-amber-900'
                    : 'text-amber-700 hover:bg-amber-50'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                Admin Panel
              </Link>
            )}
          </div>

          {/* Right Action Icons & Auth */}
          <div className="flex items-center gap-2.5">
            {/* Quick Post Button */}
            <Link
              to="/item/new"
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-sm shadow-emerald-200"
            >
              <PlusCircle className="w-4 h-4" />
              <span>List an Item</span>
            </Link>

            {isAuthenticated ? (
              <>
                {/* Notifications Bell */}
                <div className="relative" ref={notifRef}>
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="relative w-9 h-9 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 flex items-center justify-center transition-colors"
                    title="Notifications"
                  >
                    <Bell className="w-4 h-4" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 text-white text-[10px] font-bold flex items-center justify-center shadow-sm">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Dropdown Box */}
                  {showNotifications && (
                    <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-50 animate-fade-in">
                      <div className="p-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                          <Bell className="w-3.5 h-3.5 text-emerald-600" /> Notifications
                        </span>
                        {unreadCount > 0 && (
                          <button
                            onClick={markAllAsRead}
                            className="text-[11px] text-emerald-600 hover:text-emerald-700 font-semibold"
                          >
                            Mark all read
                          </button>
                        )}
                      </div>

                      <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                        {notifications.length === 0 ? (
                          <div className="p-6 text-center text-xs text-slate-400">
                            No notifications yet!
                          </div>
                        ) : (
                          notifications.map((n) => (
                            <div
                              key={n.id}
                              onClick={() => {
                                markAsRead(n.id);
                                if (n.link) navigate(n.link);
                                setShowNotifications(false);
                              }}
                              className={`p-3 text-xs cursor-pointer hover:bg-slate-50 transition-colors ${
                                !n.is_read ? 'bg-emerald-50/40' : ''
                              }`}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <h4 className="font-semibold text-slate-900">{n.title}</h4>
                                <span className="text-[10px] text-slate-400 shrink-0">
                                  {new Date(n.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                                </span>
                              </div>
                              <p className="text-slate-600 text-[11px] mt-0.5 line-clamp-2">{n.message}</p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* User Menu */}
                <div className="relative" ref={userRef}>
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2 p-1.5 pl-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors"
                  >
                    <img
                      src={user?.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${user?.name}`}
                      alt={user?.name}
                      className="w-6 h-6 rounded-full object-cover"
                    />
                    <span className="text-xs font-semibold text-slate-800 max-w-[100px] truncate hidden sm:inline-block">
                      {user?.name}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  {/* User Dropdown */}
                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-50 animate-fade-in p-2">
                      <div className="px-3 py-2 border-b border-slate-100">
                        <p className="text-xs font-bold text-slate-900 truncate">{user?.name}</p>
                        <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                        <div className="mt-1 flex items-center gap-1.5">
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 uppercase">
                            {user?.role}
                          </span>
                          {Boolean(user?.is_verified) && (
                            <span className="text-[10px] font-semibold text-emerald-600 flex items-center gap-0.5">
                              <ShieldCheck className="w-3 h-3" /> Verified
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="py-1">
                        <Link
                          to="/profile"
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 rounded-xl"
                        >
                          <User className="w-4 h-4 text-slate-400" />
                          <span>My Profile & Trust Score</span>
                        </Link>
                        <Link
                          to="/dashboard"
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 rounded-xl"
                        >
                          <Layers className="w-4 h-4 text-slate-400" />
                          <span>Exchange Dashboard</span>
                        </Link>
                        {isAdmin && (
                          <Link
                            to="/admin"
                            onClick={() => setShowUserMenu(false)}
                            className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-amber-800 hover:bg-amber-50 rounded-xl"
                          >
                            <ShieldCheck className="w-4 h-4 text-amber-600" />
                            <span>Admin Control Panel</span>
                          </Link>
                        )}
                      </div>

                      {/* Evaluator Quick Switcher */}
                      <div className="pt-2 border-t border-slate-100">
                        <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                          Demo Switcher (Viva Mode)
                        </p>
                        <button
                          onClick={() => handleDemoSwitch('borrower')}
                          className="w-full text-left px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 rounded-lg flex items-center justify-between"
                        >
                          <span>Rahul (Borrower)</span>
                          <span className="text-[10px] text-slate-400">Student</span>
                        </button>
                        <button
                          onClick={() => handleDemoSwitch('owner')}
                          className="w-full text-left px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 rounded-lg flex items-center justify-between"
                        >
                          <span>Priya (Owner)</span>
                          <span className="text-[10px] text-slate-400">Lender</span>
                        </button>
                        <button
                          onClick={() => handleDemoSwitch('admin')}
                          className="w-full text-left px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 rounded-lg flex items-center justify-between"
                        >
                          <span>Admin</span>
                          <span className="text-[10px] text-amber-600 font-semibold">Full Access</span>
                        </button>
                      </div>

                      <div className="pt-2 mt-1 border-t border-slate-100">
                        <button
                          onClick={() => {
                            logout();
                            setShowUserMenu(false);
                            navigate('/');
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-sm"
                >
                  Join Free
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="md:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100"
            >
              {showMobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {showMobileMenu && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-2 pb-4 space-y-2">
          <Link
            to="/explore"
            onClick={() => setShowMobileMenu(false)}
            className="block px-3 py-2 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Explore Items
          </Link>
          <Link
            to="/item/new"
            onClick={() => setShowMobileMenu(false)}
            className="block px-3 py-2 rounded-xl text-sm font-semibold text-emerald-600 hover:bg-emerald-50"
          >
            + List an Item
          </Link>
          {isAuthenticated && (
            <Link
              to="/dashboard"
              onClick={() => setShowMobileMenu(false)}
              className="block px-3 py-2 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              My Exchanges Dashboard
            </Link>
          )}
          {isAdmin && (
            <Link
              to="/admin"
              onClick={() => setShowMobileMenu(false)}
              className="block px-3 py-2 rounded-xl text-sm font-semibold text-amber-700 hover:bg-amber-50"
            >
              Admin Control Panel
            </Link>
          )}
        </div>
      )}
    </nav>
  );
};


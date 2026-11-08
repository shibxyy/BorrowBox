import React from 'react';
import { Package, Heart, ShieldCheck, RefreshCw, Sparkles, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 text-xs border-t border-slate-800 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Col 1: Brand & Motto */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-500 flex items-center justify-center text-white">
                <Package className="w-4 h-4" />
              </div>
              <span className="text-lg font-bold text-white tracking-tight">Borrow<span className="text-emerald-400">Box</span></span>
            </div>
            
            <p className="text-sm text-slate-300 font-medium italic">
              “Don’t Buy It. Borrow It. Share It. Reuse It.”
            </p>

            <p className="text-slate-400 max-w-md text-xs leading-relaxed">
              A community-based digital sharing and borrowing platform connecting neighbours, college campuses, and local communities to borrow idle goods safely with verified trust scores.
            </p>

            <div className="pt-2 flex items-center gap-4 text-[11px] text-emerald-400">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Trust & Verified Profiles
              </span>
              <span className="flex items-center gap-1">
                <RefreshCw className="w-3.5 h-3.5" /> Sustainable Circular Economy
              </span>
            </div>
          </div>

          {/* Col 2: Navigation */}
          <div>
            <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-3">Platform Navigation</h4>
            <ul className="space-y-2">
              <li><Link to="/explore" className="hover:text-emerald-400 transition-colors">Explore All Items</Link></li>
              <li><Link to="/explore?category=1" className="hover:text-emerald-400 transition-colors">Cameras & Electronics</Link></li>
              <li><Link to="/explore?category=2" className="hover:text-emerald-400 transition-colors">Power Tools & DIY</Link></li>
              <li><Link to="/explore?category=5" className="hover:text-emerald-400 transition-colors">Camping & Outdoor Gear</Link></li>
              <li><Link to="/item/new" className="hover:text-emerald-400 transition-colors">List an Idle Item</Link></li>
            </ul>
          </div>

          {/* Col 3: Academic Information */}
          <div>
            <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-3">Academic Project</h4>
            <div className="bg-slate-800/80 p-3.5 rounded-2xl border border-slate-700/60 space-y-1.5 text-[11px]">
              <span className="inline-block px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold uppercase tracking-wider text-[10px]">
                BCA FYUGP Mini Project
              </span>
              <p className="text-slate-300 font-semibold">BorrowBox System</p>
              <p className="text-slate-400">Bachelor of Computer Applications (FYUGP)</p>
              <p className="text-slate-500 pt-1">Node.js • Express • SQLite • React • Tailwind</p>
            </div>
          </div>
        </div>

        <div className="pt-8 mt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <p>© {new Date().getFullYear()} BorrowBox Platform. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Built with <Heart className="w-3 h-3 text-rose-500 fill-rose-500" /> for community sharing
          </p>
        </div>
      </div>
    </footer>
  );
};


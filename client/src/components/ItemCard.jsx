import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Star, ShieldCheck, Clock, ShieldAlert } from 'lucide-react';

export const ItemCard = ({ item, onRequest }) => {
  const isAvailable = Boolean(item.is_available);

  const conditionColors = {
    'Brand New': 'bg-emerald-100 text-emerald-800 border-emerald-200',
    'Like New': 'bg-sky-100 text-sky-800 border-sky-200',
    'Good': 'bg-amber-100 text-amber-800 border-amber-200',
    'Fair': 'bg-slate-100 text-slate-800 border-slate-200'
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col group">
      {/* Image Container */}
      <div className="relative aspect-[4/3] bg-slate-100 overflow-hidden">
        <img
          src={item.image_url}
          alt={item.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${conditionColors[item.condition] || 'bg-slate-100 text-slate-700'}`}>
            {item.condition}
          </span>
          <span className="text-[11px] font-medium bg-black/60 backdrop-blur-md text-white px-2 py-0.5 rounded-full">
            {item.category_name}
          </span>
        </div>
        <div className="absolute top-3 right-3">
          <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full shadow-sm backdrop-blur-md ${
            isAvailable 
              ? 'bg-emerald-500/90 text-white' 
              : 'bg-rose-500/90 text-white'
          }`}>
            {isAvailable ? 'Available' : 'Currently Borrowed'}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">{item.location}</span>
          </div>

          <Link to={`/item/${item.id}`} className="block">
            <h3 className="font-semibold text-slate-900 group-hover:text-emerald-600 transition-colors line-clamp-1 text-base">
              {item.title}
            </h3>
          </Link>

          <p className="text-xs text-slate-600 line-clamp-2 mt-1 mb-3">
            {item.description}
          </p>
        </div>

        <div>
          {/* Owner Info & Trust Score */}
          <div className="flex items-center justify-between py-2 border-t border-slate-100 text-xs">
            <div className="flex items-center gap-2">
              <img
                src={item.owner_avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${item.owner_name}`}
                alt={item.owner_name}
                className="w-6 h-6 rounded-full object-cover border border-slate-200"
              />
              <span className="font-medium text-slate-700 flex items-center gap-1">
                {item.owner_name}
                {Boolean(item.owner_verified) && (
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" title="Verified Member" />
                )}
              </span>
            </div>
            <div className="flex items-center gap-1 text-amber-600 font-semibold bg-amber-50 px-1.5 py-0.5 rounded">
              <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
              <span>{item.owner_trust_score ? Number(item.owner_trust_score).toFixed(1) : '5.0'}</span>
            </div>
          </div>

          {/* Pricing & Duration */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Security Deposit</span>
              <span className="font-bold text-slate-900">
                {item.security_deposit > 0 ? `₹${item.security_deposit}` : 'Zero Deposit'}
              </span>
            </div>
            <div className="text-right">
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Max Borrowing</span>
              <span className="font-medium text-slate-700 flex items-center gap-1 justify-end">
                <Clock className="w-3 h-3 text-slate-400" />
                {item.max_duration_days} Days
              </span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="mt-3.5 pt-2 flex items-center gap-2">
            <Link
              to={`/item/${item.id}`}
              className="flex-1 text-center py-2 px-3 text-xs font-semibold rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Details
            </Link>
            {isAvailable ? (
              <button
                onClick={() => onRequest ? onRequest(item) : null}
                className="flex-1 py-2 px-3 text-xs font-semibold rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-sm shadow-emerald-200"
              >
                Borrow
              </button>
            ) : (
              <span className="flex-1 py-2 px-3 text-xs font-medium rounded-xl bg-slate-100 text-slate-400 text-center cursor-not-allowed">
                In Use
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};


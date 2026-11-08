import React from 'react';
import { Send, ThumbsUp, Handshake, CornerDownLeft, Star, X } from 'lucide-react';

export const LifecycleStepper = ({ currentStatus }) => {
  const steps = [
    { key: 'Requested', label: 'Requested', icon: Send },
    { key: 'Approved', label: 'Approved', icon: ThumbsUp },
    { key: 'Active', label: 'Handover Active', icon: Handshake },
    { key: 'Returned', label: 'Returned', icon: CornerDownLeft },
    { key: 'Completed', label: 'Completed', icon: Star }
  ];

  if (currentStatus === 'Rejected' || currentStatus === 'Cancelled') {
    return (
      <div className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-medium">
        <X className="w-4 h-4 text-rose-600" />
        <span>This transaction was {currentStatus.toLowerCase()}.</span>
      </div>
    );
  }

  const stepOrder = ['Requested', 'Approved', 'Active', 'Returned', 'Completed'];
  const currentIndex = stepOrder.indexOf(currentStatus);

  return (
    <div className="w-full py-2">
      <div className="flex items-center justify-between relative">
        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-200 -translate-y-1/2 z-0" />
        <div
          className="absolute top-1/2 left-0 h-0.5 bg-emerald-500 -translate-y-1/2 z-0 transition-all duration-500"
          style={{ width: `${Math.max(0, (currentIndex / (steps.length - 1)) * 100)}%` }}
        />

        {steps.map((step, idx) => {
          const isDone = idx <= currentIndex;
          const isCurrent = idx === currentIndex;
          const Icon = step.icon;

          return (
            <div key={step.key} className="relative z-10 flex flex-col items-center group">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 text-xs font-semibold shadow-sm ${
                  isCurrent
                    ? 'bg-emerald-600 text-white ring-4 ring-emerald-100 scale-110'
                    : isDone
                    ? 'bg-emerald-500 text-white'
                    : 'bg-white border-2 border-slate-300 text-slate-400'
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <span
                className={`mt-1.5 text-[11px] font-medium transition-colors ${
                  isCurrent
                    ? 'text-emerald-700 font-bold'
                    : isDone
                    ? 'text-slate-800'
                    : 'text-slate-400'
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};


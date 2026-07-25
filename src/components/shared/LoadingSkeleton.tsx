import React from 'react';

export const LoadingSkeleton: React.FC<{ type?: 'card' | 'table' | 'list' }> = ({
  type = 'card',
}) => {
  if (type === 'table') {
    return (
      <div className="w-full bg-surface rounded-xl border border-border p-4 space-y-3 animate-pulse">
        <div className="h-8 bg-neutral-bg rounded-lg w-full"></div>
        <div className="h-12 bg-page rounded-lg w-full"></div>
        <div className="h-12 bg-page rounded-lg w-full"></div>
        <div className="h-12 bg-page rounded-lg w-full"></div>
      </div>
    );
  }

  if (type === 'list') {
    return (
      <div className="space-y-3 animate-pulse">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-3 p-3 bg-surface rounded-xl border border-border">
            <div className="w-10 h-10 bg-border rounded-full"></div>
            <div className="flex-1 space-y-2">
              <div className="h-3 bg-border rounded w-1/3"></div>
              <div className="h-2.5 bg-neutral-bg rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="bg-surface p-5 rounded-2xl border border-border space-y-3 animate-pulse">
      <div className="flex justify-between items-center">
        <div className="h-3 bg-border rounded w-1/3"></div>
        <div className="w-8 h-8 bg-border rounded-lg"></div>
      </div>
      <div className="h-6 bg-border rounded w-1/2"></div>
      <div className="h-2 bg-neutral-bg rounded w-2/3"></div>
    </div>
  );
};

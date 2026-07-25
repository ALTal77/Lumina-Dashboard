import React from 'react';
import { LucideIcon, Inbox } from 'lucide-react';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon = Inbox,
  title,
  description,
  action,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-surface rounded-[2rem] border border-border shadow-premium">
      <div className="w-12 h-12 rounded-2xl bg-neutral-bg text-muted flex items-center justify-center mb-3">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-sm font-bold text-heading">{title}</h3>
      {description && (
        <p className="text-xs text-text-muted max-w-sm mt-1">{description}</p>
      )}
      {action && (
        <button
          onClick={action.onClick}
          className="mt-4 px-5 py-2 bg-primary text-white text-xs font-semibold rounded-full shadow-[0_4px_6px_-1px_rgba(13,148,136,0.2)] hover:bg-primary-hover hover:shadow-[0_10px_15px_-3px_rgba(13,148,136,0.3)] transition-all"
        >
          {action.label}
        </button>
      )}
    </div>
  );
};

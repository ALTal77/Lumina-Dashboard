import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  id?: string;
  title: string;
  value: string | number;
  change?: string;
  isPositive?: boolean;
  icon: LucideIcon;
  iconColor?: string;
  bgColor?: string;
  subtitle?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  id,
  title,
  value,
  change,
  isPositive = true,
  icon: Icon,
  iconColor = 'text-primary',
  bgColor = 'bg-primary-tint',
  subtitle,
}) => {
  return (
    <div
      id={id}
      className="bg-surface p-5 rounded-[2rem] border border-border shadow-premium hover:shadow-[0_20px_60px_-10px_rgba(0,0,0,0.12)] hover:border-primary-tint transition-all duration-300"
    >
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted">
          {title}
        </span>
        <div className={`p-2.5 rounded-xl ${bgColor}`}>
          <Icon className={`w-5 h-5 ${iconColor}`} />
        </div>
      </div>

      <div className="mt-3 flex items-baseline justify-between">
        <span className="text-[30px] font-bold text-heading tracking-tight">
          {value}
        </span>

        {change && (
          <span
            className={`inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full ${
              isPositive
                ? 'bg-primary-tint text-primary'
                : 'bg-danger-bg text-danger'
            }`}
          >
            {isPositive ? (
              <TrendingUp className="w-3 h-3 mr-1 ltr:mr-1 rtl:ml-1" />
            ) : (
              <TrendingDown className="w-3 h-3 mr-1 ltr:mr-1 rtl:ml-1" />
            )}
            {change}
          </span>
        )}
      </div>

      {subtitle && (
        <p className="mt-1 text-xs text-text-muted">
          {subtitle}
        </p>
      )}
    </div>
  );
};

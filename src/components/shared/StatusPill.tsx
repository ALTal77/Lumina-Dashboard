import React from 'react';
import { useTranslation } from 'react-i18next';

export type StatusType =
  | 'confirmed'
  | 'active'
  | 'completed'
  | 'pending'
  | 'rejected'
  | 'cancelled'
  | 'closed'
  | 'maintenance'
  | 'suspended'
  | 'paid'
  | 'unpaid'
  | 'refunded';

interface StatusPillProps {
  status: StatusType | string;
  size?: 'sm' | 'md';
}

export const StatusPill: React.FC<StatusPillProps> = ({ status, size = 'sm' }) => {
  const { t } = useTranslation();
  const normalized = status.toLowerCase();

  let colorClasses = 'bg-neutral-bg text-muted border-border';

  if (['confirmed', 'active', 'completed', 'paid'].includes(normalized)) {
    colorClasses = 'bg-primary-tint text-primary border-primary-tint';
  } else if (['pending', 'unpaid'].includes(normalized)) {
    colorClasses = 'bg-pending-bg text-pending border-pending-bg';
  } else if (['rejected', 'cancelled', 'closed', 'suspended'].includes(normalized)) {
    colorClasses = 'bg-danger-bg text-danger border-danger-bg';
  } else if (['maintenance'].includes(normalized)) {
    colorClasses = 'bg-pending-bg text-pending border-pending-bg';
  } else if (['refunded'].includes(normalized)) {
    colorClasses = 'bg-primary-tint text-primary border-primary-tint';
  }

  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-bold uppercase tracking-wider rounded-full border ${colorClasses} ${sizeClasses}`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${
          ['confirmed', 'active', 'completed', 'paid'].includes(normalized)
            ? 'bg-primary'
            : ['pending', 'unpaid'].includes(normalized)
            ? 'bg-pending'
            : ['rejected', 'cancelled', 'closed', 'suspended'].includes(normalized)
            ? 'bg-danger'
            : ['maintenance'].includes(normalized)
            ? 'bg-pending'
            : 'bg-muted'
        }`}
      />
      {t('status.' + status)}
    </span>
  );
};

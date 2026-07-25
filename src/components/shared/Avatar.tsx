import React from 'react';
import { useTranslation } from 'react-i18next';

interface AvatarProps {
  src?: string;
  name: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  status?: 'online' | 'busy' | 'offline';
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  name,
  size = 'md',
  status,
  className = '',
}) => {
  const { t } = useTranslation();
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  const sizeClasses = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-lg',
  }[size];

  const statusSize = {
    xs: 'w-1.5 h-1.5',
    sm: 'w-2 h-2',
    md: 'w-2.5 h-2.5',
    lg: 'w-3 h-3',
    xl: 'w-3.5 h-3.5',
  }[size];

  return (
    <div className="relative inline-block flex-shrink-0">
      {src ? (
        <img
          src={src}
          alt={name}
          className={`${sizeClasses} rounded-full object-cover border border-border shadow-2xs ${className}`}
        />
      ) : (
        <div
          className={`${sizeClasses} rounded-full bg-primary-tint text-primary border border-primary-tint font-bold flex items-center justify-center ${className}`}
        >
          {initials || t('avatar.initialsFallback')}
        </div>
      )}

      {status && (
        <span
          className={`absolute bottom-0 right-0 rtl:left-0 rtl:right-auto ${statusSize} rounded-full border-2 border-surface ${
            status === 'online'
              ? 'bg-success'
              : status === 'busy'
              ? 'bg-pending'
              : 'bg-muted'
          }`}
        />
      )}
    </div>
  );
};

import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  message?: string;
}

interface ToastProps {
  toast: ToastMessage | null;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ toast, onClose }) => {
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(onClose, 4000);
      return () => clearTimeout(timer);
    }
  }, [toast, onClose]);

  if (!toast) return null;

  const config = {
    success: {
      icon: CheckCircle2,
      bg: 'bg-success/90 text-white border-success',
      iconColor: 'text-success-bg',
    },
    error: {
      icon: AlertCircle,
      bg: 'bg-danger/90 text-white border-danger',
      iconColor: 'text-danger-bg',
    },
    info: {
      icon: Info,
      bg: 'bg-heading/90 text-white border-border',
      iconColor: 'text-primary-tint',
    },
  }[toast.type];

  const Icon = config.icon;

  return (
    <div className="fixed bottom-5 right-5 z-50 animate-in slide-in-from-bottom-5 duration-200">
      <div
        className={`flex items-start gap-3 p-4 rounded-xl border shadow-xl backdrop-blur-md max-w-sm ${config.bg}`}
      >
        <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${config.iconColor}`} />
        <div className="flex-1 pr-2">
          <h4 className="text-xs font-bold leading-tight">{toast.title}</h4>
          {toast.message && <p className="text-[11px] text-white mt-0.5">{toast.message}</p>}
        </div>
        <button onClick={onClose} className="p-0.5 text-muted hover:text-white rounded">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

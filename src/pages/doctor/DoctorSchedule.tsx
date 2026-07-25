import React from 'react';
import { useTranslation } from 'react-i18next';
import { Clock, Lock, Unlock, CheckCircle } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';

export const DoctorSchedule: React.FC = () => {
  const { user } = useAuth();
  const { timeSlots, toggleSlotLock } = useData();
  const { t } = useTranslation();

  const mySlots = timeSlots.filter((s) => s.doctorId === user.id);

  return (
    <div className="space-y-6">
      <div className="bg-surface p-5 rounded-2xl border border-border shadow-xs flex justify-between items-center">
        <div>
          <h1 className="text-xl font-black text-heading tracking-tight">{t('doctorSchedule.title')}</h1>
          <p className="text-xs text-muted mt-0.5">
            {t('doctorSchedule.subtitle')}
          </p>
        </div>
        <span className="text-xs font-bold px-3 py-1 bg-primary-tint text-primary rounded-lg">
          {t('doctorSchedule.activeSlots', { count: mySlots.length })}
        </span>
      </div>

      <div className="bg-surface rounded-2xl border border-border p-5 space-y-4">
        <h3 className="text-xs font-bold text-heading uppercase tracking-wider">
          {t('doctorSchedule.sectionTitle')}
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {mySlots.map((slot) => (
            <div
              key={slot.id}
              className={`p-3.5 rounded-xl border flex items-center justify-between transition-all ${
                slot.isLocked
                  ? 'bg-neutral-bg border-border text-muted'
                  : 'bg-page border-border text-heading'
              }`}
            >
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" />
                <span className="text-xs font-bold">{slot.startTime} - {slot.endTime}</span>
              </div>

              <button
                onClick={() => toggleSlotLock(slot.id)}
                className={`p-1.5 rounded-lg border text-xs font-bold transition-colors ${
                  slot.isLocked
                    ? 'bg-pending-bg text-pending border-pending-bg'
                    : 'bg-border text-muted'
                }`}
                title={slot.isLocked ? t('doctorSchedule.tooltip.unlock') : t('doctorSchedule.tooltip.lock')}
              >
                {slot.isLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

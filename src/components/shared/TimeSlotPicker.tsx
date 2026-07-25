import React from 'react';
import { useTranslation } from 'react-i18next';
import { Clock } from 'lucide-react';
import { TimeSlot } from '../../types';

interface TimeSlotPickerProps {
  id?: string;
  slots: TimeSlot[];
  selectedSlotId?: string;
  onSelectSlot: (slot: TimeSlot) => void;
}

export const TimeSlotPicker: React.FC<TimeSlotPickerProps> = ({
  id,
  slots,
  selectedSlotId,
  onSelectSlot,
}) => {
  const { t } = useTranslation();
  if (slots.length === 0) {
    return (
      <div className="p-4 bg-page border border-border rounded-xl text-center text-xs text-muted">
        {t('timeSlotPicker.empty.message')}
      </div>
    );
  }

  return (
    <div id={id} className="grid grid-cols-2 sm:grid-cols-3 gap-2">
      {slots.map((slot) => {
        const isSelected = selectedSlotId === slot.id;
        const isDisabled = !slot.isAvailable || slot.isLocked;

        return (
          <button
            key={slot.id}
            type="button"
            disabled={isDisabled}
            onClick={() => onSelectSlot(slot)}
            className={`flex items-center justify-center gap-1.5 p-2.5 rounded-xl border text-xs font-semibold transition-all ${
              isSelected
                ? 'bg-primary border-primary text-white shadow-xs'
                : isDisabled
                ? 'bg-neutral-bg border-border text-muted cursor-not-allowed line-through'
                : 'bg-surface border-border text-heading hover:border-primary hover:text-primary'
            }`}
          >
            <Clock className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-muted'}`} />
            <span>
              {slot.startTime}{t('timeSlotPicker.timeSeparator')}{slot.endTime}
            </span>
          </button>
        );
      })}
    </div>
  );
};

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Sliders, Save, CheckCircle, ShieldAlert } from 'lucide-react';
import { useData } from '../../context/DataContext';

export const SystemSettingsPage: React.FC = () => {
  const { t } = useTranslation();
  const { systemSettings, updateSystemSettings } = useData();

  const [hours, setHours] = useState(systemSettings.allowCancellationHours);
  const [maxBookings, setMaxBookings] = useState(systemSettings.maxActiveBookingsPerPatient);
  const [defaultFee, setDefaultFee] = useState(systemSettings.defaultConsultationFee);
  const [notice, setNotice] = useState(systemSettings.emergencyNoticeBanner);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSystemSettings({
      allowCancellationHours: hours,
      maxActiveBookingsPerPatient: maxBookings,
      defaultConsultationFee: defaultFee,
      emergencyNoticeBanner: notice,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="bg-surface p-5 rounded-2xl border border-border shadow-xs">
        <h1 className="text-xl font-black text-heading tracking-tight">{t('systemSettings.title')}</h1>
        <p className="text-xs text-muted mt-0.5">
          {t('systemSettings.subtitle')}
        </p>
      </div>

      <form onSubmit={handleSave} className="bg-surface p-6 rounded-2xl border border-border shadow-xs space-y-5">
        <h3 className="text-sm font-bold text-heading border-b border-border pb-2">
          {t('systemSettings.section.businessRules')}
        </h3>

        {savedSuccess && (
          <div className="p-3 bg-success-bg text-success border border-success-bg rounded-xl text-xs font-bold flex items-center gap-2">
            <CheckCircle className="w-4 h-4" /> {t('systemSettings.successMessage')}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-semibold text-heading mb-1">
              {t('systemSettings.form.cancellationWindow')}
            </label>
            <input
              type="number"
              value={hours}
              onChange={(e) => setHours(Number(e.target.value))}
              className="w-full p-2.5 bg-page border border-border rounded-xl text-heading"
            />
            <p className="text-[10px] text-muted mt-1">
              {t('systemSettings.form.cancellationWindowHelp')}
            </p>
          </div>

          <div>
            <label className="block font-semibold text-heading mb-1">
              {t('systemSettings.form.maxBookings')}
            </label>
            <input
              type="number"
              value={maxBookings}
              onChange={(e) => setMaxBookings(Number(e.target.value))}
              className="w-full p-2.5 bg-page border border-border rounded-xl text-heading"
            />
          </div>

          <div>
            <label className="block font-semibold text-heading mb-1">
              {t('systemSettings.form.defaultFee')}
            </label>
            <input
              type="number"
              value={defaultFee}
              onChange={(e) => setDefaultFee(Number(e.target.value))}
              className="w-full p-2.5 bg-page border border-border rounded-xl text-heading"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-heading mb-1">
            {t('systemSettings.form.emergencyBanner')}
          </label>
          <input
            type="text"
            value={notice}
            onChange={(e) => setNotice(e.target.value)}
            className="w-full p-2.5 text-xs bg-page border border-border rounded-xl text-heading"
          />
        </div>

        <div className="pt-4 border-t border-border flex justify-end">
          <button
            type="submit"
            className="px-5 py-2.5 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl transition-colors shadow-xs flex items-center gap-2"
          >
            <Save className="w-4 h-4" /> {t('systemSettings.button.save')}
          </button>
        </div>
      </form>
    </div>
  );
};

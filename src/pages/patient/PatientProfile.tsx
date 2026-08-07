import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { User, Phone, Mail, MapPin, Calendar, FileText, Save, CheckCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { FileUploadMock } from '../../components/shared/FileUploadMock';
import { AppImage } from '../../components/shared/AppImage';

export const PatientProfile: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();

  const [name, setName] = useState(user.name);
  const [phone, setPhone] = useState(user.phone || '+1 (555) 234-5678');
  const [address, setAddress] = useState(user.address || '742 Evergreen Terrace, Springfield');
  const [dob, setDob] = useState(user.dob || '1992-05-14');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>(user.gender || 'Female');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="bg-surface p-5 rounded-2xl border border-border shadow-xs flex items-center gap-4">
        <AppImage
          src={user.avatar}
          alt={user.name}
          className="w-16 h-16 rounded-2xl object-cover border-2 border-primary shadow-sm"
        />
        <div>
          <h1 className="text-xl font-black text-heading" dir="auto">{user.name}</h1>
          <p className="text-xs text-muted">{t('patientProfile.subtitle', { id: user.id })}</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="bg-surface p-6 rounded-2xl border border-border shadow-xs space-y-5">
        <h3 className="text-sm font-bold text-heading border-b border-border pb-2">
          {t('patientProfile.sectionTitle')}
        </h3>

        {savedSuccess && (
          <div className="p-3 bg-success-bg text-success border border-success-bg rounded-xl text-xs font-bold flex items-center gap-2">
            <CheckCircle className="w-4 h-4" /> {t('patientProfile.successMessage')}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-semibold text-heading mb-1">{t('patientProfile.form.fullName')}</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2.5 bg-neutral-bg border border-border rounded-xl text-heading"
              dir="auto"
            />
          </div>

          <div>
            <label className="block font-semibold text-heading mb-1">{t('patientProfile.form.phone')}</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full p-2.5 bg-neutral-bg border border-border rounded-xl text-heading"
            />
          </div>

          <div>
            <label className="block font-semibold text-heading mb-1">{t('patientProfile.form.dob')}</label>
            <input
              type="date"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              className="w-full p-2.5 bg-neutral-bg border border-border rounded-xl text-heading"
              dir="auto"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-heading mb-1">{t('patientProfile.form.address')}</label>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full p-2.5 text-xs bg-neutral-bg border border-border rounded-xl text-heading"
            dir="auto"
          />
        </div>

        <div className="pt-2">
          <FileUploadMock label={t('patientProfile.form.uploadLabel')} />
        </div>

        <div className="pt-4 border-t border-border flex justify-end">
          <button
            type="submit"
            className="px-5 py-2.5 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl transition-colors shadow-xs flex items-center gap-2"
          >
            <Save className="w-4 h-4" /> {t('patientProfile.button.save')}
          </button>
        </div>
      </form>
    </div>
  );
};

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Stethoscope, Phone, Mail, Award, Globe, Star, CalendarCheck } from 'lucide-react';
import { Doctor } from '../../types';
import { StarRating } from '../../components/shared/StarRating';
import { AppImage } from '../../components/shared/AppImage';
import { useData } from '../../context/DataContext';

interface DoctorProfileProps {
  doctor: Doctor;
  onClose?: () => void;
}

export const DoctorProfile: React.FC<DoctorProfileProps> = ({ doctor, onClose }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { ratings } = useData();

  const doctorReviews = ratings.filter((r) => r.doctorId === doctor.id);

  const handleStartBooking = () => {
    if (onClose) onClose();
    navigate(`/patient/book?doctor=${doctor.id}`);
  };

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 bg-neutral-bg rounded-2xl border border-border">
        <AppImage
          src={doctor.profilePicture}
          alt={doctor.name}
          className="w-20 h-20 rounded-2xl object-cover border-2 border-surface shadow-md flex-shrink-0"
        />
        <div className="flex-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary-tint px-2 py-0.5 rounded inline-block mb-1">
            {t('doctorProfile.badge', { department: doctor.departmentName })}
          </span>
          <h2 className="text-lg font-black text-heading" dir="auto">{t('doctorProfile.name', { name: doctor.name })}</h2>
          <p className="text-xs font-medium text-heading" dir="auto">{t('doctorProfile.specialty', { specialty: doctor.specialty })}</p>

          <div className="mt-2 flex items-center gap-3">
            <StarRating rating={doctor.rating} reviewCount={doctor.reviewCount} size="sm" />
            <span className="text-[11px] text-muted">• {t('doctorProfile.experience', { years: doctor.yearsExperience })}</span>
          </div>
        </div>
      </div>

      {/* Bio & Details */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-muted">{t('doctorProfile.aboutDoctor')}</h4>
        <p className="text-xs text-heading leading-relaxed bg-surface p-4 rounded-xl border border-border" dir="auto">
          {doctor.bio}
        </p>
      </div>

      {/* Key Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="p-3 bg-surface rounded-xl border border-border">
          <span className="text-[10px] text-muted font-bold uppercase block">{t('doctorProfile.stat.fee')}</span>
          <span className="text-sm font-black text-heading">{t('doctorProfile.stat.feeValue', { fee: doctor.consultationFee })}</span>
        </div>
        <div className="p-3 bg-surface rounded-xl border border-border">
          <span className="text-[10px] text-muted font-bold uppercase block">{t('doctorProfile.stat.languages')}</span>
          <span className="text-xs font-bold text-heading truncate block" dir="auto">
            {doctor.languages.join(', ')}
          </span>
        </div>
        <div className="p-3 bg-surface rounded-xl border border-border col-span-2 sm:col-span-1">
          <span className="text-[10px] text-muted font-bold uppercase block">{t('doctorProfile.stat.availableDays')}</span>
          <span className="text-xs font-bold text-success truncate block" dir="auto">
            {doctor.availableDays.join(', ')}
          </span>
        </div>
      </div>

      {/* Patient Reviews Section */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-muted">
          {t('doctorProfile.reviews.title', { count: doctorReviews.length })}
        </h4>
        {doctorReviews.length === 0 ? (
          <p className="text-xs text-muted italic p-3 bg-neutral-bg rounded-xl border border-border">
            {t('doctorProfile.reviews.empty')}
          </p>
        ) : (
          <div className="space-y-2 max-h-48 overflow-y-auto pr-1 rtl:pl-1 rtl:pr-0">
            {doctorReviews.map((rev) => (
              <div
                key={rev.id}
                className="p-3 bg-surface rounded-xl border border-border text-xs"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-heading" dir="auto">{rev.patientName}</span>
                  <span className="text-[10px] text-muted">{rev.date}</span>
                </div>
                <StarRating rating={rev.stars} size="sm" />
                <p className="text-heading mt-1.5 italic" dir="auto">"{rev.comment}"</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Action CTA */}
      <div className="pt-3 border-t border-border flex justify-end">
        <button
          onClick={handleStartBooking}
          className="px-5 py-2.5 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl transition-colors shadow-md flex items-center gap-2"
        >
          <CalendarCheck className="w-4 h-4" />
          <span>{t('doctorProfile.button.bookConsultation')}</span>
        </button>
      </div>
    </div>
  );
};

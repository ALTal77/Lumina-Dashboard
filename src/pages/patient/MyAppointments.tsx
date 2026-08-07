import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar, Clock, AlertTriangle, XCircle, Star, CheckCircle, Edit3 } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { Appointment } from '../../types';
import { StatusPill } from '../../components/shared/StatusPill';
import { Modal } from '../../components/shared/Modal';
import { StarRating } from '../../components/shared/StarRating';
import { AppImage } from '../../components/shared/AppImage';

export const MyAppointments: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { appointments, cancelAppointment, modifyAppointment, addRating, systemSettings } = useData();

  const myAppointments = appointments.filter((a) => a.patientId === user.id);

  // Modal States
  const [ratingTarget, setRatingTarget] = useState<Appointment | null>(null);
  const [stars, setStars] = useState<number>(5);
  const [reviewComment, setReviewComment] = useState<string>('');

  const [rescheduleTarget, setRescheduleTarget] = useState<Appointment | null>(null);
  const [newDate, setNewDate] = useState<string>('');
  const [newTimeSlot, setNewTimeSlot] = useState<string>('09:30 AM - 10:00 AM');

  // Client side 24h cancellation check
  const isWithinAllowedCancellationWindow = (aptDateStr: string) => {
    const aptDate = new Date(aptDateStr).getTime();
    const now = new Date().getTime();
    const hoursDifference = (aptDate - now) / (1000 * 3600);
    return hoursDifference >= systemSettings.allowCancellationHours;
  };

  const handleConfirmRating = () => {
    if (!ratingTarget) return;
    addRating({
      patientId: user.id,
      patientName: user.name,
      patientAvatar: user.avatar,
      doctorId: ratingTarget.doctorId,
      stars,
      comment: reviewComment,
    });
    setRatingTarget(null);
    setReviewComment('');
  };

  const handleConfirmReschedule = () => {
    if (!rescheduleTarget || !newDate) return;
    modifyAppointment(rescheduleTarget.id, newDate, newTimeSlot);
    setRescheduleTarget(null);
  };

  return (
    <div className="space-y-6">
      <div className="bg-surface p-5 rounded-2xl border border-border shadow-xs flex justify-between items-center">
        <div>
          <h1 className="text-xl font-black text-heading tracking-tight">{t('myAppointments.title')}</h1>
          <p className="text-xs text-muted mt-0.5">
            {t('myAppointments.subtitle')}
          </p>
        </div>
        <span className="text-xs font-bold px-3 py-1 bg-neutral-bg text-heading rounded-lg">
          {t('myAppointments.totalCount', { count: myAppointments.length })}
        </span>
      </div>

      <div className="space-y-4">
        {myAppointments.length === 0 ? (
          <div className="bg-surface p-8 text-center rounded-2xl border border-border text-muted">
            {t('myAppointments.empty')}
          </div>
        ) : (
          myAppointments.map((apt) => {
            const canCancel =
              (apt.status === 'confirmed' || apt.status === 'pending') &&
              isWithinAllowedCancellationWindow(apt.date);

            return (
              <div
                key={apt.id}
                className="bg-surface rounded-2xl border border-border shadow-xs p-5 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-4">
                  <AppImage
                    src={apt.doctorAvatar || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150'}
                    alt={apt.doctorName}
                    className="w-14 h-14 rounded-2xl object-cover border border-border flex-shrink-0"
                  />
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-sm font-bold text-heading" dir="auto">{apt.doctorName}</h3>
                      <StatusPill status={apt.status} />
                    </div>
                    <p className="text-xs text-muted">
                      {t('myAppointments.doctorSpecialty', { specialty: apt.doctorSpecialty, department: apt.departmentName })}
                    </p>

                    <div className="mt-2 flex flex-wrap items-center gap-4 text-xs font-semibold text-heading">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-primary" /> {apt.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-primary" /> {apt.timeSlot}
                      </span>
                      <span className="text-success font-bold">{t('myAppointments.feePaid', { fee: apt.consultationFee })}</span>
                    </div>

                    {apt.rejectionReason && (
                      <p className="mt-2 text-xs text-danger bg-danger-bg p-2 rounded-lg border border-danger-bg">
                        {t('myAppointments.rejectionReason', { reason: apt.rejectionReason })}
                      </p>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center gap-2 pt-3 md:pt-0 border-t md:border-t-0 border-border justify-end">
                  {apt.status === 'completed' && (
                    <button
                      disabled={apt.isRated}
                      onClick={() => {
                        setRatingTarget(apt);
                        setStars(5);
                      }}
                      className="px-3 py-1.5 bg-pending hover:brightness-90 disabled:bg-border disabled:text-muted text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-1"
                    >
                      <Star className="w-3.5 h-3.5 fill-current" />
                      <span>{apt.isRated ? t('myAppointments.button.alreadyRated') : t('myAppointments.button.rateDoctor')}</span>
                    </button>
                  )}

                  {(apt.status === 'pending' || apt.status === 'confirmed') && (
                    <>
                      <button
                        onClick={() => {
                          setRescheduleTarget(apt);
                          setNewDate(apt.date);
                        }}
                        className="px-3 py-1.5 bg-neutral-bg hover:bg-border text-heading text-xs font-bold rounded-xl transition-colors flex items-center gap-1"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>{t('myAppointments.button.reschedule')}</span>
                      </button>

                      {canCancel ? (
                        <button
                          onClick={() => cancelAppointment(apt.id, 'Cancelled by patient')}
                          className="px-3 py-1.5 bg-danger-bg hover:bg-danger-bg text-danger border border-danger-bg text-xs font-bold rounded-xl transition-colors flex items-center gap-1"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>{t('myAppointments.button.cancelAppointment')}</span>
                        </button>
                      ) : (
                        <span
                          title={t('myAppointments.cancelWindowTitle', { hours: systemSettings.allowCancellationHours })}
                          className="text-[10px] text-muted font-medium italic flex items-center gap-1"
                        >
                          <AlertTriangle className="w-3 h-3 text-pending" /> {t('myAppointments.cancelWindowText', { hours: systemSettings.allowCancellationHours })}
                        </span>
                      )}
                    </>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Rate Doctor Modal */}
      {ratingTarget && (
        <Modal
          isOpen={!!ratingTarget}
          onClose={() => setRatingTarget(null)}
          title={t('myAppointments.rateModal.title', { name: ratingTarget.doctorName })}
          subtitle={t('myAppointments.rateModal.subtitle')}
        >
          <div className="space-y-4">
            <div className="text-center py-3">
              <span className="text-xs font-semibold text-muted block mb-2">{t('myAppointments.rateModal.selectRating')}</span>
              <StarRating rating={stars} size="lg" interactive onChange={(val) => setStars(val)} />
            </div>

            <div>
              <label className="block text-xs font-semibold text-heading mb-1">
                {t('myAppointments.rateModal.reviewLabel')}
              </label>
              <textarea
                rows={3}
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder={t('myAppointments.rateModal.reviewPlaceholder')}
                className="w-full p-2.5 text-xs bg-neutral-bg border border-border rounded-xl text-heading"
              />
            </div>

            <div className="pt-3 border-t border-border flex justify-end gap-2">
              <button
                onClick={() => setRatingTarget(null)}
                className="px-3 py-1.5 bg-neutral-bg text-heading text-xs font-bold rounded-lg"
              >
                {t('myAppointments.rateModal.cancel')}
              </button>
              <button
                onClick={handleConfirmRating}
                className="px-4 py-1.5 bg-primary text-white text-xs font-bold rounded-lg hover:bg-primary-hover"
              >
                {t('myAppointments.rateModal.submit')}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Reschedule Modal */}
      {rescheduleTarget && (
        <Modal
          isOpen={!!rescheduleTarget}
          onClose={() => setRescheduleTarget(null)}
          title={t('myAppointments.rescheduleModal.title', { name: rescheduleTarget.doctorName })}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-heading mb-1">
                {t('myAppointments.rescheduleModal.selectDate')}
              </label>
              <input
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                className="w-full p-2.5 text-xs bg-neutral-bg border border-border rounded-xl text-heading"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-heading mb-1">
                {t('myAppointments.rescheduleModal.selectTimeSlot')}
              </label>
              <select
                value={newTimeSlot}
                onChange={(e) => setNewTimeSlot(e.target.value)}
                className="w-full p-2.5 text-xs bg-neutral-bg border border-border rounded-xl text-heading"
              >
                <option value="09:00 AM - 09:30 AM">09:00 AM - 09:30 AM</option>
                <option value="09:30 AM - 10:00 AM">09:30 AM - 10:00 AM</option>
                <option value="11:00 AM - 11:30 AM">11:00 AM - 11:30 AM</option>
                <option value="02:00 PM - 02:30 PM">02:00 PM - 02:30 PM</option>
              </select>
            </div>

            <div className="pt-3 border-t border-border flex justify-end gap-2">
              <button
                onClick={() => setRescheduleTarget(null)}
                className="px-3 py-1.5 bg-neutral-bg text-heading text-xs font-bold rounded-lg"
              >
                {t('myAppointments.rescheduleModal.cancel')}
              </button>
              <button
                onClick={handleConfirmReschedule}
                className="px-4 py-1.5 bg-primary text-white text-xs font-bold rounded-lg hover:bg-primary-hover"
              >
                {t('myAppointments.rescheduleModal.confirm')}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

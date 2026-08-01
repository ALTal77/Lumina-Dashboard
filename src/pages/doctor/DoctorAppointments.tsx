import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar, Clock, CheckCircle2, XCircle, AlertCircle, MessageSquare } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { Appointment } from '../../types';
import { StatusPill } from '../../components/shared/StatusPill';
import { Modal } from '../../components/shared/Modal';

export const DoctorAppointments: React.FC = () => {
  const { user } = useAuth();
  const { appointments, approveAppointment, rejectAppointment, completeAppointment } = useData();
  const { t } = useTranslation();

  const myAppointments = appointments.filter((a) => a.doctorId === user.id);

  // Rejection Modal State
  const [rejectingTarget, setRejectingTarget] = useState<Appointment | null>(null);
  const [rejectReason, setRejectReason] = useState<string>('');

  const handleConfirmRejection = () => {
    if (!rejectingTarget || !rejectReason.trim()) return;
    rejectAppointment(rejectingTarget.id, rejectReason.trim());
    setRejectingTarget(null);
    setRejectReason('');
  };

  return (
    <div className="space-y-6">
      <div className="bg-surface p-5 rounded-2xl border border-border shadow-xs flex justify-between items-center">
        <div>
          <h1 className="text-xl font-black text-heading tracking-tight">{t('doctorAppointments.title')}</h1>
          <p className="text-xs text-muted mt-0.5">
            {t('doctorAppointments.subtitle')}
          </p>
        </div>
        <span className="text-xs font-bold px-3 py-1 bg-neutral-bg text-muted rounded-lg">
          {t('doctorAppointments.requestCount', { count: myAppointments.length })}
        </span>
      </div>

      <div className="space-y-4">
        {myAppointments.map((apt) => (
          <div
            key={apt.id}
            className="bg-surface rounded-2xl border border-border shadow-xs p-5 flex flex-col md:flex-row md:items-center justify-between gap-4"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-heading" dir="auto">{apt.patientName}</h3>
                <StatusPill status={apt.status} />
              </div>
              <p className="text-xs text-muted">
                {t('doctorAppointments.appointmentInfo', { date: apt.date, timeSlot: apt.timeSlot, fee: apt.consultationFee })}
              </p>
              {apt.notes && (
                <p className="text-xs text-muted italic bg-page p-2 rounded-lg border border-border mt-1" dir="auto">
                  {t('doctorAppointments.patientNote', { note: apt.notes })}
                </p>
              )}
              {apt.rejectionReason && (
                <p className="text-xs text-danger bg-danger-bg p-2 rounded-lg mt-1" dir="auto">
                  {t('doctorAppointments.rejectionReason', { reason: apt.rejectionReason })}
                </p>
              )}
            </div>

            <div className="flex items-center gap-2 self-end md:self-center">
              {apt.status === 'pending' && (
                <>
                  <button
                    onClick={() => approveAppointment(apt.id)}
                    className="px-3.5 py-1.5 bg-success hover:brightness-90 text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-1 shadow-xs"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" /> {t('doctorAppointments.button.approve')}
                  </button>
                  <button
                    onClick={() => setRejectingTarget(apt)}
                    className="px-3.5 py-1.5 bg-danger-bg hover:bg-danger-bg text-danger border border-danger-bg text-xs font-bold rounded-xl transition-colors flex items-center gap-1"
                  >
                    <XCircle className="w-3.5 h-3.5" /> {t('doctorAppointments.button.reject')}
                  </button>
                </>
              )}

              {apt.status === 'confirmed' && (
                <button
                  onClick={() => completeAppointment(apt.id)}
                  className="px-4 py-1.5 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl transition-colors shadow-xs"
                >
                  {t('doctorAppointments.button.markCompleted')}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Reject Reason Modal */}
      {rejectingTarget && (
        <Modal
          isOpen={!!rejectingTarget}
          onClose={() => setRejectingTarget(null)}
          title={t('doctorAppointments.rejectModal.title', { name: rejectingTarget.patientName })}
          subtitle={t('doctorAppointments.rejectModal.subtitle')}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-muted mb-1">
                {t('doctorAppointments.rejectModal.reasonLabel')}
              </label>
              <textarea
                rows={3}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder={t('doctorAppointments.rejectModal.placeholder')}
                className="w-full p-2.5 text-xs bg-page border border-border rounded-xl text-heading text-left rtl:text-right placeholder:text-muted"
              />
            </div>

            <div className="pt-3 border-t border-border flex justify-end gap-2">
              <button
                onClick={() => setRejectingTarget(null)}
                className="px-3 py-1.5 bg-neutral-bg text-muted text-xs font-bold rounded-lg"
              >
                {t('doctorAppointments.button.cancel')}
              </button>
              <button
                disabled={!rejectReason.trim()}
                onClick={handleConfirmRejection}
                className="px-4 py-1.5 bg-danger disabled:opacity-50 text-white text-xs font-bold rounded-lg hover:brightness-90"
              >
                {t('doctorAppointments.button.confirmRejection')}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

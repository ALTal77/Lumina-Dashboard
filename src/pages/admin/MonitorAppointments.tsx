import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar, Search, Filter, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { StatusPill } from '../../components/shared/StatusPill';

export const MonitorAppointments: React.FC = () => {
  const { t } = useTranslation();
  const { appointments, cancelAppointment, approveAppointment } = useData();

  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [actionError, setActionError] = useState<string>('');

  const handleApprove = async (id: string) => {
    setActionError('');
    try {
      await approveAppointment(id);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to approve');
    }
  };

  const handleCancel = async (id: string) => {
    setActionError('');
    try {
      await cancelAppointment(id, 'Emergency Admin Cancellation');
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to cancel');
    }
  };

  const filteredAppointments = appointments.filter((apt) => {
    if (statusFilter !== 'all' && apt.status !== statusFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        apt.patientName.toLowerCase().includes(q) ||
        apt.doctorName.toLowerCase().includes(q) ||
        apt.departmentName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="bg-surface p-5 rounded-2xl border border-border shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-black text-heading tracking-tight">{t('monitorAppointments.title')}</h1>
          <p className="text-xs text-muted mt-0.5">
            {t('monitorAppointments.subtitle')}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('monitorAppointments.searchPlaceholder')}
            className="px-3 py-1.5 text-xs bg-page border border-border rounded-xl"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 text-xs bg-page border border-border rounded-xl"
          >
            <option value="all">{t('monitorAppointments.filter.allStatuses')}</option>
            <option value="pending">{t('monitorAppointments.filter.pending')}</option>
            <option value="confirmed">{t('monitorAppointments.filter.confirmed')}</option>
            <option value="completed">{t('monitorAppointments.filter.completed')}</option>
            <option value="cancelled">{t('monitorAppointments.filter.cancelled')}</option>
            <option value="rejected">{t('monitorAppointments.filter.rejected')}</option>
          </select>
        </div>
      </div>

      {actionError && (
        <div className="p-3 bg-danger-bg text-danger border border-danger-bg rounded-xl text-xs font-bold flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" /> {actionError}
        </div>
      )}

      <div className="bg-surface rounded-2xl border border-border shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left rtl:text-right text-xs text-muted">
            <thead className="bg-page uppercase text-[10px] font-bold text-muted border-b border-border">
              <tr>
                <th className="p-3 rtl:text-right">{t('monitorAppointments.tableHeader.id')}</th>
                <th className="p-3 rtl:text-right">{t('monitorAppointments.tableHeader.patient')}</th>
                <th className="p-3 rtl:text-right">{t('monitorAppointments.tableHeader.doctorDept')}</th>
                <th className="p-3 rtl:text-right">{t('monitorAppointments.tableHeader.dateTime')}</th>
                <th className="p-3 rtl:text-right">{t('monitorAppointments.tableHeader.fee')}</th>
                <th className="p-3 rtl:text-right">{t('monitorAppointments.tableHeader.status')}</th>
                <th className="p-3 text-right rtl:text-left">{t('monitorAppointments.tableHeader.adminAction')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredAppointments.map((apt) => (
                <tr key={apt.id} className="hover:bg-neutral-bg/50">
                  <td className="p-3 font-mono text-[11px] font-bold text-heading">
                    #{apt.id}
                  </td>
                  <td className="p-3 font-bold text-heading">{apt.patientName}</td>
                  <td className="p-3">
                    <div className="font-bold text-heading">{apt.doctorName}</div>
                    <div className="text-[10px] text-primary">{apt.departmentName}</div>
                  </td>
                  <td className="p-3 font-semibold">
                    {apt.date}
                    <div className="text-[10px] text-muted">{apt.timeSlot}</div>
                  </td>
                  <td className="p-3 font-bold text-success">${apt.consultationFee}</td>
                  <td className="p-3">
                    <StatusPill status={apt.status} />
                  </td>
                  <td className="p-3 text-right rtl:text-left">
                    {apt.status === 'pending' && (
                      <button
                        onClick={() => handleApprove(apt.id)}
                        className="px-2.5 py-1 bg-success text-white font-bold rounded hover:brightness-90 mr-1"
                      >
                        {t('monitorAppointments.button.approve')}
                      </button>
                    )}
                    {(apt.status === 'pending' || apt.status === 'confirmed') && (
                      <button
                        onClick={() => handleCancel(apt.id)}
                        className="px-2.5 py-1 bg-danger text-white font-bold rounded hover:brightness-90"
                      >
                        {t('monitorAppointments.button.overrideCancel')}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

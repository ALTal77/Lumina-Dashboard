import React from 'react';
import { useTranslation } from 'react-i18next';
import { BarChart3, PieChart, TrendingUp, Users } from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart as RechartsPie,
  Pie,
  Cell,
  CartesianGrid,
} from 'recharts';
import { useData } from '../../context/DataContext';

export const ReportsAnalytics: React.FC = () => {
  const { t } = useTranslation();
  const { departments, doctors, appointments } = useData();

  const deptData = departments.map((d) => ({
    name: d.name,
    count: doctors.filter((doc) => doc.departmentId === d.id).length,
  }));

  const statusData = [
    { name: t('reportsAnalytics.status.confirmed'), value: appointments.filter((a) => a.status === 'confirmed').length, color: '#2563eb' },
    { name: t('reportsAnalytics.status.completed'), value: appointments.filter((a) => a.status === 'completed').length, color: '#10b981' },
    { name: t('reportsAnalytics.status.pending'), value: appointments.filter((a) => a.status === 'pending').length, color: '#f59e0b' },
    { name: t('reportsAnalytics.status.cancelled'), value: appointments.filter((a) => a.status === 'cancelled').length, color: '#f43f5e' },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-surface p-5 rounded-2xl border border-border shadow-xs">
        <h1 className="text-xl font-black text-heading tracking-tight">{t('reportsAnalytics.title')}</h1>
        <p className="text-xs text-muted mt-0.5">
          {t('reportsAnalytics.subtitle')}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Department Staffing Chart */}
        <div className="bg-surface rounded-2xl border border-border p-5 space-y-3">
          <h3 className="text-xs font-bold text-heading uppercase tracking-wider">
            {t('reportsAnalytics.chart.doctorsPerDepartment')}
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deptData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Appointment Status Pie Chart */}
        <div className="bg-surface rounded-2xl border border-border p-5 space-y-3">
          <h3 className="text-xs font-bold text-heading uppercase tracking-wider">
            {t('reportsAnalytics.chart.appointmentStatusBreakdown')}
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPie>
                <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </RechartsPie>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

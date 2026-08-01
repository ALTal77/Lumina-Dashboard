import React from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import {
  Users,
  Stethoscope,
  Building2,
  CalendarCheck,
  DollarSign,
  Activity,
  Plus,
  ChevronRight,
} from "lucide-react";
import { useData } from "../../context/DataContext";
import { StatCard } from "../../components/shared/StatCard";
import { DataTable } from "../../components/shared/DataTable";
import { StatusPill } from "../../components/shared/StatusPill";

export const AdminDashboard: React.FC = () => {
  const { t } = useTranslation() as {
    t: (key: string, options?: any) => string;
  };
  const { doctors, departments, appointments, patients, payments } = useData();
  const navigate = useNavigate();

  const totalRevenue = payments.reduce((acc, p) => acc + p.amount, 0);
  const pendingCount = appointments.filter(
    (a) => a.status === "pending",
  ).length;

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden bg-gradient-to-br from-primary to-primary-hover text-white rounded-2xl p-6 shadow-lg border border-border">
        {/* Decorative blobs */}
        <div
          className="absolute -top-24 -right-16 rtl:-left-16 rtl:-right-auto w-72 h-72 rounded-full pointer-events-none"
          style={{ background: "rgba(255,255,255,0.14)", filter: "blur(90px)" }}
        />
        <div
          className="absolute -bottom-28 -left-10 rtl:-right-10 rtl:-left-auto w-64 h-64 rounded-full pointer-events-none"
          style={{ background: "rgba(255,255,255,0.08)", filter: "blur(90px)" }}
        />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="px-2.5 py-0.5 rounded-full bg-white/15 text-white border border-white/30 text-[10px] font-bold uppercase tracking-wider inline-block mb-2 backdrop-blur-sm">
              {t("adminDashboard.badge")}
            </span>
            <h1 className="text-2xl font-black tracking-tight text-white">
              {t("adminDashboard.title")}
            </h1>
            <p className="text-white/80 text-xs mt-1">
              {t("adminDashboard.subtitle")}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate("/admin/doctors")}
              className="px-3.5 py-2 bg-white text-primary hover:bg-primary-tint text-xs font-bold rounded-xl transition-all shadow-md flex items-center gap-1.5 hover:-translate-y-0.5"
            >
              <Plus className="w-4 h-4" /> {t("adminDashboard.addDoctor")}
            </button>
            <button
              onClick={() => navigate("/admin/departments")}
              className="px-3.5 py-2 bg-white/15 hover:bg-white/25 text-white text-xs font-bold rounded-xl border border-white/30 backdrop-blur-sm transition-all flex items-center gap-1.5 hover:-translate-y-0.5"
            >
              <Building2 className="w-4 h-4" />{" "}
              {t("adminDashboard.manageDepartments")}
            </button>
          </div>
        </div>
      </div>

      {/* Admin KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title={t("adminDashboard.statCard.medicalStaff")}
          value={doctors.length}
          subtitle={t("adminDashboard.statCard.medicalStaffSubtitle")}
          icon={Stethoscope}
          iconColor="text-primary"
          bgColor="bg-primary-tint"
        />
        <StatCard
          title={t("adminDashboard.statCard.departments")}
          value={departments.length}
          subtitle={t("adminDashboard.statCard.departmentsSubtitle")}
          icon={Building2}
          iconColor="text-success"
          bgColor="bg-success-bg"
        />
        <StatCard
          title={t("adminDashboard.statCard.totalPatients")}
          value={patients.length}
          icon={Users}
          iconColor="text-pending"
          bgColor="bg-pending-bg"
        />
        <StatCard
          title={t("adminDashboard.statCard.appointments")}
          value={appointments.length}
          subtitle={t("adminDashboard.statCard.appointmentsSubtitle", {
            count: pendingCount,
          })}
          icon={CalendarCheck}
          iconColor="text-primary"
          bgColor="bg-primary-tint"
        />
        <StatCard
          title={t("adminDashboard.statCard.grossRevenue")}
          value={`$${totalRevenue}`}
          subtitle={t("adminDashboard.statCard.revenueSubtitle")}
          icon={DollarSign}
          iconColor="text-success"
          bgColor="bg-success-bg"
        />
      </div>

      {/* Live System Activity Monitor Table */}
      <div className="bg-surface rounded-2xl border border-border p-5 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <div>
            <h2 className="text-sm font-bold text-heading flex items-center gap-2">
              <Activity className="w-4 h-4 text-primary" />{" "}
              {t("adminDashboard.recentActivity.title")}
            </h2>
            <p className="text-xs text-muted">
              {t("adminDashboard.recentActivity.subtitle")}
            </p>
          </div>
          <button
            onClick={() => navigate("/admin/appointments")}
            className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
          >
            <span>
              {t("adminDashboard.recentActivity.viewAll", {
                count: appointments.length,
              })}
            </span>
            <ChevronRight className="w-3.5 h-3.5 rtl:rotate-180" />
          </button>
        </div>

        <DataTable
          data={appointments.slice(0, 5)}
          columns={[
            {
              key: "patientName",
              header: t("adminDashboard.recentActivity.columnPatient"),
              render: (item) => (
                <div>
                  <div className="font-bold text-heading">
                    {item.patientName}
                  </div>
                  <div className="text-[10px] text-muted">
                    {t("adminDashboard.recentActivity.idLabel", {
                      id: item.patientId,
                    })}
                  </div>
                </div>
              ),
            },
            {
              key: "doctorName",
              header: t("adminDashboard.recentActivity.columnDoctor"),
              render: (item) => (
                <div>
                  <div className="font-bold text-heading">
                    {item.doctorName}
                  </div>
                  <div className="text-[10px] text-primary">
                    {item.departmentName}
                  </div>
                </div>
              ),
            },
            {
              key: "date",
              header: t("adminDashboard.recentActivity.columnSchedule"),
              render: (item) => (
                <div className="text-xs">
                  <div className="font-bold">{item.date}</div>
                  <div className="text-[10px] text-muted">{item.timeSlot}</div>
                </div>
              ),
            },
            {
              key: "consultationFee",
              header: t("adminDashboard.recentActivity.columnFee"),
              render: (item) => (
                <span className="font-bold text-success">
                  ${item.consultationFee}
                </span>
              ),
            },
            {
              key: "status",
              header: t("adminDashboard.recentActivity.columnStatus"),
              render: (item) => <StatusPill status={item.status} />,
            },
          ]}
        />
      </div>
    </div>
  );
};

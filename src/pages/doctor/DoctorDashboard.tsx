import React from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { CalendarCheck, Clock, DollarSign, CheckCircle2, AlertCircle } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useData } from "../../context/DataContext";
import { StatCard } from "../../components/shared/StatCard";
import { StatusPill } from "../../components/shared/StatusPill";

export const DoctorDashboard: React.FC = () => {
  const { user } = useAuth();
  const { doctors, appointments, approveAppointment, completeAppointment } = useData();
  const { t } = useTranslation() as {
    t: (key: string, options?: any) => string;
  };
  const navigate = useNavigate();

  const [actionError, setActionError] = React.useState<string>("");

  const handleApprove = async (id: string) => {
    setActionError("");
    try {
      await approveAppointment(id);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Failed to approve");
    }
  };

  const handleComplete = async (id: string) => {
    setActionError("");
    try {
      await completeAppointment(id);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Failed to mark completed");
    }
  };

  const doctorSpecialty =
    doctors.find((d) => d.id === user.id)?.specialty ?? "";

  const myAppointments = appointments.filter((a) => a.doctorId === user.id);
  const pendingRequests = myAppointments.filter((a) => a.status === "pending");
  const confirmedToday = myAppointments.filter((a) => a.status === "confirmed");
  const completedVisits = myAppointments.filter(
    (a) => a.status === "completed",
  );

  const totalEarnings = completedVisits.reduce(
    (acc, a) => acc + a.consultationFee,
    0,
  );

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
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
            <h1 className="text-2xl font-semibold tracking-tight text-white">
              {t("doctorDashboard.title", { name: user.name })}
            </h1>
            <p className="text-white/80 text-xs mt-1">
              {t("doctorDashboard.subtitle", {
                specialty: doctorSpecialty,
                count: pendingRequests.length,
              })}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate("/doctor/appointments")}
              className="px-3.5 py-2 bg-white text-primary hover:bg-primary-tint text-xs font-bold rounded-xl transition-all shadow-md flex items-center gap-1.5 hover:-translate-y-0.5"
            >
              <CalendarCheck className="w-4 h-4" />{" "}
              {t("doctorDashboard.button.viewAppointments")}
            </button>
            <button
              onClick={() => navigate("/doctor/schedule")}
              className="px-3.5 py-2 bg-white/15 hover:bg-white/25 text-white text-xs font-bold rounded-xl border border-white/30 backdrop-blur-sm transition-all flex items-center gap-1.5 hover:-translate-y-0.5"
            >
              <Clock className="w-4 h-4" />{" "}
              {t("doctorDashboard.button.manageSchedule")}
            </button>
          </div>
        </div>
      </div>

      {actionError && (
        <div className="p-3 bg-danger-bg text-danger border border-danger-bg rounded-xl text-xs font-bold flex items-center gap-2">
          <AlertCircle className="w-4 h-4" /> {actionError}
        </div>
      )}

      {/* Doctor KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title={t("doctorDashboard.statCard.pendingRequests")}
          value={pendingRequests.length}
          subtitle={t("doctorDashboard.statCard.pendingRequestsSubtitle")}
          icon={CalendarCheck}
          iconColor="text-pending"
          bgColor="bg-pending-bg"
        />
        <StatCard
          title={t("doctorDashboard.statCard.confirmedAppointments")}
          value={confirmedToday.length}
          icon={Clock}
          iconColor="text-primary"
          bgColor="bg-primary-tint"
        />
        <StatCard
          title={t("doctorDashboard.statCard.completedVisits")}
          value={completedVisits.length}
          icon={CheckCircle2}
          iconColor="text-success"
          bgColor="bg-success-bg"
        />
        <StatCard
          title={t("doctorDashboard.statCard.totalPracticeIncome")}
          value={`$${totalEarnings}`}
          icon={DollarSign}
          iconColor="text-primary"
          bgColor="bg-primary-tint"
        />
      </div>

      {/* Pending Requests High Priority Section */}
      {pendingRequests.length > 0 && (
        <div className="bg-pending-bg border border-pending rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-pending flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-pending animate-ping" />{" "}
              {t("doctorDashboard.urgent.title", {
                count: pendingRequests.length,
              })}
            </h2>
            <button
              onClick={() => navigate("/doctor/appointments")}
              className="text-xs font-bold text-pending underline"
            >
              {t("doctorDashboard.urgent.openFullManager")}
            </button>
          </div>

          <div className="space-y-2">
            {pendingRequests.slice(0, 3).map((req) => (
              <div
                key={req.id}
                className="bg-surface p-3 rounded-xl border border-pending-bg flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div>
                  <h4 className="font-bold text-heading" dir="auto">
                    {req.patientName}
                  </h4>
                  <p className="text-[11px] text-muted">
                    {req.date} @ {req.timeSlot}
                  </p>
                  {req.notes && (
                    <p
                      className="text-[11px] text-muted italic mt-0.5"
                      dir="auto"
                    >
                      "{req.notes}"
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button
                    onClick={() => handleApprove(req.id)}
                    className="px-3 py-1.5 bg-success hover:brightness-90 text-white font-bold rounded-lg transition-colors flex items-center gap-1"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />{" "}
                    {t("doctorDashboard.button.approve")}
                  </button>
                  <button
                    onClick={() => navigate("/doctor/appointments")}
                    className="px-3 py-1.5 bg-neutral-bg hover:bg-danger-bg text-muted hover:text-danger font-bold rounded-lg transition-colors"
                  >
                    {t("doctorDashboard.button.review")}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Confirmed Visits Schedule */}
      <div className="bg-surface rounded-2xl border border-border p-5">
        <div className="flex items-center justify-between pb-3 border-b border-border mb-4">
          <h2 className="text-sm font-bold text-heading">
            {t("doctorDashboard.upcomingVisits.title")}
          </h2>
          <button
            onClick={() => navigate("/doctor/appointments")}
            className="text-xs font-bold text-primary hover:underline"
          >
            {t("doctorDashboard.upcomingVisits.viewAll", {
              count: myAppointments.length,
            })}
          </button>
        </div>

        {confirmedToday.length === 0 ? (
          <p className="text-xs text-muted py-6 text-center">
            {t("doctorDashboard.upcomingVisits.empty")}
          </p>
        ) : (
          <div className="space-y-3">
            {confirmedToday.map((apt) => (
              <div
                key={apt.id}
                className="p-3.5 bg-page rounded-xl border border-border flex items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-heading" dir="auto">
                      {apt.patientName}
                    </span>
                    <StatusPill status={apt.status} />
                  </div>
                  <p className="text-[11px] text-muted mt-0.5">
                    {t("doctorDashboard.upcomingVisits.visitInfo", {
                      date: apt.date,
                      timeSlot: apt.timeSlot,
                      fee: apt.consultationFee,
                    })}
                  </p>
                </div>

                <button
                  onClick={() => handleComplete(apt.id)}
                  className="px-3 py-1.5 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-lg transition-colors shadow-xs"
                >
                  {t("doctorDashboard.button.markCompleted")}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

import React from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Calendar,
  Clock,
  Stethoscope,
  Building2,
  MessageSquare,
  ChevronRight,
  User,
  AlertCircle,
  FileText,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useData } from "../../context/DataContext";
import { StatCard } from "../../components/shared/StatCard";
import { StatusPill } from "../../components/shared/StatusPill";
import { AppImage } from "../../components/shared/AppImage";

export const PatientDashboard: React.FC = () => {
  const { user } = useAuth();
  const { appointments, doctors, conversations, medicalRecords } = useData();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const myAppointments = appointments.filter((a) => a.patientId === user.id);
  const upcomingAppointment = myAppointments.find(
    (a) => a.status === "confirmed" || a.status === "pending",
  );
  const myConversations = conversations.filter(
    (c) => c.participantRole === "doctor",
  );
  const unreadMessagesCount = myConversations.reduce(
    (acc, c) => acc + c.unreadCount,
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
              {t("patientDashboard.welcome", { name: user.name })}
            </h1>
            <p className="text-white/80 text-xs mt-1 max-w-xl">
              {t("patientDashboard.subtitle")}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate("/patient/doctors")}
              className="px-3.5 py-2 bg-white text-primary hover:bg-primary-tint text-xs font-bold rounded-xl transition-all shadow-md flex items-center gap-1.5 hover:-translate-y-0.5"
            >
              <Stethoscope className="w-4 h-4" />{" "}
              {t("patientDashboard.button.bookNew")}
            </button>
            <button
              onClick={() => navigate("/patient/departments")}
              className="px-3.5 py-2 bg-white/15 hover:bg-white/25 text-white text-xs font-bold rounded-xl border border-white/30 backdrop-blur-sm transition-all flex items-center gap-1.5 hover:-translate-y-0.5"
            >
              <Building2 className="w-4 h-4" />{" "}
              {t("patientDashboard.button.browseDepartments")}
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title={t("patientDashboard.statCard.totalAppointments")}
          value={myAppointments.length}
          icon={Calendar}
          iconColor="text-primary"
          bgColor="bg-primary-tint"
        />
        <StatCard
          title={t("patientDashboard.statCard.upcomingVisit")}
          value={
            upcomingAppointment
              ? upcomingAppointment.date
              : t("patientDashboard.statCard.upcomingVisitNone")
          }
          subtitle={
            upcomingAppointment
              ? upcomingAppointment.timeSlot
              : t("patientDashboard.statCard.noActiveBooking")
          }
          icon={Clock}
          iconColor="text-success"
          bgColor="bg-success-bg"
        />
        <StatCard
          title={t("patientDashboard.statCard.unreadMessages")}
          value={unreadMessagesCount}
          icon={MessageSquare}
          iconColor="text-pending"
          bgColor="bg-pending-bg"
        />
        <StatCard
          title={t("patientDashboard.statCard.medicalRecords")}
          value={medicalRecords.filter((r) => r.patientId === user.id).length}
          icon={FileText}
          iconColor="text-primary"
          bgColor="bg-primary-tint"
        />
      </div>

      {/* Main Grid: Upcoming Visit Highlight + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Next Active Appointment Card */}
        <div className="lg:col-span-2 bg-surface rounded-2xl border border-border shadow-xs p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary" />
                <h2 className="text-sm font-bold text-heading">
                  {t("patientDashboard.upcoming.title")}
                </h2>
              </div>
              <button
                onClick={() => navigate("/patient/appointments")}
                className="text-xs font-bold text-primary hover:underline"
              >
                {t("patientDashboard.upcoming.viewAll", {
                  count: myAppointments.length,
                })}
              </button>
            </div>

            {upcomingAppointment ? (
              <div className="py-4 space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <AppImage
                      src={
                        upcomingAppointment.doctorAvatar ||
                        "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150"
                      }
                      alt={upcomingAppointment.doctorName}
                      className="w-12 h-12 rounded-xl object-cover border border-border"
                    />
                    <div>
                      <h3 className="text-sm font-bold text-heading" dir="auto">
                        {upcomingAppointment.doctorName}
                      </h3>
                      <p className="text-xs text-muted" dir="auto">
                        {upcomingAppointment.doctorSpecialty} •{" "}
                        {upcomingAppointment.departmentName}
                      </p>
                    </div>
                  </div>
                  <StatusPill status={upcomingAppointment.status} />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-neutral-bg p-3 rounded-xl border border-border text-xs">
                  <div>
                    <span className="text-[10px] text-muted font-semibold block uppercase">
                      {t("patientDashboard.upcoming.date")}
                    </span>
                    <span className="font-bold text-heading">
                      {upcomingAppointment.date}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-muted font-semibold block uppercase">
                      {t("patientDashboard.upcoming.timeSlot")}
                    </span>
                    <span className="font-bold text-heading">
                      {upcomingAppointment.timeSlot}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-muted font-semibold block uppercase">
                      {t("patientDashboard.upcoming.fee")}
                    </span>
                    <span className="font-bold text-success">
                      {t("patientDashboard.upcoming.feePaid", {
                        fee: upcomingAppointment.consultationFee,
                      })}
                    </span>
                  </div>
                </div>

                {upcomingAppointment.notes && (
                  <p className="text-xs text-heading bg-primary-tint/50 p-2.5 rounded-lg border border-primary-tint italic">
                    <span dir="auto">"{upcomingAppointment.notes}"</span>
                  </p>
                )}
              </div>
            ) : (
              <div className="py-8 text-center">
                <AlertCircle className="w-8 h-8 text-muted mx-auto mb-2" />
                <p className="text-xs font-semibold text-heading">
                  {t("patientDashboard.upcoming.emptyTitle")}
                </p>
                <p className="text-[11px] text-muted mt-0.5">
                  {t("patientDashboard.upcoming.emptyText")}
                </p>
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-border flex items-center justify-end">
            <button
              onClick={() => navigate("/patient/doctors")}
              className="px-3.5 py-1.5 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-lg transition-colors"
            >
              {t("patientDashboard.upcoming.bookButton")}
            </button>
          </div>
        </div>

        {/* Quick Links Nav Card */}
        <div className="bg-surface rounded-2xl border border-border shadow-xs p-5 flex flex-col justify-between">
          <h2 className="text-sm font-bold text-heading pb-3 border-b border-border">
            {t("patientDashboard.quickLinks.title")}
          </h2>

          <div className="space-y-2.5 my-3">
            <button
              onClick={() => navigate("/patient/departments")}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-neutral-bg hover:bg-neutral-bg border border-border transition-colors text-left rtl:text-right"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary-tint text-primary rounded-lg">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-heading">
                    {t("patientDashboard.quickLinks.browseDepartments")}
                  </h4>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-muted rtl:rotate-180" />
            </button>

            <button
              onClick={() => navigate("/patient/doctors")}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-neutral-bg hover:bg-neutral-bg border border-border transition-colors text-left rtl:text-right"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-success-bg text-success rounded-lg">
                  <Stethoscope className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-heading">
                    {t("patientDashboard.quickLinks.findSpecialists")}
                  </h4>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-muted rtl:rotate-180" />
            </button>

            <button
              onClick={() => navigate("/patient/messages")}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-neutral-bg hover:bg-neutral-bg border border-border transition-colors text-left rtl:text-right"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-pending-bg text-pending rounded-lg">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-heading">
                    {t("patientDashboard.quickLinks.doctorInbox")}
                  </h4>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-muted rtl:rotate-180" />
            </button>
          </div>
        </div>
      </div>

      {/* Featured Doctors Section */}
      <div className="bg-surface rounded-2xl border border-border shadow-xs p-5">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-border">
          <div>
            <h2 className="text-sm font-bold text-heading">
              {t("patientDashboard.featured.title")}
            </h2>
            <p className="text-xs text-muted">
              {t("patientDashboard.featured.subtitle")}
            </p>
          </div>
          <button
            onClick={() => navigate("/patient/doctors")}
            className="text-xs font-bold text-primary hover:underline"
          >
            {t("patientDashboard.featured.browseAll", {
              count: doctors.length,
            })}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {doctors.slice(0, 4).map((doc) => (
            <div
              key={doc.id}
              className="bg-neutral-bg border border-border rounded-xl p-4 flex flex-col justify-between hover:border-primary transition-colors"
            >
              <div>
                <AppImage
                  src={doc.profilePicture}
                  alt={doc.name}
                  className="w-16 h-16 rounded-xl object-cover mb-3 border border-border"
                />
                <h3 className="text-xs font-bold text-heading" dir="auto">
                  {doc.name}
                </h3>
                <p
                  className="text-[11px] text-primary font-semibold"
                  dir="auto"
                >
                  {doc.specialty}
                </p>
                <p className="text-[10px] text-muted mt-0.5">
                  {t("patientDashboard.featured.doctorInfo", {
                    department: doc.departmentName,
                    years: doc.yearsExperience,
                  })}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
                <span className="text-xs font-bold text-heading">
                  ${doc.consultationFee}
                </span>
                <button
                  onClick={() => navigate(`/patient/book?doctor=${doc.id}`)}
                  className="px-2.5 py-1 bg-primary hover:bg-primary-hover text-white text-[10px] font-bold rounded-md transition-colors"
                >
                  {t("patientDashboard.featured.bookSlot")}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

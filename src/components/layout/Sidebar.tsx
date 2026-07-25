import React from "react";
import { useTranslation } from "react-i18next";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Building2,
  Stethoscope,
  CalendarCheck,
  CreditCard,
  Users,
  MessageSquare,
  FileText,
  Clock,
  Settings,
  BarChart3,
  LogOut,
  Sliders,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { Avatar } from "../shared/Avatar";

export const Sidebar: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { role, user, logout } = useAuth();

  const patientNav = [
    {
      label: t("nav.patient.dashboard"),
      path: "/patient/dashboard",
      icon: LayoutDashboard,
    },
    {
      label: t("nav.patient.departments"),
      path: "/patient/departments",
      icon: Building2,
    },
    {
      label: t("nav.patient.doctors"),
      path: "/patient/doctors",
      icon: Stethoscope,
    },
    {
      label: t("nav.patient.appointments"),
      path: "/patient/appointments",
      icon: CalendarCheck,
    },
    {
      label: t("nav.patient.messages"),
      path: "/patient/messages",
      icon: MessageSquare,
    },
    {
      label: t("nav.patient.profile"),
      path: "/patient/profile",
      icon: Settings,
    },
  ];

  const doctorNav = [
    {
      label: t("nav.doctor.dashboard"),
      path: "/doctor/dashboard",
      icon: LayoutDashboard,
    },
    {
      label: t("nav.doctor.appointments"),
      path: "/doctor/appointments",
      icon: CalendarCheck,
    },
    { label: t("nav.doctor.schedule"), path: "/doctor/schedule", icon: Clock },
    {
      label: t("nav.doctor.patients"),
      path: "/doctor/patients",
      icon: FileText,
    },
    {
      label: t("nav.doctor.messages"),
      path: "/doctor/messages",
      icon: MessageSquare,
    },
    { label: t("nav.doctor.profile"), path: "/doctor/profile", icon: Settings },
  ];

  const adminNav = [
    {
      label: t("nav.admin.dashboard"),
      path: "/admin/dashboard",
      icon: LayoutDashboard,
    },
    {
      label: t("nav.admin.doctors"),
      path: "/admin/doctors",
      icon: Stethoscope,
    },
    {
      label: t("nav.admin.departments"),
      path: "/admin/departments",
      icon: Building2,
    },
    {
      label: t("nav.admin.appointments"),
      path: "/admin/appointments",
      icon: CalendarCheck,
    },
    { label: t("nav.admin.patients"), path: "/admin/patients", icon: Users },
    {
      label: t("nav.admin.payments"),
      path: "/admin/payments",
      icon: CreditCard,
    },
    { label: t("nav.admin.reports"), path: "/admin/reports", icon: BarChart3 },
    { label: t("nav.admin.settings"), path: "/admin/settings", icon: Sliders },
  ];

  const currentNav =
    role === "admin" ? adminNav : role === "doctor" ? doctorNav : patientNav;

  const roleBadgeConfig = {
    admin: {
      bg: "bg-primary/60 text-primary-tint border-primary",
      label: t("sidebar.badge.admin"),
    },
    doctor: {
      bg: "bg-success/60 text-success-bg border-success/50",
      label: t("sidebar.badge.doctor"),
    },
    patient: {
      bg: "bg-primary/60 text-primary-tint border-primary",
      label: t("sidebar.badge.patient"),
    },
  };

  const badge = roleBadgeConfig[role];
  const roleKey = user.role as "patient" | "doctor" | "admin";
  const roleAccentBg =
    roleKey === "doctor"
      ? "bg-accent-doctor"
      : roleKey === "admin"
        ? "bg-accent-admin"
        : "bg-accent-patient";

  return (
    <aside className="w-64 bg-heading text-white/70 flex flex-col h-full flex-shrink-0 border-r rtl:border-l rtl:border-r-0 border-heading select-none">
      <div className="p-5 flex items-center gap-3 border-b border-heading">
        <img
          src="/src/assets/images/full.png"
          alt={t("sidebar.logoAlt")}
          className="h-auto w-full object-contain bg-white rounded-lg"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = "none";
            const parent = (e.target as HTMLImageElement).parentElement!;
            const fallback = document.createElement("div");
            fallback.className =
              "w-9 h-9 bg-primary rounded-xl flex items-center justify-center font-black text-white text-base shadow-md";
            fallback.textContent = t("sidebar.logoFallback");
            parent.prepend(fallback);
          }}
        />
      </div>

      <div className="px-4 pt-4 pb-2">
        <div className="text-muted text-[10px] font-bold uppercase tracking-widest px-2 mb-2 flex items-center justify-between">
          <span>{badge.label}</span>
          <span
            className={`px-1.5 py-0.2 rounded text-[9px] font-black uppercase ${badge.bg}`}
          >
            {role}
          </span>
        </div>

        <nav className="space-y-1">
          {currentNav.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                    isActive
                      ? `${roleAccentBg} text-white shadow-sm font-bold`
                      : "text-white/70 hover:bg-heading hover:text-white"
                  }`
                }
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      <div className="flex-1" />

      <div className="p-4 border-t border-heading bg-heading/80">
        <button
          onClick={logout}
          title={t("sidebar.logoutTooltip")}
          className="flex items-center cursor-pointer justify-center gap-2 w-full p-2.5 text-muted hover:text-danger hover:bg-heading/50 rounded-xl border border-heading/50 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span className="text-xs font-bold">
            {i18n.language.startsWith("ar") ? "تسجيل الخروج" : "Logout"}
          </span>
        </button>
      </div>
    </aside>
  );
};

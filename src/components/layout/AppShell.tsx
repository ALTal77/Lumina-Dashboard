import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { Bell, Globe, X } from "lucide-react";
import { Sidebar } from "./Sidebar";
import { useAuth } from "../../context/AuthContext";
import { useData } from "../../context/DataContext";
import { UserRole } from "../../types";

export const AppShell: React.FC = () => {
  const { t } = useTranslation();
  const { role, loginAs, dir, toggleRTL, user } = useAuth();
  const { notifications, markNotificationRead } = useData();
  const navigate = useNavigate();
  const location = useLocation();

  const [showNotifications, setShowNotifications] = useState(false);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleRoleSwitch = (newRole: UserRole) => {
    loginAs(newRole);
    if (newRole === "patient") navigate("/patient/dashboard");
    else if (newRole === "doctor") navigate("/doctor/dashboard");
    else if (newRole === "admin") navigate("/admin/dashboard");
  };

  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes("/patient/dashboard"))
      return t("pageTitle.patient.dashboard");
    if (path.includes("/patient/departments"))
      return t("pageTitle.patient.departments");
    if (path.includes("/patient/doctors"))
      return t("pageTitle.patient.doctors");
    if (path.includes("/patient/book")) return t("pageTitle.patient.book");
    if (path.includes("/patient/appointments"))
      return t("pageTitle.patient.appointments");
    if (path.includes("/patient/messages"))
      return t("pageTitle.patient.messages");
    if (path.includes("/patient/profile"))
      return t("pageTitle.patient.profile");

    if (path.includes("/doctor/dashboard"))
      return t("pageTitle.doctor.dashboard");
    if (path.includes("/doctor/appointments"))
      return t("pageTitle.doctor.appointments");
    if (path.includes("/doctor/schedule"))
      return t("pageTitle.doctor.schedule");
    if (path.includes("/doctor/patients"))
      return t("pageTitle.doctor.patients");
    if (path.includes("/doctor/messages"))
      return t("pageTitle.doctor.messages");
    if (path.includes("/doctor/profile")) return t("pageTitle.doctor.profile");

    if (path.includes("/admin/dashboard"))
      return t("pageTitle.admin.dashboard");
    if (path.includes("/admin/doctors")) return t("pageTitle.admin.doctors");
    if (path.includes("/admin/departments"))
      return t("pageTitle.admin.departments");
    if (path.includes("/admin/appointments"))
      return t("pageTitle.admin.appointments");
    if (path.includes("/admin/patients")) return t("pageTitle.admin.patients");
    if (path.includes("/admin/payments")) return t("pageTitle.admin.payments");
    if (path.includes("/admin/reports")) return t("pageTitle.admin.reports");
    if (path.includes("/admin/settings")) return t("pageTitle.admin.settings");

    return t("pageTitle.fallback");
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-surface text-heading font-poppins antialiased relative">
      {/* Decorative background blob */}
      <div
        className="absolute -top-40 -right-40 rtl:-left-40 rtl:-right-auto w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{
          background: "rgba(13,148,136,0.03)",
          filter: "blur(120px)",
        }}
      />

      <Sidebar />

      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden relative">
        {/* Glass Navbar */}
        <header
          className="h-16 flex-shrink-0 z-40 mx-4 mt-3 px-6 flex items-center justify-between"
          style={{
            background: "rgba(15,118,110,0.92)",
            backdropFilter: "blur(16px)",
            border: "1px solid rgba(204,251,241,0.35)",
            borderRadius: "2rem",
            boxShadow: "0 8px 32px 0 rgba(15,118,110,0.28)",
          }}
        >
          <div className="flex items-center gap-4 min-w-0">
            <h1 className="font-semibold text-white truncate tracking-tight">
              {getPageTitle()}
            </h1>
          </div>

          <div className="flex items-center gap-4 flex-shrink-0">
            <button
              onClick={toggleRTL}
              title={t("navbar.direction.tooltip", { dir: dir.toUpperCase() })}
              className="flex cursor-pointer items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white/70 hover:text-white border border-white/25 hover:border-white/50 rounded-full transition-colors"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>{dir === "ltr" ? "EN" : "AR"}</span>
            </button>

            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="w-8 h-8 bg-white/10 cursor-pointer hover:bg-white/20 rounded-full flex items-center justify-center text-white/80 hover:text-white relative transition-colors"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 rtl:-left-0.5 rtl:-right-auto w-4 h-4 bg-danger text-white text-[9px] font-black rounded-full flex items-center justify-center border-2 border-white">
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div
                  className="absolute right-0 rtl:right-auto rtl:left-0 mt-2 w-80 bg-white border border-border overflow-hidden z-50"
                  style={{
                    borderRadius: "0.5rem",
                    boxShadow: "var(--shadow-premium)",
                  }}
                >
                  <div className="p-3 border-b border-border flex items-center justify-between bg-page">
                    <h4 className="text-xs font-bold text-heading">
                      {t("navbar.notifications.heading")}
                    </h4>
                    <button
                      onClick={() => setShowNotifications(false)}
                      className="p-1 text-muted hover:text-heading rounded cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="max-h-72 overflow-y-auto divide-y divide-border">
                    {notifications.length === 0 ? (
                      <p className="p-4 text-center text-xs text-muted">
                        {t("navbar.notifications.empty")}
                      </p>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          onClick={() => markNotificationRead(n.id)}
                          className={`p-3 text-xs cursor-pointer hover:bg-primary-tint transition-colors ${
                            !n.isRead ? "bg-primary-tint/40" : ""
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-bold text-heading">
                              {n.title}
                            </span>
                            <span className="text-[9px] text-muted">
                              {n.createdAt.replace("T", " ").split(" ")[1]?.slice(0, 5) ||
                                t("navbar.notifications.now")}
                            </span>
                          </div>
                          <p className="text-[11px] text-muted leading-snug">
                            {n.message}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 bg-surface relative">
          <div
            className="absolute bottom-0 left-0 rtl:right-0 rtl:left-auto w-[400px] h-[400px] rounded-full pointer-events-none"
            style={{
              background: "rgba(13,148,136,0.03)",
              filter: "blur(100px)",
            }}
          />
          <Outlet />
        </main>
      </div>
    </div>
  );
};

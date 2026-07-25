import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { User, Lock, LogIn, Eye, EyeOff, Globe } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { UserRole } from "../../types";
import fullLogo from "../../assets/images/full.png";

const CREDENTIALS: { email: string; password: string; role: UserRole }[] = [
  { email: "admin@lumina.com", password: "admin123", role: "admin" },
  { email: "dr.vance@hospital.org", password: "doctor123", role: "doctor" },
  { email: "sarah@example.com", password: "patient123", role: "patient" },
];

export const LoginPage: React.FC = () => {
  const { loginAs, dir, toggleRTL } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password.trim()) {
      setError(t("login.form.error"));
      return;
    }

    setLoading(true);

    setTimeout(() => {
      const match = CREDENTIALS.find(
        (c) =>
          c.email === email.trim().toLowerCase() && c.password === password,
      );

      if (match) {
        loginAs(match.role);
        navigate(`/${match.role}/dashboard`);
      } else {
        setError(t("login.form.error"));
        setLoading(false);
      }
    }, 800);
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col relative overflow-hidden">
      {/* Decorative blobs */}
      <div
        className="absolute top-0 left-0 w-[500px] h-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none"
        style={{ background: "rgba(13,148,136,0.04)", filter: "blur(120px)" }}
      />
      <div
        className="absolute bottom-0 right-0 w-[500px] h-[500px] translate-x-1/2 translate-y-1/2 rounded-full pointer-events-none"
        style={{ background: "rgba(13,148,136,0.04)", filter: "blur(120px)" }}
      />

      {/* RTL toggle */}
      <div className="absolute top-4 right-4 rtl:right-auto rtl:left-4 z-10 ">
        <button
          onClick={toggleRTL}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold cursor-pointer text-slate-500 hover:text-heading border border-border hover:border-border rounded-full transition-colors"
        >
          <Globe className="w-3.5 h-3.5" />
          <span>{dir === "ltr" ? "AR" : "EN"}</span>
        </button>
      </div>

      {/* Center content */}
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-sm">
          {/* Logo */}
          <div className="text-center mb-8">
            <img
              src={fullLogo}
              alt={t("sidebar.logoAlt")}
              className="h-12 mx-auto mb-4 object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
                const fallback = (e.target as HTMLImageElement)
                  .nextElementSibling;
                if (fallback) (fallback as HTMLElement).style.display = "flex";
              }}
            />
            <div className="hidden w-12 h-12 bg-primary rounded-xl items-center justify-center font-black text-white text-xl mx-auto mb-4 shadow-lg">
              LH
            </div>
            <h1 className="text-xl font-black text-[#0E3B3D] tracking-tight">
              {t("login.form.welcome")}
            </h1>
            <p className="text-xs text-muted mt-1">
              {t("login.brandSubtitle")}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3 text-xs font-bold text-danger bg-danger-bg border border-danger-bg rounded-[16px] text-center">
                {error}
              </div>
            )}

            <div>
              <label className="text-xs font-semibold text-muted mb-1.5 block">
                {t("login.form.emailLabel")}
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted rtl:right-4 rtl:left-auto" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t("login.form.emailPlaceholder")}
                  className="w-full pl-11 pr-4 rtl:pr-11 rtl:pl-4 py-3 text-sm text-left rtl:text-right text-heading bg-page border border-border rounded-[16px] outline-none transition-colors placeholder:text-muted focus:border-primary focus:ring-2 focus:ring-primary/10"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-muted mb-1.5 block">
                {t("login.form.passwordLabel")}
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted rtl:right-4 rtl:left-auto" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t("login.form.passwordPlaceholder")}
                  className="w-full pl-11 pr-11 rtl:pr-11 rtl:pl-11 py-3 text-sm text-heading bg-page border border-border rounded-[16px] outline-none transition-colors placeholder:text-muted focus:border-primary focus:ring-2 focus:ring-primary/10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-heading rtl:left-3 rtl:right-auto cursor-pointer"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex cursor-pointer items-center justify-center gap-2 py-3 bg-primary hover:bg-primary text-white font-bold text-sm rounded-full transition-colors shadow-lg shadow-primary/20 disabled:opacity-60"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <LogIn className="w-4 h-4" />
              )}
              {loading ? "" : t("login.form.submit")}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

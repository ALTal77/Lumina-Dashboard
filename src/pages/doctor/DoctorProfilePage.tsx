import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Save, CheckCircle } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { FileUploadMock } from "../../components/shared/FileUploadMock";
import { AppImage } from "../../components/shared/AppImage";
import { Doctor } from "../../types";

export const DoctorProfilePage: React.FC = () => {
  const { user } = useAuth();
  const { t } = useTranslation() as {
    t: (key: string, options?: any) => string;
  };

  const doctorUser = user as unknown as Doctor;

  const [name, setName] = useState(user.name);
  const [specialty, setSpecialty] = useState(
    doctorUser.specialty || "Cardiologist Specialist",
  );
  const [fee, setFee] = useState(doctorUser.consultationFee || 150);
  const [bio, setBio] = useState(
    doctorUser.bio ||
      "Board-certified clinical practitioner with 12+ years of experience.",
  );
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="bg-surface p-5 rounded-2xl border border-border shadow-xs flex items-center gap-4">
        <AppImage
          src={user.avatar}
          alt={user.name}
          className="w-16 h-16 rounded-2xl object-cover border-2 border-primary shadow-sm"
        />
        <div>
          <h1
            className="text-xl font-black text-heading"
            dir="auto"
          >
            {t("doctorProfilePage.title", { name: user.name })}
          </h1>
          <p
            className="text-xs text-primary font-bold"
            dir="auto"
          >
            {specialty}
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSave}
        className="bg-surface p-6 rounded-2xl border border-border shadow-xs space-y-5"
      >
        <h3 className="text-sm font-bold text-heading border-b border-border pb-2">
          {t("doctorProfilePage.sectionTitle")}
        </h3>

        {savedSuccess && (
          <div className="p-3 bg-success-bg text-success border border-success-bg rounded-xl text-xs font-bold flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />{" "}
            {t("doctorProfilePage.successMessage")}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-semibold text-muted mb-1">
              {t("doctorProfilePage.form.name")}
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2.5 bg-page border border-border rounded-xl text-heading text-left rtl:text-right placeholder:text-muted"
            />
          </div>

          <div>
            <label className="block font-semibold text-muted mb-1">
              {t("doctorProfilePage.form.specialty")}
            </label>
            <input
              type="text"
              value={specialty}
              onChange={(e) => setSpecialty(e.target.value)}
              className="w-full p-2.5 bg-page border border-border rounded-xl text-heading text-left rtl:text-right placeholder:text-muted"
            />
          </div>

          <div>
            <label className="block font-semibold text-muted mb-1">
              {t("doctorProfilePage.form.consultationFee")}
            </label>
            <input
              type="number"
              value={fee}
              onChange={(e) => setFee(Number(e.target.value))}
              className="w-full p-2.5 bg-page border border-border rounded-xl text-heading text-left rtl:text-right placeholder:text-muted"
            />
          </div>

          <div>
            <label className="block font-semibold text-muted mb-1">
              {t("doctorProfilePage.form.clinicalEmail")}
            </label>
            <input
              type="email"
              disabled
              value={user.email}
              className="w-full p-2.5 bg-neutral-bg border border-border rounded-xl text-muted cursor-not-allowed text-left rtl:text-right"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-muted mb-1">
            {t("doctorProfilePage.form.bio")}
          </label>
          <textarea
            rows={3}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="w-full p-2.5 text-xs bg-page border border-border rounded-xl text-heading text-left rtl:text-right placeholder:text-muted"
          />
        </div>

        <div className="pt-2">
          <FileUploadMock label={t("doctorProfilePage.form.fileUpload")} />
        </div>

        <div className="pt-4 border-t border-border flex justify-end">
          <button
            type="submit"
            className="px-5 py-2.5 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl transition-colors shadow-xs flex items-center gap-2"
          >
            <Save className="w-4 h-4" /> {t("doctorProfilePage.button.save")}
          </button>
        </div>
      </form>
    </div>
  );
};

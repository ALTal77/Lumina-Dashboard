import React, { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Search,
  Filter,
  Stethoscope,
  Star,
  Globe,
  Clock,
  ChevronRight,
} from "lucide-react";
import { useData } from "../../context/DataContext";
import { Doctor } from "../../types";
import { StarRating } from "../../components/shared/StarRating";
import { Modal } from "../../components/shared/Modal";
import { DoctorProfile } from "./DoctorProfile";

export const DoctorListing: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { doctors, departments } = useData();

  const deptFilterParam = searchParams.get("dept") || "all";
  const docFilterParam = searchParams.get("doc");

  const [selectedDept, setSelectedDept] = useState<string>(deptFilterParam);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [minRating, setMinRating] = useState<number>(0);

  const [viewingDoctor, setViewingDoctor] = useState<Doctor | null>(
    docFilterParam
      ? doctors.find((d) => d.id === docFilterParam) || null
      : null,
  );

  const filteredDoctors = doctors.filter((doc) => {
    if (selectedDept !== "all" && doc.departmentId !== selectedDept)
      return false;
    if (minRating > 0 && doc.rating < minRating) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        doc.name.toLowerCase().includes(q) ||
        doc.specialty.toLowerCase().includes(q) ||
        doc.languages.some((l) => l.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header & Filter Bar */}
      <div className="bg-surface p-5 rounded-2xl border border-border shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-black text-heading tracking-tight">
              {t("doctorListing.title")}
            </h1>
            <p className="text-xs text-muted mt-1">
              {t("doctorListing.subtitle")}
            </p>
          </div>
          <span className="text-xs font-bold text-muted">
            {t("doctorListing.showingCount", {
              filtered: filteredDoctors.length,
              total: doctors.length,
            })}
          </span>
        </div>

        {/* Filter inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-border">
          {/* Search bar */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted rtl:right-3 rtl:left-auto" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t("doctorListing.searchPlaceholder")}
              className="w-full pl-9 pr-3 rtl:pr-9 rtl:pl-3 py-2 text-xs bg-neutral-bg border border-border rounded-xl text-heading placeholder-muted focus:outline-none focus:border-primary"
            />
          </div>

          {/* Department dropdown */}
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-neutral-bg border border-border rounded-xl text-heading focus:outline-none focus:border-primary font-medium"
          >
            <option value="all">
              {t("doctorListing.filter.allDepartments")}
            </option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Doctor Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredDoctors.map((doc) => (
          <div
            key={doc.id}
            className="bg-surface rounded-2xl border border-border shadow-xs p-5 flex flex-col justify-between hover:border-primary transition-all duration-200"
          >
            <div>
              <div className="flex items-start gap-3 mb-3">
                <img
                  src={doc.profilePicture}
                  alt={doc.name}
                  className="w-16 h-16 rounded-2xl object-cover border border-border flex-shrink-0"
                />
                <div className="overflow-hidden">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary-tint px-2 py-0.5 rounded border border-primary-tint inline-block mb-1">
                    {doc.departmentName}
                  </span>
                  <h3
                    className="text-sm font-bold text-heading truncate"
                    dir="auto"
                  >
                    {doc.name}
                  </h3>
                  <p className="text-xs text-muted truncate" dir="auto">
                    {doc.specialty}
                  </p>
                  <div className="mt-1">
                    <StarRating
                      rating={doc.rating}
                      reviewCount={doc.reviewCount}
                      size="sm"
                    />
                  </div>
                </div>
              </div>

              <p
                className="text-xs text-heading line-clamp-2 mb-4 leading-relaxed"
                dir="auto"
              >
                {doc.bio}
              </p>

              <div className="grid grid-cols-2 gap-2 text-[11px] bg-neutral-bg p-2.5 rounded-xl border border-border mb-4">
                <div>
                  <span className="text-muted font-semibold block text-[9px] uppercase">
                    {t("doctorListing.card.experience")}
                  </span>
                  <span className="font-bold text-heading">
                    {doc.yearsExperience} {t("doctorListing.card.years")}
                  </span>
                </div>
                <div>
                  <span className="text-muted font-semibold block text-[9px] uppercase">
                    {t("doctorListing.card.languages")}
                  </span>
                  <span className="font-bold text-heading truncate block">
                    {doc.languages.join(", ")}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-border flex items-center justify-between">
              <div>
                <span className="text-[10px] text-muted font-semibold block uppercase">
                  {t("doctorListing.card.consultation")}
                </span>
                <span className="text-sm font-black text-heading">
                  ${doc.consultationFee}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewingDoctor(doc)}
                  className="px-3 py-1.5 bg-neutral-bg hover:bg-border text-heading text-xs font-bold rounded-lg transition-colors"
                >
                  {t("doctorListing.button.bioProfile")}
                </button>
                <button
                  onClick={() => navigate(`/patient/book?doctor=${doc.id}`)}
                  className="px-3 py-1.5 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-lg transition-colors shadow-xs"
                >
                  {t("doctorListing.button.bookSlot")}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Doctor Bio Modal */}
      {viewingDoctor && (
        <Modal
          isOpen={!!viewingDoctor}
          onClose={() => setViewingDoctor(null)}
          title={viewingDoctor.name}
          subtitle={t("doctorListing.modal.subtitle", {
            specialty: viewingDoctor.specialty,
            department: viewingDoctor.departmentName,
          })}
          maxWidth="lg"
        >
          <DoctorProfile
            doctor={viewingDoctor}
            onClose={() => setViewingDoctor(null)}
          />
        </Modal>
      )}
    </div>
  );
};

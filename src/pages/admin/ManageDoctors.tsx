import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Edit2, Trash2 } from "lucide-react";
import { useData } from "../../context/DataContext";
import { Doctor } from "../../types";
import { Modal } from "../../components/shared/Modal";
import { StarRating } from "../../components/shared/StarRating";
import { FileUploadMock } from "../../components/shared/FileUploadMock";

export const ManageDoctors: React.FC = () => {
  const { t } = useTranslation() as {
    t: (key: string, options?: any) => string;
  };
  const { doctors, departments, addDoctor, updateDoctor, deleteDoctor } =
    useData();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);

  // Form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [departmentId, setDepartmentId] = useState(
    departments[0]?.id || "dept-1",
  );
  const [specialty, setSpecialty] = useState("");
  const [yearsExperience, setYearsExperience] = useState(5);
  const [consultationFee, setConsultationFee] = useState(100);
  const [languages, setLanguages] = useState("English, Spanish");
  const [bio, setBio] = useState("");
  const [profilePicture, setProfilePicture] = useState(
    "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=200",
  );

  const openAddModal = () => {
    setEditingDoctor(null);
    setName("");
    setEmail("dr.new@lumina.health");
    setPhone("+1 (555) 019-2831");
    setDepartmentId(departments[0]?.id || "dept-1");
    setSpecialty("General Medicine");
    setYearsExperience(5);
    setConsultationFee(120);
    setLanguages("English, Arabic");
    setBio(
      "Experienced physician dedicated to patient-centered clinical care.",
    );
    setProfilePicture(
      "https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=200",
    );
    setIsModalOpen(true);
  };

  const openEditModal = (doc: Doctor) => {
    setEditingDoctor(doc);
    setName(doc.name);
    setEmail(doc.email || "dr.health@lumina.health");
    setPhone(doc.phone || "+1 (555) 000-0000");
    setDepartmentId(doc.departmentId);
    setSpecialty(doc.specialty);
    setYearsExperience(doc.yearsExperience);
    setConsultationFee(doc.consultationFee);
    setLanguages(doc.languages.join(", "));
    setBio(doc.bio);
    setProfilePicture(doc.profilePicture);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const deptObj = departments.find((d) => d.id === departmentId);
    const deptName = deptObj ? deptObj.name : "General Care";

    const doctorData = {
      name,
      email,
      phone,
      departmentId,
      departmentName: deptName,
      specialty,
      yearsExperience,
      consultationFee,
      languages: languages.split(",").map((s) => s.trim()),
      bio,
      profilePicture,
      availableDays: ["Mon", "Tue", "Wed", "Thu", "Fri"],
    };

    if (editingDoctor) {
      updateDoctor(editingDoctor.id, doctorData);
    } else {
      addDoctor(doctorData);
    }

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="bg-surface p-5 rounded-2xl border border-border shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-black text-heading tracking-tight">
            {t("manageDoctors.title")}
          </h1>
          <p className="text-xs text-muted mt-0.5">
            {t("manageDoctors.subtitle")}
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="px-4 py-2 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl transition-colors shadow-xs flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>{t("manageDoctors.button.add")}</span>
        </button>
      </div>

      <div className="bg-surface rounded-2xl border border-border shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left rtl:text-right text-xs text-muted">
            <thead className="bg-page uppercase text-[10px] font-bold text-muted border-b border-border">
              <tr>
                <th className="p-3 rtl:text-right">
                  {t("manageDoctors.tableHeader.doctor")}
                </th>
                <th className="p-3 rtl:text-right">
                  {t("manageDoctors.tableHeader.deptSpecialty")}
                </th>
                <th className="p-3 rtl:text-right">
                  {t("manageDoctors.tableHeader.experience")}
                </th>
                <th className="p-3 rtl:text-right">
                  {t("manageDoctors.tableHeader.fee")}
                </th>
                <th className="p-3 rtl:text-right">
                  {t("manageDoctors.tableHeader.rating")}
                </th>
                <th className="p-3 text-right rtl:text-left">
                  {t("manageDoctors.tableHeader.actions")}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {doctors.map((doc) => (
                <tr
                  key={doc.id}
                  className="hover:bg-neutral-bg/50"
                >
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={doc.profilePicture}
                        alt={doc.name}
                        className="w-9 h-9 rounded-xl object-cover border border-border"
                      />
                      <div>
                        <div className="font-bold text-heading">
                          {doc.name}
                        </div>
                        <div className="text-[10px] text-muted">
                          {t("manageDoctors.idLabel", { id: doc.id })}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="font-bold text-primary">
                      {doc.departmentName}
                    </div>
                    <div className="text-[11px] text-muted">
                      {doc.specialty}
                    </div>
                  </td>
                  <td className="p-3 font-semibold">
                    {t("manageDoctors.experienceYears", {
                      years: doc.yearsExperience,
                    })}
                  </td>
                  <td className="p-3 font-bold text-success">
                    ${doc.consultationFee}
                  </td>
                  <td className="p-3">
                    <StarRating
                      rating={doc.rating}
                      reviewCount={doc.reviewCount}
                      size="sm"
                    />
                  </td>
                  <td className="p-3 text-right rtl:text-left">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => openEditModal(doc)}
                        className="p-1.5 text-muted hover:text-primary hover:bg-primary-tint rounded-lg transition-colors"
                        title={t("manageDoctors.tooltip.edit")}
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => deleteDoctor(doc.id)}
                        className="p-1.5 text-muted hover:text-danger hover:bg-danger-bg rounded-lg transition-colors"
                        title={t("manageDoctors.tooltip.delete")}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Doctor Modal */}
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={
            editingDoctor
              ? t("manageDoctors.modal.editTitle", { name: editingDoctor.name })
              : t("manageDoctors.modal.addTitle")
          }
        >
          <form onSubmit={handleSave} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-heading mb-1">
                  {t("manageDoctors.form.name")}
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2 bg-page border border-border rounded-lg text-heading"
                />
              </div>

              <div>
                <label className="block font-semibold text-heading mb-1">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-2 bg-page border border-border rounded-lg text-heading"
                />
              </div>

              <div>
                <label className="block font-semibold text-heading mb-1">
                  Phone
                </label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full p-2 bg-page border border-border rounded-lg text-heading"
                />
              </div>

              <div>
                <label className="block font-semibold text-heading mb-1">
                  {t("manageDoctors.form.department")}
                </label>
                <select
                  value={departmentId}
                  onChange={(e) => setDepartmentId(e.target.value)}
                  className="w-full p-2 bg-page border border-border rounded-lg text-heading"
                >
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-heading mb-1">
                  {t("manageDoctors.form.specialty")}
                </label>
                <input
                  type="text"
                  required
                  value={specialty}
                  onChange={(e) => setSpecialty(e.target.value)}
                  className="w-full p-2 bg-page border border-border rounded-lg text-heading"
                />
              </div>

              <div>
                <label className="block font-semibold text-heading mb-1">
                  {t("manageDoctors.form.experience")}
                </label>
                <input
                  type="number"
                  required
                  value={yearsExperience}
                  onChange={(e) => setYearsExperience(Number(e.target.value))}
                  className="w-full p-2 bg-page border border-border rounded-lg text-heading"
                />
              </div>

              <div>
                <label className="block font-semibold text-heading mb-1">
                  {t("manageDoctors.form.consultationFee")}
                </label>
                <input
                  type="number"
                  required
                  value={consultationFee}
                  onChange={(e) => setConsultationFee(Number(e.target.value))}
                  className="w-full p-2 bg-page border border-border rounded-lg text-heading"
                />
              </div>

              <div>
                <label className="block font-semibold text-heading mb-1">
                  {t("manageDoctors.form.languages")}
                </label>
                <input
                  type="text"
                  value={languages}
                  onChange={(e) => setLanguages(e.target.value)}
                  className="w-full p-2 bg-page border border-border rounded-lg text-heading"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-heading mb-1">
                {t("manageDoctors.form.bio")}
              </label>
              <textarea
                rows={2}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full p-2 bg-page border border-border rounded-lg text-heading"
              />
            </div>

            <FileUploadMock
              label={t("manageDoctors.form.avatarUpload")}
              onFileSelect={(f) => setProfilePicture(f.url)}
              defaultPreview={profilePicture}
            />

            <div className="pt-3 border-t border-border flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-3 py-1.5 bg-neutral-bg text-heading text-xs font-bold rounded-lg"
              >
                {t("manageDoctors.button.cancel")}
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-primary text-white text-xs font-bold rounded-lg hover:bg-primary-hover"
              >
                {t("manageDoctors.button.save")}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

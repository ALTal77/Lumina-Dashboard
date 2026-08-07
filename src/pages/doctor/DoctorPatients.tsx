import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Plus } from "lucide-react";
import { useData } from "../../context/DataContext";
import { useAuth } from "../../context/AuthContext";
import { Modal } from "../../components/shared/Modal";
import { AppImage } from "../../components/shared/AppImage";
import { Doctor, Patient } from "../../types";

export const DoctorPatients: React.FC = () => {
  const { user } = useAuth();
  const { medicalRecords, addMedicalNote, patients } = useData();
  const { t } = useTranslation() as {
    t: (key: string, options?: any) => string;
  };

  const patientList = patients as unknown as Patient[];

  const [selectedPatientId, setSelectedPatientId] = useState<string>(
    patientList[0]?.id || "p-1",
  );
  const [showAddRecordModal, setShowAddRecordModal] = useState<boolean>(false);

  const [diagnosis, setDiagnosis] = useState<string>("");
  const [prescription, setPrescription] = useState<string>("");
  const [clinicalNotes, setClinicalNotes] = useState<string>("");

  const activePatient =
    patientList.find((p) => p.id === selectedPatientId) || patientList[0];
  const patientRecords = (medicalRecords || []).filter(
    (r: any) => r.patientId === selectedPatientId,
  );

  const handleCreateRecord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!diagnosis || !activePatient) return;

    addMedicalNote({
      patientId: activePatient.id,
      patientName: activePatient.name,
      doctorId: user.id,
      doctorName: user.name,
      doctorSpecialty:
        (user as unknown as Doctor).specialty || "General Practice",
      date: new Date().toISOString().split("T")[0],
      diagnosis,
      prescription,
      note: clinicalNotes,
    });

    setShowAddRecordModal(false);
    setDiagnosis("");
    setPrescription("");
    setClinicalNotes("");
  };

  return (
    <div className="space-y-6">
      <div className="bg-surface p-5 rounded-2xl border border-border shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-black text-heading tracking-tight">
            {t("doctorPatients.title")}
          </h1>
          <p className="text-xs text-muted mt-0.5">
            {t("doctorPatients.subtitle")}
          </p>
        </div>
        <button
          onClick={() => setShowAddRecordModal(true)}
          className="px-4 py-2 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl transition-colors shadow-xs flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>{t("doctorPatients.button.addRecord")}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Patient Selection List */}
        <div className="bg-surface rounded-2xl border border-border p-4 space-y-3">
          <h3 className="text-sm font-bold text-heading  ">
            {t("doctorPatients.selectPatient")}
          </h3>
          <div className="space-y-1 max-h-96 overflow-y-auto">
            {patientList.map((p) => (
              <div
                key={p.id}
                onClick={() => setSelectedPatientId(p.id)}
                className={`p-3 rounded-xl border text-xs cursor-pointer transition-colors flex items-center gap-3 ${
                  selectedPatientId === p.id
                    ? "bg-primary-tint border-primary font-bold text-heading"
                    : "bg-page border-border text-muted"
                }`}
              >
                <AppImage
                  src={p.avatar}
                  alt={p.name}
                  className="w-8 h-8 rounded-full object-cover"
                />
                <div>
                  <h4 className="font-bold" dir="auto">
                    {p.name}
                  </h4>
                  <p className="text-[10px] text-muted">{p.email}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Patient Records Detail View */}
        <div className="md:col-span-2 bg-surface rounded-2xl border border-border p-5 space-y-4">
          {activePatient && (
            <div className="pb-3 border-b border-border flex justify-between items-center">
              <div>
                <h2 className="text-base font-bold text-heading" dir="auto">
                  {activePatient.name}
                </h2>
              </div>
              <span className="text-xs font-mono font-bold text-muted">
                {t("doctorPatients.patientIdLabel", { id: activePatient.id })}
              </span>
            </div>
          )}

          <h3 className="text-sm font-bold text-heading">
            {t("doctorPatients.recordedConsultations", {
              count: patientRecords.length,
            })}
          </h3>

          {patientRecords.length === 0 ? (
            <p className="text-xs text-muted italic py-6 text-center">
              {t("doctorPatients.emptyRecords")}
            </p>
          ) : (
            <div className="space-y-3">
              {patientRecords.map((rec: any) => (
                <div
                  key={rec.id}
                  className="p-4 bg-page rounded-xl border border-border space-y-2 text-xs"
                >
                  <div className="flex justify-between items-center text-muted">
                    <span className="font-bold text-primary">
                      {rec.doctorName}
                    </span>
                    <span className="text-[10px]">{rec.date}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-muted uppercase font-semibold block">
                      {t("doctorPatients.record.diagnosis")}
                    </span>
                    <p className="font-bold text-heading">{rec.diagnosis}</p>
                  </div>
                  {rec.prescription && (
                    <div>
                      <span className="text-[10px] text-muted uppercase font-semibold block">
                        {t("doctorPatients.record.prescription")}
                      </span>
                      <p className="font-mono text-success">
                        {rec.prescription}
                      </p>
                    </div>
                  )}
                  {rec.note && (
                    <p
                      className="text-muted italic pt-1 border-t border-border"
                      dir="auto"
                    >
                      {t("doctorPatients.record.notes", { notes: rec.note })}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Record Modal */}
      {showAddRecordModal && (
        <Modal
          isOpen={showAddRecordModal}
          onClose={() => setShowAddRecordModal(false)}
          title={t("doctorPatients.modal.title", { name: activePatient?.name })}
        >
          <form onSubmit={handleCreateRecord} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-muted mb-1">
                {t("doctorPatients.modal.diagnosisLabel")}
              </label>
              <input
                type="text"
                required
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
                placeholder={t("doctorPatients.modal.diagnosisPlaceholder")}
                className="w-full p-2.5 text-xs bg-page border border-border rounded-xl text-heading text-left rtl:text-right placeholder:text-muted"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted mb-1">
                {t("doctorPatients.modal.prescriptionLabel")}
              </label>
              <textarea
                rows={2}
                value={prescription}
                onChange={(e) => setPrescription(e.target.value)}
                placeholder={t("doctorPatients.modal.prescriptionPlaceholder")}
                className="w-full p-2.5 text-xs bg-page border border-border rounded-xl text-heading text-left rtl:text-right placeholder:text-muted"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted mb-1">
                {t("doctorPatients.modal.notesLabel")}
              </label>
              <textarea
                rows={3}
                value={clinicalNotes}
                onChange={(e) => setClinicalNotes(e.target.value)}
                placeholder={t("doctorPatients.modal.notesPlaceholder")}
                className="w-full p-2.5 text-xs bg-page border border-border rounded-xl text-heading text-left rtl:text-right placeholder:text-muted"
              />
            </div>

            <div className="pt-3 border-t border-border flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAddRecordModal(false)}
                className="px-3 py-1.5 bg-neutral-bg text-muted text-xs font-bold rounded-lg"
              >
                {t("doctorPatients.button.cancel")}
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-primary text-white text-xs font-bold rounded-lg hover:bg-primary-hover"
              >
                {t("doctorPatients.button.saveRecord")}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

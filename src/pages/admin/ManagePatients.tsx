import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Trash2, AlertTriangle } from "lucide-react";
import { useData } from "../../context/DataContext";
import { Patient } from "../../types";
import { AppImage } from "../../components/shared/AppImage";
import { Modal } from "../../components/shared/Modal";

export const ManagePatients: React.FC = () => {
  const { t } = useTranslation() as {
    t: (key: string, options?: any) => string;
  };
  const { patients, togglePatientSuspension, deletePatient } = useData();

  const [deleteTarget, setDeleteTarget] = useState<Patient | null>(null);
  const [error, setError] = useState("");

  // Cast patients to Patient[] so TS recognizes the bloodGroup field
  const patientList = patients as unknown as Patient[];

  const handleToggleSuspend = async (p: Patient) => {
    setError("");
    try {
      await togglePatientSuspension(p.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update status");
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setError("");
    try {
      await deletePatient(String(deleteTarget.id));
      setDeleteTarget(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete patient");
      setDeleteTarget(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-surface p-5 rounded-2xl border border-border shadow-xs flex justify-between items-center">
        <div>
          <h1 className="text-xl font-black text-heading tracking-tight">
            {t("managePatients.title")}
          </h1>
          <p className="text-xs text-muted mt-0.5">
            {t("managePatients.subtitle")}
          </p>
        </div>
        <span className="text-xs font-bold px-3 py-1 bg-neutral-bg text-heading rounded-lg">
          {t("managePatients.registeredCount", { count: patientList.length })}
        </span>
      </div>

      <div className="bg-surface rounded-2xl border border-border shadow-xs overflow-hidden">
        {error && (
          <div className="p-3 bg-danger-bg text-danger border-b border-danger-bg text-xs font-bold flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" /> {error}
          </div>
        )}
        <div className="overflow-x-auto">
          <table className="w-full text-left rtl:text-right text-xs text-muted">
            <thead className="bg-page uppercase text-[10px] font-bold text-muted border-b border-border">
              <tr>
                <th className="p-3 rtl:text-right">
                  {t("managePatients.tableHeader.patient")}
                </th>
                <th className="p-3 rtl:text-right">
                  {t("managePatients.tableHeader.email")}
                </th>
                <th className="p-3 rtl:text-right">
                  {t("managePatients.tableHeader.phone")}
                </th>
                <th className="p-3 rtl:text-right">
                  {t("managePatients.tableHeader.status")}
                </th>
                <th className="p-3 text-right rtl:text-left">
                  {t("managePatients.tableHeader.action")}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {patientList.map((p) => (
                <tr key={p.id} className="hover:bg-neutral-bg/50">
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <AppImage
                        src={p.avatar}
                        alt={p.name}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <div>
                        <div className="font-bold text-heading">{p.name}</div>
                        <div className="text-[10px] text-muted">
                          {t("managePatients.idLabel", { id: p.id })}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="p-3 font-mono">{p.email}</td>
                  <td className="p-3">{p.phone}</td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        p.status === "suspended"
                          ? "bg-danger-bg text-danger"
                          : "bg-success-bg text-success"
                      }`}
                    >
                      {p.status === "suspended"
                        ? t("managePatients.status.suspended")
                        : t("managePatients.status.active")}
                    </span>
                  </td>
                  <td className="p-3 text-right rtl:text-left">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleToggleSuspend(p)}
                        className={`px-3 py-1 rounded text-xs font-bold transition-colors ${
                          p.status === "suspended"
                            ? "bg-success text-white hover:brightness-90"
                            : "bg-danger-bg text-danger hover:bg-danger-bg border border-danger-bg"
                        }`}
                      >
                        {p.status === "suspended"
                          ? t("managePatients.button.reactivate")
                          : t("managePatients.button.suspend")}
                      </button>
                      <button
                        onClick={() => setDeleteTarget(p)}
                        className="p-1.5 text-muted hover:text-danger hover:bg-danger-bg rounded-lg"
                        title={t("managePatients.button.delete")}
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

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <Modal
          isOpen={!!deleteTarget}
          onClose={() => setDeleteTarget(null)}
          title={t("managePatients.deleteConfirmation.title")}
        >
          <div className="space-y-4">
            {error && (
              <div className="p-3 bg-danger-bg text-danger border border-danger-bg rounded-xl text-xs font-bold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" /> {error}
              </div>
            )}
            <p className="text-xs text-muted">
              {t("managePatients.deleteConfirmation.message", { name: deleteTarget.name })}
            </p>
            <div className="pt-3 border-t border-border flex justify-end gap-2">
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-3 py-1.5 bg-neutral-bg text-heading text-xs font-bold rounded-lg"
              >
                {t("managePatients.button.cancel")}
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-1.5 bg-danger text-white text-xs font-bold rounded-lg hover:brightness-90"
              >
                {t("managePatients.deleteConfirmation.confirm")}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

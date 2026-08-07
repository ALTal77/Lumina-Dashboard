import React from "react";
import { useTranslation } from "react-i18next";
import { useData } from "../../context/DataContext";
import { Patient } from "../../types";
import { AppImage } from "../../components/shared/AppImage";

export const ManagePatients: React.FC = () => {
  const { t } = useTranslation() as {
    t: (key: string, options?: any) => string;
  };
  const { patients, togglePatientSuspension } = useData();

  // Cast patients to Patient[] so TS recognizes the bloodGroup field
  const patientList = patients as unknown as Patient[];

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
                    <button
                      onClick={() => togglePatientSuspension(p.id)}
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
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

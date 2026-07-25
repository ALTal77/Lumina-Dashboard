import React from "react";
import { useTranslation } from "react-i18next";
import { Download } from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { useData } from "../../context/DataContext";

export const RevenuePayments: React.FC = () => {
  const { t } = useTranslation() as {
    t: (key: string, options?: any) => string;
  };
  const { payments } = useData();

  const totalRevenue = payments.reduce((acc, p) => acc + p.amount, 0);

  const revenueData = [
    { month: "Jan", revenue: 2400 },
    { month: "Feb", revenue: 3200 },
    { month: "Mar", revenue: 2800 },
    { month: "Apr", revenue: 3900 },
    { month: "May", revenue: 4500 },
    { month: "Jun", revenue: 5200 },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-surface p-5 rounded-2xl border border-border shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-black text-heading tracking-tight">
            {t("revenuePayments.title")}
          </h1>
          <p className="text-xs text-muted mt-0.5">
            {t("revenuePayments.subtitle")}
          </p>
        </div>
        <div className="text-right rtl:text-left">
          <span className="text-[10px] text-muted uppercase font-bold block">
            {t("revenuePayments.grossRevenue")}
          </span>
          <span className="text-2xl font-black text-success">
            ${totalRevenue}.00
          </span>
        </div>
      </div>

      {/* Revenue Chart */}
      <div className="bg-surface rounded-2xl border border-border p-5 space-y-3">
        <h3 className="text-xs font-bold text-heading uppercase tracking-wider">
          {t("revenuePayments.chart.monthlyRevenue")}
        </h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#334155"
                opacity={0.2}
              />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#10b981"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorRev)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Payment Transactions Table */}
      <div className="bg-surface rounded-2xl border border-border shadow-xs overflow-hidden">
        <div className="p-4 border-b border-border flex justify-between items-center">
          <h3 className="text-xs font-bold text-heading uppercase tracking-wider">
            {t("revenuePayments.table.title", { count: payments.length })}
          </h3>
          <button
            onClick={() => window.print()}
            className="px-3 py-1 bg-neutral-bg text-heading text-xs font-bold rounded-lg flex items-center gap-1"
          >
            <Download className="w-3.5 h-3.5" />{" "}
            {t("revenuePayments.button.exportLedger")}
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left rtl:text-right text-xs text-muted">
            <thead className="bg-page uppercase text-[10px] font-bold text-muted border-b border-border">
              <tr>
                <th className="p-3 rtl:text-right">
                  {t("revenuePayments.tableHeader.transactionId")}
                </th>
                <th className="p-3 rtl:text-right">
                  {t("revenuePayments.tableHeader.patient")}
                </th>
                <th className="p-3 rtl:text-right">
                  {t("revenuePayments.tableHeader.doctor")}
                </th>
                <th className="p-3 rtl:text-right">
                  {t("revenuePayments.tableHeader.method")}
                </th>
                <th className="p-3 rtl:text-right">
                  {t("revenuePayments.tableHeader.date")}
                </th>
                <th className="p-3 text-right rtl:text-left">
                  {t("revenuePayments.tableHeader.amount")}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {payments.map((p) => (
                <tr
                  key={p.id}
                  className="hover:bg-neutral-bg/50"
                >
                  <td className="p-3 font-mono font-bold text-heading">
                    {p.id}
                  </td>
                  <td className="p-3 font-bold">{p.patientName}</td>
                  <td className="p-3">{p.doctorName}</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded bg-neutral-bg font-semibold text-[10px]">
                      {p.paymentMethod}
                    </span>
                  </td>
                  <td className="p-3 text-muted">{p.createdAt}</td>
                  <td className="p-3 text-right rtl:text-left font-black text-success">
                    ${p.amount}.00
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

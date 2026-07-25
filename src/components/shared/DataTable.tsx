import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { ChevronLeft, ChevronRight, ArrowUpDown, Search } from "lucide-react";

export interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => React.ReactNode;
  sortable?: boolean;
  className?: string;
}

interface DataTableProps<T> {
  id?: string;
  data: T[];
  columns: Column<T>[];
  pageSize?: number;
  searchPlaceholder?: string;
  searchField?: (item: T) => string;
  actions?: (item: T) => React.ReactNode;
  emptyMessage?: string;
  headerRight?: React.ReactNode;
}

export function DataTable<T extends object>({
  id,
  data,
  columns,
  pageSize = 7,
  searchPlaceholder,
  searchField,
  actions,
  emptyMessage,
  headerRight,
}: DataTableProps<T>) {
  const { t } = useTranslation() as {
    t: (key: string, options?: any) => string;
  };
  const resolvedSearchPlaceholder =
    searchPlaceholder ?? t("dataTable.search.placeholder");
  const resolvedEmptyMessage = emptyMessage ?? t("dataTable.empty.message");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const filteredData = data.filter((item) => {
    if (!searchTerm) return true;
    if (searchField) {
      return searchField(item).toLowerCase().includes(searchTerm.toLowerCase());
    }
    return JSON.stringify(item)
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
  });

  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortKey) return 0;
    const valA = (a as Record<string, unknown>)[sortKey];
    const valB = (b as Record<string, unknown>)[sortKey];

    if (valA === valB) return 0;
    if (valA === undefined || valA === null) return 1;
    if (valB === undefined || valB === null) return -1;

    const res = (valA as any) > (valB as any) ? 1 : -1;
    return sortDirection === "asc" ? res : -res;
  });

  const totalPages = Math.ceil(sortedData.length / pageSize) || 1;
  const paginatedData = sortedData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDirection("asc");
    }
  };

  return (
    <div
      id={id}
      className="bg-surface rounded-[2rem] border border-border shadow-premium overflow-hidden flex flex-col"
    >
      <div className="p-4 border-b border-border bg-page flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted rtl:right-3 rtl:left-auto" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            placeholder={resolvedSearchPlaceholder}
            className="w-full pl-9 pr-3 rtl:pr-9 rtl:pl-3 py-1.5 text-xs bg-page border border-border text-heading placeholder-muted rounded-[16px] focus:outline-none focus:border-primary focus:shadow-[0_0_0_2px_rgba(13,148,136,0.1)] font-bold text-sm"
          />
        </div>
        {headerRight && (
          <div className="flex items-center gap-2">{headerRight}</div>
        )}
      </div>

      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left rtl:text-right border-collapse">
          <thead className="bg-page text-[10px] font-bold text-muted uppercase tracking-[0.2em] border-b border-border">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`px-4 py-3 font-semibold ${col.className || ""}`}
                >
                  {col.sortable ? (
                    <button
                      onClick={() => handleSort(col.key)}
                      className="inline-flex items-center gap-1 hover:text-heading transition-colors"
                    >
                      {col.header}
                      <ArrowUpDown className="w-3 h-3 text-muted" />
                    </button>
                  ) : (
                    col.header
                  )}
                </th>
              ))}
              {actions && (
                <th className="px-4 py-3 text-right rtl:text-left">
                  {t("dataTable.actions.header")}
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-border text-xs text-muted">
            {paginatedData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (actions ? 1 : 0)}
                  className="px-4 py-8 text-center text-muted italic"
                >
                  {resolvedEmptyMessage}
                </td>
              </tr>
            ) : (
              paginatedData.map((item, idx) => (
                <tr key={idx} className="hover:bg-primary-tint transition-colors">
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={`px-4 py-3 ${col.className || ""}`}
                    >
                      {col.render
                        ? col.render(item)
                        : (item as Record<string, unknown>)[col.key] !==
                            undefined
                          ? String((item as Record<string, unknown>)[col.key])
                          : "-"}
                    </td>
                  ))}
                  {actions && (
                    <td className="px-4 py-3 text-right rtl:text-left">
                      {actions(item)}
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="p-3 border-t border-border bg-page flex items-center justify-between text-xs text-muted">
        <div>
          {t("dataTable.pagination.showing")}{" "}
          <span className="font-semibold text-heading">
            {filteredData.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}
          </span>{" "}
          {t("dataTable.pagination.to")}{" "}
          <span className="font-semibold text-heading">
            {Math.min(currentPage * pageSize, filteredData.length)}
          </span>{" "}
          {t("dataTable.pagination.of")}{" "}
          <span className="font-semibold text-heading">
            {filteredData.length}
          </span>{" "}
          {t("dataTable.pagination.entries")}
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-1 rounded-full border border-border bg-surface text-heading hover:bg-primary-tint hover:border-primary-tint disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4 rtl:rotate-180" />
          </button>
          <span className="px-2 font-medium text-heading">
            {currentPage} / {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="p-1 rounded-full border border-border bg-surface text-heading hover:bg-primary-tint hover:border-primary-tint disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="w-4 h-4 rtl:rotate-180" />
          </button>
        </div>
      </div>
    </div>
  );
}

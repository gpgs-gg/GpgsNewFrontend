import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Eye,
  Pencil,
  Trash2,
  Receipt,
  MapPin,
  BedDouble,
  Phone,
  MessageCircle,
  ClipboardList,
  ChevronRight,
  X,
  CalendarDays,
} from "lucide-react";

import { formatDate, formatDateAndTime } from "../../utils/dateFormatter";

import NoDataFound from "../common/NoDataFound";

const PropertyMobileCards = ({
  properties = [],
  isLoading = false,
  isAdmin = false,
  selectedProperties = [],
  onSelect,
  showActions = false,
  canViewProperty = false,
  canEditProperty = false,
  canDeleteProperty = false,
  deleting = false,
  onDelete,
}) => {
  const [workLogsProperty, setWorkLogsProperty] = useState(null);

  const detailLabel =
    "text-[10px] font-semibold uppercase tracking-[0.08em] text-neutral-500";

  const detailValue =
    "mt-1.5 break-words text-[12px] font-medium leading-5 text-neutral-800";

  const actionButton =
    "inline-flex items-center justify-center rounded-lg border border-neutral-200 bg-white p-2.5 text-neutral-700 transition-colors hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-50";

  if (isLoading) {
    return (
      <div className="space-y-3 bg-neutral-50/60 p-3">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="h-44 animate-pulse rounded-xl border border-neutral-200 bg-white"
          />
        ))}
      </div>
    );
  }

  if (!properties.length) {
    return (
      <div className="p-4">
        <NoDataFound
          title="No Properties Found"
          description="Try searching different keywords"
        />
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3 bg-neutral-50/60 p-3">
        {properties.map((item) => {
          const sortedLogs = [...(item.workLogs || [])].sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
          );

          const latestLog = sortedLogs[0];

          const contact = String(item.internet?.contactNo1 || "").trim();

          const whatsappNumber = contact.replace(/\D/g, "").replace(/^91/, "");

          return (
            <article
              key={item._id}
              className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)] transition-shadow hover:shadow-sm"
            >
              {/* Property header */}
              <div className="flex items-start gap-3 px-4 py-3.5">
                {isAdmin && (
                  <input
                    type="checkbox"
                    className="mt-1 h-4 w-4 shrink-0 cursor-pointer accent-neutral-900"
                    checked={selectedProperties.includes(item._id)}
                    onChange={() => onSelect?.(item._id)}
                    aria-label={`Select ${item.propertyCode}`}
                  />
                )}

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="break-words text-sm font-bold tracking-tight text-neutral-950">
                      {item.propertyCode || "Property"}
                    </h3>

                   <span
  className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${
    item.status === "Active"
      ? "border-green-200 bg-green-50 text-green-700"
      : "border-neutral-200 bg-neutral-50 text-neutral-600"
  }`}
>
  <span
    className={`h-1.5 w-1.5 rounded-full ${
      item.status === "Active"
        ? "bg-green-600"
        : "bg-neutral-400"
    }`}
  />
  {item.status || "N/A"}
</span>
                  </div>

                  <p className="mt-1.5 flex items-start gap-1.5 text-xs leading-5 text-neutral-500">
                    <MapPin
                      size={14}
                      className="mt-0.5 shrink-0 text-neutral-400"
                    />
                    <span className="break-words">
                      {item.propertyLocation || "Location not available"}
                    </span>
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-2 rounded-lg border border-neutral-200 bg-neutral-50 px-2.5 py-2">
                  <BedDouble size={15} className="text-neutral-600" />
                  <div>
                    <p className="text-sm font-bold leading-none text-neutral-900">
                      {item.bedCount ?? 0}
                    </p>
                    {/* <p className="mt-1 text-[9px] font-medium uppercase tracking-wide text-neutral-500">
                      Beds
                    </p> */}
                  </div>
                </div>
              </div>

              {/* Property details */}
              <div className="border-y border-neutral-200 bg-neutral-50/50 px-4 py-3.5">
                <div className="grid grid-cols-2 gap-x-4 gap-y-4">
                  <div className="min-w-0">
                    <p className={detailLabel}>Consumer ID</p>
                    <p className={detailValue}>
                      {item.internet?.consumerId || "—"}
                    </p>
                  </div>

                  <div className="min-w-0">
                    <p className={detailLabel}>Internet Contact</p>

                    {contact ? (
                      <div className="mt-1.5 flex min-w-0 items-center gap-1.5">
                        <span className="min-w-0 truncate text-xs font-medium text-neutral-800">
                          {contact}
                        </span>

                        <a
                          href={`tel:${contact}`}
                          aria-label="Call internet vendor"
                          className="shrink-0 rounded-md border border-neutral-200 bg-white p-1.5 text-neutral-700 transition-colors hover:bg-neutral-100"
                        >
                          <Phone size={13} />
                        </a>

                        <a
                          href={`https://wa.me/${whatsappNumber}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label="WhatsApp internet vendor"
                          className="shrink-0 rounded-md border border-neutral-200 bg-white p-1.5 text-neutral-700 transition-colors hover:bg-neutral-100"
                        >
                          <MessageCircle size={13} />
                        </a>
                      </div>
                    ) : (
                      <p className={detailValue}>—</p>
                    )}
                  </div>

                  <div className="min-w-0">
                    <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-neutral-500">
                      <CalendarDays size={12} />
                      Start Date
                    </p>
                    <p className={detailValue}>
                      {item.agreement?.propertyStartDate
                        ? formatDate(item.agreement.propertyStartDate)
                        : "—"}
                    </p>
                  </div>

                  <div className="min-w-0">
                    <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-neutral-500">
                      <CalendarDays size={12} />
                      End Date
                    </p>
                    <p className={detailValue}>
                      {item.agreement?.propertyEndDate
                        ? formatDate(item.agreement.propertyEndDate)
                        : "—"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Work logs preview and inline details */}
              <div className="border-t border-neutral-200">
                <button
                  type="button"
                  onClick={() =>
                    setWorkLogsProperty(
                      workLogsProperty?._id === item._id ? null : item,
                    )
                  }
                  className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors hover:bg-neutral-50"
                  aria-expanded={workLogsProperty?._id === item._id}
                >
                  <div className="flex min-w-0 items-center gap-2.5">
                    <ClipboardList
                      size={16}
                      className="shrink-0 text-neutral-600"
                    />

                    <span className="text-xs font-semibold text-neutral-800">
                      Work Logs
                    </span>

                    <span className="rounded-md border border-neutral-200 bg-neutral-100 px-1.5 py-0.5 text-[10px] font-semibold text-neutral-600">
                      {sortedLogs.length}
                    </span>
                  </div>

                  <span className="flex shrink-0 items-center gap-1 text-[11px] font-semibold text-neutral-600">
                    {workLogsProperty?._id === item._id
                      ? "Hide Less"
                      : "View Logs"}
                    <ChevronRight
                      size={14}
                      className={`transition-transform ${
                        workLogsProperty?._id === item._id ? "rotate-90" : ""
                      }`}
                    />
                  </span>
                </button>

                {workLogsProperty?._id === item._id && (
                  <div className="border-t border-neutral-200 bg-neutral-50 px-4 py-3">
                    {sortedLogs.length > 0 ? (
                      <div className="space-y-0">
                        {sortedLogs.map((log, index) => (
                          <div
                            key={log._id || index}
                            className={`py-3 ${
                              index !== 0 ? "border-t border-neutral-200" : ""
                            }`}
                          >
                            <div className="flex flex-wrap items-start justify-between gap-2">
                              <p className="text-xs font-semibold text-neutral-900">
                                {log.createdBy || "Unknown"}
                              </p>

                              <p className="text-[10px] text-neutral-500">
                                {formatDateAndTime(log.createdAt)}
                              </p>
                            </div>

                            <p className="mt-1.5 whitespace-pre-wrap break-words text-xs leading-5 text-neutral-600">
                              {log.message || "No message available"}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="py-2 text-xs text-neutral-500">
                        No work logs added.
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex flex-wrap items-center gap-2 border-t border-neutral-200 bg-neutral-50/50 px-4 py-3">
                <Link
                  to={`/properties/expense/${item._id}`}
                  className="inline-flex min-w-0 flex-1 items-center justify-center gap-2 rounded-lg border border-neutral-300 bg-white px-3 py-2.5 text-xs font-semibold text-neutral-800 transition-colors hover:bg-neutral-100"
                >
                  <Receipt size={15} />
                  Expenses
                </Link>

                {showActions && (
                  <>
                    {canViewProperty && (
                      <Link
                        to={`/properties/edit/${item._id}`}
                        aria-label="View property"
                        title="View property"
                        className={actionButton}
                      >
                        <Eye size={16} />
                      </Link>
                    )}

                    {canEditProperty && (
                      <Link
                        to={`/properties/edit/${item._id}`}
                        aria-label="Edit property"
                        title="Edit property"
                        className={actionButton}
                      >
                        <Pencil size={16} />
                      </Link>
                    )}

                    {canDeleteProperty && (
                      <button
                        type="button"
                        aria-label="Delete property"
                        title="Delete property"
                        disabled={deleting}
                        onClick={() => onDelete?.(item._id)}
                        className={actionButton}
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </>
                )}
              </div>
            </article>
          );
        })}
      </div>

    
    </>
  );
};

export default PropertyMobileCards;
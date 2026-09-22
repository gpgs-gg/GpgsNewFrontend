import { Eye, Pencil, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";

import { formatDate, formatDateAndTime } from "../../utils/dateFormatter";

import { TableFilePreview } from "../../components/common/FilePreview";

const priorityColors = {
  Critical: "text-red-700",
  High: "text-red-500",
  Medium: "text-yellow-500",
  Low: "text-green-700",
};

const statusColors = {
  Open: "bg-red-100 text-red-700",
  Acknowledged: "bg-blue-100 text-blue-700",
  "In Progress": "bg-yellow-100 text-yellow-700",
  "On Hold": "bg-orange-100 text-orange-700",
  Resolved: "bg-green-100 text-green-700",
  Closed: "bg-gray-200 text-gray-700",
  Cancelled: "bg-pink-100 text-pink-700",
  ReOpen: "bg-purple-100 text-purple-700",
};

const TicketMobileCard = ({
  item,
  selected,
  onSelect,
  canView,
  canEdit,
  canDelete,
  onDelete,
  filters,
  search,
}) => {
  return (
    <article className="w-full max-w-full overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
      <div className="p-4 space-y-4">
        {/* ============================================================
            HEADER
        ============================================================ */}
        <div className="flex min-w-0 items-center justify-between gap-3">
          {/* CHECKBOX + TICKET ID */}
          <div className="flex min-w-0 items-center gap-2">
            <input
              type="checkbox"
              checked={selected}
              onChange={onSelect}
              aria-label={`Select ${item.ticketId}`}
              className="h-4 w-4 shrink-0 cursor-pointer rounded border-gray-300"
            />

            <h3 className="min-w-0 break-all text-lg font-semibold">
              Ticket ID: {item.ticketId || "-"}
            </h3>
          </div>

          {/* ACTIONS */}
          <div className="flex shrink-0 items-center gap-3">
            {/* VIEW */}
            {canView && (
              <Link
                to={`/tickets/view/${item._id}`}
                aria-label="View Ticket"
                title="View Ticket"
                className="text-red-600 hover:text-red-900"
              >
                <Eye size={18} strokeWidth={2.5} />
              </Link>
            )}

            {/* EDIT */}
            {canEdit && (
              <Link
                to={`/tickets/edit/${item._id}`}
                state={{
                  filters,
                  search,
                }}
                aria-label="Edit Ticket"
                title="Edit Ticket"
                className="text-green-600 hover:text-green-900"
              >
                <Pencil size={17} strokeWidth={2.5} />
              </Link>
            )}

            {/* DELETE */}
            {canDelete && (
              <button
                type="button"
                onClick={onDelete}
                aria-label="Delete Ticket"
                title="Delete Ticket"
                className="text-red-600 hover:text-red-900"
              >
                <Trash2 size={17} strokeWidth={2.5} />
              </button>
            )}
          </div>
        </div>

        {/* ============================================================
            DATE CREATED
        ============================================================ */}
        <MobileTicketField
          label="Date Created"
          value={
            item.dateCreated
              ? formatDateAndTime(new Date(item.dateCreated))
              : "-"
          }
        />

        {/* ============================================================
            PROPERTY
        ============================================================ */}
        <MobileTicketField
          label="Property Code"
          value={item.propertyCode || item.propertyId?.propertyCode}
        />

        {/* ============================================================
            TITLE
        ============================================================ */}
        <div>
          <span className="font-semibold">Title:</span>

          <div className="break-words font-medium">
            {item.title
              ? item.title.length > 25
                ? `${item.title.substring(0, 25)}...`
                : item.title
              : "N/A"}
          </div>

          <div className="break-words text-sm text-gray-500">
            {item.description
              ? item.description.length > 60
                ? `${item.description.substring(0, 60)}...`
                : item.description
              : "No Description"}
          </div>
        </div>

        {/* ============================================================
            STATUS
        ============================================================ */}
        <div>
          <span className="font-semibold">Status:</span>{" "}
          <span
            className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
              statusColors[item.status] || "bg-gray-100 text-gray-700"
            }`}
          >
            {item.status || "Unknown"}
          </span>
        </div>

        {/* ============================================================
            ATTACHMENT
        ============================================================ */}
        <div>
          <span className="font-semibold">Attachment:</span>

          <div className="mt-1 max-w-full overflow-hidden">
            {item.attachment ? (
              <TableFilePreview files={item.attachment} />
            ) : (
              <p className="text-sm text-gray-500">No Attachments</p>
            )}
          </div>
        </div>

        {/* ============================================================
            OTHER FIELDS
        ============================================================ */}
        <MobileTicketField label="Room No" value={item.roomNo} />

        <MobileTicketField label="Bed No" value={item.bedNo} />

        <MobileTicketField
          label="Customer Impacted"
          value={item.customerImpacted}
        />

        <MobileTicketField label="Escalated" value={item.escalated} />

        <MobileTicketField
          label="Target Date"
          value={item.targetDate ? formatDate(item.targetDate) : "-"}
        />

        <MobileTicketField label="Category" value={item.category} />

        <MobileTicketField
          label="Priority"
          value={item.priority}
          valueClassName={priorityColors[item.priority] || ""}
        />

        <MobileTicketField label="Department" value={item.department} />

        <MobileTicketField label="Manager" value={item.manager} />

        <MobileTicketField label="Ticket Manager" value={item.ticketManager} />

        <MobileTicketField label="Assignee" value={item.assignee} />

        <MobileTicketField
          label="Location"
          value={item.propertyLocation || item.propertyId?.propertyLocation}
        />

        <MobileTicketField
          label="Late Acknowledged"
          value={item.lateAcknowledged}
        />

        <MobileTicketField label="Late Resolved" value={item.lateResolved} />

        {/* ============================================================
            CREATED BY
        ============================================================ */}
        <MobileTicketField
          label="Created By"
          value={
            item.createdByName
              ? `${item.createdByName} (${item.createdById || "-"})`
              : "-"
          }
        />

        {/* ============================================================
            UPDATED BY
        ============================================================ */}
        <MobileTicketField
          label="Updated By"
          value={
            item.updatedByName
              ? `${item.updatedByName} (${item.updatedById || "-"})`
              : "-"
          }
        />

        {/* ============================================================
            UPDATED DATE
        ============================================================ */}
        <MobileTicketField label="Updated Date" value={item.updatedDateTime} />

        {/* ============================================================
            WORK LOGS
        ============================================================ */}
        <div>
          <span className="font-semibold">Work Logs:</span>

          <div className="mt-1 max-h-32 overflow-y-auto rounded border p-2 text-sm">
            {item.workLogs?.length > 0 ? (
              [...item.workLogs]
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                .map((log, index) => (
                  <div key={log._id || index} className="mb-3 last:mb-0">
                    <div className="text-gray-700">
                      {log.createdBy || "System"}
                      <span className="mx-1">•</span>
                      {log.createdAt ? formatDateAndTime(log.createdAt) : "-"}
                    </div>

                    <div className="mt-1 break-words font-medium">
                      {log.message}
                    </div>
                  </div>
                ))
            ) : (
              <span className="text-gray-500">No WorkLogs</span>
            )}
          </div>
        </div>
      </div>
    </article>
  );
};

/* ================================================================
   MOBILE FIELD
================================================================ */

const MobileTicketField = ({ label, value, valueClassName = "" }) => {
  return (
    <div className="break-words">
      <span className="font-semibold">{label}:</span>{" "}
      <span className={`font-normal break-words ${valueClassName}`}>
        {value || "N/A"}
      </span>
    </div>
  );
};

export default TicketMobileCard;

// import React, { useMemo } from "react";
// import { Eye, Pencil, Trash2 } from "lucide-react";
// import { Link } from "react-router-dom";

// import MobileDataCard from "../common/MobileDataCard";
// import { MobileCardField, MobileCardGrid } from "../common/MobileCardField";

// import { formatDate, formatDateAndTime } from "../../utils/dateFormatter";

// import { TableFilePreview } from "../common/FilePreview";

// const priorityColors = {
//   Critical: "text-red-700",
//   High: "text-red-500",
//   Medium: "text-yellow-500",
//   Low: "text-green-700",
// };

// const statusColors = {
//   Open: "bg-red-100 text-red-700",
//   Acknowledged: "bg-blue-100 text-blue-700",
//   "In Progress": "bg-yellow-100 text-yellow-700",
//   "On Hold": "bg-orange-100 text-orange-700",
//   Resolved: "bg-green-100 text-green-700",
//   Closed: "bg-gray-200 text-gray-700",
//   Cancelled: "bg-pink-100 text-pink-700",
//   ReOpen: "bg-purple-100 text-purple-700",
// };

// const TicketMobileCard = ({
//   item,
//   selected,
//   onSelect,
//   canView,
//   canEdit,
//   canDelete,
//   onDelete,
//   filters,
//   search,
// }) => {
//   // ============================================================
//   // SORT WORK LOGS
//   // ============================================================

//   const sortedWorkLogs = useMemo(() => {
//     return [...(item.workLogs || [])].sort(
//       (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0),
//     );
//   }, [item.workLogs]);

//   const latestWorkLog = sortedWorkLogs[0];

//   // ============================================================
//   // SAFE DATE FORMATTERS
//   // ============================================================

//   const createdDate = item.dateCreated
//     ? formatDateAndTime(new Date(item.dateCreated))
//     : "-";

//   const targetDate = item.targetDate ? formatDate(item.targetDate) : "-";

//   return (
//     <MobileDataCard
//       title={item.ticketId || "No Ticket ID"}
//       subtitle={
//         <>
//           <span>{item.propertyId?.propertyCode || "No Property"}</span>

//           <span className="mx-1">•</span>

//           <span>{createdDate}</span>
//         </>
//       }
//       badge={item.status || "Unknown"}
//       badgeClassName={statusColors[item.status] || "bg-gray-100 text-gray-700"}
//       selected={selected}
//       onSelect={onSelect}
//       headerActions={
//         <div className="flex items-center gap-1.5">
//           {/* VIEW */}
//           {canView && (
//             <Link
//               to={`/tickets/view/${item._id}`}
//               aria-label="View Ticket"
//               title="View Ticket"
//               className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-blue-100 bg-blue-50 text-blue-600 transition hover:bg-blue-100 active:scale-95"
//             >
//               <Eye size={15} />
//             </Link>
//           )}

//           {/* EDIT */}
//           {canEdit && (
//             <Link
//               to={`/tickets/edit/${item._id}`}
//               state={{
//                 filters,
//                 search,
//               }}
//               aria-label="Edit Ticket"
//               title="Edit Ticket"
//               className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-amber-100 bg-amber-50 text-amber-600 transition hover:bg-amber-100 active:scale-95"
//             >
//               <Pencil size={15} />
//             </Link>
//           )}

//           {/* DELETE */}
//           {canDelete && (
//             <button
//               type="button"
//               onClick={onDelete}
//               aria-label="Delete Ticket"
//               title="Delete Ticket"
//               className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-red-100 bg-red-50 text-red-600 transition hover:bg-red-100 active:scale-95"
//             >
//               <Trash2 size={15} />
//             </button>
//           )}
//         </div>
//       }
//       footer={
//         <div className="space-y-5">
//           {/* ========================================================
//               TICKET DETAILS
//           ======================================================== */}

//           <section>
//             <p className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
//               Ticket Details
//             </p>

//             <MobileCardGrid>
//               <MobileCardField label="Category" value={item.category} />

//               <MobileCardField label="Department" value={item.department} />

//               <MobileCardField label="Manager" value={item.manager} />

//               <MobileCardField
//                 label="Ticket Manager"
//                 value={item.ticketManager}
//               />

//               <MobileCardField label="Assignee" value={item.assignee} />

//               <MobileCardField label="Bed No" value={item.bedNo} />

//               <MobileCardField label="Room No" value={item.roomNo} />

//               <MobileCardField
//                 label="Customer Impacted"
//                 value={item.customerImpacted}
//               />

//               <MobileCardField label="Escalated" value={item.escalated} />

//               <MobileCardField label="Target Date" value={targetDate} />

//               <MobileCardField
//                 label="Location"
//                 value={item.propertyId?.propertyLocation}
//               />

//               <MobileCardField
//                 label="Late Acknowledged"
//                 value={item.lateAcknowledged}
//               />

//               <MobileCardField
//                 label="Late Resolved"
//                 value={item.lateResolved}
//               />

//               <MobileCardField
//                 label="Priority"
//                 value={item.priority}
//                 className={priorityColors[item.priority] || ""}
//               />
//             </MobileCardGrid>
//           </section>

//           {/* ========================================================
//               AUDIT INFORMATION
//           ======================================================== */}

//           <section className="border-t border-gray-100 pt-4">
//             <p className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
//               Audit Information
//             </p>

//             <MobileCardGrid>
//               <MobileCardField
//                 label="Created By"
//                 value={
//                   item.createdByName
//                     ? `${item.createdByName} (${item.createdById || "-"})`
//                     : "-"
//                 }
//               />

//               <MobileCardField
//                 label="Updated By"
//                 value={
//                   item.updatedByName
//                     ? `${item.updatedByName} (${item.updatedById || "-"})`
//                     : "-"
//                 }
//               />

//               <MobileCardField
//                 label="Updated Date"
//                 value={item.updatedDateTime || "-"}
//               />
//             </MobileCardGrid>
//           </section>

//           {/* ========================================================
//               DESCRIPTION
//           ======================================================== */}

//           <section className="border-t border-gray-100 pt-4">
//             <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
//               Description
//             </p>

//             <div className="rounded-xl border border-gray-100 bg-white p-3">
//               <p className="whitespace-pre-wrap break-words text-sm leading-5 text-gray-700">
//                 {item.description || "No Description"}
//               </p>
//             </div>
//           </section>

//           {/* ========================================================
//               ATTACHMENTS
//           ======================================================== */}

//           {item.attachment && (
//             <section className="border-t border-gray-100 pt-4">
//               <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
//                 Attachments
//               </p>

//               <div className="overflow-hidden rounded-xl border border-gray-100 bg-white p-3">
//                 <TableFilePreview files={item.attachment} />
//               </div>
//             </section>
//           )}

//           {/* ========================================================
//               WORK LOGS
//           ======================================================== */}

//           <section className="border-t border-gray-100 pt-4">
//             <div className="mb-3 flex items-center justify-between">
//               <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
//                 Work Logs
//               </p>

//               <span className="rounded-full bg-gray-100 px-2 py-1 text-[10px] font-medium text-gray-500">
//                 {sortedWorkLogs.length}{" "}
//                 {sortedWorkLogs.length === 1 ? "entry" : "entries"}
//               </span>
//             </div>

//             {sortedWorkLogs.length > 0 ? (
//               <div className="space-y-2.5">
//                 {sortedWorkLogs.map((log, index) => (
//                   <div
//                     key={log._id || index}
//                     className="rounded-xl border border-gray-100 bg-white p-3"
//                   >
//                     <div className="flex items-start justify-between gap-3">
//                       <span className="min-w-0 truncate text-xs font-semibold text-gray-700">
//                         {log.createdBy || "System"}
//                       </span>

//                       <span className="shrink-0 whitespace-nowrap text-[10px] text-gray-400">
//                         {log.createdAt ? formatDateAndTime(log.createdAt) : "-"}
//                       </span>
//                     </div>

//                     <p className="mt-1.5 whitespace-pre-line break-words text-xs leading-5 text-gray-600">
//                       {log.message || "-"}
//                     </p>
//                   </div>
//                 ))}
//               </div>
//             ) : (
//               <div className="rounded-xl border border-gray-100 bg-white p-3">
//                 <span className="text-xs text-gray-500">
//                   No worklogs available
//                 </span>
//               </div>
//             )}
//           </section>
//         </div>
//       }
//     >
//       {/* ============================================================
//           TICKET SUMMARY
//       ============================================================ */}

//       <div className="space-y-4">
//         {/* ==========================================================
//             TITLE
//         ========================================================== */}

//         <div className="min-w-0">
//           <p className="break-words text-sm font-semibold leading-5 text-gray-900">
//             {item.title || "Untitled Ticket"}
//           </p>

//           {item.description && (
//             <p className="mt-1.5 line-clamp-2 break-words text-xs leading-5 text-gray-500">
//               {item.description}
//             </p>
//           )}
//         </div>

//         {/* ==========================================================
//             PROPERTY + PRIORITY
//         ========================================================== */}

//         <div className="grid grid-cols-2 gap-2.5">
//           <div className="min-w-0 rounded-xl border border-gray-100 bg-gray-50 px-3 py-2.5">
//             <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">
//               Property
//             </p>

//             <p className="mt-1 truncate text-sm font-medium text-gray-800">
//               {item.propertyId?.propertyCode || "-"}
//             </p>
//           </div>

//           <div className="min-w-0 rounded-xl border border-gray-100 bg-gray-50 px-3 py-2.5">
//             <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">
//               Priority
//             </p>

//             <p
//               className={`mt-1 truncate text-sm font-semibold ${
//                 priorityColors[item.priority] || "text-gray-700"
//               }`}
//             >
//               {item.priority || "-"}
//             </p>
//           </div>
//         </div>

//         {/* ==========================================================
//             LATEST ACTIVITY
//         ========================================================== */}

//         {latestWorkLog && (
//           <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
//             <div className="flex items-center justify-between gap-2 border-b border-gray-200 bg-gray-50 px-3 py-2.5">
//               <span className="text-[10px] font-semibold uppercase tracking-wide text-gray-500">
//                 Latest Activity
//               </span>

//               <span className="shrink-0 whitespace-nowrap text-[10px] text-gray-400">
//                 {latestWorkLog.createdAt
//                   ? formatDateAndTime(latestWorkLog.createdAt)
//                   : "-"}
//               </span>
//             </div>

//             <div className="px-3 py-2.5">
//               <p className="truncate text-xs font-semibold text-gray-600">
//                 {latestWorkLog.createdBy || "System"}
//               </p>

//               <p className="mt-1 line-clamp-2 break-words text-xs leading-5 text-gray-700">
//                 {latestWorkLog.message || "-"}
//               </p>
//             </div>
//           </div>
//         )}
//       </div>
//     </MobileDataCard>
//   );
// };

// export default TicketMobileCard;
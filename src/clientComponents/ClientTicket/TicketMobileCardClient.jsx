import { Eye, Pencil, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";

import { formatDate, formatDateAndTime } from "../../utils/dateFormatter";

import { TableFilePreview } from "../../components/common/FilePreview";

const TicketMobileCardClient = ({
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
<div className="bg-white rounded-lg shadow-[0_0_15px_rgba(0,0,0,0.15)] p-4 mb-4 mx-5 mt-5 space-y-3">
      <article className="w-full max-w-full overflow-hidden bg-white rounded-lg  ">
        <div className="p-4 space-y-3">
          {/* ============================================================
            HEADER
        ============================================================ */}
          <div className="flex min-w-0 justify-between items-center gap-3">
            {/* CHECKBOX + TICKET ID */}
            <div className="flex min-w-0 items-center gap-2">
              <input
                type="checkbox"
                checked={selected}
                onChange={onSelect}
                aria-label={`Select ${item.ticketId}`}
                className="h-4 w-4 shrink-0 cursor-pointer rounded "
              />

              <h3 className="min-w-0 text-lg font-semibold  break-all">
                Ticket ID: {item.ticketId || "-"}
              </h3>
            </div>

            {/* ACTIONS */}
            {/* ACTIONS */}
            <div className="flex shrink-0 items-center gap-3">
              {canView && (
                <Link
                  to={`/client-tickets/view/${item._id}`}
                  aria-label="View Ticket"
                  title="View Ticket"
                  className="text-red-600 hover:text-red-900"
                >
                  <Eye size={18} strokeWidth={2.5} />
                </Link>
              )}

              <Link
                to={`/client-tickets/edit/${item._id}`}
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

              <button
                type="button"
                onClick={onDelete}
                aria-label="Delete Ticket"
                title="Delete Ticket"
                className="text-red-600 hover:text-red-900"
              >
                <Trash2 size={17} strokeWidth={2.5} />
              </button>
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

            <div className="font-medium break-words">
              {item.title
                ? item.title.length > 25
                  ? `${item.title.substring(0, 25)}...`
                  : item.title
                : "N/A"}
            </div>

            <div className="text-sm text-gray-500 break-words">
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
          <MobileTicketField label="Status" value={item.status} />

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
          {/* <MobileTicketField label="Room No" value={item.roomNo} />

        <MobileTicketField label="Bed No" value={item.bedNo} /> */}

          {/* <MobileTicketField
          label="Customer Impacted"
          value={item.customerImpacted}
        />

        <MobileTicketField label="Escalated" value={item.escalated} /> */}

          {/* <MobileTicketField
          label="Target Date"
          value={item.targetDate ? formatDate(item.targetDate) : "-"}
        /> */}

          <MobileTicketField label="Category" value={item.category} />

          {/* <MobileTicketField label="Priority" value={item.priority} /> */}

          <MobileTicketField label="Department" value={item.department} />

          {/* <MobileTicketField label="Manager" value={item.manager} />

        <MobileTicketField label="Ticket Manager" value={item.ticketManager} /> */}

          {/* <MobileTicketField label="Assignee" value={item.assignee} /> */}

          {/* <MobileTicketField
          label="Location"
          value={item.propertyLocation || item.propertyId?.propertyLocation}
        /> */}

          {/* <MobileTicketField
          label="Late Acknowledged"
          value={item.lateAcknowledged}
        />

        <MobileTicketField label="Late Resolved" value={item.lateResolved} /> */}

          {/* ============================================================
            CREATED BY
        ============================================================ */}
          {/* <MobileTicketField
          label="Created By"
          value={
            item.createdByName
              ? `${item.createdByName} (${item.createdById || "-"})`
              : "-"
          }
        /> */}

          {/* ============================================================
            UPDATED BY
        ============================================================ */}
          {/* <MobileTicketField
          label="Updated By"
          value={
            item.updatedByName
              ? `${item.updatedByName} (${item.updatedById || "-"})`
              : "-"
          }
        /> */}

          {/* ============================================================
            UPDATED DATE
        ============================================================ */}
          {/* <MobileTicketField label="Updated Date" value={item.updatedDateTime} /> */}

          {/* ============================================================
            WORK LOGS
        ============================================================ */}
          <div>
            <span className="font-semibold">Work Logs:</span>

            <div className="text-sm max-h-32 overflow-y-auto whitespace-pre-wrap border p-2 rounded mt-1">
              {item.workLogs?.length > 0 ? (
                [...item.workLogs]
                  .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                  .map((log, index) => (
                    <div key={log._id || index} className="mb-3 last:mb-0">
                      <div className="text-gray-700">
                        {log.createdBy || "System"}
                        <span className="mx-1">•</span>
                        {formatDateAndTime(log.createdAt)}
                      </div>

                      <div className="mt-1 font-medium break-words">
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
    </div>
  );
};

/* ================================================================
   MOBILE FIELD
================================================================ */

const MobileTicketField = ({ label, value }) => {
  return (
    <div className="break-words">
      <span className="font-semibold">{label}:</span>{" "}
      <span className="font-normal break-words">{value || "N/A"}</span>
    </div>
  );
};

export default TicketMobileCardClient;
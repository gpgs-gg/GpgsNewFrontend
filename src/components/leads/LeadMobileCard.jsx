import { Link } from "react-router-dom";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { IoIosCall } from "react-icons/io";
import { FaWhatsapp } from "react-icons/fa";
import { formatDate, formatDateAndTime } from "../../utils/dateFormatter";

const statusColors = {
  New: "bg-blue-100 text-blue-700",
  Followup: "bg-yellow-100 text-yellow-700",
  Visited: "bg-purple-100 text-purple-700",
  Booked: "bg-green-100 text-green-700",
  Cancelled: "bg-red-100 text-red-700",
};

const LeadMobileCard = ({
  item,
  selectedLeads,
  handleSelectLead,
  showActions,
  canViewLead,
  canEditLead,
  canDeleteLead,
  handleDelete,
  search,
  filters,
}) => {
  const sortedWorkLogs = [...(item.workLogs || [])].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
  );

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm">
      {/* HEADER */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-start gap-2">
          <input
            type="checkbox"
            checked={selectedLeads.includes(item._id)}
            onChange={() => handleSelectLead(item._id)}
            className="mt-1 h-4 w-4 shrink-0 cursor-pointer"
          />

          <div className="min-w-0">
            <p className="break-words font-semibold text-gray-900">
              {item.ClientName || "-"}
            </p>
            <p className="text-xs text-gray-500">
              Lead ID: {item.LeadNo || "-"}
            </p>
          </div>
        </div>

        <span
          className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${
            statusColors[item.LeadStatus] || "bg-gray-100 text-gray-700"
          }`}
        >
          {item.LeadStatus || "-"}
        </span>
      </div>

      {/* DETAILS */}
      <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-3 border-t border-gray-100 pt-3">
        <Detail label="Date" value={formatDate(item.Date)} />
        <Detail label="Gender" value={item.Gender} />

        <div>
          <p className="text-xs text-gray-500">Calling No.</p>
          <div className="mt-1 flex items-center gap-1 text-sm font-medium">
            <span className="break-all">{item.CallingNo || "-"}</span>
            {item.CallingNo && (
              <a href={`tel:${item.CallingNo}`} className="shrink-0">
                <IoIosCall className="text-lg text-green-600" />
              </a>
            )}
          </div>
        </div>

        <div>
          <p className="text-xs text-gray-500">WhatsApp No.</p>
          <div className="mt-1 flex items-center gap-1 text-sm font-medium">
            <span className="break-all">{item.WhatsAppNo || "-"}</span>
            {item.WhatsAppNo && (
              <a
                href={`https://wa.me/${item.WhatsAppNo}`}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0"
              >
                <FaWhatsapp className="text-green-600" />
              </a>
            )}
          </div>
        </div>

        <Detail label="Followup Date" value={formatDate(item.FollowupDate)} />
        <Detail label="Field Member" value={item.FieldMember} />
        <Detail label="Lead Source" value={item.LeadSource} />
        <Detail label="Assignee" value={item.Assignee} />
        <Detail label="Reason" value={item.Reason} />
      </div>

      {/* WORK LOGS */}
      <div className="mt-3 border-t border-gray-100 pt-3">
        <p className="mb-1 text-xs font-semibold text-gray-500">Work Logs</p>

        {sortedWorkLogs.length > 0 ? (
          <details className="group">
            <summary className="cursor-pointer text-sm text-gray-700">
              <span className="line-clamp-2">{sortedWorkLogs[0]?.message}</span>
              <span className="mt-1 inline-block text-xs font-medium text-blue-600">
                View all ({sortedWorkLogs.length})
              </span>
            </summary>

            <div className="mt-2 max-h-48 space-y-3 overflow-y-auto rounded-lg bg-gray-50 p-2">
              {sortedWorkLogs.map((log, index) => (
                <div
                  key={log._id || index}
                  className="border-b pb-2 last:border-0"
                >
                  <p className="text-xs text-gray-500">
                    {log.createdBy} • {formatDateAndTime(log.createdAt)}
                  </p>
                  <p className="mt-1 whitespace-pre-wrap text-sm text-gray-800">
                    {log.message}
                  </p>
                </div>
              ))}
            </div>
          </details>
        ) : (
          <p className="text-sm text-gray-400">No work logs</p>
        )}
      </div>

      {/* ACTIONS */}
      {showActions && (
        <div className="mt-3 flex justify-end gap-2 border-t border-gray-100 pt-3">
          {canViewLead && (
            <Link to={`/leads/edit/${item._id}`}>
              <button
                type="button"
                className="rounded-lg bg-blue-100 p-2 text-blue-700"
              >
                <Eye size={17} />
              </button>
            </Link>
          )}

          {canEditLead && (
            <Link to={`/leads/edit/${item._id}`} state={{ search, filters }}>
              <button
                type="button"
                className="rounded-lg bg-yellow-100 p-2 text-yellow-700"
              >
                <Pencil size={17} />
              </button>
            </Link>
          )}

          {canDeleteLead && (
            <button
              type="button"
              onClick={() => handleDelete(item._id)}
              className="rounded-lg bg-red-100 p-2 text-red-600"
            >
              <Trash2 size={17} />
            </button>
          )}
        </div>
      )}
    </div>
  );
};

const Detail = ({ label, value }) => (
  <div className="min-w-0">
    <p className="text-xs text-gray-500">{label}</p>
    <p className="mt-1 break-words text-sm font-medium text-gray-800">
      {value || "-"}
    </p>
  </div>
);

export default LeadMobileCard;
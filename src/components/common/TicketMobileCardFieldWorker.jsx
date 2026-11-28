import {
  Eye,
  Pencil,
  Trash2,
  ClipboardList,
  Building2,
  Users,
  Camera,
  CalendarDays,
} from "lucide-react";
import { Link } from "react-router-dom";

import { formatDate, formatDateAndTime } from "../../utils/dateFormatter";

import { TableFilePreview } from "../../components/common/FilePreview";
import { useEffect, useState } from "react";
import { translateToHindi } from "../../utils/translateText";
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

const TicketMobileCardFieldWorker = ({
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
  const propertyCode =
    item.propertyCode || item.propertyId?.propertyCode || "-";

  const propertyLocation =
    item.propertyLocation || item.propertyId?.propertyLocation || "-";
const [hindiTranslation, setHindiTranslation] = useState({
  title: "",
  description: "",
  roomNo: "",
  bedNo: "",
});

const [isTranslating, setIsTranslating] = useState(false);

useEffect(() => {
  let active = true;

  const translateTicket = async () => {
    setIsTranslating(true);

    try {
      const [
        translatedTitle,
        translatedDescription,
        translatedRoomNo,
        translatedBedNo,
      ] = await Promise.all([
        translateToHindi(item.title || ""),
        translateToHindi(item.description || ""),
        translateToHindi(String(item.roomNo || "")),
        translateToHindi(String(item.bedNo || "")),
      ]);

      if (active) {
        setHindiTranslation({
          title: translatedTitle,
          description: translatedDescription,
          roomNo: translatedRoomNo,
          bedNo: translatedBedNo,
        });
      }
    } catch (error) {
      console.error("Ticket translation failed:", error);
    } finally {
      if (active) setIsTranslating(false);
    }
  };

  translateTicket();

  return () => {
    active = false;
  };
}, [item._id, item.title, item.description, item.roomNo, item.bedNo]);
  return (
    <article className="w-full overflow-hidden rounded-xl border border-gray-200 bg-gray-100 shadow-sm">
      {/* HEADER */}
      <div className="flex items-center justify-between gap-2 bg-gray-900 px-3 py-3 text-white">
        <div className="flex min-w-0 items-center gap-2">
          {/* <input
            type="checkbox"
            checked={selected}
            onChange={onSelect}
            aria-label={`Select ${item.ticketId}`}
            className="h-4 w-4 shrink-0 cursor-pointer rounded"
          /> */}

          <div className="min-w-0">
            {/* <div className="text-[10px] font-medium text-gray-400">
              TICKET ID
            </div> */}

            <h3 className="truncate text-sm font-bold">
              {item.ticketId || "-"}
            </h3>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          {canEdit && (
            <Link
              to={`/tickets/edit/field-worker/${item._id}`}
              state={{ filters, search }}
              title="Update Ticket"
              className="text-green-400 hover:text-green-300"
            >
              <Pencil size={18} />
            </Link>
          )}

          {canDelete && (
            <button
              type="button"
              onClick={onDelete}
              title="Delete Ticket"
              className="text-red-400 hover:text-red-300"
            >
              <Trash2 size={18} />
            </button>
          )}
        </div>
      </div>

      {/* CARD CONTENT */}
      <div className="space-y-3 p-3">
        {/* PROPERTY / ROOM / BED */}
        {/* PROPERTY / ROOM / BED */}
        <div className="grid grid-cols-3 gap-2 rounded-lg border border-gray-200 bg-white p-3">
          <div className="min-w-0">
            <label className="mb-1 flex items-center gap-1 text-[10px] font-medium text-gray-500">
              <Building2 size={12} />
              प्रॉपर्टी कोड
            </label>

            <p className="truncate text-xs font-bold text-gray-800">
              {propertyCode}
            </p>
          </div>

          <div className="min-w-0">
            <label className="mb-1 block text-[10px] font-medium text-gray-500">
              कमरा नंबर
            </label>

            <p className="truncate text-xs font-bold text-gray-800">
              {isTranslating
                ? "अनुवाद हो रहा है..."
                : hindiTranslation.roomNo || item.roomNo || "-"}
            </p>
          </div>

          <div className="min-w-0">
            <label className="mb-1 block text-[10px] font-medium text-gray-500">
              बेड नंबर
            </label>

            <p className="truncate text-xs font-bold text-gray-800">
              {isTranslating
                ? "अनुवाद हो रहा है..."
                : hindiTranslation.bedNo || item.bedNo || "-"}
            </p>
          </div>
        </div>

        {/* TICKET TITLE */}
        {/* TICKET TITLE */}
        <div className="rounded-lg border border-gray-200 bg-white p-3">
          <label className="mb-1 block text-[10px] font-semibold text-gray-500">
            टिकट का शीर्षक
          </label>

          <p className="break-words text-sm font-bold text-gray-800">
            {isTranslating
              ? "अनुवाद हो रहा है..."
              : hindiTranslation.title || item.title || "-"}
          </p>
        </div>

        {/* DESCRIPTION */}
        {/* DESCRIPTION */}
        <div className="rounded-lg border border-gray-200 bg-white p-3">
          <label className="mb-2 flex items-center gap-1 text-xs font-semibold text-gray-600">
            <ClipboardList size={14} />
            समस्या का विवरण
          </label>

          <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-gray-700">
            {isTranslating
              ? "अनुवाद हो रहा है..."
              : hindiTranslation.description ||
                item.description ||
                "कोई विवरण नहीं"}
          </p>
        </div>

        {/* ASSIGNEE / STATUS */}
        <div className="grid grid-cols-2 gap-2">
          <div className="min-w-0 rounded-lg border border-gray-200 bg-white p-3">
            <label className="mb-1 flex items-center gap-1 text-[11px] font-semibold text-gray-500">
              <Users size={13} />
              नियुक्त कर्मचारी
            </label>

            <p className="break-words text-xs font-semibold text-gray-800">
              {item.assignee || "नियुक्त नहीं"}
            </p>
          </div>

          <div className="min-w-0 rounded-lg border border-gray-200 bg-white p-3">
            <label className="mb-1 block text-[11px] font-semibold text-gray-500">
              स्थिति
            </label>

            <span
              className={`inline-flex max-w-full rounded-full px-2 py-1 text-[10px] font-semibold ${
                statusColors[item.status] || "bg-gray-100 text-gray-700"
              }`}
            >
              {item.status === "Open"
                ? "खुला"
                : item.status === "Acknowledged"
                  ? "स्वीकार किया गया"
                  : item.status === "In Progress"
                    ? "काम जारी है"
                    : item.status === "On Hold"
                      ? "रुका हुआ"
                      : item.status === "Resolved"
                        ? "समाधान किया गया"
                        : item.status === "Closed"
                          ? "बंद"
                          : item.status === "Cancelled"
                            ? "रद्द"
                            : item.status === "ReOpen"
                              ? "फिर से खोला गया"
                              : item.status || "अज्ञात"}
            </span>
          </div>
        </div>

 
        {/* ATTACHMENTS */}
        <div className="rounded-lg border border-gray-200 bg-white p-3">
          <label className="mb-2 flex items-center gap-1 text-xs font-semibold text-gray-600">
            <Camera size={14} />
            संलग्न फ़ाइलें
          </label>

          <div className="max-w-full overflow-hidden">
            {item.attachment?.length > 0 || item.attachment ? (
              <TableFilePreview files={item.attachment} />
            ) : (
              <p className="text-xs text-gray-400">कोई फ़ाइल संलग्न नहीं है</p>
            )}
          </div>
        </div>
      </div>
    </article>
  );
};

/* REUSABLE FIELD */

const MobileTicketField = ({ label, value }) => (
  <div className="min-w-0 rounded-lg border border-gray-200 bg-white p-3">
    <label className="mb-1 block text-[10px] font-semibold text-gray-500">
      {label}
    </label>

    <p className="break-words text-xs font-medium text-gray-800">
      {value === null || value === undefined || value === ""
        ? "-"
        : String(value)}
    </p>
  </div>
);

export default TicketMobileCardFieldWorker;
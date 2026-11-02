import React from "react";
import {
  Phone,
  MessageSquarePlus,
  CalendarDays,
  Wallet,
  MapPin,
  BedDouble,
  UserRound,
} from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { formatDate } from "../../utils/dateFormatter";

export default function RnrClientMobileCard({
  item,
  statusFullForm,
  onAddComment,
}) {
  const getClientStatus = () => {
    if (item.isBookingCancelled) {
      return {
        text: "Cancelled",
        className: "bg-red-50 text-red-700 border-red-200",
      };
    }

    if (
      item.clientVacatingDate &&
      new Date(item.clientVacatingDate) <= new Date()
    ) {
      return {
        text: "RFH",
        className: "bg-orange-50 text-orange-700 border-orange-200",
      };
    }

    if (item.noticeStartDate) {
      return {
        text: "Notice",
        className: "bg-amber-50 text-amber-700 border-amber-200",
      };
    }

    return {
      text: "Active",
      className: "bg-emerald-50 text-emerald-700 border-emerald-200",
    };
  };

  const fnfStatus = item?.fnf?.status;
  const status = getClientStatus();
  const displayedStatus = fnfStatus?.trim() ? fnfStatus : status.text;

  const rentHistory = item?.latestRentHistory;
  const currentDue = Number(rentHistory?.currentDue || 0);

  const monthYear =
    rentHistory?.month && rentHistory?.year
      ? `${new Date(
          Number(rentHistory.year),
          Number(rentHistory.month) - 1,
        ).toLocaleString("en-US", { month: "long" })} ${rentHistory.year}`
      : "-";

  const comments = item?.rentNotReceivedComment?.[0]?.comments || [];
  const latestComment = comments[comments.length - 1];

  const formatDateTime = (value) => {
    if (!value) return "-";

    const date = new Date(value);
    if (isNaN(date.getTime())) return "-";

    return date.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
      timeZone: "Asia/Kolkata",
    });
  };

  const dateItem = (label, value) => (
    <div className="min-w-0 rounded-lg bg-slate-50 p-2.5">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p className="mt-1 break-words text-xs font-semibold text-slate-700">
        {value ? formatDate(value) : "-"}
      </p>
    </div>
  );

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      {/* CLIENT HEADER */}
      <div className="border-b border-slate-100 p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex min-w-0 items-start gap-2.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600">
              <UserRound size={20} />
            </div>

            <div className="min-w-0">
              <h3 className="break-words text-sm font-bold text-slate-800">
                {item.fullName || "-"}
              </h3>
              <p className="mt-1 text-xs font-medium text-slate-500">
                {item.propertyId?.propertyCode || "-"}
              </p>
            </div>
          </div>

          <span
            title={statusFullForm?.[displayedStatus] || displayedStatus}
            className={`shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-bold ${
              fnfStatus?.trim()
                ? "border-slate-200 bg-slate-100 text-slate-700"
                : status.className
            }`}
          >
            {displayedStatus}
          </span>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-1 rounded-md bg-slate-50 px-2 py-1 text-xs text-slate-600">
            <MapPin size={12} />
            Room: {item.bedId?.roomNo || "-"}
          </span>
          <span className="inline-flex items-center gap-1 rounded-md bg-slate-50 px-2 py-1 text-xs text-slate-600">
            <BedDouble size={12} />
            Bed: {item.bedId?.bedNo || "-"}
          </span>
          <span className="rounded-md bg-slate-50 px-2 py-1 text-xs text-slate-600">
            {item.bookingType === "Daily" ? "Daily" : item.stayType || "-"}
          </span>
        </div>
      </div>

      {/* CONTACT DETAILS */}
      <div className="grid grid-cols-2 gap-2 border-b border-slate-100 p-3">
        <div className="min-w-0">
          <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
            Calling No
          </p>
          {item.callingNo ? (
            <a
              href={`tel:${String(item.callingNo).replace(/[^\d+]/g, "")}`}
              className="flex items-center gap-1.5 break-all text-xs font-semibold text-blue-900"
            >
              <Phone size={14} className="shrink-0" />
              {item.callingNo}
            </a>
          ) : (
            <span className="text-xs text-slate-400">-</span>
          )}
        </div>

        <div className="min-w-0">
          <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
            WhatsApp No
          </p>
          {item.whatsappNo ? (
            <a
              href={`https://wa.me/${String(item.whatsappNo).replace(/\D/g, "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 break-all text-xs font-semibold text-green-600"
            >
              <FaWhatsapp size={15} className="shrink-0" />
              {item.whatsappNo}
            </a>
          ) : (
            <span className="text-xs text-slate-400">-</span>
          )}
        </div>
      </div>

      {/* RENT DETAILS */}
      <div className="p-3">
        <div className="mb-3 flex items-center justify-between gap-2">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
              Current Due
            </p>
            <p
              className={`mt-1 text-xl font-bold ${
                currentDue < 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              ₹ {currentDue.toLocaleString("en-IN")}
            </p>
          </div>

          <div className="text-right">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
              Month / Year
            </p>
            <p className="mt-1 text-xs font-semibold text-slate-700">
              {monthYear}
            </p>
          </div>
        </div>

        <div className="mb-3 flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-2">
          <Wallet size={15} className="shrink-0 text-blue-600" />
          <span className="text-xs text-slate-600">Rent Date:</span>
          <span className="text-xs font-semibold text-slate-800">
            Rent Date
          </span>
        </div>

        {/* IMPORTANT DATES */}
        <div className="mb-3 flex items-center gap-1.5 text-xs font-bold text-slate-700">
          <CalendarDays size={14} className="text-slate-500" />
          Important Dates
        </div>

        <div className="grid grid-cols-2 gap-2">
          {[
            ["DOJ", item.clientDoj],
            ["NSD", item.noticeStartDate],
            ["NLD", item.noticeLastDate],
            ["CVD", item.clientVacatingDate],
          ]
            .filter(([_, date]) => date)
            .map(([label, date]) => dateItem(label, date))}
        </div>
      </div>

      {/* LATEST COMMENT */}
      <div className="border-t border-slate-100 bg-slate-50 p-3">
        <div className="mb-2 flex items-center justify-between gap-2">
          <p className="text-xs font-bold text-slate-700">Latest Comment</p>

          <span className="text-[10px] text-slate-400">
            {comments.length} {comments.length === 1 ? "comment" : "comments"}
          </span>
        </div>

        {latestComment ? (
          <div>
            <p className="break-words text-xs leading-relaxed text-slate-700">
              {latestComment.comment}
            </p>
            <p className="mt-1 text-[10px] text-slate-400">
              {formatDateTime(latestComment.date)}
              {latestComment.addedBy ? ` · ${latestComment.addedBy}` : ""}
            </p>
          </div>
        ) : (
          <p className="text-xs italic text-slate-400">No comment added</p>
        )}

        <button
          type="button"
          onClick={() => onAddComment(item)}
          className="mt-3 theme-btn flex w-full items-center justify-center gap-2 rounded-lg  py-2.5 text-xs font-semibold text-white transition "
        >
          <MessageSquarePlus size={15} />
          Add Comment
        </button>
      </div>
    </div>
  );
}
import { Link } from "react-router-dom";
import {
  BedDouble,
  MapPin,
  IndianRupee,
  Eye,
  Pencil,
  Trash2,
  CheckCircle2,
  Snowflake,
  Bath,
  CalendarDays,
  Zap,
} from "lucide-react";
import { formatDate } from "../../utils/dateFormatter";

const Detail = ({ label, value }) => (
  <div className="min-w-0 space-y-1">
    <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
      {label}
    </p>
    <p className="break-words text-sm font-medium text-slate-800">
      {value === null || value === undefined || value === "" ? "—" : value}
    </p>
  </div>
);

const BedMobileCard = ({
  item,
  isSelected,
  onSelect,
  isAdmin,
  canViewBed,
  canEditBed,
  canDeleteBed,
  onDelete,
  deleting,
}) => {
  const isActive = item?.status === "Active";

  return (
    <article className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      {/* Card header */}
      <div className="flex items-start gap-3 border-b border-slate-100 bg-slate-50/70 p-4">
        {isAdmin && (
          <input
            type="checkbox"
            aria-label={`Select bed ${item?.bedNo || ""}`}
            checked={isSelected}
            onChange={() => onSelect(item._id)}
            className="mt-1 h-4 w-4 shrink-0 cursor-pointer accent-slate-700"
          />
        )}

        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700">
          <BedDouble size={21} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base font-semibold text-slate-900">
              {item?.propertyId?.propertyCode || "Unknown Property"}
            </h3>

            <span
              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                isActive
                  ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
                  : "bg-red-50 text-red-700 ring-1 ring-red-200"
              }`}
            >
              <CheckCircle2 size={12} />
              {item?.status || "Unknown"}
            </span>
          </div>

          <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
            <MapPin size={13} className="shrink-0" />
            <span className="break-words">
              {item?.propertyId?.propertyLocation || "Location unavailable"}
            </span>
          </p>
        </div>
      </div>

      <div className="space-y-4 p-4">
        {/* Room and bed identification */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg border border-slate-200 p-3">
            <p className="text-xs text-slate-500">Room Number</p>
            <p className="mt-1 text-lg font-semibold text-slate-900">
              {item?.roomNo || "—"}
            </p>
          </div>

          <div className="rounded-lg border border-slate-200 p-3">
            <p className="text-xs text-slate-500">Bed Number</p>
            <p className="mt-1 text-lg font-semibold text-slate-900">
              {item?.bedNo || "—"}
            </p>
          </div>
        </div>

        {/* Bed details */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-4">
          <Detail label="Gender" value={item?.gender} />
          <Detail label="Sharing Type" value={item?.sharingType} />
          <Detail label="Bath Attached" value={item?.bathAttached} />
          <Detail label="AC Room" value={item?.acRoom} />
        </div>

        {/* Financial details */}
        <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-3">
          <div className="mb-3 flex items-center gap-2">
            <IndianRupee size={16} className="text-slate-600" />
            <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-600">
              Financial Details
            </h4>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-slate-500">Monthly Rent</p>
              <p className="mt-1 text-lg font-bold text-slate-900">
                ₹{Number(item?.monthlyRent || 0).toLocaleString("en-IN")}
              </p>
            </div>

            <Detail
              label="Deposit Amount (DA)"
              value={
                item?.depositAmount != null
                  ? `₹${Number(item.depositAmount).toLocaleString("en-IN")}`
                  : "—"
              }
            />

            <Detail
              label="Security Deposit Factor"
              value={item?.securityDepositMultiplicationFactor}
            />

            <Detail label="Free EB" value={item?.freeEbAsPerBed} />
          </div>
        </div>

        {/* Rent hike details */}
        <div>
          <h4 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-600">
            <CalendarDays size={15} />
            Rent Hike Details
          </h4>

          <div className="grid grid-cols-2 gap-x-4 gap-y-4">
            <Detail
              label="Upcoming Hike Date (URHD)"
              value={
                item?.upcomingRentHikeDate
                  ? formatDate(item.upcomingRentHikeDate)
                  : "—"
              }
            />

            <Detail
              label="Upcoming Hike Amount (URHA)"
              value={item?.upcomingRentHikeAmount}
            />

            <Detail
              label="Previous Hike Date (PRHD)"
              value={
                item?.previousRentHikeDate
                  ? formatDate(item.previousRentHikeDate)
                  : "—"
              }
            />
          </div>
        </div>

        {/* Actions */}
        {(canViewBed || canEditBed || canDeleteBed) && (
          <div className="flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3">
            {canViewBed && (
              <Link
                to={`/bed/edit/${item._id}`}
                className="inline-flex min-h-10 flex-1 items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                <Eye size={16} />
                View
              </Link>
            )}

            {canEditBed && (
              <Link
                to={`/bed/edit/${item._id}`}
                className="inline-flex min-h-10 flex-1 items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                <Pencil size={15} />
                Edit
              </Link>
            )}

            {canDeleteBed && (
              <button
                type="button"
                onClick={() => onDelete(item)}
                disabled={deleting}
                className="inline-flex min-h-10 flex-1 items-center justify-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Trash2 size={16} />
                Delete
              </button>
            )}
          </div>
        )}
      </div>
    </article>
  );
};

export default BedMobileCard;
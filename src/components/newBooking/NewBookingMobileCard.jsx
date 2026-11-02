import React from "react";
import {
  Eye,
  Pencil,
  Trash2,
  Phone,
  MessageCircle,
  MapPin,
  BedDouble,
  CalendarDays,
  IndianRupee,
  ShieldCheck,
  Clock,
  User,
  Building2,
} from "lucide-react";
import { Link } from "react-router-dom";
import { formatDate } from "../../utils/dateFormatter";
import image from "../../assets/icons8-verified-account (1).gif";

const NewBookingMobileCard = ({
  item,
  onStatusToggle,
  onPaymentVerification,
  onDelete,
  isPending,
  canEditBooking,
  canViewBooking,
  canDeleteBooking,
  isPendingDelete,
}) => {
  const isBooked = item.status === "Booked";
  const isVerified = item.loginEnabled;

  const formatAmount = (amount) =>
    `₹${(Number(amount) || 0).toLocaleString("en-IN")}`;

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      {/* TOP SECTION */}
      <div className="border-b border-slate-100 bg-slate-50/70 p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700">
                <User size={18} />
              </div>

              <div className="min-w-0">
                <h3 className="truncate text-sm font-bold text-slate-800">
                  {item.fullName || "Unknown Client"}
                </h3>
                <p className="text-xs text-slate-500">
                  {item.teamCode || "No Team Code"}
                </p>
              </div>
            </div>
          </div>

          <div className="flex shrink-0 flex-col items-end gap-1">
            <span
              className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                isBooked
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {isBooked ? "Booked" : "Not Booked"}
            </span>

            <span className="text-[10px] text-slate-500">
              {item.createdAt ? formatDate(item.createdAt) : "-"}
            </span>
          </div>
        </div>

        {/* CONTACT */}
        <div className="mt-3 grid grid-cols-2 gap-2">
          <a
            href={item.callingNo ? `tel:${item.callingNo}` : undefined}
            className="flex min-w-0 items-center gap-2 rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-xs text-slate-700"
          >
            <Phone size={14} className="shrink-0 text-blue-600" />
            <span className="truncate">{item.callingNo || "-"}</span>
          </a>

          <a
            href={
              item.whatsappNo
                ? `https://wa.me/${String(item.whatsappNo).replace(/\D/g, "")}`
                : undefined
            }
            target="_blank"
            rel="noopener noreferrer"
            className="flex min-w-0 items-center gap-2 rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-xs text-slate-700"
          >
            <MessageCircle size={14} className="shrink-0 text-green-600" />
            <span className="truncate">{item.whatsappNo || "-"}</span>
          </a>
        </div>
      </div>

      <div className="space-y-3 p-3">
        {/* BOOKING STATUS & PAYMENT VERIFICATION */}
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-lg border border-slate-200 p-2.5">
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              Booking Status
            </p>

            <div className="flex items-center justify-between gap-2">
              <span
                className={`text-xs font-semibold ${
                  isBooked ? "text-green-700" : "text-red-600"
                }`}
              >
                {isBooked ? "Booked" : "Not Booked"}
              </span>

              <button
                type="button"
                role="switch"
                aria-checked={isBooked}
                onClick={() => onStatusToggle(item)}
                disabled={
                  isPending || !canEditBooking || (isBooked && isVerified)
                }
                className={`relative h-4 w-10 shrink-0 rounded-full transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-50 ${
                  isBooked ? "bg-green-500" : "bg-slate-300"
                }`}
              >
                <span
                  className={`absolute top-0.5 h-3 w-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                    isBooked ? "translate-x-0" : "translate-x-[-18px]"
                  }`}
                />
              </button>
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 p-2.5">
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              Payment Verification
            </p>

            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                {isVerified ? (
                  <>
                    <img
                      src={image}
                      alt="Verified"
                      className="h-5 w-5 object-contain"
                    />
                    <span className="text-xs font-semibold text-green-700">
                      Verified
                    </span>
                  </>
                ) : (
                  <span className="text-xs font-semibold text-orange-600">
                    Pending
                  </span>
                )}
              </div>
              {!isVerified && (
                <>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={isVerified}
                    onClick={() => !isVerified && onPaymentVerification(item)}
                    disabled={!canEditBooking || isVerified}
                    className={`relative h-4 w-10 shrink-0 rounded-full transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-50 ${
                      isVerified ? "bg-green-500" : "bg-slate-300"
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 h-3 w-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                        isVerified ? "translate-x-5" : "translate-x-[-18px]"
                      }`}
                    />
                  </button>{" "}
                </>
              )}
            </div>
          </div>
        </div>

        {/* PROPERTY DETAILS */}
        <div>
          <div className="mb-2 flex items-center gap-2">
            <Building2 size={15} className="text-blue-600" />
            <h4 className="text-xs font-bold uppercase tracking-wide text-slate-700">
              Property Details
            </h4>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg bg-slate-50 p-2.5">
              <p className="text-[10px] text-slate-500">Permanent Property</p>
              <p className="mt-1 truncate text-xs font-semibold text-slate-800">
                {item.propertyId?.propertyCode || "-"}
              </p>
            </div>

            <div className="rounded-lg bg-slate-50 p-2.5">
              <p className="text-[10px] text-slate-500">Location</p>
              <p className="mt-1 flex items-center gap-1 truncate text-xs font-semibold text-slate-800">
                <MapPin size={12} className="shrink-0 text-slate-400" />
                {item.propertyId?.propertyLocation || "-"}
              </p>
            </div>

            <div className="rounded-lg bg-slate-50 p-2.5">
              <p className="text-[10px] text-slate-500">Permanent Bed / Room</p>
              <p className="mt-1 flex items-center gap-1 text-xs font-semibold text-slate-800">
                <BedDouble size={13} className="text-slate-400" />
                {item.bedId?.bedNo || "-"} / {item.bedId?.roomNo || "-"}
              </p>
            </div>

            <div className="rounded-lg bg-slate-50 p-2.5">
              <p className="text-[10px] text-slate-500">Client DOJ</p>
              <p className="mt-1 flex items-center gap-1 text-xs font-semibold text-slate-800">
                <CalendarDays size={13} className="text-slate-400" />
                {item.clientDoj ? formatDate(item.clientDoj) : "-"}
              </p>
            </div>

            <div className="rounded-lg bg-slate-50 p-2.5">
              <p className="text-[10px] text-slate-500">Temporary Property</p>
              <p className="mt-1 truncate text-xs font-semibold text-slate-800">
                {item.temporaryPropertyId?.propertyCode || "-"}
              </p>
            </div>

            <div className="rounded-lg bg-slate-50 p-2.5">
              <p className="text-[10px] text-slate-500">Temporary Bed / DOJ</p>
              <p className="mt-1 text-xs font-semibold text-slate-800">
                {item.temporaryBedId?.bedNo || "-"} /{" "}
                {item.temporaryClientDoj
                  ? formatDate(item.temporaryClientDoj)
                  : "-"}
              </p>
            </div>
          </div>
        </div>

        {/* PAYMENT DETAILS */}
        <div className="overflow-hidden rounded-lg border border-slate-200">
          <div className="flex items-center gap-2 border-b border-slate-200 bg-slate-50 px-3 py-2">
            <IndianRupee size={15} className="text-green-600" />
            <h4 className="text-xs font-bold uppercase tracking-wide text-slate-700">
              Payment Details
            </h4>
          </div>

          <div className="grid grid-cols-2 gap-x-3 gap-y-3 p-3">
            <div>
              <p className="text-[10px] text-slate-500">Monthly Rent</p>
              <p className="mt-0.5 text-sm font-semibold text-slate-800">
                {formatAmount(item.monthlyRent)}
              </p>
            </div>

            <div>
              <p className="text-[10px] text-slate-500">Deposit</p>
              <p className="mt-0.5 text-sm font-semibold text-slate-800">
                {formatAmount(item.depositAmount)}
              </p>
            </div>

            <div>
              <p className="text-[10px] text-slate-500">Processing Fees</p>
              <p className="mt-0.5 text-sm font-semibold text-slate-800">
                {formatAmount(item.processingFees)}
              </p>
            </div>

            <div>
              <p className="text-[10px] text-slate-500">Total Amount</p>
              <p className="mt-0.5 text-sm font-bold text-slate-800">
                {formatAmount(item.totalAmount)}
              </p>
            </div>

            <div className="rounded-lg bg-green-50 p-2">
              <p className="text-[10px] text-green-700">Booking Amount</p>
              <p className="mt-0.5 text-sm font-bold text-green-700">
                {formatAmount(item.bookingAmount)}
              </p>
            </div>

            <div className="rounded-lg bg-red-50 p-2">
              <p className="text-[10px] text-red-600">Balance Amount</p>
              <p className="mt-0.5 text-sm font-bold text-red-600">
                {formatAmount(item.balanceAmount)}
              </p>
            </div>
          </div>
        </div>

        {/* ACTIONS */}
        {(canViewBooking || canEditBooking || canDeleteBooking) && (
          <div className="flex items-center gap-2 border-t border-slate-100 pt-3">
            {canViewBooking && (
              <Link
                to={`/new-bookings/view/${item._id}`}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-100"
              >
                <Eye size={15} />
                View
              </Link>
            )}

            {canEditBooking && !isVerified && (
              <Link
                to={`/new-bookings/edit/${item._id}`}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-700 hover:bg-amber-100"
              >
                <Pencil size={15} />
                Edit
              </Link>
            )}

            {canDeleteBooking && (
              <button
                type="button"
                onClick={() => onDelete(item._id)}
                disabled={isPendingDelete}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-100 disabled:opacity-50"
              >
                <Trash2 size={15} />
                Delete
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default NewBookingMobileCard;
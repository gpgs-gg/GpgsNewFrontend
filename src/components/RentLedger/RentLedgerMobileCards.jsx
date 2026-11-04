import React from "react";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { formatDate } from "../../utils/dateFormatter";

const RentLedgerMobileCards = ({
  data = [],
  selectedRentRecords,
  setSelectedRentRecords,
  canViewRentLedger,
  canEditRentLedger,
  isAdmin,
  showActions,
  currentMonth,
  currentYear,
  deletePending,
  onDelete,
}) => {
  const toggleRecord = (id) => {
    setSelectedRentRecords((prev) => {
      const next = new Set(prev);

      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }

      return next;
    });
  };

  const formatAmount = (value) =>
    `₹${Math.round(Number(value || 0)).toLocaleString("en-IN")}`;

  const isCurrentMonth = (item) =>
    item.monthName === currentMonth &&
    Number(item.year) === Number(currentYear) &&
    item.paymentStatus !== "Shifted";

  const statusStyles = {
    Paid: "bg-green-100 text-green-700",
    Partial: "bg-yellow-100 text-yellow-700",
    Shifted: "bg-blue-100 text-blue-700",
  };

  const detail = (label, value, valueClass = "") => (
    <div className="min-w-0">
      <p className="text-xs text-gray-500">{label}</p>
      <p
        className={`mt-1 text-sm font-semibold text-gray-800 break-words ${valueClass}`}
      >
        {value ?? "-"}
      </p>
    </div>
  );

  if (!data.length) {
    return (
      <div className="flex min-h-64 items-center justify-center p-4">
        <p className="text-center text-sm text-gray-500">
          No rent history available for this client.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3 p-3">
      {/* Select all records on the current page */}
      <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-3 py-3">
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
          <input
            type="checkbox"
            checked={
              data.length > 0 &&
              data.every((item) => selectedRentRecords.has(item._id))
            }
            onChange={() => {
              setSelectedRentRecords((prev) => {
                const next = new Set(prev);
                const allSelected = data.every((item) => next.has(item._id));

                data.forEach((item) => {
                  if (allSelected) {
                    next.delete(item._id);
                  } else {
                    next.add(item._id);
                  }
                });

                return next;
              });
            }}
            className="h-4 w-4 accent-gray-500"
            aria-label="Select all rent records on this page"
          />
          Select page
        </label>

        <span className="text-xs text-gray-500">
          {data.filter((item) => selectedRentRecords.has(item._id)).length}{" "}
          selected
        </span>
      </div>

      {data.map((item) => (
        <article
          key={item._id}
          className={`overflow-hidden rounded-xl border shadow-sm ${
            isCurrentMonth(item)
              ? "border-green-300 bg-green-50"
              : "border-gray-200 bg-white"
          }`}
        >
          {/* Card header */}
          <div className="flex items-start justify-between gap-3 border-b border-gray-200/80 p-3">
            <div className="flex min-w-0 items-start gap-3">
              <input
                type="checkbox"
                checked={selectedRentRecords.has(item._id)}
                onChange={() => toggleRecord(item._id)}
                className="mt-1 h-4 w-4 shrink-0 accent-gray-500"
                aria-label={`Select rent record ${item.monthName} ${item.year}`}
              />

              <div className="min-w-0">
                <p className="break-words font-bold text-gray-900">
                  {item.propertyId?.propertyCode || "-"}
                </p>
                <p className="mt-1 text-sm font-medium text-gray-600">
                  {item.monthName} {item.year}
                </p>
              </div>
            </div>

            <span
              className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${
                statusStyles[item.paymentStatus] || "bg-red-100 text-red-700"
              }`}
            >
              {item.paymentStatus || "Unpaid"}
            </span>
          </div>

          {/* Important amounts */}
          <div className="grid grid-cols-2 gap-4 p-3">
            {detail(
              "Current Due",
              formatAmount(item.currentDue),
              Number(item.currentDue) > 0
                ? "text-red-600"
                : Number(item.currentDue) < 0
                  ? "text-green-600"
                  : "",
            )}

            {detail(
              "Total Received",
              formatAmount(item.totalReceived),
              "text-green-600",
            )}

            {detail("Total Receivable", formatAmount(item.totalReceivable))}
            {detail("Rent Amount", formatAmount(item.rentAmt))}
            {detail("Monthly Rent", formatAmount(item.monthlyRent))}
            {detail("Days Count", item.daysCount)}
            {detail("EB Amount", formatAmount(item.ebAmt))}
            {detail("Adjusted EB", formatAmount(item.adjEB))}
            {detail("Previous Due", formatAmount(item.previousDue))}
            {detail("Parking Charges", formatAmount(item.parkingCharges))}
            {detail("Deposit", formatAmount(item.depositAmount))}
            {detail("Processing Fee", formatAmount(item.processingFees))}
            {detail("Adjusted Amount", formatAmount(item.adjAmt))}
            {detail("Flat EB", formatAmount(item.flatEB))}
            {detail(
              "Rent Start Date",
              item.startDate ? formatDate(item.startDate) : "-",
            )}
            {detail(
              "Rent Last Date",
              item.endDate ? formatDate(item.endDate) : "-",
            )}
          </div>

          {/* Payment comments */}
          <div className="border-t border-gray-200/80 px-3 py-3">
            <p className="text-xs text-gray-500">Payment Comments</p>

            {item.paymentComments?.length > 0 ? (
              <div className="mt-1 space-y-2">
                {[...item.paymentComments].reverse().map((comment, index) => {
                  const date = comment?.date ? new Date(comment.date) : null;

                  const formattedDate =
                    date && !isNaN(date.getTime())
                      ? date.toLocaleString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "";

                  return (
                    <p
                      key={comment?._id || index}
                      className="break-words text-sm text-gray-700"
                    >
                      {formattedDate && (
                        <span className="font-semibold text-gray-500">
                          [{formattedDate}]{" "}
                        </span>
                      )}
                      {comment?.comment || "-"}
                    </p>
                  );
                })}
              </div>
            ) : (
              <p className="mt-1 text-sm text-gray-400">No comment</p>
            )}
          </div>

          {/* Remarks */}
          <div className="border-t border-gray-200/80 px-3 py-3">
            <p className="text-xs text-gray-500">Remarks</p>
            <p className="mt-1 break-words text-sm text-gray-700">
              {item.remarks || "-"}
            </p>
          </div>

          {/* Actions */}
          {showActions && (
            <div className="flex flex-wrap items-center gap-2 border-t border-gray-200/80 p-3">
              {canViewRentLedger && item.paymentStatus !== "Shifted" && (
                <Link
                  to={`/rent-ledger/edit/${item._id}`}
                  className="inline-flex items-center gap-2 rounded-lg bg-blue-100 px-3 py-2 text-sm font-medium text-blue-700 hover:bg-blue-200"
                >
                  <Eye size={16} />
                  View
                </Link>
              )}

              {canEditRentLedger && item.paymentStatus !== "Shifted" && (
                <Link
                  to={`/rent-ledger/edit/${item._id}`}
                  className="inline-flex items-center gap-2 rounded-lg bg-yellow-100 px-3 py-2 text-sm font-medium text-yellow-800 hover:bg-yellow-200"
                >
                  <Pencil size={16} />
                  Edit
                </Link>
              )}

              {isAdmin && (
                <button
                  type="button"
                  onClick={() => onDelete(item._id)}
                  disabled={deletePending}
                  className="inline-flex items-center gap-2 rounded-lg bg-red-100 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-200 disabled:opacity-50"
                >
                  <Trash2 size={16} />
                  Delete
                </button>
              )}
            </div>
          )}
        </article>
      ))}
    </div>
  );
};

export default RentLedgerMobileCards;
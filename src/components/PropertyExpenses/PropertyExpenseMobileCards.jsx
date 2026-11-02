import { Pencil, Trash2, CalendarDays, Wallet, ReceiptText, FileText } from "lucide-react";

const PropertyExpenseMobileCards = ({
  expenses = [],
  isLoading,
  currentPage,
  rowsPerPage,
  onEdit,
  onDelete,
  isDeleting,
}) => {
  const getPaymentStyle = (mode) => {
    const styles = {
      Cash: "bg-green-50 text-green-700 border-green-200",
      Bank: "bg-blue-50 text-blue-700 border-blue-200",
      UPI: "bg-purple-50 text-purple-700 border-purple-200",
      Cheque: "bg-amber-50 text-amber-700 border-amber-200",
    };

    return styles[mode] || "bg-gray-50 text-gray-700 border-gray-200";
  };

  if (isLoading) {
    return (
      <div className="space-y-3 p-3">
        {[1, 2, 3, 4].map((item) => (
          <div
            key={item}
            className="animate-pulse rounded-xl border border-gray-200 bg-white p-4"
          >
            <div className="h-4 w-36 rounded bg-gray-200" />
            <div className="mt-3 h-6 w-24 rounded bg-gray-200" />
            <div className="mt-4 h-4 w-full rounded bg-gray-100" />
            <div className="mt-3 h-4 w-2/3 rounded bg-gray-100" />
          </div>
        ))}
      </div>
    );
  }

  if (!expenses.length) {
    return (
      <div className="p-4">
        <div className="rounded-xl border border-gray-200 bg-white py-10 text-center">
          <ReceiptText size={36} className="mx-auto text-gray-300" />
          <p className="mt-3 font-semibold text-gray-700">
            No Expenses Found
          </p>
          <p className="mt-1 text-sm text-gray-500">
            No expenses are available for this property.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3 p-3">
      {expenses.map((expense, index) => {
        const latestWorkLog =
          expense.workLogs?.[expense.workLogs.length - 1];

        return (
          <div
            key={expense._id || index}
            className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm"
          >
            {/* CARD HEADER */}
            <div className="flex items-start justify-between gap-3 border-b border-gray-100 bg-gray-50/70 px-4 py-3">
              <div className="flex min-w-0 items-start gap-2.5">
                <div className="rounded-lg bg-blue-50 p-2 text-blue-700">
                  <ReceiptText size={19} />
                </div>

                <div className="min-w-0">
                  <p className="break-words text-sm font-bold text-gray-900">
                    {expense.category || "Uncategorized"}
                  </p>

                  <div className="mt-1 flex items-center gap-1.5 text-xs text-gray-500">
                    <CalendarDays size={13} />
                    {expense.expenseDate
                      ? new Date(expense.expenseDate).toLocaleDateString(
                          "en-GB",
                          {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          }
                        )
                      : "-"}
                  </div>
                </div>
              </div>

              <span className="shrink-0 rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-500">
                #{(currentPage - 1) * rowsPerPage + index + 1}
              </span>
            </div>

            {/* AMOUNT */}
            <div className="flex items-center justify-between gap-3 px-4 py-3">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                  Expense Amount
                </p>

                <p className="mt-1 text-xl font-bold text-gray-900">
                  ₹{Number(expense.amount || 0).toLocaleString("en-IN")}
                </p>
              </div>

              <div className="flex flex-col items-end gap-1">
                <span className="text-xs text-gray-500">
                  Payment Mode
                </span>

                <span
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${getPaymentStyle(
                    expense.paymentMode
                  )}`}
                >
                  <Wallet size={13} />
                  {expense.paymentMode || "-"}
                </span>
              </div>
            </div>

            {/* WORK LOG */}
            <div className="mx-4 mb-3 rounded-lg border border-gray-100 bg-gray-50 p-3">
              <div className="mb-1.5 flex items-center gap-1.5">
                <FileText size={14} className="text-gray-500" />
                <span className="text-xs font-semibold text-gray-600">
                  Work Log
                </span>

                {expense.workLogs?.length > 0 && (
                  <span className="ml-auto rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-medium text-blue-700">
                    {expense.workLogs.length} Records
                  </span>
                )}
              </div>

              {latestWorkLog?.message ? (
                <>
                  <p className="break-words whitespace-pre-wrap text-sm text-gray-700">
                    {latestWorkLog.message}
                  </p>

                  <p className="mt-1.5 text-[11px] text-gray-400">
                    {latestWorkLog.createdBy || "System"}
                    {latestWorkLog.createdAt &&
                      ` • ${new Date(
                        latestWorkLog.createdAt
                      ).toLocaleString("en-IN")}`}
                  </p>
                </>
              ) : (
                <p className="text-xs text-gray-400">
                  No work logs available
                </p>
              )}
            </div>

            {/* ACTIONS */}
            <div className="flex items-center justify-end gap-2 border-t border-gray-100 px-4 py-3">
              <button
                type="button"
                onClick={() => onEdit(expense)}
                className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-xs font-semibold text-amber-700 transition hover:bg-amber-100"
              >
                <Pencil size={14} />
                Edit
              </button>

              <button
                type="button"
                onClick={() => onDelete(expense)}
                disabled={isDeleting}
                className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Trash2 size={14} />
                Delete
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default PropertyExpenseMobileCards;
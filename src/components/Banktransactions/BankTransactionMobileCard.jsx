import { useState } from "react";
import { Eye, Pencil, Copy, ChevronDown, ChevronUp } from "lucide-react";
import { Link } from "react-router-dom";
import { formatDate, formatDateAndTime } from "../../utils/dateFormatter";

const BankTransactionMobileCard = ({ item, onCopy, onLinkPayment }) => {
  const [showWorkLogs, setShowWorkLogs] = useState(false);

  const sortedWorkLogs = [...(item.workLogs || [])].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
  );

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm">
      {/* Date + Account + Source */}
      <div className="flex items-start justify-between gap-2 border-b border-gray-100 pb-2">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-gray-800">
            {formatDate(item.date)}
          </p>
          <p className="mt-1 text-xs text-gray-500 break-words">
            {item.account || "-"}
          </p>
        </div>

        <span className="shrink-0 rounded bg-blue-100 px-2 py-1 text-xs text-blue-700">
          {item.source || "-"}
        </span>
      </div>

      {/* Narration */}
      <div className="py-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="mb-1 text-xs text-gray-500">Narration</p>
            <p className="whitespace-pre-line break-words text-sm font-medium text-gray-800">
              {item.narration || "-"}
            </p>
          </div>

          <button
            type="button"
            onClick={() => onCopy(item.narration, item.chqNo)}
            className="shrink-0 rounded-md bg-gray-100 p-2 text-gray-600 hover:bg-gray-200"
            title="Copy narration"
          >
            <Copy size={15} />
          </button>
        </div>

        {item.chqNo && (
          <p className="mt-2 text-xs text-gray-500">
            Cheque / Ref No.:{" "}
            <span className="font-medium text-gray-700">{item.chqNo}</span>
          </p>
        )}
      </div>

      {/* Amounts */}
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-lg border border-red-100 bg-red-50 p-2">
          <p className="text-xs text-gray-500">Withdrawal</p>
          <p className="mt-1 break-words text-sm font-semibold text-red-600">
            {item.withdrawal
              ? `₹${Number(item.withdrawal).toLocaleString("en-IN")}`
              : "-"}
          </p>
        </div>

        <div className="rounded-lg border border-green-100 bg-green-50 p-2">
          <p className="text-xs text-gray-500">Deposit</p>
          <p className="mt-1 break-words text-sm font-semibold text-green-600">
            {item.deposit
              ? `₹${Number(item.deposit).toLocaleString("en-IN")}`
              : "-"}
          </p>
        </div>
      </div>

      {/* Transaction Details */}
      <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-3 border-t border-gray-100 pt-3">
        <Detail
          label="Property / Expense Code"
          value={
            item?.propertyId?.propertyCode || item?.expenseCode?.label || "-"
          }
        />
        <Detail label="Expense Category" value={item?.expenseCategory || "-"} />
        <Detail label="Assignee" value={item?.assignee || "-"} />
        <Detail label="Status" value={item?.status || "-"} />
        <Detail label="Reviewer" value={item?.reviewer || "-"} />
        <Detail label="Auditor" value={item?.auditor || "-"} />
        <Detail
          label="Balance"
          value={`₹${Number(item.balance || 0).toLocaleString("en-IN")}`}
        />
        <Detail label="Value Date" value={formatDate(item.valueDate)} />
        <Detail label="Created At" value={formatDate(item.createdAt)} />
      </div>

      {/* Work Logs */}
      <div className="mt-3 border-t border-gray-100 pt-3">
        <button
          type="button"
          onClick={() => setShowWorkLogs((prev) => !prev)}
          className="flex w-full items-center justify-between text-sm font-medium text-gray-700"
        >
          <span>Work Logs ({sortedWorkLogs.length})</span>
          {showWorkLogs ? <ChevronUp size={17} /> : <ChevronDown size={17} />}
        </button>

        {showWorkLogs && (
          <div className="mt-2 space-y-3">
            {sortedWorkLogs.length > 0 ? (
              sortedWorkLogs.map((log, index) => (
                <div
                  key={log._id || index}
                  className="rounded-lg bg-gray-50 p-2"
                >
                  <p className="text-xs text-gray-500">
                    {log.createdBy || "-"} • {formatDateAndTime(log.createdAt)}
                  </p>
                  <p className="mt-1 whitespace-pre-line break-words text-sm text-gray-700">
                    {log.message || "-"}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-xs text-gray-500">No work logs available.</p>
            )}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-gray-100 pt-3">
        {item?.deposit > 0 && (
          <button
            type="button"
            disabled={item?.isMapped}
            onClick={() => onLinkPayment(item)}
            className={`flex-1 rounded-lg px-3 py-2 text-sm text-white ${
              item?.isMapped
                ? "cursor-not-allowed bg-gray-300"
                : "bg-green-600 hover:bg-green-700"
            }`}
          >
            Link Payment
          </button>
        )}

        <button
          type="button"
          className="rounded-lg bg-blue-100 p-2 text-blue-700 hover:bg-blue-200"
          title="View"
        >
          <Eye size={17} />
        </button>

        <Link
          to={`/bank/edit/${item.account}/${item._id}`}
          className="rounded-lg bg-yellow-100 p-2 text-yellow-700 hover:bg-yellow-200"
          title="Edit"
        >
          <Pencil size={17} />
        </Link>
      </div>
    </div>
  );
};

const Detail = ({ label, value }) => (
  <div className="min-w-0">
    <p className="text-xs text-gray-500">{label}</p>
    <p className="mt-0.5 wrap-break-word text-sm font-medium text-gray-800">
      {value || "-"}
    </p>
  </div>
);

export default BankTransactionMobileCard;
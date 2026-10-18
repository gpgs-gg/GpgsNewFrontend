import React from "react";
import { X, FileText, RefreshCw } from "lucide-react";
import { useMyAttendanceRequests } from "./services/index";

const MyAttendanceRequestsModal = ({ onClose }) => {
  const { data, isLoading, isError, refetch, isFetching } =
    useMyAttendanceRequests({ page: 1, limit: 100 });

  const requests = data?.data || [];

  const getRequestStatus = (status) => {
    const styles = {
      PENDING: "bg-yellow-50 text-yellow-700",
      APPROVED: "bg-green-50 text-green-700",
      REJECTED: "bg-red-50 text-red-700",
    };

    return styles[status] || "bg-gray-100 text-gray-600";
  };

  const getAttendanceStatus = (status) => {
    if (status === 1 || status === "1" || status === "PRESENT") {
      return { label: "Present", style: "text-green-700 bg-green-50" };
    }

    if (status === 0.5 || status === "0.5" || status === "HALF_DAY") {
      return { label: "Half Day", style: "text-yellow-700 bg-yellow-50" };
    }

    if (status === 0 || status === "0" || status === "ABSENT") {
      return { label: "Absent", style: "text-red-700 bg-red-50" };
    }

    return { label: "--", style: "text-gray-500 bg-gray-50" };
  };

  const formatDate = (value) => {
    if (!value) return "--";

    return new Date(value).toLocaleDateString("en-IN", {
      timeZone: "Asia/Kolkata",
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-3 sm:p-5">
      <div className="flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-5 py-4">
          <div>
            <h2 className="text-lg font-bold text-gray-800">
              My Attendance Requests
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Track requests submitted to your manager.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => refetch()}
              disabled={isFetching}
              title="Refresh requests"
              className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 disabled:opacity-50"
            >
              <RefreshCw
                size={18}
                className={isFetching ? "animate-spin" : ""}
              />
            </button>

            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
              aria-label="Close requests"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Request list */}
        <div className="overflow-auto p-4 sm:p-5">
          {isLoading ? (
            <div className="py-12 text-center text-sm text-gray-500">
              Loading attendance requests...
            </div>
          ) : isError ? (
            <div className="py-12 text-center">
              <p className="text-sm text-red-600">
                Unable to load your attendance requests.
              </p>
              <button
                type="button"
                onClick={() => refetch()}
                className="mt-3 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
              >
                Try Again
              </button>
            </div>
          ) : requests.length === 0 ? (
            <div className="py-12 text-center">
              <FileText className="mx-auto mb-3 text-gray-400" size={36} />
              <p className="font-medium text-gray-700">
                No attendance requests found
              </p>
              <p className="mt-1 text-sm text-gray-500">
                Your submitted requests will appear here.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                  <tr>
                    <th className="px-4 py-3">Attendance Date</th>
                    <th className="px-4 py-3">Manager</th>
                    <th className="px-4 py-3">Reason</th>
                    <th className="px-4 py-3">Request Status</th>
                    <th className="px-4 py-3">Attendance Status</th>
                    <th className="px-4 py-3">Attachment</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {requests.map((request) => {
                    const attendanceStatus = getAttendanceStatus(
                      request.attendanceStatus,
                    );

                    return (
                      <tr key={request._id} className="hover:bg-gray-50">
                        <td className="whitespace-nowrap px-4 py-4 text-gray-700">
                          {formatDate(request.attendanceDate)}
                        </td>

                        <td className="px-4 py-4 text-gray-700">
                          {request.requestedTo?.employeeName || "--"}
                          {request.requestedTo?.employeeId && (
                            <p className="mt-1 text-xs text-gray-400">
                              {request.requestedTo.employeeId}
                            </p>
                          )}
                        </td>

                        <td className="max-w-[220px] px-4 py-4 text-gray-600">
                          <p className="whitespace-normal break-words">
                            {request.reason || "--"}
                          </p>
                        </td>

                        <td className="px-4 py-4">
                          <span
                            className={`whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold ${getRequestStatus(request.status)}`}
                          >
                            {request.status || "--"}
                          </span>
                        </td>

                        <td className="px-4 py-4">
                          <span
                            className={`whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold ${attendanceStatus.style}`}
                          >
                            {attendanceStatus.label}
                          </span>
                        </td>

                        <td className="px-4 py-4">
                          {request.attachment ? (
                            <a
                              href={request.attachment}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 whitespace-nowrap font-medium text-blue-600 hover:underline"
                            >
                              <FileText size={15} />
                              View file
                            </a>
                          ) : (
                            <span className="text-gray-400">--</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end border-t px-5 py-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default MyAttendanceRequestsModal;
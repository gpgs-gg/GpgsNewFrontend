import React, { useEffect, useState } from "react";
import { Check, XCircle, Trash2, FileText } from "lucide-react";
import { toast } from "react-toastify";
import { X, Paperclip, ExternalLink } from "lucide-react";
import NoDataFound from "../common/NoDataFound";
import Pagination from "../common/Pagination";
import ConfirmModal from "../common/ConfirmModal";

import { TableFilePreview } from "../common/FilePreview";
import { PAGINATION } from "../../constants/appConfig";
import { useAuthorization } from "../../context/AuthorizationContext";
import { useAuth } from "../../context/authContext";
import {
  useAllAttendanceRequests,
  useAttendanceRequestsAssignedToMe,
  useUpdateAttendanceRequestStatus,
  useDeleteAttendanceRequest,
  useRegularizeAttendance,
} from "./services/index";

// ======================================================
// HELPERS
// ======================================================
const formatDate = (value) => {
  if (!value) return "--";
  const match = String(value).match(/^\d{4}-\d{2}-\d{2}/);
  const d = match ? new Date(`${match[0]}T00:00:00`) : new Date(value);
  if (Number.isNaN(d.getTime())) return "--";
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const formatDateTime = (value) => {
  if (!value) return "--";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "--";
  return d.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

const formatTime = (value) => {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

// YYYY-MM-DD needed for the regularize API
const toApiDate = (value) => {
  if (!value) return "";
  const match = String(value).match(/^\d{4}-\d{2}-\d{2}/);
  if (match) return match[0];
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

const getApprovedBadge = (request) => {
  if (request.status === "APPROVED") {
    const t = String(
      request.requestType || request.approvedType || "",
    ).toUpperCase();

    if (t.includes("HALF")) {
      return {
        label: "Half Day",
        className: "bg-orange-100 text-orange-700",
      };
    }
    if (t.includes("ABSENT")) {
      return {
        label: "Absent",
        className: "bg-red-100 text-red-700",
      };
    }
    return {
      label: "Present",
      className: "bg-green-100 text-green-700",
    };
  }
  if (request.status === "REJECTED") {
    return { label: "Rejected", className: "bg-red-100 text-red-700" };
  }
  return { label: "Pending", className: "bg-yellow-100 text-yellow-700" };
};
// Normalize backend fields into our mode keys
const getCurrentMode = (request) => {
  if (request.status === "REJECTED") return "REJECTED";
  const t = String(
    request.approvedType || request.requestType || "",
  ).toUpperCase();
  if (t.includes("HALF")) return "HALF_DAY";
  if (t.includes("ABSENT")) return "ABSENT";
  if (request.status === "APPROVED") return "FULL_DAY";
  return "PENDING";
};

// Status chips config
const STATUS_CHIPS = [
  {
    key: "FULL_DAY",
    label: "Present",
    activeClass: "bg-black text-white border-black",
    idleClass: "bg-white text-gray-900 border-gray-400 hover:bg-gray-100",
  },
  {
    key: "HALF_DAY",
    label: "Half Day",
    activeClass: "bg-black text-white border-black",
    idleClass: "bg-white text-gray-900 border-gray-400 hover:bg-gray-100",
  },
  {
    key: "ABSENT",
    label: "Absent",
    activeClass: "bg-black text-white border-black",
    idleClass: "bg-white text-gray-900 border-gray-400 hover:bg-gray-100",
  },
  {
    key: "REJECTED",
    label: "Reject Request",
    activeClass: "bg-black text-white border-black",
    idleClass: "bg-white text-gray-900 border-gray-400 hover:bg-gray-100",
  },
];
// ======================================================
// MODAL — RIGHT SIDE DRAWER
// ======================================================
const AllAttendanceRequestsModal = ({ isOpen, onClose }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [statusTab, setStatusTab] = useState("PENDING");
  const [deleteId, setDeleteId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [processingId, setProcessingId] = useState(null);

  const rowsPerPage = PAGINATION.EMPLOYEES_PER_PAGE || 10;

  const { canEdit, canDelete } = useAuthorization();
  const canApproveReject = canEdit("all_attendance");
  const canDeleteRequest = canDelete("all_attendance");

  // Counts for each tab
  const { user } = useAuth();

  const isAdmin = user?.role?.toLowerCase() === "admin";
  const isManager = user?.designation?.toLowerCase() === "manager";

  // ... inside AllAttendanceRequestsModal component ...

  // Admin fetches all requests; manager fetches assigned requests only.
  const useRequestsQuery = isAdmin
    ? useAllAttendanceRequests
    : useAttendanceRequestsAssignedToMe;

  // ✅ Only fetch counts when the modal is OPEN

  // ✅ Only fetch the list when the modal is OPEN
  const listQuery = useRequestsQuery(
    {
      page: currentPage,
      limit: rowsPerPage,
      status: statusTab,
    },
    { enabled: isOpen }, // <--- ADD THIS
  );

  // ... rest of the code ...

  const updateStatusMutation = useUpdateAttendanceRequestStatus();
  const deleteMutation = useDeleteAttendanceRequest();
  const regularizeMutation = useRegularizeAttendance(); // ✅ NEW

  const requestList = listQuery.data?.data || [];
  const totalPages = listQuery.data?.totalPages || 1;

  const counts = {
    [statusTab]: listQuery.data?.totalRecords ?? 0,
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [statusTab]);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // ======================================================
  // REGULARIZE ATTENDANCE
  // status: 1 = Present, 0.5 = Half Day, 0 = Absent
  // mode:   "FULL_DAY" | "HALF_DAY" | "ABSENT"
  // ======================================================
  const handleRegularize = async (request, mode) => {

    const employeeId =
      request?.requestedBy?._id || request?.requestedBy || null;

    if (!employeeId) {
      toast.error("Employee not found on this request.");
      return;
    }

    const attendanceDate = toApiDate(request.attendanceDate);
    if (!attendanceDate) {
      toast.error("Invalid attendance date on this request.");
      return;
    }

    // Map mode → numeric status + labels
    const map = {
      FULL_DAY: {
        status: 1,
        remarks: "Full Day approved via request",
        worklog: "Request approved as Full Day by admin",
        success: "Marked as Present.",
        requestStatus: "APPROVED",
      },
      HALF_DAY: {
        status: 0.5,
        remarks: "Half Day approved via request",
        worklog: "Request approved as Half Day by admin",
        success: "Marked as Half Day.",
        requestStatus: "APPROVED",
      },
      ABSENT: {
        status: 0,
        remarks: "Marked Absent via request",
        worklog: "Request approved as Absent by admin",
        success: "Marked as Absent.",
        requestStatus: "APPROVED",
      },
    };




    const cfg = map[mode];
    if (!cfg) return;

    try {
      setProcessingId(request._id);

      // 1️⃣ Regularize attendance record
      const fd = new FormData();
      fd.append("employeeId", employeeId);
      fd.append("attendanceDate", attendanceDate);
      fd.append("status", String(cfg.status));
      fd.append("remarks", cfg.remarks);
      fd.append("newWorkLog", cfg.worklog);

      await regularizeMutation.mutateAsync(fd);

      // 2️⃣ Update request status
      const attendanceStatusMap = {
        FULL_DAY: 1,
        HALF_DAY: 0.5,
        ABSENT: 0,
      };

      await updateStatusMutation.mutateAsync({
        id: request._id,
        status: cfg.requestStatus,
        attendanceStatus: attendanceStatusMap[mode],
        approvedType: mode, // "FULL_DAY" | "HALF_DAY" | "ABSENT"
      });
      toast.dismiss()
      toast.success(cfg.success, {
        position: "top-center",
      });
    } catch (err) {
      toast.error(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to update attendance.",
      );
    } finally {
      setProcessingId(null);
    }
  };

  // ======================================================
  // REJECT — only flips the request status, does NOT touch
  // the underlying attendance record.
  // ======================================================
  const handleReject = async (request) => {
    try {
      setProcessingId(request._id);
      await updateStatusMutation.mutateAsync({
        id: request._id,
        status: "REJECTED",
      });
      toast.dismiss()
      toast.success("Request rejected." ,{
        position:"top-center"
      });
    } catch (err) {
      toast.error(
        err?.response?.data?.message || err?.message || "Failed to reject.",
      );
    } finally {
      setProcessingId(null);
    }
  };
  // Unified chip click — routes to reject or regularize
  const handleChipClick = (request, mode) => {
    if (processingId) return;
    if (mode === "REJECTED") {
      handleReject(request);
    } else {
      handleRegularize(request, mode);
    }
  };

  const handleConfirmDelete = () => {
    if (!deleteId) return;
    deleteMutation.mutate(deleteId, {
      onSuccess: (data) => {
        toast.success(data?.message || "Request deleted successfully.");
        setDeleteId(null);
        setSelectedRequest(null);
        setShowDeleteModal(false);
      },
      onError: (err) => {
        toast.error(
          err?.response?.data?.message || "Failed to delete request.",
        );
      },
    });
  };

  const tabs = [
    { key: "PENDING", label: "Pending" },
    { key: "APPROVED", label: "Approved" },
    { key: "REJECTED", label: "Rejected" },
  ];

  return (
    <>
      {/* BACKDROP */}
      <div
        className={`fixed inset-0 z-50 bg-slate-900/10 transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-10"
        }`}
        onClick={onClose}
      />

      {/* RIGHT SIDE DRAWER */}
      <div
        className={`fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-white shadow-2xl transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        role="dialog"
        aria-modal="true"
      >
        {/* HEADER */}
        <div className="shrink-0 bg-gray-900 px-5 py-4">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-base font-semibold text-white sm:text-lg">
              Attendance Requests
            </h2>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-gray-300 transition hover:bg-gray-800 hover:text-white"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* TABS */}
        <div className="flex items-center gap-2 border-b border-gray-200 bg-white px-4 py-3">
          {tabs.map((tab) => {
            const active = statusTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setStatusTab(tab.key)}
                className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                  active
                    ? "bg-gray-600 text-white shadow-sm"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {tab.label} {counts[tab.key] > 0 && `(${counts[tab.key]})`}
              </button>
            );
          })}
        </div>

        {/* LIST */}
        <div className="min-h-0 flex-1 overflow-y-auto bg-gray-50 p-3 sm:p-4">
          {listQuery.isLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="h-44 animate-pulse rounded-xl bg-white shadow-sm"
                />
              ))}
            </div>
          ) : requestList.length === 0 ? (
            <NoDataFound
              title="No Requests Found"
              description="There are no attendance requests in this status."
            />
          ) : (
            <div className="space-y-3">
              {requestList.map((request) => {
                const badge = getApprovedBadge(request);
                const employeeName =
                  request.requestedBy?.employeeName || "Unknown Employee";
                const employeeId = request.requestedBy?.employeeId || "—";
                const inTime = request.inTime || request.attendance?.inTime;
                const outTime = request.outTime || request.attendance?.outTime;
                const isProcessing = processingId === request._id;

                return (
                  <div
                    key={request._id}
                    className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition hover:shadow-md"
                  >
                    {/* Top row */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="truncate text-sm font-bold text-gray-900">
                          {employeeName}
                        </h3>
                        <p className="mt-0.5 text-xs text-gray-500">
                          ID: {employeeId}
                        </p>
                      </div>
                      <span className="shrink-0 rounded-full border border-gray-400 bg-white px-3 py-1 text-[11px] font-semibold text-gray-900">
                        {badge.label}
                      </span>
                    </div>
                    {/* Info grid */}
                    <div className="mt-3 grid grid-cols-4 gap-2 border-t border-gray-100 pt-3">
                      <div>
                        <p className="text-[10px] font-medium uppercase tracking-wide text-gray-400">
                          Attendance Date
                        </p>
                        <p className="mt-0.5 text-xs font-semibold text-gray-800">
                          {formatDate(request.attendanceDate)}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] font-medium uppercase tracking-wide text-gray-400">
                          In Time
                        </p>
                        <p className="mt-0.5 text-xs font-semibold text-gray-800">
                          {formatTime(inTime)}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] font-medium uppercase tracking-wide text-gray-400">
                          Out Time
                        </p>
                        <p className="mt-0.5 text-xs font-semibold text-gray-800">
                          {formatTime(outTime)}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] font-medium uppercase tracking-wide text-gray-400">
                          Created At
                        </p>
                        <p className="mt-0.5 text-xs font-semibold text-gray-800">
                          {formatDateTime(
                            request.createdAt || request.requestedAt,
                          )}
                        </p>
                      </div>
                    </div>

                    {/* Request Reason & Attendance Remarks */}
                    <div className="mt-3 grid grid-cols-2 gap-2 border-t border-gray-100 pt-3">
                      <div className="min-w-0 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
                        <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-500">
                          Request Reason
                        </p>
                        <p className="mt-1 whitespace-pre-wrap break-words text-xs leading-5 text-gray-700">
                          {request.reason || "No reason provided"}
                        </p>
                      </div>

                      <div>
                        {request.attachment && (
                          <div className="mt-2 flex items-center justify-between rounded-lg border border-gray-200 bg-white px-3 py-2">
                            <div className="flex min-w-0 items-center gap-2">
                              <Paperclip
                                size={14}
                                className="shrink-0 text-gray-500"
                              />
                              <span className="truncate text-xs font-medium text-gray-700">
                                Supporting Attachment
                              </span>
                            </div>

                            <a
                              href={request.attachment}
                              target="_blank"
                              rel="noopener noreferrer"
                              title="View attachment"
                              aria-label="View attendance attachment"
                              className="ml-2 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-blue-100 bg-blue-50 text-blue-600 transition hover:bg-blue-100"
                            >
                              <FileText size={16} />
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                    {/* Compact Attachment Icon */}

                    {/* <div className="mt-3 border-t border-gray-100 pt-3">
                      <p className="text-[10px] font-medium uppercase tracking-wide text-gray-400">
                        Request Reason
                      </p>
                      <p className="mt-0.5 whitespace-pre-wrap break-words text-xs text-gray-700">
                        {request.reason || "No reason provided"}
                      </p>
                    </div>
               
                    <div className="mt-3 rounded-lg border border-blue-100 bg-blue-50/70 px-3 py-2.5">
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-blue-600">
                        Attendance Remarks
                      </p>
                      <p className="mt-1 whitespace-pre-wrap break-words text-xs text-gray-700">
                        {request.attendance?.remarks ||
                          request.attendanceRemarks ||
                          "No attendance remarks"}
                      </p>
                    </div>
                    */}

                    {/* Actions — pending */}
                    {statusTab === "PENDING" && canApproveReject && (
                      <div className="mt-3 space-y-2 border-t border-gray-100 pt-3">
                        {/* Regularize row — 3 explicit statuses */}
                        <div className="grid grid-cols-3 gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              handleRegularize(request, "FULL_DAY")
                            }
                            disabled={isProcessing}
                            className="rounded-lg border border-gray-900 bg-black px-3 py-2 text-xs font-semibold text-white transition hover:bg-gray-800 disabled:opacity-50"
                          >
                            ✓ Present
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              handleRegularize(request, "HALF_DAY")
                            }
                            disabled={isProcessing}
                            className="rounded-lg border border-gray-400 bg-white px-3 py-2 text-xs font-semibold text-gray-900 transition hover:bg-gray-100 disabled:opacity-50"
                          >
                            ⊙ Half Day
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRegularize(request, "ABSENT")}
                            disabled={isProcessing}
                            className="rounded-lg border border-gray-400 bg-white px-3 py-2 text-xs font-semibold text-gray-900 transition hover:bg-gray-100 disabled:opacity-50"
                          >
                            ✕ Absent
                          </button>
                        </div>

                        {/* Reject row — only flips the request status */}
                        <button
                          type="button"
                          onClick={() => handleReject(request)}
                          disabled={isProcessing}
                          className="w-full rounded-lg border border-gray-400 bg-white px-3 py-2 text-xs font-semibold text-gray-900 transition hover:bg-gray-100 disabled:opacity-50"
                        >
                          Reject Request
                        </button>
                      </div>
                    )}
                    {/* Change Status — APPROVED / REJECTED tabs */}
                    {/* Change Status — APPROVED / REJECTED tabs */}
                    {(statusTab === "APPROVED" || statusTab === "REJECTED") &&
                      canApproveReject && (
                        <div className="mt-3 border-t border-gray-100 pt-3">
                          <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-gray-500">
                            Change Status
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {STATUS_CHIPS.map((chip) => {
                              const isActive =
                                getCurrentMode(request) === chip.key;
                              return (
                                <button
                                  key={chip.key}
                                  type="button"
                                  disabled={isProcessing || isActive}
                                  onClick={() =>
                                    handleChipClick(request, chip.key)
                                  }
                                  className={`rounded-full cursor-pointer border px-3 py-1.5 text-[11px] font-semibold text-gray-900 transition disabled:cursor-not-allowed ${
                                    isActive ? chip.activeClass : chip.idleClass
                                  } ${
                                    isProcessing && !isActive
                                      ? "opacity-50"
                                      : ""
                                  }`}
                                  title={
                                    isActive
                                      ? "Current status"
                                      : `Mark as ${chip.label}`
                                  }
                                >
                                  {isActive && "✓ "}
                                  {chip.label}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    {/* Delete */}
                    {/* {canDeleteRequest && (
                      <div className="mt-2 flex justify-end">
                        <button
                          type="button"
                          onClick={() => {
                            setDeleteId(request._id);
                            setSelectedRequest(request);
                            setShowDeleteModal(true);
                          }}
                          disabled={deleteMutation.isPending || isProcessing}
                          className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                        >
                          <Trash2 size={12} /> Delete
                        </button>
                      </div>
                    )} */}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* PAGINATION */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3">
            <span className="text-xs text-gray-500">
              Page {currentPage} of {totalPages}
            </span>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>

      {/* DELETE CONFIRM */}
      <ConfirmModal
        isOpen={showDeleteModal}
        title="Delete Attendance Request"
        message={
          selectedRequest
            ? `Are you sure you want to delete the request from ${
                selectedRequest.requestedBy?.employeeName || "this employee"
              } on ${formatDate(
                selectedRequest.attendanceDate,
              )}? This action cannot be undone.`
            : "This request will be permanently deleted."
        }
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setShowDeleteModal(false);
          setDeleteId(null);
          setSelectedRequest(null);
        }}
      />
    </>
  );
};

export default AllAttendanceRequestsModal;

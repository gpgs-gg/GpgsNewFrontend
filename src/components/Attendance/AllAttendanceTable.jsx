import React, { useState, useEffect, useMemo } from "react";
import ConfirmModal from "../common/ConfirmModal";
import { toast } from "react-toastify";
import { FaUserClock } from "react-icons/fa";
import { Filter } from "lucide-react";
import Pagination from "../Common/Pagination";
import NoDataFound from "../common/NoDataFound";
import TableSkeleton from "../../components/common/TableSkelton";
import { PAGINATION } from "../../constants/appConfig";
import useDebounce from "../hooks/useDebounce";
import AttendanceFilter from "./AttendanceFilter";
import { useEmployeeDetailsData } from "../EmployeeDetails/Services/index";
import { useAllAttendance, useDeleteAttendance } from "./services/index";
import { TableFilePreview } from "../../components/common/FilePreview";
import AttendanceRegularizationModal from "./AttendanceRegularizationModal ";
import { useAuthorization } from "../../context/AuthorizationContext";
import { Trash2 } from "lucide-react";
import usePersistedFilters from "../hooks/usePersistedFilters";
const AllAttendanceTable = () => {
  const DEFAULT_ATTENDANCE_FILTERS = {
    month: "",
    date: "",
    status: "",
    employeeId: "",
  };

  const { filters, setFilters, updateFilters, removeFilter, resetFilters } =
    usePersistedFilters("attendance_filters", DEFAULT_ATTENDANCE_FILTERS);
  const [search, setSearch] = useState("");

  // ======================================================
  // STATE
  // ======================================================
  const [currentPage, setCurrentPage] = useState(1);

  const [regularizeOpen, setRegularizeOpen] = useState(false);
  const [selectedAttendance, setSelectedAttendance] = useState(null);

  const [deleteId, setDeleteId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [resetTrigger, setResetTrigger] = useState(0);
  const debouncedSearch = useDebounce(search);

  const rowsPerPage = PAGINATION.EMPLOYEES_PER_PAGE || 10;
  const DATE_WIDTH = 120;
  const EMPLOYEE_ID_WIDTH = 120;
  const EMPLOYEE_NAME_WIDTH = 160;
  const ACTION_WIDTH = 190;
  const { canEdit, canDelete } = useAuthorization();

  const canEditAttendance = canEdit("attendance");
  const canDeleteAttendance = canDelete("attendance");

  const showActions = canEditAttendance || canDeleteAttendance;
  const [filterOpen, setFilterOpen] = useState(false);

  // ======================================================
  // API
  // ======================================================

  const {
    data: response,
    isLoading,
    isFetching,
  } = useAllAttendance({
    page: currentPage,
    limit: rowsPerPage,
    ...filters,
    search: debouncedSearch,
  });

  // ======================================================
  // DATA
  // ======================================================

  const attendanceList = response?.data || [];

  const pagination = response?.pagination || {};

  const totalPages = pagination.totalPages || 1;

  const totalRecords = pagination.total || 0;
  const { data: employeeResponse } = useEmployeeDetailsData({
    page: 1,
    limit: 1000,
  });
  const employees = employeeResponse?.data || [];
  const deleteAttendanceMutation = useDeleteAttendance();
  // ======================================================
  // STATUS
  // ======================================================
  const filterLabels = useMemo(() => {
    const labels = [];

    if (filters.month) {
      labels.push({
        key: "month",
        label: `Month : ${filters.month}`,
      });
    }

    if (filters.date) {
      labels.push({
        key: "date",
        label: `Date : ${filters.date}`,
      });
    }

    if (filters.status) {
      const statusLabel =
        filters.status === "1"
          ? "Present"
          : filters.status === "0.5"
            ? "Half Day"
            : "Absent";

      labels.push({
        key: "status",
        label: `Status : ${statusLabel}`,
      });
    }

    if (filters.employeeId) {
      const employee = employees.find(
        (item) => item._id === filters.employeeId,
      );

      if (employee) {
        labels.push({
          key: "employeeId",
          label: `Employee : ${employee.employeeName}`,
        });
      }
    }

    return labels;
  }, [filters, employees]);
  const getAttendanceStatus = (attendance) => {
    const numericStatus = Number(attendance.status);

    if (attendance.inTime && !attendance.outTime) {
      return {
        label: "Absent",
        className: "bg-red-50 text-red-600",
      };
    }

    if (numericStatus === 1) {
      return {
        label: "Present",
        className: "bg-green-50 text-green-600",
      };
    }

    if (numericStatus === 0.5) {
      return {
        label: "Half Day",
        className: "bg-yellow-50 text-yellow-600",
      };
    }

    return {
      label: "Absent",
      className: "bg-red-50 text-red-600",
    };
  };

  // ======================================================
  // FORMAT DATE
  // ======================================================

  const formatDate = (dateValue) => {
    if (!dateValue) return "--";

    return new Date(dateValue).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };
  const handleDeleteAttendance = (attendance) => {
    if (!attendance?._id) return;

    setDeleteId(attendance._id);
    setSelectedAttendance(attendance);
    setShowDeleteModal(true);
  };
  const handleConfirmDelete = () => {
    if (!deleteId) return;

    deleteAttendanceMutation.mutate(deleteId, {
      onSuccess: (data) => {
        toast.dismiss();
        toast.success(data?.message || "Attendance deleted successfully.");

        // If deleting the only record on a page,
        // move to previous page.
        if (attendanceList.length === 1 && currentPage > 1) {
          setCurrentPage((prev) => prev - 1);
        }

        setDeleteId(null);
        setSelectedAttendance(null);
        setShowDeleteModal(false);
      },

      onError: (error) => {
        console.error("Delete Attendance Error:", error);

        toast.error(
          error?.response?.data?.message || "Failed to delete attendance.",
        );
      },
    });
  };
  // ======================================================
  // FORMAT TIME
  // ======================================================

  const formatTime = (dateValue) => {
    if (!dateValue) return "--";

    return new Date(dateValue).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  // ======================================================
  // FORMAT MINUTES
  // ======================================================

  const formatMinutes = (minutes = 0) => {
    if (!minutes) return "0H 0M";

    const hours = Math.floor(minutes / 60);

    const remainingMinutes = minutes % 60;

    return `${hours}H ${remainingMinutes}M`;
  };

  // ======================================================
  // RESET FILTERS
  // ======================================================

  const handleReset = () => {
    resetFilters();

    setSearch("");
    setCurrentPage(1);

    setResetTrigger((prev) => prev + 1);
  };

  const totalColumns = 14 + (showActions ? 1 : 0);
  // ======================================================
  // UI
  // ======================================================

  return (
    <>
      {/* ==================================================
        HEADER
    ================================================== */}

      <div className="bg-white rounded-xl shadow-sm border border-gray-400 px-3 py-2">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold uppercase">All Attendance</h1>

            <p className="text-sm text-gray-500">
              View attendance records of all employees
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setSelectedAttendance(null);
                setRegularizeOpen(true);
              }}
              className="theme-btn text-white px-4 py-2 rounded-lg hover:bg-gray-700"
            >
              + Add Attendance
            </button>

            <div className="flex items-center border gap-2 rounded-lg bg-green-50 px-4 py-2">
              <FaUserClock className="text-green-600" />

              <span className="text-sm font-semibold text-gray-700">
                Total Records: {totalRecords}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ==================================================
        TABLE CARD
    ================================================== */}

      <div className="bg-white rounded-xl border shadow-sm overflow-hidden flex flex-col h-[75vh] mt-3">
        {/* ==================================================
          SEARCH + FILTER BAR
      ================================================== */}
        <div className="px-3 py-2 border-b border-gray-400 flex justify-between gap-3">
          {/* SEARCH */}

          <div className="relative w-80">
            <input
              type="text"
              className="border px-3 py-2 pr-10 rounded-lg w-full"
              placeholder="Search employee..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
            />

            {search && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setCurrentPage(1);

                 
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-red-500"
              >
                ✕
              </button>
            )}
          </div>

          {/* FILTER CHIPS */}

          <div className="flex flex-wrap items-center gap-2 flex-1">
            {filterLabels.map((filter) => (
              <div
                key={filter.key}
                className="group inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm shadow-sm transition-all duration-200 hover:border-slate-300 hover:bg-slate-100"
              >
                <span className="mr-2 font-medium text-slate-700">
                  {filter.label}
                </span>

                <button
                  type="button"
                  onClick={() => removeFilter(filter.key)}
                  className="flex h-5 w-5 items-center justify-center rounded-full text-slate-400 transition-colors duration-200 hover:bg-red-100 hover:text-red-600"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          {/* FILTER BUTTON */}

          <div className="flex gap-2">
            {filterLabels.length > 0 && (
              <button
                type="button"
                onClick={handleReset}
                className="border border-gray-300 px-4 py-2 rounded-lg text-red-500"
              >
                Reset
              </button>
            )}

            <button
              onClick={() => setFilterOpen(true)}
              className="border border-gray-300 px-4 py-2 rounded-lg flex items-center gap-2"
            >
              <Filter size={16} />
              Filters
            </button>
          </div>
        </div>

        {/* ==================================================
          TABLE CONTENT
      ================================================== */}
        <div className="flex-1 overflow-auto">
          <table className="min-w-max w-full border-separate border-spacing-0">
            <thead className="sticky top-0 bg-gray-100 z-30">
              <tr>
                <th
                  className="p-3 text-left whitespace-nowrap sticky left-0 z-20 bg-gray-100"
                  style={{
                    width: `${DATE_WIDTH}px`,
                    minWidth: `${DATE_WIDTH}px`,
                  }}
                >
                  Date
                </th>

                <th
                  className="p-3 text-left whitespace-nowrap sticky left-[120px] z-20 bg-gray-100"
                  style={{
                    width: `${EMPLOYEE_ID_WIDTH}px`,
                    minWidth: `${EMPLOYEE_ID_WIDTH}px`,
                  }}
                >
                  Employee ID
                </th>

                <th
                  className="p-3 text-left whitespace-nowrap sticky left-[240px] z-20 bg-gray-100"
                  style={{
                    width: `${EMPLOYEE_NAME_WIDTH}px`,
                    minWidth: `${EMPLOYEE_NAME_WIDTH}px`,
                  }}
                >
                  Employee Name
                </th>

                <th className="p-3 text-left whitespace-nowrap">Department</th>

                <th className="p-3 text-left whitespace-nowrap">Designation</th>

                <th className="p-3 text-left whitespace-nowrap">In Time</th>

                <th className="p-3 text-left whitespace-nowrap">In Selfie</th>

                <th className="p-3 text-left whitespace-nowrap">Out Time</th>

                <th className="p-3 text-left whitespace-nowrap">Out Selfie</th>

                <th className="p-3 text-left whitespace-nowrap">Total Hours</th>

                <th className="p-3 text-left whitespace-nowrap">Overtime</th>

                <th className="p-3 text-left whitespace-nowrap">Deficit</th>

                <th className="p-3 text-center whitespace-nowrap">Status</th>
                <th className="p-3 text-center whitespace-nowrap">Document</th>
                {showActions && (
                  <th
                    className="p-3 text-center whitespace-nowrap sticky right-0 z-20 bg-gray-100"
                    style={{
                      width: `${ACTION_WIDTH}px`,
                      minWidth: `${ACTION_WIDTH}px`,
                    }}
                  >
                    Action
                  </th>
                )}
              </tr>
            </thead>

            {isLoading ? (
              <TableSkeleton rows={8} columns={15} />
            ) : (
              <tbody>
                {attendanceList.length > 0 ? (
                  attendanceList.map((attendance) => {
                    const statusData = getAttendanceStatus(attendance);
                    return (
                      <tr
                        key={attendance._id}
                        className="border-t border-gray-300 hover:bg-gray-50"
                      >
                        {/* DATE */}

                        <td
                          className="p-3 whitespace-nowrap text-sm text-gray-700 sticky left-0 z-10 bg-white"
                          style={{
                            width: `${DATE_WIDTH}px`,
                            minWidth: `${DATE_WIDTH}px`,
                          }}
                        >
                          {formatDate(attendance.attendanceDate)}
                        </td>

                        {/* EMPLOYEE ID */}

                        <td
                          className="p-3 whitespace-nowrap font-semibold sticky left-[120px] z-10 bg-white"
                          style={{
                            width: `${EMPLOYEE_ID_WIDTH}px`,
                            minWidth: `${EMPLOYEE_ID_WIDTH}px`,
                          }}
                        >
                          {attendance.employeeId?.employeeId || "--"}
                        </td>

                        {/* EMPLOYEE NAME */}

                        <td
                          className="p-3 whitespace-nowrap font-semibold sticky left-[240px] z-10 bg-white"
                          style={{
                            width: `${EMPLOYEE_NAME_WIDTH}px`,
                            minWidth: `${EMPLOYEE_NAME_WIDTH}px`,
                          }}
                        >
                          {attendance.employeeId?.employeeName || "--"}
                        </td>

                        {/* DEPARTMENT */}

                        <td className="p-3 whitespace-nowrap">
                          {attendance.employeeId?.department || "--"}
                        </td>

                        {/* DESIGNATION */}

                        <td className="p-3 whitespace-nowrap">
                          {attendance.employeeId?.designation || "--"}
                        </td>

                        {/* IN TIME */}

                        <td className="p-3 whitespace-nowrap">
                          {formatTime(attendance.inTime)}
                        </td>

                        {/* IN SELFIE */}

                        <td className="p-3">
                          {attendance.inSelfie?.url ? (
                            <TableFilePreview files={[attendance.inSelfie]} />
                          ) : (
                            <span className="text-xs text-gray-400">--</span>
                          )}
                        </td>

                        {/* OUT TIME */}

                        <td className="p-3 whitespace-nowrap">
                          {formatTime(attendance.outTime)}
                        </td>

                        {/* OUT SELFIE */}
                        <td className="p-3">
                          {attendance.outSelfie?.url ? (
                            <TableFilePreview files={[attendance.outSelfie]} />
                          ) : (
                            <span className="text-xs text-gray-400">--</span>
                          )}
                        </td>
                        {/* TOTAL */}

                        <td className="p-3 whitespace-nowrap font-medium">
                          {formatMinutes(attendance.totalMinutes)}
                        </td>

                        {/* OVERTIME */}

                        <td className="p-3 whitespace-nowrap">
                          {formatMinutes(attendance.overtimeMinutes)}
                        </td>

                        {/* DEFICIT */}

                        <td className="p-3 whitespace-nowrap">
                          {formatMinutes(attendance.deficitMinutes)}
                        </td>

                        {/* STATUS */}

                        <td className="p-3 text-center">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              Number(attendance.status) === 1
                                ? "bg-green-100 text-green-700"
                                : Number(attendance.status) === 0.5
                                  ? "bg-yellow-100 text-yellow-700"
                                  : "bg-red-100 text-red-700"
                            }`}
                          >
                            {statusData.label}
                          </span>
                        </td>
                        {/* REGULARIZATION DOCUMENT */}
                        {/* REGULARIZATION DOCUMENTS */}
                        <td className="p-3 text-center">
                          {attendance.regularizationDocuments?.length > 0 ? (
                            <TableFilePreview
                              files={attendance.regularizationDocuments.map(
                                (doc) => ({
                                  url: doc.url,
                                  publicId: doc.publicId,
                                  originalName: doc.originalName,
                                  mimeType: doc.mimeType,
                                  size: doc.size,
                                }),
                              )}
                            />
                          ) : (
                            <span className="text-xs text-gray-400">--</span>
                          )}
                        </td>
                        {/* Regularize Attendance */}
                        {showActions && (
                          <td
                            className="p-3 text-center sticky right-0 z-10 bg-white"
                            style={{
                              width: `${ACTION_WIDTH}px`,
                              minWidth: `${ACTION_WIDTH}px`,
                            }}
                          >
                            <div className="flex items-center justify-center gap-2">
                              {/* EDIT / REGULARIZE */}
                              {canEditAttendance && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedAttendance(attendance);
                                    setRegularizeOpen(true);
                                  }}
                                  disabled={deleteAttendanceMutation.isPending}
                                  className="
            rounded-lg
            border border-blue-200
            bg-blue-50
            px-3 py-1.5
            text-xs
            font-semibold
            text-blue-600
            hover:bg-blue-100
            cursor-pointer
            disabled:cursor-not-allowed
            disabled:opacity-50
          "
                                >
                                  Regularize
                                </button>
                              )}

                              {/* DELETE */}
                              {canDeleteAttendance && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setDeleteId(attendance._id);
                                    setSelectedAttendance(attendance);
                                    setShowDeleteModal(true);
                                  }}
                                  disabled={deleteAttendanceMutation.isPending}
                                  className="
            p-2
            cursor-pointer
            bg-red-100
            rounded-lg
            hover:bg-red-200
            disabled:opacity-50
          "
                                  title="Delete Attendance"
                                >
                                  <Trash2 size={16} />
                                </button>
                              )}
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={totalColumns}>
                      <NoDataFound
                        title="No Attendance Found"
                        description="Try searching or changing the attendance filters"
                      />
                    </td>
                  </tr>
                )}
              </tbody>
            )}
          </table>
        </div>
        {/* ==================================================
          PAGINATION
      ================================================== */}
        <div className="border-t p-3 flex justify-between items-center">
          <span className="text-sm text-gray-500">
            Showing{" "}
            {totalRecords === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1} -{" "}
            {Math.min(currentPage * rowsPerPage, totalRecords)} of{" "}
            {totalRecords}
          </span>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
        <AttendanceFilter
          isOpen={filterOpen}
          employees={employees}
          resetTrigger={resetTrigger}
          initialFilters={filters}
          onClose={() => setFilterOpen(false)}
          onApply={(data) => {
            setFilters({
              month: data.month || "",
              date: data.date || "",
              status: data.status || "",
              employeeId: data.employeeId || "",
            });

            setCurrentPage(1);
          }}
          handleReset={handleReset}
        />
        {/* attendance regularization model */}
        <AttendanceRegularizationModal
          isOpen={regularizeOpen}
          attendance={selectedAttendance}
          employees={employees}
          onClose={() => {
            setRegularizeOpen(false);
            setSelectedAttendance(null);
          }}
          onSuccess={() => {
            // React Query refetch can happen here
            // depending on your query configuration.
          }}
        />
        <ConfirmModal
          isOpen={showDeleteModal}
          title="Delete Attendance"
          message={
            selectedAttendance
              ? `Are you sure you want to permanently delete attendance for ${
                  selectedAttendance.employeeId?.employeeName || "this employee"
                } on ${formatDate(selectedAttendance.attendanceDate)}? This action cannot be undone.`
              : "This attendance record will be permanently deleted."
          }
          onConfirm={handleConfirmDelete}
          onCancel={() => {
            setShowDeleteModal(false);
            setDeleteId(null);
            setSelectedAttendance(null);
          }}
        />
      </div>
    </>
  );
};

export default AllAttendanceTable;
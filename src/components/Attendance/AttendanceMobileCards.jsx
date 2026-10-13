import React, { useState } from "react";
import EmployeeAttendanceRequestModal from "./AttendanceRequestForm";
import { FaCalendarAlt } from "react-icons/fa";
import { TableFilePreview } from "../common/FilePreview";
import { useCreateAttendanceRequest } from "./services/index";
const AttendanceHistoryCards = ({
  attendanceList = [],
  isLoading = false,
  formatDate,
  formatTime,
  formatMinutes,
  getAttendanceStatus,
  managers = [],
  onSubmitRegularization,
}) => {
  const [selectedAttendance, setSelectedAttendance] = useState(null);
  const createRequestMutation = useCreateAttendanceRequest();

  const handleAttendanceRequestSubmit = async (formData) => {
    await createRequestMutation.mutateAsync(formData);
    setSelectedAttendance(null);
  };

  // In AttendanceHistoryCards.jsx
  const getAttendanceDateForInput = (value) => {
    if (!value) return "";

    const match = String(value).match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (match) {
      // Build a LOCAL date (not UTC) so no shift occurs
      const [, y, m, d] = match;
      return `${y}-${m}-${d}`;
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };
  return (
    <div className="p-3 md:p-5">
      {/* Loading */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="animate-pulse rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
            >
              <div className="mb-5 flex items-center justify-between">
                <div className="h-4 w-36 rounded bg-gray-200" />
                <div className="h-4 w-16 rounded bg-gray-200" />
              </div>

              <div className="mb-4 h-3 w-28 rounded bg-gray-100" />
              <div className="mb-5 grid grid-cols-2 gap-4">
                <div className="h-24 rounded bg-gray-100" />
                <div className="h-24 rounded bg-gray-100" />
              </div>

              <div className="h-4 rounded bg-gray-100" />
            </div>
          ))}
        </div>
      ) : attendanceList.length === 0 ? (
        /* Empty State */
        <div className="flex min-h-[220px] flex-col items-center justify-center rounded-lg border border-gray-200 bg-white px-4 text-center">
          <FaCalendarAlt className="mb-3 text-3xl text-gray-300" />

          <h3 className="text-sm font-semibold text-gray-800">
            No Attendance Records
          </h3>

          <p className="mt-1 text-sm text-gray-500">
            No attendance records found for the selected period.
          </p>
        </div>
      ) : (
        /* Attendance Cards */
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-3">
          {attendanceList.map((attendance) => {
            const status = getAttendanceStatus(attendance.status);
            const isComplete = Boolean(attendance.inTime && attendance.outTime);

            return (
              <article
                key={attendance._id}
                className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-shadow duration-200 hover:shadow-md"
              >
                <div className="p-4">
                  {/* Employee Name and Status */}
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="min-w-0 truncate text-sm font-semibold text-gray-900">
                      {attendance.employeeId?.employeeName || "--"}
                    </h3>

                    <span
                      className={`shrink-0 text-xs font-semibold ${status.className}`}
                    >
                      {status.label}
                    </span>
                  </div>

                  {/* Employee ID */}
                  <p className="mt-5 text-xs text-gray-500">
                    Employee ID:{" "}
                    <span className="text-gray-600">
                      {attendance.employeeId?.employeeId || "--"}
                    </span>
                  </p>

                  {/* Attendance Date */}
                  <p className="mt-3 text-xs text-gray-500">
                    Date: {formatDate(attendance.attendanceDate)}
                  </p>

                  {/* In Time and Out Time */}
                  <div className="mt-4 grid grid-cols-2 gap-4">
                    {/* Check In */}
                    <div className="min-w-0">
                      <p className="text-xs text-gray-500">In Time</p>

                      <p className="mt-1 text-sm font-semibold text-gray-900">
                        {formatTime(attendance.inTime)}
                      </p>

                      <div className="mt-2 h-[60px] w-[60px] overflow-hidden rounded-lg border border-gray-200">
                        {attendance.inSelfie?.url ? (
                          <TableFilePreview files={[attendance.inSelfie]} />
                        ) : (
                          <div className="flex h-full items-center justify-center bg-gray-50 text-center text-[10px] text-gray-400">
                            No selfie
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Check Out */}
                    <div className="min-w-0 text-right">
                      <p className="text-xs text-gray-500">Out Time</p>

                      <p className="mt-1 text-sm font-semibold text-gray-900">
                        {formatTime(attendance.outTime)}
                      </p>

                      <div className="ml-auto mt-2 h-[60px] w-[60px] overflow-hidden rounded-lg border border-gray-200">
                        {attendance.outSelfie?.url ? (
                          <TableFilePreview files={[attendance.outSelfie]} />
                        ) : (
                          <div className="flex h-full items-center justify-center bg-gray-50 text-center text-[10px] text-gray-400">
                            No selfie
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Working Hours Summary */}
                  <div className="mt-4 border-t border-gray-100 pt-3">
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
                      <p className="text-gray-500">
                        Total Hours:{" "}
                        <span className="font-semibold text-gray-700">
                          {formatMinutes(attendance.totalMinutes)}
                        </span>
                      </p>

                      <p className="text-gray-500">
                        OverTime:{" "}
                        <span className="font-semibold text-gray-700">
                          {formatMinutes(attendance.overtimeMinutes)}
                        </span>
                      </p>

                      <p className="text-gray-500">
                        DeficitHours:{" "}
                        <span className="font-semibold text-gray-700">
                          {formatMinutes(attendance.deficitMinutes)}
                        </span>
                      </p>
                    </div>

                    {!isComplete && (
                      <p className="mt-2 text-[11px] text-amber-600">
                        Attendance incomplete
                      </p>
                    )}
                  </div>
                </div>
                {/* ATTENDANCE REGULARIZATION BUTTON */}
                <div className="border-t border-gray-100 px-4 pb-4 pt-3">
                  <button
                    type="button"
                    onClick={() => setSelectedAttendance(attendance)}
                    className="w-full rounded-xl border border-green-200 bg-green-50 px-4 py-2.5 text-sm font-semibold text-green-700 transition hover:border-green-300 hover:bg-green-100"
                  >
                    Request Regularization
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* ATTENDANCE REGULARIZATION MODAL */}
      {/* ATTENDANCE REGULARIZATION MODAL */}
      {selectedAttendance && (
        <EmployeeAttendanceRequestModal
          attendance={{
            ...selectedAttendance,
            attendanceDate: getAttendanceDateForInput(
              selectedAttendance.attendanceDate,
            ),
          }}
          managers={managers}
          onClose={() => setSelectedAttendance(null)}
          onSubmit={handleAttendanceRequestSubmit}
        />
      )}
    </div>
  );
};

export default AttendanceHistoryCards;
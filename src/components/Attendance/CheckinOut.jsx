import React, { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import Pagination from "../Common/Pagination";
import { PAGINATION } from "../../constants/appConfig";
import {
  FaCamera,
  FaSignInAlt,
  FaSignOutAlt,
  FaUserClock,
  FaCalendarAlt,
  FaClock,
} from "react-icons/fa";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { TableFilePreview } from "../../components/common/FilePreview";
import { toast } from "react-toastify";

import {
  useTodayAttendance,
  useMyAttendance,
  useCheckInAttendance,
  useCheckOutAttendance,
} from "./services/index";

const CheckinOut = () => {
  // ======================================================
  // STATE
  // ======================================================

  const [currentPage, setCurrentPage] = useState(1);
  const [month, setMonth] = useState("");
  const [currentTime, setCurrentTime] = useState(new Date());

  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraMode, setCameraMode] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [selectedSelfie, setSelectedSelfie] = useState(null);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  // ======================================================
  // API
  // ======================================================

  const { data: todayResponse, isLoading: isTodayLoading } =
    useTodayAttendance();
  const rowsPerPage = PAGINATION.EMPLOYEES_PER_PAGE || 5;
  const { data: historyResponse, isLoading: isHistoryLoading } =
    useMyAttendance({
      page: currentPage,
      limit: rowsPerPage,
      month,
    });

  const { mutate: checkIn, isPending: isCheckingIn } = useCheckInAttendance();

  const { mutate: checkOut, isPending: isCheckingOut } =
    useCheckOutAttendance();

  // ======================================================
  // DATA
  // ======================================================

  const todayAttendance = todayResponse?.data || null;

  const attendanceList = historyResponse?.data || [];
  const pagination = historyResponse?.pagination || {};

  const totalPages = pagination.totalPages || 1;

  const totalRecords = pagination.total || 0;
  // ======================================================
  // LIVE CLOCK
  // ======================================================

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // ======================================================
  // EMPLOYEE WORKING HOURS
  // ======================================================
  // Backend source:
  //
  // employee.workingHours
  // employee.halfDayHours
  //
  // Backend defaults:
  // Full Day  = 9 hours
  // Half Day  = 5 hours
  // ======================================================

  const employeeWorkingHours = Number(
    todayAttendance?.employeeId?.workingHours,
  );

  const employeeHalfDayHours = Number(
    todayAttendance?.employeeId?.halfDayHours,
  );

  const requiredWorkingHours =
    Number.isFinite(employeeWorkingHours) && employeeWorkingHours > 0
      ? employeeWorkingHours
      : 9;

  const halfDayWorkingHours =
    Number.isFinite(employeeHalfDayHours) && employeeHalfDayHours > 0
      ? employeeHalfDayHours
      : 5;

  const requiredWorkingMinutes = requiredWorkingHours * 60;

  const halfDayWorkingMinutes = halfDayWorkingHours * 60;

  // ======================================================
  // CHECK-IN / CHECK-OUT STATUS
  // ======================================================

  const hasCheckedIn = Boolean(todayAttendance?.inTime);

  const hasCheckedOut = Boolean(todayAttendance?.outTime);

  // ======================================================
  // LIVE WORKED SECONDS
  // ======================================================

  const getLiveWorkedSeconds = () => {
    if (!todayAttendance?.inTime) {
      return 0;
    }

    const start = new Date(todayAttendance.inTime);

    const end = todayAttendance.outTime
      ? new Date(todayAttendance.outTime)
      : currentTime;

    const workedSeconds = Math.floor((end.getTime() - start.getTime()) / 1000);

    return Math.max(workedSeconds, 0);
  };

  const liveWorkedSeconds = getLiveWorkedSeconds();

  const liveWorkedMinutes = Math.floor(liveWorkedSeconds / 60);

  // ======================================================
  // REMAINING WORKING TIME
  // ======================================================
  // IMPORTANT:
  // This uses employee-specific working hours.
  //
  // Example:
  // workingHours = 8
  // remaining = 8 hours - live worked time
  //
  // It continuously decreases because currentTime
  // updates every second.
  // ======================================================

  const remainingSeconds = Math.max(
    requiredWorkingMinutes * 60 - liveWorkedSeconds,
    0,
  );

  // ======================================================
  // HALF DAY REMAINING TIME
  // ======================================================

  const halfDayRemainingSeconds = Math.max(
    halfDayWorkingMinutes * 60 - liveWorkedSeconds,
    0,
  );

  // ======================================================
  // CHECK-IN TIME RESTRICTION
  // ======================================================
  // This is frontend-only.
  // Your current backend does NOT enforce 10 AM.
  // ======================================================

  const getIndiaHour = () => {
    const indiaHour = new Intl.DateTimeFormat("en-IN", {
      timeZone: "Asia/Kolkata",
      hour: "2-digit",
      hour12: false,
    }).format(currentTime);

    return Number(indiaHour);
  };

  const canCheckIn = getIndiaHour() >= 10;

  // ======================================================
  // FORMAT REMAINING TIME
  // ======================================================

  const formatRemainingTime = (seconds = 0) => {
    const safeSeconds = Math.max(Number(seconds) || 0, 0);

    const hours = Math.floor(safeSeconds / 3600);

    const minutes = Math.floor((safeSeconds % 3600) / 60);

    const secs = safeSeconds % 60;

    return `${hours}H ${minutes}M ${String(secs).padStart(2, "0")}S`;
  };

  // ======================================================
  // FORMAT MINUTES
  // ======================================================

  const formatMinutes = (minutes = 0) => {
    const safeMinutes = Math.max(Number(minutes) || 0, 0);

    const hours = Math.floor(safeMinutes / 60);

    const remainingMinutes = safeMinutes % 60;

    return `${hours}H ${remainingMinutes}M`;
  };

  // ======================================================
  // FORMAT TIME
  // ======================================================

  const formatTime = (date) => {
    if (!date) return "--";

    return new Date(date).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  // ======================================================
  // FORMAT DATE
  // ======================================================

  const formatDate = (date) => {
    if (!date) return "--";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  // ======================================================
  // CAMERA
  // ======================================================

  const openCamera = async (mode) => {
    // --------------------------------------------------
    // CHECK-IN TIME RESTRICTION
    // --------------------------------------------------
    if (mode === "check-in" && !canCheckIn) {
      toast.warning("Check-in is available only after 10:00 AM.");
      return;
    }

    try {
      setCameraMode(mode);
      setCapturedImage(null);

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
        },
        audio: false,
      });

      streamRef.current = stream;

      setCameraOpen(true);

      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }, 100);
    } catch (error) {
      console.error("Camera Error:", error);

      toast.error("Unable to access camera. Please allow camera permission.");
    }
  };

  // ======================================================
  // STOP CAMERA
  // ======================================================

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        track.stop();
      });

      streamRef.current = null;
    }

    setCameraOpen(false);
  };

  // ======================================================
  // CAPTURE SELFIE
  // ======================================================

  const captureSelfie = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas) {
      toast.error("Camera is not ready.");
      return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context = canvas.getContext("2d");

    if (!context) {
      toast.error("Unable to capture selfie.");
      return;
    }

    // Mirror image
    context.save();

    context.translate(canvas.width, 0);

    context.scale(-1, 1);

    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    context.restore();

    canvas.toBlob(
      (blob) => {
        if (!blob) {
          toast.error("Unable to capture selfie. Please try again.");
          return;
        }

        const imageUrl = URL.createObjectURL(blob);

        setCapturedImage({
          blob,
          url: imageUrl,
        });

        stopCamera();

        const formData = new FormData();

        formData.append("selfie", blob, "attendance-selfie.jpg");

        // ==================================================
        // CHECK IN
        // ==================================================

        if (cameraMode === "check-in") {
          checkIn(formData, {
            onSuccess: (response) => {
              const utterance = new SpeechSynthesisUtterance(
                "Jai Shree Ram, Check-in successful",
              );

              utterance.lang = "hi-IN";
              utterance.rate = 0.9;
              utterance.pitch = 1;

              window.speechSynthesis.cancel();
              window.speechSynthesis.speak(utterance);
toast.dismiss();
              toast.success(response?.message || "Check-in successful!");

              setCapturedImage(null);
              setCameraMode(null);
            },

            onError: (error) => {
              console.error("Check In Error:", error);

              toast.error(
                error?.response?.data?.message ||
                  "Check-in failed. Please try again.",
              );

              setCapturedImage(null);
              setCameraMode(null);
            },
          });
        }

        // ==================================================
        // CHECK OUT
        // ==================================================

        if (cameraMode === "check-out") {
          checkOut(formData, {
            onSuccess: (response) => {
              const utterance = new SpeechSynthesisUtterance(
                "Jai Shree Ram, Check-out successful. Have a nice day",
              );

              utterance.lang = "hi-IN";
              utterance.rate = 0.9;
              utterance.pitch = 1;

              window.speechSynthesis.cancel();
              window.speechSynthesis.speak(utterance);
toast.dismiss();
              toast.success(response?.message || "Check-out successful!");

              setCapturedImage(null);
              setCameraMode(null);
            },

            onError: (error) => {
              console.error("Check Out Error:", error);

              toast.error(
                error?.response?.data?.message ||
                  "Check-out failed. Please try again.",
              );

              setCapturedImage(null);
              setCameraMode(null);
            },
          });
        }
      },
      "image/jpeg",
      0.85,
    );
  };

  // ======================================================
  // ATTENDANCE STATUS
  // ======================================================

  const getAttendanceStatus = (status) => {
    const numericStatus = Number(status);

    if (numericStatus === 1) {
      return {
        label: "Present",
        className:
          "bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20",
      };
    }

    if (numericStatus === 0.5) {
      return {
        label: "Half Day",
        className:
          "bg-yellow-50 text-yellow-700 ring-1 ring-inset ring-yellow-600/20",
      };
    }

    return {
      label: "Absent",
      className: "bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/20",
    };
  };

  return (
    <div className="p-4 md:p-6">
      {/* ==================================================
          PAGE HEADER
      ================================================== */}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
        {/* ==================================================
            TODAY ATTENDANCE CARD
        ================================================== */}

        <div className="overflow-hidden max-h-fit rounded-2xl border border-gray-200 bg-white shadow-sm p-2">
          {/* CARD HEADER */}

          <div className="border-b border-gray-100 bg-gradient-to-r from-green-50 to-white px-5 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-100">
                  <FaUserClock className="text-green-600" />
                </div>

                <div>
                  <h2 className="font-bold text-gray-900">
                    Today's Attendance
                  </h2>

                  <p className="mt-0.5 text-xs text-gray-500">
                    {formatDate(new Date())}
                  </p>
                </div>
              </div>

              {hasCheckedOut ? (
                <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                  Completed
                </span>
              ) : hasCheckedIn ? (
                <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                  Working
                </span>
              ) : (
                <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
                  Not Started
                </span>
              )}
            </div>
          </div>
          {/* ==================================================
              CAMERA
          ================================================== */}

          <div className="relative mb-3 flex h-[260px] items-center justify-center overflow-hidden rounded-2xl bg-gray-950 ring-1 ring-gray-200">
            {capturedImage ? (
              <img
                src={capturedImage.url}
                alt="Attendance selfie"
                className="h-full w-full object-cover"
              />
            ) : cameraOpen ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="h-full w-full object-cover scale-x-[-1]"
              />
            ) : (
              <div className="flex flex-col items-center text-gray-500">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-800">
                  <FaCamera size={28} className="text-gray-400" />
                </div>

                <p className="mt-4 text-sm font-medium text-gray-300">
                  Camera preview
                </p>

                <p className="mt-1 text-xs text-gray-500">
                  Your selfie will appear here
                </p>
              </div>
            )}
          </div>

          <canvas ref={canvasRef} className="hidden" />

          {/* CAPTURE BUTTON */}
          {cameraOpen && (
            <div className="absolute left-3 top-3 z-10 rounded-full bg-black/60 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur">
              {cameraMode === "check-in"
                ? "Check-In Selfie"
                : "Check-Out Selfie"}
            </div>
          )}
          {cameraOpen && (
            <button
              type="button"
              onClick={captureSelfie}
              disabled={isCheckingIn || isCheckingOut}
              className="mb-3 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-900 py-3.5 font-semibold text-white shadow-sm transition-all hover:bg-blue-800 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
            >
              <FaCamera />
              {isCheckingIn || isCheckingOut
                ? "Processing..."
                : "Capture Selfie"}
            </button>
          )}

          {/* ==================================================
              TODAY IN / OUT
          ================================================== */}

          <div className="mb-2">
            {/* CHECK IN - OUT */}

            {/* REMAINING TIME */}
            {hasCheckedIn && (
              <div className="rounded-xl border border-orange-100 bg-orange-50 p-3.5">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium text-orange-700">
                    Remaining
                  </p>

                  <FaClock className="text-orange-500" />
                </div>

                <p className="mt-2 text-md font-bold text-orange-700">
                  {formatRemainingTime(remainingSeconds)}
                </p>
              </div>
            )}
          </div>

          {/* ==================================================
              ACTION BUTTONS
          ================================================== */}

          <div className="grid grid-cols-2 gap-3">
            {/* CHECK IN */}
            <div className="flex flex-col">
              <p className="mt-2 text-center font-medium text-gray-800">
                {todayAttendance?.inTime
                  ? formatTime(todayAttendance.inTime)
                  : "--"}
              </p>

              <button
                type="button"
                disabled={hasCheckedIn || isCheckingIn || !canCheckIn}
                onClick={() => openCamera("check-in")}
                className="group mt-2 flex min-h-[52px] items-center justify-center gap-2 rounded-xl bg-green-600 px-4 py-3.5 font-semibold text-white shadow-sm transition-all hover:bg-green-700 hover:shadow-md disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400"
              >
                <FaSignInAlt className="transition-transform group-hover:-translate-x-0.5" />

                <span>{hasCheckedIn ? "Checked In" : "Check In"}</span>
              </button>
            </div>

            {/* CHECK OUT */}
            <div className="flex flex-col">
              <p className="mt-2 text-center font-medium text-gray-800">
                {todayAttendance?.outTime
                  ? formatTime(todayAttendance.outTime)
                  : "--"}
              </p>

              <button
                type="button"
                disabled={!hasCheckedIn || hasCheckedOut || isCheckingOut}
                onClick={() => openCamera("check-out")}
                className="group mt-2 flex min-h-[52px] items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 py-3.5 font-semibold text-white shadow-sm transition-all hover:bg-orange-600 hover:shadow-md disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400"
              >
                <FaSignOutAlt className="transition-transform group-hover:translate-x-0.5" />

                <span>{hasCheckedOut ? "Checked Out" : "Check Out"}</span>
              </button>
            </div>
          </div>

          {/* CHECK-IN MESSAGE */}

          {!hasCheckedIn && !canCheckIn && (
            <div className="mt-3 rounded-xl border border-red-100 bg-red-50 px-3 py-2.5 text-center">
              <p className="text-xs font-medium text-red-600">
                Check-in is available after 10:00 AM.
              </p>

              <p className="mt-0.5 text-[11px] text-red-500">
                Please return after the permitted check-in time.
              </p>
            </div>
          )}
        </div>

        {/* ==================================================
            HISTORY
        ================================================== */}

        <div className="rounded-xl bg-white shadow-md">
          {/* HEADER */}

          <div className="flex flex-col gap-4 border-b p-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-800">
                Attendance History
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <DatePicker
                selected={month ? new Date(`${month}-01`) : null}
                onChange={(date) => {
                  if (date) {
                    const year = date.getFullYear();
                    const monthNumber = String(date.getMonth() + 1).padStart(
                      2,
                      "0",
                    );

                    setMonth(`${year}-${monthNumber}`);
                  } else {
                    setMonth("");
                  }

                  setCurrentPage(1);
                }}
                dateFormat="MMM yyyy"
                showMonthYearPicker
                isClearable
                placeholderText="Select Month"
                className="custom-datepicker"
              />
            </div>
          </div>

          {/* TABLE */}

          <div className="overflow-x-auto">
            <table className="w-full min-w-275">
              <thead className="sticky top-0 bg-gray-100 z-30">
                <tr>
                  <th className="w-[130px] min-w-[130px] whitespace-nowrap px-5 py-3.5 text-left text-md font-semibold tracking-wide">
                    Date
                  </th>

                  <th className="w-[150px] min-w-[150px] whitespace-nowrap px-5 py-3.5 text-left text-md font-semibold tracking-wide">
                    Employee ID
                  </th>

                  <th className="whitespace-nowrap px-5 py-3.5 text-left text-md font-semibold  tracking-wide ">
                    Employee Name
                  </th>

                  <th className="whitespace-nowrap px-5 py-3.5 text-left text-md font-semibold  tracking-wide ">
                    In Time
                  </th>

                  <th className="whitespace-nowrap px-5 py-3.5 text-left text-md font-semibold  tracking-wide ">
                    In Selfie
                  </th>

                  <th className="whitespace-nowrap px-5 py-3.5 text-left text-md font-semibold  tracking-wide ">
                    Out Time
                  </th>

                  <th className="whitespace-nowrap px-5 py-3.5 text-left text-md font-semibold  tracking-wide ">
                    Out Selfie
                  </th>

                  <th className="whitespace-nowrap px-5 py-3.5 text-left text-md font-semibold  tracking-wide ">
                    Total Hours
                  </th>

                  <th className="whitespace-nowrap px-5 py-3.5 text-left text-md font-semibold  tracking-wide ">
                    OverTime
                  </th>

                  <th className="whitespace-nowrap px-5 py-3.5 text-left text-md font-semibold  tracking-wide ">
                    Deficit Hours
                  </th>

                  <th className="whitespace-nowrap px-5 py-3.5 text-left text-md font-semibold  tracking-wide ">
                    Status
                  </th>
                </tr>
              </thead>

              <tbody>
                {isHistoryLoading ? (
                  <tr>
                    <td
                      colSpan="11"
                      className="py-10 text-center text-gray-500"
                    >
                      Loading attendance...
                    </td>
                  </tr>
                ) : attendanceList.length === 0 ? (
                  <tr>
                    <td
                      colSpan="11"
                      className="py-10 text-center text-gray-500"
                    >
                      No attendance records found.
                    </td>
                  </tr>
                ) : (
                  attendanceList.map((attendance) => (
                    <tr
                      key={attendance._id}
                      className="border-b border-gray-100 transition-colors hover:bg-green-50/30"
                    >
                      {/* DATE */}

                      <td className="px-5 py-4 text-md text-gray-700">
                        {formatDate(attendance.attendanceDate)}
                      </td>

                      {/* EMPLOYEE ID */}

                      <td className="px-5 py-4 text-md font-medium text-gray-700">
                        {attendance.employeeId?.employeeId || "--"}
                      </td>

                      {/* EMPLOYEE NAME */}

                      <td className="px-5 py-4 text-md font-medium text-gray-800">
                        {attendance.employeeId?.employeeName || "--"}
                      </td>

                      {/* IN TIME */}

                      <td className="px-5 py-4 text-md text-gray-700">
                        {formatTime(attendance.inTime)}
                      </td>

                      {/* IN SELFIE */}

                      {/* IN SELFIE */}

                      <td className="px-5 py-4">
                        {attendance.inSelfie?.url ? (
                          <TableFilePreview files={[attendance.inSelfie]} />
                        ) : (
                          <span className="text-xs text-gray-400">--</span>
                        )}
                      </td>
                      {/* OUT TIME */}

                      {/* OUT SELFIE */}

                      <td className="px-5 py-4 text-md text-gray-700">
                        {formatTime(attendance.outTime)}
                      </td>
                      {/* OUT SELFIE */}
                      <td className="px-5 py-4">
                        {attendance.outSelfie?.url ? (
                          <TableFilePreview files={[attendance.outSelfie]} />
                        ) : (
                          <span className="text-xs text-gray-400">--</span>
                        )}
                      </td>

                      {/* TOTAL */}

                      <td className="px-5 py-4 text-md font-medium text-gray-700">
                        {formatMinutes(attendance.totalMinutes)}
                      </td>

                      {/* OVERTIME */}

                      <td className="px-5 py-4 text-md text-gray-700">
                        {formatMinutes(attendance.overtimeMinutes)}
                      </td>

                      {/* DEFICIT */}

                      <td className="px-5 py-4 text-md text-gray-700">
                        {formatMinutes(attendance.deficitMinutes)}
                      </td>

                      {/* STATUS */}

                      <td className="px-5 py-4">
                        {(() => {
                          const status = getAttendanceStatus(attendance.status);

                          return (
                            <span
                              className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${status.className}`}
                            >
                              {status.label}
                            </span>
                          );
                        })()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* ==================================================
              PAGINATION
          ================================================== */}

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
        </div>
      </div>
    </div>
  );
};

export default CheckinOut;
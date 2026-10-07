import React, { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import Pagination from "../common/Pagination";
import { PAGINATION } from "../../constants/appConfig";
import {
  FaCamera,
  FaSignInAlt,
  FaSignOutAlt,
  FaUserClock,
  FaCalendarAlt,
  FaClock,
  FaDownload,
} from "react-icons/fa";
import jsPDF from "jspdf";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { TableFilePreview } from "../../components/common/FilePreview";
import { toast } from "react-toastify";
import { useEmployeeExistingSalaries } from "../Salary/services/index";

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
  const [showAllSalaries, setShowAllSalaries] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  // ======================================================
  // API
  // ======================================================

  const { data: todayResponse, isLoading: isTodayLoading } =
    useTodayAttendance();

  const todayAttendance = todayResponse?.data || null;

  const { data: existingSalaryResponse, isLoading: isExistingSalaryLoading } =
    useEmployeeExistingSalaries(todayAttendance?.employeeId?.employeeId);

  const existingSalaries = existingSalaryResponse?.data?.salaries || [];

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

  const isAttendanceProcessing = isCheckingIn || isCheckingOut;

  // ======================================================
  // DATA
  // ======================================================

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

    if (!video.videoWidth || !video.videoHeight) {
      toast.error("Camera is still starting. Please try again.");
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

        // ================================
        // CHECK IN
        // ================================

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

        // ================================
        // CHECK OUT
        // ================================

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
  useEffect(() => {
    if (!cameraOpen) return;

    // Give the camera time to initialize before capturing
    const timer = setTimeout(() => {
      captureSelfie();
    }, 1500);

    return () => clearTimeout(timer);
  }, [cameraOpen]);
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
  // ======================================================
  // DOWNLOAD SALARY SLIP
  // ======================================================

  // ======================================================
  // DOWNLOAD SALARY SLIP
  // ======================================================

  const downloadSalarySlip = (salary) => {
    try {
      const doc = new jsPDF();

      const employeeName =
        existingSalaryResponse?.data?.employeeName ||
        todayAttendance?.employeeId?.employeeName ||
        "--";

      const employeeId =
        existingSalaryResponse?.data?.employeeId ||
        todayAttendance?.employeeId?.employeeId ||
        "--";

      const designation = todayAttendance?.employeeId?.designation || "--";

      const department = todayAttendance?.employeeId?.department || "--";

      const monthName = new Date(
        salary.year,
        salary.month - 1,
      ).toLocaleDateString("en-IN", {
        month: "long",
        year: "numeric",
      });

      const monthlySalary = Number(salary.monthlySalary || 0);
      const payableSalary = Number(salary.payableSalary || 0);
      const paidAmount = Number(salary.paidAmount || 0);

      // Salary difference treated as salary adjustment/deduction
      const salaryAdjustment = Math.max(monthlySalary - payableSalary, 0);

      const totalDeductions = salaryAdjustment;

      const formatAmount = (amount) =>
        `Rs. ${Number(amount || 0).toLocaleString("en-IN")}`;

      // ==================================================
      // PAGE
      // ==================================================

      doc.setDrawColor(210, 210, 210);
      doc.setLineWidth(0.4);

      doc.roundedRect(15, 12, 180, 270, 2, 2);

      // ==================================================
      // COMPANY HEADER
      // ==================================================

      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);
      doc.setTextColor(25, 50, 85);

      doc.text("GPGS Technology", 21, 25);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(80, 80, 80);

      doc.text("Gopal's Paying Guest Services", 21, 32);

      doc.setDrawColor(200, 200, 200);
      doc.line(21, 38, 189, 38);

      // ==================================================
      // SALARY SLIP TITLE
      // ==================================================

      doc.setFillColor(225, 242, 250);
      doc.roundedRect(20, 43, 170, 12, 2, 2, "F");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(15);
      doc.setTextColor(25, 50, 85);

      doc.text(`Salary Slip - ${monthName}`, 105, 51, {
        align: "center",
      });

      // ==================================================
      // A. EMPLOYEE DETAILS
      // ==================================================

      doc.setFillColor(225, 242, 250);
      doc.roundedRect(20, 61, 170, 8, 1, 1, "F");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(25, 50, 85);

      doc.text("A. Employee Details", 23, 66.5);

      doc.setDrawColor(215, 215, 215);
      doc.roundedRect(20, 69, 170, 47, 1, 1);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(50, 50, 50);

      const employeeDetails = [
        ["Employee Name", employeeName],
        ["Employee ID", employeeId],
        ["Designation", designation],
        ["Department", department],
        ["Pay Period", monthName],
        ["Payable Days", String(Number(salary.totalPayableDays || 0))],
        ["Paid Leave Days", String(Number(salary.paidLeaveDays || 0))],
        ["Public Holiday Days", String(Number(salary.publicHolidayDays || 0))],
      ];

      let detailY = 76;

      employeeDetails.forEach(([label, value]) => {
        doc.text(label, 23, detailY);
        doc.text(":", 68, detailY);
        doc.text(String(value), 73, detailY);

        detailY += 5;
      });

      // ==================================================
      // B. EARNINGS
      // ==================================================

      doc.setFillColor(220, 240, 225);
      doc.roundedRect(20, 121, 83, 8, 1, 1, "F");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(30, 70, 45);

      doc.text("B. Earnings", 23, 126.5);

      doc.setDrawColor(215, 215, 215);
      doc.roundedRect(20, 129, 83, 48, 1, 1);

      // Table header
      doc.setFillColor(242, 246, 250);
      doc.rect(20, 129, 83, 8, "F");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(45, 55, 65);

      doc.text("Component", 23, 134.5);
      doc.text("Amount", 78, 134.5);

      doc.line(68, 129, 68, 177);

      // Basic Salary
      doc.setFont("helvetica", "normal");
      doc.text("Basic Salary", 23, 143);
      doc.text(formatAmount(monthlySalary), 78, 143);

      doc.line(20, 146, 103, 146);

      // Paid Salary
      doc.text("Payable Salary", 23, 152);
      doc.text(formatAmount(payableSalary), 78, 152);

      doc.line(20, 155, 103, 155);

      // Paid Amount
      doc.text("Paid Amount", 23, 161);
      doc.text(formatAmount(paidAmount), 78, 161);

      doc.line(20, 164, 103, 164);

      // Gross Salary
      doc.setFillColor(225, 242, 225);
      doc.rect(20, 164, 83, 13, "F");

      doc.setFont("helvetica", "bold");
      doc.text("Gross Salary", 23, 172);
      doc.text(formatAmount(monthlySalary), 78, 172);

      // ==================================================
      // C. DEDUCTIONS
      // ==================================================

      doc.setFillColor(250, 225, 232);
      doc.roundedRect(107, 121, 83, 8, 1, 1, "F");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(100, 45, 60);

      doc.text("C. Deductions", 110, 126.5);

      doc.setDrawColor(215, 215, 215);
      doc.roundedRect(107, 129, 83, 48, 1, 1);

      // Table header
      doc.setFillColor(242, 246, 250);
      doc.rect(107, 129, 83, 8, "F");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(45, 55, 65);

      doc.text("Component", 110, 134.5);
      doc.text("Amount", 165, 134.5);

      doc.line(155, 129, 155, 177);

      // Salary Adjustment
      doc.setFont("helvetica", "normal");

      doc.text("Salary Adjustment", 110, 143);
      doc.text(formatAmount(salaryAdjustment), 165, 143);

      doc.line(107, 146, 190, 146);

      // Unpaid Days
      doc.text("Unpaid Days", 110, 152);
      doc.text(
        String(
          Math.max(
            0,
            Number(salary.totalPayableDays || 0) -
              Number(salary.paidLeaveDays || 0) -
              Number(salary.publicHolidayDays || 0),
          ),
        ),
        165,
        152,
      );

      doc.line(107, 155, 190, 155);

      // Other deductions
      doc.text("Other Deductions", 110, 161);
      doc.text("Rs. 0", 165, 161);

      doc.line(107, 164, 190, 164);

      // Total deductions
      doc.setFillColor(250, 225, 232);
      doc.rect(107, 164, 83, 13, "F");

      doc.setFont("helvetica", "bold");
      doc.text("Total Deductions", 110, 172);
      doc.text(formatAmount(totalDeductions), 165, 172);

      // ==================================================
      // D. PAYMENT SUMMARY
      // ==================================================

      doc.setFillColor(232, 235, 250);
      doc.roundedRect(20, 183, 170, 8, 1, 1, "F");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(45, 55, 100);

      doc.text("D. Payment Summary", 23, 188.5);

      doc.setDrawColor(215, 215, 215);
      doc.roundedRect(20, 191, 170, 38, 1, 1);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(50, 50, 50);

      doc.text("Monthly Salary", 23, 200);
      doc.text(formatAmount(monthlySalary), 150, 200);

      doc.text("Total Deductions", 23, 208);
      doc.text(formatAmount(totalDeductions), 150, 208);

      doc.text("Payable Salary", 23, 216);
      doc.text(formatAmount(payableSalary), 150, 216);

      // ==================================================
      // NET SALARY
      // ==================================================

      doc.setFillColor(225, 242, 250);
      doc.roundedRect(20, 235, 170, 14, 2, 2, "F");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(25, 50, 85);

      doc.text("Net Salary / Take-Home Pay", 24, 244);

      doc.text(formatAmount(payableSalary), 185, 244, {
        align: "right",
      });

      // ==================================================
      // PAID AMOUNT
      // ==================================================

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(70, 70, 70);

      doc.text(`Paid Amount: ${formatAmount(paidAmount)}`, 105, 258, {
        align: "center",
      });

      // ==================================================
      // FOOTER
      // ==================================================

      doc.setFontSize(8);
      doc.setTextColor(120, 120, 120);

      doc.text("This is a system generated salary slip.", 105, 270, {
        align: "center",
      });

      // ==================================================
      // DOWNLOAD
      // ==================================================

      const safeEmployeeId = employeeId.replace(/[^a-zA-Z0-9-_]/g, "_");

      const safeMonth = monthName.replace(/\s+/g, "-");

      doc.save(`Salary-Slip-${safeEmployeeId}-${safeMonth}.pdf`);

      toast.success("Salary slip downloaded successfully.");
    } catch (error) {
      console.error("Salary Slip Download Error:", error);

      toast.error("Unable to download salary slip.");
    }
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
            {isAttendanceProcessing ? (
              <div className="flex flex-col items-center justify-center text-white">
                <div className="relative flex h-16 w-16 items-center justify-center">
                  <div className="absolute h-16 w-16 animate-spin rounded-full border-4 border-gray-600 border-t-green-500" />
                  <FaClock className="text-xl text-green-400" />
                </div>

                <p className="mt-4 text-sm font-semibold">
                  {isCheckingIn ? "Checking in..." : "Checking out..."}
                </p>

                <p className="mt-1 text-xs text-gray-400">
                  Please wait while we process your attendance
                </p>
              </div>
            ) : capturedImage ? (
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
                {isCheckingIn ? (
                  <>
                    <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    <span>Checking In...</span>
                  </>
                ) : (
                  <>
                    <FaSignInAlt className="transition-transform group-hover:-translate-x-0.5" />
                    <span>{hasCheckedIn ? "Checked In" : "Check In"}</span>
                  </>
                )}
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
                {isCheckingOut ? (
                  <>
                    <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    <span>Checking Out...</span>
                  </>
                ) : (
                  <>
                    <FaSignOutAlt className="transition-transform group-hover:translate-x-0.5" />
                    <span>{hasCheckedOut ? "Checked Out" : "Check Out"}</span>
                  </>
                )}
              </button>
            </div>
          </div>
          {/* EMPLOYEE SALARY */}
          {/* EMPLOYEE SALARY */}
          <div className="mt-3 rounded-xl border border-green-100 bg-green-50 p-3">
            <button
              type="button"
              onClick={() => setShowAllSalaries((prev) => !prev)}
              className="w-full rounded-lg border border-green-200 bg-white px-3 py-2 text-xs font-semibold text-green-700 transition hover:bg-green-100"
            >
              {showAllSalaries ? "Hide Previous Salaries" : "Show All Salaries"}
            </button>

            {showAllSalaries && (
              <div className="mt-3 border-t border-green-200 pt-3">
                {isExistingSalaryLoading ? (
                  <p className="py-3 text-center text-xs text-gray-500">
                    Loading salaries...
                  </p>
                ) : existingSalaries.length === 0 ? (
                  <p className="py-3 text-center text-xs text-gray-500">
                    No previous salary records found.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {existingSalaries.map((salary) => (
                      <div
                        key={salary._id}
                        className="rounded-lg border border-green-100 bg-white p-3"
                      >
                        {/* MONTH + PAYABLE SALARY */}
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-semibold text-gray-800">
                            {new Date(
                              salary.year,
                              salary.month - 1,
                            ).toLocaleDateString("en-IN", {
                              month: "long",
                              year: "numeric",
                            })}
                          </p>

                          <p className="text-sm font-bold text-green-700">
                            ₹{" "}
                            {Number(salary.payableSalary || 0).toLocaleString(
                              "en-IN",
                            )}
                          </p>
                        </div>

                        {/* SALARY DETAILS */}
                        <div className="mt-2 grid grid-cols-2 gap-2 text-[11px]">
                          {/* MONTHLY SALARY */}
                          <div>
                            <p className="text-gray-400">Monthly Salary</p>
                            <p className="font-medium text-gray-700">
                              ₹{" "}
                              {Number(salary.monthlySalary || 0).toLocaleString(
                                "en-IN",
                              )}
                            </p>
                          </div>

                          {/* PAYABLE SALARY */}
                          <div>
                            <p className="text-gray-400">Payable Salary</p>
                            <p className="font-medium text-gray-700">
                              ₹{" "}
                              {Number(salary.payableSalary || 0).toLocaleString(
                                "en-IN",
                              )}
                            </p>
                          </div>

                          {/* TOTAL PAYABLE DAYS */}
                          <div>
                            <p className="text-gray-400">Payable Days</p>
                            <p className="font-medium text-gray-700">
                              {Number(salary.totalPayableDays || 0)}
                            </p>
                          </div>

                          {/* PAID LEAVE DAYS */}
                          <div>
                            <p className="text-gray-400">Paid Leave Days</p>
                            <p className="font-medium text-gray-700">
                              {Number(salary.paidLeaveDays || 0)}
                            </p>
                          </div>

                          {/* PUBLIC HOLIDAY DAYS */}
                          <div>
                            <p className="text-gray-400">Public Holiday Days</p>
                            <p className="font-medium text-gray-700">
                              {Number(salary.publicHolidayDays || 0)}
                            </p>
                          </div>

                          {/* PAID AMOUNT */}
                          <div>
                            <p className="text-gray-400">Paid Amount</p>
                            <p className="font-medium text-gray-700">
                              ₹{" "}
                              {Number(salary.paidAmount || 0).toLocaleString(
                                "en-IN",
                              )}
                            </p>
                          </div>
                        </div>
                        {/* DOWNLOAD SALARY SLIP */}
                        <button
                          type="button"
                          onClick={() => downloadSalarySlip(salary)}
                          className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-green-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-green-700"
                        >
                          <FaDownload />
                          Download Salary Slip
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
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
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
  FaTicketAlt,
} from "react-icons/fa";
import jsPDF from "jspdf";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { TableFilePreview } from "../../components/common/FilePreview";
import { toast } from "react-toastify";
import { useEmployeeExistingSalaries } from "../Salary/services/index";
import AttendanceHistoryCards from "./AttendanceMobileCards";
import {
  useTodayAttendance,
  useMyAttendance,
  useCheckInAttendance,
  useCheckOutAttendance,
} from "./services/index";
import { useCreateAttendanceRequest } from "./services/index";
import EmployeeAttendanceRequestModal from "./AttendanceRequestForm";
import MyAttendanceRequestsModal from "./MyAttendanceRequestsModal";
const CheckinOut = () => {
  // ======================================================
  // STATE
  // ======================================================

  const [currentPage, setCurrentPage] = useState(1);
  const [month, setMonth] = useState(() => {
    const now = new Date();

    const year = now.getFullYear();
    const monthNumber = String(now.getMonth() + 1).padStart(2, "0");

    return `${year}-${monthNumber}`;
  });
  const [currentTime, setCurrentTime] = useState(new Date());

  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraMode, setCameraMode] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [selectedSelfie, setSelectedSelfie] = useState(null);
  const [showAllSalaries, setShowAllSalaries] = useState(false);
  const [isOpeningCamera, setIsOpeningCamera] = useState(false);
  const [selectedAttendance, setSelectedAttendance] = useState(null);
  const [showMyRequests, setShowMyRequests] = useState(false);

  const createRequestMutation = useCreateAttendanceRequest();

  // Preserve the date portion without timezone shifts
  const getAttendanceDateForInput = (value) => {
    if (!value) return "";

    // If the backend already returns YYYY-MM-DD, preserve it.
    const dateOnlyMatch = String(value).match(/^(\d{4}-\d{2}-\d{2})$/);

    if (dateOnlyMatch) {
      return dateOnlyMatch[1];
    }

    // Convert timestamp to the correct Indian calendar date.
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "";

    const parts = new Intl.DateTimeFormat("en-IN", {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).formatToParts(date);

    const getPart = (type) => parts.find((part) => part.type === type)?.value;

    return `${getPart("year")}-${getPart("month")}-${getPart("day")}`;
  };

  const handleAttendanceRequestSubmit = async (formData) => {
    await createRequestMutation.mutateAsync(formData);
    setSelectedAttendance(null);
  };
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

  // ======================================================
  // CHECK-IN TIME RESTRICTION
  // ======================================================

  // Change these values whenever you want to update check-in time.
  const CHECK_IN_HOUR = 6;
  const CHECK_IN_MINUTE = 45;
  useEffect(() => {
    const startCameraOnPageLoad = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user" },
          audio: false,
        });

        streamRef.current = stream;
        setCameraOpen(true);
      } catch (error) {
        // console.error("Camera Error:", error);
        toast.dismiss();
        //   toast.error("Unable to access camera. Please allow camera permission.");
      }
    };

    startCameraOnPageLoad();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    };
  }, []);
  const getIndiaTimeInMinutes = () => {
    const parts = new Intl.DateTimeFormat("en-IN", {
      timeZone: "Asia/Kolkata",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).formatToParts(currentTime);

    const hour = Number(parts.find((part) => part.type === "hour")?.value);

    const minute = Number(parts.find((part) => part.type === "minute")?.value);

    return hour * 60 + minute;
  };

  const allowedCheckInMinutes = CHECK_IN_HOUR * 60 + CHECK_IN_MINUTE;

  const canCheckIn = getIndiaTimeInMinutes() >= allowedCheckInMinutes;
  const formattedCheckInTime = new Date(
    2000,
    0,
    1,
    CHECK_IN_HOUR,
    CHECK_IN_MINUTE,
  ).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
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
    if (mode === "check-in" && !canCheckIn) {
      toast.warning(
        `Check-in is available only after ${formattedCheckInTime}.`,
      );
      return;
    }

    if (isAttendanceProcessing || isOpeningCamera) return;

    const video = videoRef.current;
    const stream = streamRef.current;

    if (!stream || !video) {
      toast.dismiss();
      toast.error(
        "Please allow camera access in your browser settings and try again.",
      );
      return;
    }

    try {
      // Attach the existing camera stream to the current video element.
      if (video.srcObject !== stream) {
        video.srcObject = stream;
      }

      await video.play();

      // Wait until the browser provides actual video dimensions.
      if (!video.videoWidth || video.readyState < 2) {
        await new Promise((resolve, reject) => {
          const cleanup = () => {
            clearTimeout(timeout);
            video.removeEventListener("loadeddata", checkReady);
            video.removeEventListener("canplay", checkReady);
          };

          const checkReady = () => {
            if (video.videoWidth > 0 && video.videoHeight > 0) {
              cleanup();
              resolve();
            }
          };

          const timeout = setTimeout(() => {
            cleanup();
            reject(new Error("Camera preview did not become ready."));
          }, 8000);

          video.addEventListener("loadeddata", checkReady);
          video.addEventListener("canplay", checkReady);

          // Check again in case the video became ready just before listeners.
          checkReady();
        });
      }

      // Pass the mode directly; do not rely on updated React state.
      setCameraMode(mode);
      captureSelfie(mode);
    } catch (error) {
      toast.dismiss();
      console.error("Open camera error:", error);
      toast.error("Camera is not ready. Please wait a moment and try again.");
    }
  };

  useEffect(() => {
    const video = videoRef.current;
    const stream = streamRef.current;

    if (!cameraOpen || !video || !stream) return;

    if (video.srcObject !== stream) {
      video.srcObject = stream;
    }

    video.play().catch((error) => {
      console.error("Unable to start camera preview:", error);
    });

    return () => {
      video.onloadedmetadata = null;
    };
  }, [cameraOpen, capturedImage]);
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

  const captureSelfie = (mode) => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas || !video.videoWidth || !video.videoHeight) {
      toast.dismiss();
      toast.error("Camera is not ready. Please try again.");
      return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context = canvas.getContext("2d");

    if (!context) {
      toast.dismiss();
      toast.error("Unable to capture selfie.");
      return;
    }

    // Mirror the selfie.
    context.save();
    context.translate(canvas.width, 0);
    context.scale(-1, 1);
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    context.restore();

    canvas.toBlob(
      (blob) => {
        if (!blob) {
          toast.dismiss();
          toast.error("Unable to capture selfie. Please try again.");
          return;
        }

        const imageUrl = URL.createObjectURL(blob);

        setCapturedImage({
          blob,
          url: imageUrl,
        });

        const formData = new FormData();
        formData.append("selfie", blob, "attendance-selfie.jpg");

        // Use the mode argument, not cameraMode state.
        if (mode === "check-in") {
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
              // console.error("Check-in API error:", error);
              toast.dismiss();
              toast.error(
                error?.response?.data?.message ||
                  "Check-in failed. Please try again.",
              );

              setCapturedImage(null);
              setCameraMode(null);
            },
          });
        } else if (mode === "check-out") {
          checkOut(formData, {
            onSuccess: (response) => {
              const utterance = new SpeechSynthesisUtterance(
                "Jai Shree Ram, Check-out successful. Have a naice day",
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
              // console.error("Check-out API error:", error);
              toast.dismiss();
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
  // ======================================================
  // DOWNLOAD SALARY SLIP
  // ======================================================

const downloadSalarySlip = (salary) => {
    try {
      const doc = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
      });

      // ==================================================
      // EMPLOYEE DETAILS
      // ==================================================

      const employeeName =
        existingSalaryResponse?.data?.employeeName ||
        todayAttendance?.employeeId?.employeeName ||
        "--";

      const employeeId =
        existingSalaryResponse?.data?.employeeId ||
        todayAttendance?.employeeId?.employeeId ||
        "--";

      const designation = todayAttendance?.employeeId?.designation || "--";

      const department =
        existingSalaryResponse?.data?.department ||
        todayAttendance?.employeeId?.department ||
        "--";

      const monthName = new Date(
        salary.year,
        salary.month - 1,
      ).toLocaleDateString("en-IN", {
        month: "long",
        year: "numeric",
      });

      // ==================================================
      // SALARY CALCULATIONS
      // ==================================================
      console.log("Salary Data:", salary);
      const monthlySalary = Number(salary.monthlySalary || 0);
      const payableSalary = Number(salary.payableSalary || 0);
      const paidAmount = Number(salary.paidAmount || 0);

      const totalDaysInMonth = Number(salary.totalDaysInMonth || 0);

      const perDaySalary = Number(
        salary.perDaySalary ||
          (totalDaysInMonth > 0 ? monthlySalary / totalDaysInMonth : 0),
      );

      const actualPresentDays = Number(salary.totalPresentDays || 0);

      const weeklyOffDays = salary.paidLeaveDays - salary.publicHolidayDays;

      const publicHolidayDays = Number(salary.publicHolidayDays || 0);

      const totalPayableDays = Number(salary.totalPayableDays || 0);

      const previousDue = Number(salary.previousDue || 0);

      const currentDue = Number(
        salary.currentDue ?? previousDue + payableSalary - paidAmount,
      );

      const paidLeaveDays = Number(salary.paidLeaveDays || 0);

      const lop = Math.max(totalDaysInMonth - totalPayableDays, 0);

      const baseSalary = monthlySalary;

      const overtimeEarnings = Math.max(0, payableSalary - monthlySalary);

      const salaryAdjustment = Math.max(monthlySalary - payableSalary, 0);

      const totalEarnings = monthlySalary;
      const totalDeductions = salaryAdjustment;
      const netPay = payableSalary;

      // ==================================================
      // NUMBER FORMATTING
      // ==================================================

      const formatNumber = (amount) =>
        Number(amount || 0).toLocaleString("en-IN", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });

      // ==================================================
      // COMPANY DETAILS
      // ==================================================

      const isITDepartment = String(department).trim().toLowerCase() === "it";

      const companyName = isITDepartment
        ? "Gopal's Innovative Tech Solutions"
        : "Gopal's Paying Guest Services";

      const companySubtitle = isITDepartment
        ? "Gits Technologies Pvt. Ltd."
        : "GPMS";

      // ==================================================
      // COLORS
      // ==================================================

      const green = [79, 101, 43];
      const lightGreen = [218, 228, 190];
      const borderColor = [125, 125, 125];
      const black = [25, 25, 25];
      const white = [255, 255, 255];

      // ==================================================
      // PDF DIMENSIONS
      // ==================================================

      const pageWidth = 297;
      const pageHeight = 210;

      const x = 10;
      const y = 10;
      const w = 277;

      const companyW = 65;
      const titleW = 125;
      const confidentialW = w - companyW - titleW;

      const headerH = 28;
      const employeeH = 28;
      const salarySummaryH = 32;
      const tableHeaderH = 10;
      const tableBodyH = 35;
      const totalH = 10;
      const footerH = 12;

      const tableX = x;

      const summaryY = y + headerH + employeeH;

      const tableY = summaryY + salarySummaryH;

      const descriptionW = 128;
      const earningsW = 72;
      const deductionsW = w - descriptionW - earningsW;

      const earningsX = tableX + descriptionW;

      const deductionsX = earningsX + earningsW;

      // ==================================================
      // PAGE BACKGROUND
      // ==================================================

      doc.setFillColor(245, 248, 245);

      doc.rect(0, 0, pageWidth, pageHeight, "F");

      doc.setFillColor(...white);
      doc.setDrawColor(...borderColor);
      doc.setLineWidth(0.35);

      doc.rect(
        x,
        y,
        w,
        headerH +
          employeeH +
          salarySummaryH +
          tableHeaderH +
          tableBodyH +
          totalH +
          footerH,
        "FD",
      );

      // ==================================================
      // COMPANY HEADER
      // ==================================================

      doc.setFillColor(...green);

      doc.rect(x, y, companyW, headerH, "F");

      doc.setTextColor(...white);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);

      const companyLines = doc.splitTextToSize(companyName, companyW - 10);

      doc.text(companyLines, x + companyW / 2, y + 11, {
        align: "center",
        lineHeightFactor: 1.3,
      });

      // ==================================================
      // SALARY SLIP TITLE
      // ==================================================

      const titleX = x + companyW;

      doc.setDrawColor(...borderColor);

      doc.rect(titleX, y, titleW, headerH, "S");

      doc.setTextColor(...black);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(20);

      doc.text("SALARY SLIP", titleX + titleW / 2, y + 13, { align: "center" });

      doc.setLineWidth(0.25);

      doc.line(titleX, y + 18, titleX + titleW, y + 18);

      doc.setFontSize(10);

      doc.text(monthName, titleX + titleW / 2, y + 24, { align: "center" });

      // ==================================================
      // CONFIDENTIAL BOX
      // ==================================================

      const confidentialX = titleX + titleW;

      doc.setFillColor(...lightGreen);

      doc.rect(confidentialX, y, confidentialW, headerH, "FD");

      doc.setTextColor(...black);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);

      doc.text("CONFIDENTIAL", confidentialX + confidentialW / 2, y + 16, {
        align: "center",
      });

      // ==================================================
      // EMPLOYEE INFORMATION
      // ==================================================

      const detailsY = y + headerH;

      doc.setDrawColor(...borderColor);

      doc.rect(x, detailsY, w, employeeH, "S");

      doc.line(x + w / 2, detailsY, x + w / 2, detailsY + employeeH);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(...black);

      const leftDetails = [
        ["Name", employeeName],
        ["Employee ID", employeeId],
        ["Pay Period", monthName],
        // ["Total Days", String(totalDaysInMonth)],
        // ["Payable Days", String(totalPayableDays)],
      ];

      const rightDetails = [
        ["Title", designation],
        ["Department", department],
        ["Total Days", String(totalDaysInMonth)],
        // ["LOP", String(lop)],
        // ["Paid Leave", String(salary.paidLeaveDays)],
      ];

      const drawDetails = (details, startX) => {
        details.forEach(([label, value], index) => {
          const rowY = detailsY + 9 + index * 7;

          doc.text(label, startX, rowY);
          doc.text(":", startX + 48, rowY);

          doc.text(String(value || "--"), startX + 53, rowY);
        });
      };

      drawDetails(leftDetails, x + 5);

      drawDetails(rightDetails, x + w / 2 + 5);

      // ==================================================
      // SALARY & PAYMENT SUMMARY
      // ==================================================

      doc.setDrawColor(...borderColor);
      doc.setFillColor(245, 248, 245);

      doc.rect(x, summaryY, w, salarySummaryH, "FD");

      // Summary heading

      doc.setFillColor(...green);

      doc.rect(x, summaryY, w, 8, "F");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(...white);

      doc.text("SALARY & PAYMENT SUMMARY", x + 5, summaryY + 5.5);

      // All 10 salary details

      const summaryDetails = [
        ["Fixed Salary", `Rs. ${formatNumber(monthlySalary)}`],
        ["Per Day Salary", `Rs. ${formatNumber(perDaySalary)}`],
        ["Actual Present Days", String(actualPresentDays)],
        ["Weekly Off", String(weeklyOffDays)],
        ["Public Holiday", String(publicHolidayDays)],
        ["Total Payable Days", String(totalPayableDays)],
        ["Total Payable Salary", `Rs. ${formatNumber(payableSalary)}`],
        ["Paid Amount", `Rs. ${formatNumber(paidAmount)}`],
        ["Current Due", `Rs. ${formatNumber(currentDue)}`],
        ["Previous Due", `Rs. ${formatNumber(previousDue)}`],
      ];

      const cellW = w / 5;
      const rowH = 12;

      summaryDetails.forEach(([label, value], index) => {
        const row = Math.floor(index / 5);
        const col = index % 5;

        const cellX = x + col * cellW;

        const cellY = summaryY + 8 + row * rowH;

        // Cell border

        doc.setDrawColor(210, 210, 210);

        doc.rect(cellX, cellY, cellW, rowH, "S");

        // Label

        doc.setFont("helvetica", "bold");
        doc.setFontSize(7);
        doc.setTextColor(90, 90, 90);

        doc.text(label, cellX + cellW / 2, cellY + 4, { align: "center" });

        // Value

        doc.setFont("helvetica", "bold");
        doc.setFontSize(8);
        doc.setTextColor(...black);

        doc.text(value, cellX + cellW / 2, cellY + 9, { align: "center" });
      });

      // ==================================================
      // TABLE HEADER
      // ==================================================

      const headerY = tableY;

      doc.setFillColor(...green);

      doc.rect(tableX, headerY, descriptionW, tableHeaderH, "F");

      doc.rect(earningsX, headerY, earningsW, tableHeaderH, "F");

      doc.rect(deductionsX, headerY, deductionsW, tableHeaderH, "F");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(...white);

      doc.text("Description", tableX + descriptionW / 2, headerY + 6.5, {
        align: "center",
      });

      doc.text("Earnings", earningsX + earningsW / 2, headerY + 6.5, {
        align: "center",
      });

      doc.text("Deductions", deductionsX + deductionsW / 2, headerY + 6.5, {
        align: "center",
      });

      // ==================================================
      // TABLE BODY
      // ==================================================

      const bodyY = headerY + tableHeaderH;

      const bodyBottom = bodyY + tableBodyH;

      doc.setDrawColor(...borderColor);
      doc.setLineWidth(0.3);

      doc.rect(tableX, bodyY, descriptionW, tableBodyH, "S");

      doc.rect(earningsX, bodyY, earningsW, tableBodyH, "S");

      doc.rect(deductionsX, bodyY, deductionsW, tableBodyH, "S");

      // Adjustment details

      const adjustmentDetails = salary.adjustmentDetails || {};

      const specialPerks = Array.isArray(adjustmentDetails.specialPerks)
        ? adjustmentDetails.specialPerks
        : [];

      // ==================================================
      // SALARY DEDUCTIONS
      // ==================================================

      const paidDeduction = salary.paidAmountDetails?.deductedAmount || {};

      const salaryDeductions =
        paidDeduction.amount > 0
          ? [
              {
                description:
                  paidDeduction.label?.trim() ||
                  paidDeduction.comments?.trim() ||
                  "Salary Deduction",
                amount: Number(paidDeduction.amount || 0),
              },
            ]
          : [];

      console.log("Deduction Details:", salaryDeductions);
      console.log("Special Perks:", specialPerks);
      // Existing salary rows

      const salaryRows = [
        {
          description: "Base Salary",
          earnings: baseSalary,
          deductions: null,
        },
        // Special Perks (Earnings)
        // Combine all Special Perks into one row
        ...(specialPerks.length > 0
          ? [
              {
                description: "Special Perk",
                earnings: specialPerks.reduce(
                  (total, item) => total + Number(item.amount || 0),
                  0,
                ),
                deductions: null,
              },
            ]
          : []),

        // Salary Deductions
        ...salaryDeductions.map((item) => ({
          description: item.label?.trim() || "Salary Deduction",
          earnings: null,
          deductions: Number(item.amount || 0),
        })),
        // {
        //   description: "Transportation Allowance",
        //   earnings: 500,
        //   deductions: null,
        // },
        // {
        //   description: "Medical Allowance",
        //   earnings: 500,
        //   deductions: null,
        // },
      ];

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(...black);

      salaryRows.forEach((row, index) => {
        const rowY = bodyY + 7 + index * 10;

        doc.text(row.description, tableX + 5, rowY);

        if (row.earnings !== null) {
          doc.text(
            formatNumber(row.earnings),
            earningsX + earningsW - 5,
            rowY,
            {
              align: "right",
            },
          );
        }

        if (row.deductions !== null) {
          doc.text(
            formatNumber(row.deductions),
            deductionsX + deductionsW - 5,
            rowY,
            { align: "right" },
          );
        }
      });

      // ==================================================
      // TOTAL ROW
      // ==================================================

      const totalY = bodyBottom;

      doc.setDrawColor(...borderColor);

      doc.rect(tableX, totalY, descriptionW, totalH, "S");

      doc.rect(earningsX, totalY, earningsW, totalH, "S");

      doc.rect(deductionsX, totalY, deductionsW, totalH, "S");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(...black);

      doc.text("Gross Earnings", tableX + 5, totalY + 6.5);

      doc.text(
        formatNumber(totalEarnings),
        earningsX + earningsW - 5,
        totalY + 6.5,
        { align: "right" },
      );

      doc.text(
        formatNumber(totalDeductions),
        deductionsX + deductionsW - 5,
        totalY + 6.5,
        { align: "right" },
      );

      // ==================================================
      // PAYMENT DATE + NET PAY
      // ==================================================

      const footerY = totalY + totalH;

      const paymentDateW = descriptionW + earningsW;

      // Payment Date

      doc.setDrawColor(...borderColor);

      doc.rect(x, footerY, paymentDateW, footerH, "S");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(...black);

      doc.text("Payment Date", x + 5, footerY + 7.5);

      doc.text(":", x + 48, footerY + 7.5);

      const paymentDate = salary.paymentDate || salary.paidAt || null;

      const formattedPaymentDate = paymentDate
        ? new Date(paymentDate).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })
        : "--";

      doc.setFont("helvetica", "normal");

      doc.text(formattedPaymentDate, x + 53, footerY + 7.5);

      // NET PAY

      doc.setFillColor(...green);

      doc.rect(x + paymentDateW, footerY, w - paymentDateW, footerH, "F");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(...white);

      doc.text(
        `NET PAY : Rs. ${formatNumber(netPay)}`,
        x + paymentDateW + (w - paymentDateW) / 2,
        footerY + 7.5,
        { align: "center" },
      );

      // ==================================================
      // DOWNLOAD PDF
      // ==================================================

    const safeEmployeeName = String(employeeName)
      .trim()
      .replace(/[^a-zA-Z0-9-_]/g, "_");

    const safeMonth = monthName.replace(/\s+/g, "-");

    doc.save(`Salary-Slip-${safeEmployeeName}-${safeMonth}.pdf`);

      toast.dismiss();

      toast.success("Salary slip downloaded successfully.");
    } catch (error) {
      console.error("Salary Slip Download Error:", error);

      toast.dismiss();

      toast.error("Unable to download salary slip.");
    }
  };

  // const downloadSalarySlip = (salary) => {
  //   try {
  //     const doc = new jsPDF({
  //       orientation: "landscape",
  //       unit: "mm",
  //       format: "a4",
  //     });

  //     // ==================================================
  //     // EMPLOYEE DETAILS
  //     // ==================================================

  //     const employeeName =
  //       existingSalaryResponse?.data?.employeeName ||
  //       todayAttendance?.employeeId?.employeeName ||
  //       "--";

  //     const employeeId =
  //       existingSalaryResponse?.data?.employeeId ||
  //       todayAttendance?.employeeId?.employeeId ||
  //       "--";

  //     const designation = todayAttendance?.employeeId?.designation || "--";

  //     const department =
  //       existingSalaryResponse?.data?.department ||
  //       todayAttendance?.employeeId?.department ||
  //       "--";
  //     const monthName = new Date(
  //       salary.year,
  //       salary.month - 1,
  //     ).toLocaleDateString("en-IN", {
  //       month: "long",
  //       year: "numeric",
  //     });

  //     const monthlySalary = Number(salary.monthlySalary || 0);
  //     const payableSalary = Number(salary.payableSalary || 0);
  //     const paidAmount = Number(salary.paidAmount || 0);

  //     const baseSalary = Math.max(monthlySalary - 1500, 0);
  //     const overtimeEarnings = Math.max(0, payableSalary - monthlySalary);

  //     const salaryAdjustment = Math.max(monthlySalary - payableSalary, 0);
  //    const totalDaysInMonth = Number(salary.totalDaysInMonth || 0);
  //    const totalPayableDays = Number(salary.totalPayableDays || 0);
  //    const paidLeaveDays = Number(salary.paidLeaveDays || 0);

  //    const lop = Math.max(totalDaysInMonth - totalPayableDays, 0);
  //     const totalEarnings = monthlySalary;
  //     const totalDeductions = salaryAdjustment;
  //     const netPay = payableSalary;

  //     // ==================================================
  //     // COMPANY NAME
  //     // ==================================================

  //     const isITDepartment = department.trim().toLowerCase() === "it";

  //     const companyName = isITDepartment
  //       ? "Gopal's Innovative Tech Solutions"
  //       : "Gopal's Paying Guest Services";

  //     const companySubtitle = isITDepartment
  //       ? "Gits Technologies Pvt. Ltd."
  //       : "GPMS";

  //     // ==================================================
  //     // COLORS
  //     // ==================================================

  //     const green = [79, 101, 43];
  //     const lightGreen = [218, 228, 190];
  //     const borderColor = [125, 125, 125];
  //     const black = [25, 25, 25];
  //     const white = [255, 255, 255];

  //     // ==================================================
  //     // SALARY SLIP DIMENSIONS
  //     // ==================================================

  //     const pageWidth = 297;
  //     const pageHeight = 210;

  //     const x = 10;
  //     const y = 24;
  //     const w = 277;

  //     const companyW = 65;
  //     const titleW = 125;
  //     const confidentialW = w - companyW - titleW;

  //     const headerH = 28;
  //     const employeeH = 40;
  //     const tableHeaderH = 10;
  //     const tableBodyH = 55;
  //     const totalH = 10;
  //     const footerH = 12;

  //     const tableX = x;
  //     const tableY = y + headerH + employeeH;

  //     const descriptionW = 128;
  //     const earningsW = 72;
  //     const deductionsW = w - descriptionW - earningsW;

  //     const earningsX = tableX + descriptionW;
  //     const deductionsX = earningsX + earningsW;

  //     // ==================================================
  //     // PAGE BACKGROUND
  //     // ==================================================

  //     doc.setFillColor(245, 248, 245);
  //     doc.rect(0, 0, pageWidth, pageHeight, "F");

  //     // White salary slip background
  //     doc.setFillColor(...white);
  //     doc.setDrawColor(...borderColor);
  //     doc.setLineWidth(0.35);

  //     doc.rect(
  //       x,
  //       y,
  //       w,
  //       headerH + employeeH + tableHeaderH + tableBodyH + totalH + footerH,
  //       "FD",
  //     );

  //     // ==================================================
  //     // HEADER
  //     // ==================================================

  //     // LEFT GREEN COMPANY BOX
  //     doc.setFillColor(...green);
  //     doc.rect(x, y, companyW, headerH, "F");

  //     doc.setTextColor(...white);
  //     doc.setFont("helvetica", "bold");
  //     doc.setFontSize(12);

  //     const companyLines = doc.splitTextToSize(companyName, companyW - 10);

  //     doc.text(companyLines, x + companyW / 2, y + 11, {
  //       align: "center",
  //       lineHeightFactor: 1.3,
  //     });

  //     // Company subtitle
  //     doc.setFont("helvetica", "normal");
  //     doc.setFontSize(8);

  //     // doc.text(
  //     //   companySubtitle,
  //     //   x + companyW / 2,
  //     //   y + 23,
  //     //   { align: "center" },
  //     // );

  //     // CENTER SALARY SLIP TITLE
  //     const titleX = x + companyW;

  //     doc.setDrawColor(...borderColor);
  //     doc.rect(titleX, y, titleW, headerH, "S");

  //     doc.setTextColor(...black);
  //     doc.setFont("helvetica", "bold");
  //     doc.setFontSize(20);

  //     doc.text("SALARY SLIP", titleX + titleW / 2, y + 13, { align: "center" });

  //     doc.setLineWidth(0.25);
  //     doc.line(titleX, y + 18, titleX + titleW, y + 18);

  //     doc.setFontSize(10);
  //     doc.setFont("helvetica", "bold");

  //     doc.text(monthName, titleX + titleW / 2, y + 24, { align: "center" });

  //     // RIGHT CONFIDENTIAL BOX
  //     const confidentialX = titleX + titleW;

  //     doc.setFillColor(...lightGreen);
  //     doc.rect(confidentialX, y, confidentialW, headerH, "FD");

  //     doc.setTextColor(...black);
  //     doc.setFont("helvetica", "bold");
  //     doc.setFontSize(16);

  //     doc.text("CONFIDENTIAL", confidentialX + confidentialW / 2, y + 16, {
  //       align: "center",
  //     });

  //     // ==================================================
  //     // EMPLOYEE INFORMATION
  //     // ==================================================

  //     const detailsY = y + headerH;

  //     doc.setDrawColor(...borderColor);

  //     // Employee details box
  //     doc.rect(x, detailsY, w, employeeH, "S");

  //     // Vertical divider
  //     doc.line(x + w / 2, detailsY, x + w / 2, detailsY + employeeH);

  //     doc.setFont("helvetica", "normal");
  //     doc.setFontSize(10);
  //     doc.setTextColor(...black);

  //     const leftDetails = [
  //       ["Name", employeeName],
  //       ["Employee ID", employeeId],
  //       ["Pay Period", monthName],
  //       ["Total Days", String(Number(salary.totalDaysInMonth || 0))],
  //       ["Payable Days", String(Number(salary.totalPayableDays || 0))],
  //     ];

  //     const rightDetails = [
  //       ["Title", designation],
  //       // ["Directorate", department],
  //       ["Department", department],
  //       ["LOP", String(lop)],

  //       ["Paid Leave", String(Number(salary.paidLeaveDays || 0))],
  //       // [
  //       //   "Public Holidays",
  //       //   String(Number(salary.publicHolidayDays || 0)),
  //       // ],
  //     ];

  //     const drawDetails = (details, startX) => {
  //       details.forEach(([label, value], index) => {
  //         const rowY = detailsY + 9 + index * 7;

  //         doc.text(label, startX, rowY);
  //         doc.text(":", startX + 48, rowY);

  //         doc.text(String(value || "--"), startX + 53, rowY);
  //       });
  //     };

  //     drawDetails(leftDetails, x + 5);
  //     drawDetails(rightDetails, x + w / 2 + 5);

  //     // ==================================================
  //     // TABLE HEADER
  //     // ==================================================

  //     const headerY = tableY;

  //     doc.setFillColor(...green);

  //     doc.rect(tableX, headerY, descriptionW, tableHeaderH, "F");

  //     doc.rect(earningsX, headerY, earningsW, tableHeaderH, "F");

  //     doc.rect(deductionsX, headerY, deductionsW, tableHeaderH, "F");

  //     doc.setFont("helvetica", "bold");
  //     doc.setFontSize(10);
  //     doc.setTextColor(...white);

  //     doc.text("Description", tableX + descriptionW / 2, headerY + 6.5, {
  //       align: "center",
  //     });

  //     doc.text("Earnings", earningsX + earningsW / 2, headerY + 6.5, {
  //       align: "center",
  //     });

  //     doc.text("Deductions", deductionsX + deductionsW / 2, headerY + 6.5, {
  //       align: "center",
  //     });

  //     // ==================================================
  //     // TABLE BODY
  //     // ==================================================

  //     const bodyY = headerY + tableHeaderH;
  //     const bodyBottom = bodyY + tableBodyH;

  //     doc.setDrawColor(...borderColor);
  //     doc.setLineWidth(0.3);

  //     doc.rect(tableX, bodyY, descriptionW, tableBodyH, "S");

  //     doc.rect(earningsX, bodyY, earningsW, tableBodyH, "S");

  //     doc.rect(deductionsX, bodyY, deductionsW, tableBodyH, "S");
  //     const adjustmentDetails = salary.adjustmentDetails || {};

  //     const specialPerks = Array.isArray(adjustmentDetails.specialPerks)
  //       ? adjustmentDetails.specialPerks
  //       : [];

  //     const salaryDeductions = Array.isArray(adjustmentDetails.deductions)
  //       ? adjustmentDetails.deductions
  //       : [];
  //     // Salary rows
  //     const salaryRows = [
  //       {
  //         description: "Base  Salary",
  //         earnings: baseSalary,
  //         deductions: null,
  //       },
  //       {
  //         description: "Overtime Earnings",
  //         earnings: overtimeEarnings,
  //         deductions: null,
  //       },

  //       {
  //         description: "Snacks Allowance",
  //         earnings: 500,
  //         deductions: null,
  //       },
  //       {
  //         description: "Transportation Allowance",
  //         earnings: 500,
  //         deductions: null,
  //       },
  //       {
  //         description: "Medical Allowance",
  //         earnings: 500,
  //         deductions: null,
  //       },
  //       // {
  //       //   description: "Unpaid Leave Deduction",
  //       //   earnings: null,
  //       //   deductions: `eeeee`,
  //       // },
  //       // {
  //       //   description: "Attendance Deficit Deduction",
  //       //   earnings: null,
  //       //   deductions: 500,
  //       // },
  //       // {
  //       //   description: "Other Deductions",
  //       //   earnings: null,
  //       //   deductions: 0,
  //       // },
  //     ];

  //     doc.setFont("helvetica", "normal");
  //     doc.setFontSize(10);
  //     doc.setTextColor(...black);

  //     salaryRows.forEach((row, index) => {
  //       const rowY = bodyY + 7 + index * 10;

  //       doc.text(row.description, tableX + 5, rowY);

  //       if (row.earnings !== null) {
  //         doc.text(
  //           Number(row.earnings).toLocaleString("en-IN", {
  //             minimumFractionDigits: 2,
  //             maximumFractionDigits: 2,
  //           }),
  //           earningsX + earningsW - 5,
  //           rowY,
  //           { align: "right" },
  //         );
  //       }

  //       if (row.deductions !== null) {
  //         doc.text(
  //           Number(row.deductions).toLocaleString("en-IN", {
  //             minimumFractionDigits: 2,
  //             maximumFractionDigits: 2,
  //           }),
  //           deductionsX + deductionsW - 5,
  //           rowY,
  //           { align: "right" },
  //         );
  //       }
  //     });

  //     // ==================================================
  //     // TOTAL ROW
  //     // ==================================================

  //     const totalY = bodyBottom;

  //     doc.setDrawColor(...borderColor);

  //     doc.rect(tableX, totalY, descriptionW, totalH, "S");

  //     doc.rect(earningsX, totalY, earningsW, totalH, "S");

  //     doc.rect(deductionsX, totalY, deductionsW, totalH, "S");

  //     doc.setFont("helvetica", "bold");
  //     doc.setFontSize(10);
  //     doc.setTextColor(...black);

  //     doc.text("Gross Earnings", tableX + 5, totalY + 6.5);

  //     const formatNumber = (amount) =>
  //       Number(amount || 0).toLocaleString("en-IN", {
  //         minimumFractionDigits: 2,
  //         maximumFractionDigits: 2,
  //       });

  //     doc.text(
  //       formatNumber(totalEarnings),
  //       earningsX + earningsW - 5,
  //       totalY + 6.5,
  //       { align: "right" },
  //     );

  //     doc.text(
  //       formatNumber(totalDeductions),
  //       deductionsX + deductionsW - 5,
  //       totalY + 6.5,
  //       { align: "right" },
  //     );

  //     // ==================================================
  //     // PAYMENT DATE + NET PAY
  //     // ==================================================

  //     const footerY = totalY + totalH;

  //     const paymentDateW = descriptionW + earningsW;

  //     // Payment date area
  //     doc.setDrawColor(...borderColor);
  //     doc.rect(x, footerY, paymentDateW, footerH, "S");

  //     doc.setFont("helvetica", "bold");
  //     doc.setFontSize(10);
  //     doc.setTextColor(...black);

  //     doc.text("Payment Date", x + 5, footerY + 7.5);

  //     doc.text(":", x + 48, footerY + 7.5);

  //     // Date field is shown only if provided by the salary record
  //     const paymentDate = salary.paymentDate || salary.paidAt || null;

  //     const formattedPaymentDate = paymentDate
  //       ? new Date(paymentDate).toLocaleDateString("en-IN", {
  //           day: "numeric",
  //           month: "long",
  //           year: "numeric",
  //         })
  //       : "--";

  //     doc.setFont("helvetica", "normal");

  //     doc.text(formattedPaymentDate, x + 53, footerY + 7.5);

  //     // NET PAY green area
  //     doc.setFillColor(...green);

  //     doc.rect(x + paymentDateW, footerY, w - paymentDateW, footerH, "F");

  //     doc.setFont("helvetica", "bold");
  //     doc.setFontSize(12);
  //     doc.setTextColor(...white);

  //     doc.text(
  //       `NET PAY : Rs. ${formatNumber(netPay)}`,
  //       x + paymentDateW + (w - paymentDateW) / 2,
  //       footerY + 7.5,
  //       { align: "center" },
  //     );

  //     // ==================================================
  //     // DOWNLOAD PDF
  //     // ==================================================

  //     const safeEmployeeId = String(employeeId).replace(/[^a-zA-Z0-9-_]/g, "_");

  //     const safeMonth = monthName.replace(/\s+/g, "-");

  //     doc.save(`Salary-Slip-${safeEmployeeId}-${safeMonth}.pdf`);

  //     toast.dismiss();
  //     toast.success("Salary slip downloaded successfully.");
  //   } catch (error) {
  //     console.error("Salary Slip Download Error:", error);

  //     toast.dismiss();
  //     toast.error("Unable to download salary slip.");
  //   }
  // };
  const handleSubmitRegularization = async (formData) => {
    // console.log("Dummy regularization request:");

    // for (const [key, value] of formData.entries()) {
    //   console.log(key, value);
    // }
    toast.dismiss();
    // Test only — this does not save anything to the backend.
    toast.success("Dummy regularization request submitted successfully.");
  };
  // DUMMY MANAGERS — for testing the regularization modal
  const managers = [
    {
      _id: "dummy-manager-1",
      employeeName: "Rahul Sharma",
      employeeId: "GG-24-EMP-01",
    },
    {
      _id: "dummy-manager-2",
      employeeName: "Priya Patel",
      employeeId: "GG-24-EMP-02",
    },
    {
      _id: "dummy-manager-3",
      employeeName: "Amit Verma",
      employeeId: "GG-24-EMP-03",
    },
  ];
  return (
    <div className=" md:p-6">
      {/* ==================================================
          PAGE HEADER
      ================================================== */}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
        {/* ==================================================
            TODAY ATTENDANCE CARD
        ================================================== */}

        <div className="overflow-hidden max-h-fit rounded-2xl border border-gray-200 bg-white shadow-sm p-1">
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
            {isOpeningCamera || isAttendanceProcessing ? (
              <div className="flex flex-col items-center justify-center text-white">
                <div className="relative flex h-16 w-16 items-center justify-center">
                  <div className="absolute h-16 w-16 animate-spin rounded-full border-4 border-gray-600 border-t-green-500" />
                  <FaClock className="text-xl text-green-400" />
                </div>

                <p className="mt-4 text-sm font-semibold">
                  {isOpeningCamera
                    ? "Starting camera..."
                    : isCheckingIn
                      ? "Checking in..."
                      : "Checking out..."}
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
              className="w-full rounded-lg border border-green-200 bg-white px-3 py-2 text-xs font-semibold text-black-700 transition hover:bg-green-100"
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
                Check-in is allowed after {formattedCheckInTime}.
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

          <div className="flex flex-col gap-4  p-1 md:flex-row md:items-center md:justify-between">
            {/* HEADER */}
            <div className=" p-1">
              <h2 className="text-lg font-bold text-gray-800">
                Attendance History
              </h2>

              {/* Horizontally scrollable actions on mobile */}
              <div className="mt-1 w-full min-w-0 overflow-x-auto pb-1">
                <div className="flex w-max items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setSelectedAttendance({
                        employeeId: todayAttendance?.employeeId || null,
                        attendanceDate: "",
                      })
                    }
                    className="flex shrink-0 items-center gap-2 whitespace-nowrap rounded-lg border border-gray-300 px-3 py-2 text-sm transition hover:bg-gray-100"
                  >
                    <FaTicketAlt />
                    <span>Raise Request</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowMyRequests(true)}
                    className="flex shrink-0 items-center gap-2 whitespace-nowrap rounded-lg border border-gray-300 px-3 py-2 text-sm transition hover:bg-gray-100"
                  >
                    <FaCalendarAlt />
                    <span>Show All Requests</span>
                  </button>

                  <div className="w-[130px] shrink-0">
                    <DatePicker
                      selected={month ? new Date(`${month}-01`) : null}
                      onChange={(date) => {
                        if (date) {
                          const year = date.getFullYear();
                          const monthNumber = String(
                            date.getMonth() + 1,
                          ).padStart(2, "0");

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
                      className="custom-datepicker w-full"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* TABLE */}

          <div className="overflow-x-auto hidden md:block justify-between">
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
                  <th className="whitespace-nowrap px-5 py-3.5 text-left text-md font-semibold tracking-wide">
                    Action
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
                              className={`inline-flex whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold ${status.className}`}
                            >
                              {status.label}
                            </span>
                          );
                        })()}
                      </td>
                      {/* ACTION — REQUEST REGULARIZATION */}
                      <td className="px-5 py-4">
                        <button
                          type="button"
                          onClick={() => {
                            // console.log("DESKTOP REGULARIZATION CLICK");
                            // console.log(
                            //   "Original date:",
                            //   attendance.attendanceDate,
                            // );
                            // console.log(
                            //   "Formatted date:",
                            //   getAttendanceDateForInput(
                            //     attendance.attendanceDate,
                            //   ),
                            // );

                            setSelectedAttendance(attendance);
                          }}
                          className="whitespace-nowrap rounded-lg border border-green-200 bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-700 transition hover:border-green-300 hover:bg-green-100"
                        >
                          Request Regularization
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* MOBILE ATTENDANCE HISTORY CARDS */}
          <div className="md:hidden">
            <AttendanceHistoryCards
              attendanceList={attendanceList}
              isLoading={isHistoryLoading}
              formatDate={formatDate}
              formatTime={formatTime}
              formatMinutes={formatMinutes}
              getAttendanceStatus={getAttendanceStatus}
              managers={managers}
              onSubmitRegularization={handleSubmitRegularization}
            />
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
      {/* ATTENDANCE REGULARIZATION MODAL */}
      {/* MY SUBMITTED ATTENDANCE REQUESTS */}
      {showMyRequests && (
        <MyAttendanceRequestsModal onClose={() => setShowMyRequests(false)} />
      )}

      {/* EXISTING ATTENDANCE REQUEST MODAL */}
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

export default CheckinOut;
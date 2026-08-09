import React, { useEffect, useRef, useState } from "react";

import {
  FaCamera,
  FaClock,
  FaSignInAlt,
  FaSignOutAlt,
  FaUserClock,
  FaCalendarAlt,
  FaCheckCircle,
} from "react-icons/fa";
import { toast } from "react-toastify";
import {
  useTodayAttendance,
  useMyAttendance,
  useCheckInAttendance,
  useCheckOutAttendance,
} from "./services/index";

const AttendanceTable = () => {
  // ======================================================
  // STATE
  // ======================================================

  const [currentPage, setCurrentPage] = useState(1);

  const [month, setMonth] = useState("");

  const [currentTime, setCurrentTime] = useState(new Date());

  const [cameraOpen, setCameraOpen] = useState(false);

  const [cameraMode, setCameraMode] = useState(null);

  const [capturedImage, setCapturedImage] = useState(null);

  const videoRef = useRef(null);

  const canvasRef = useRef(null);

  const streamRef = useRef(null);
  const REQUIRED_WORKING_MINUTES = 9 * 60;
  const HALF_DAY_MINUTES = REQUIRED_WORKING_MINUTES / 2;
  // ======================================================
  // API
  // ======================================================

  const { data: todayResponse, isLoading: isTodayLoading } =
    useTodayAttendance();

  const { data: historyResponse, isLoading: isHistoryLoading } =
    useMyAttendance({
      page: currentPage,
      limit: 10,
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

  // ======================================================
  // CURRENT TIME
  // ======================================================

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // ======================================================
  // CAMERA
  // ======================================================

  const openCamera = async (mode) => {
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

      alert("Unable to access camera. Please allow camera permission.");
    }
  };

  // ======================================================
  // STOP CAMERA
  // ======================================================

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());

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

    if (!video || !canvas) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context = canvas.getContext("2d");

    context.drawImage(video, 0, 0, canvas.width, canvas.height);

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
  // CALCULATE LIVE WORKED MINUTES
  // ======================================================
  const getLiveWorkedMinutes = () => {
    if (!todayAttendance?.inTime) {
      return 0;
    }

    const start = new Date(todayAttendance.inTime);

    const end = todayAttendance.outTime
      ? new Date(todayAttendance.outTime)
      : currentTime;

    return Math.max(0, Math.floor((end - start) / (1000 * 60)));
  };

  // ======================================================
  // LIVE ATTENDANCE PROGRESS
  // ======================================================

  const liveWorkedMinutes = getLiveWorkedMinutes();

  const remainingMinutes = Math.max(9 * 60 - liveWorkedMinutes, 0);
  // ======================================================
  // STATUS
  // ======================================================

  const getAttendanceStatus = (status) => {
    const numericStatus = Number(status);

    if (numericStatus === 1) {
      return {
        label: "Present",
        className: "text-green-600 bg-green-50",
      };
    }

    if (numericStatus === 0.5) {
      return {
        label: "Half Day",
        className: "text-yellow-600 bg-yellow-50",
      };
    }

    return {
      label: "Absent",
      className: "text-red-600 bg-red-50",
    };
  };
  const liveStatus = getAttendanceStatus(
    todayAttendance?.outTime
      ? todayAttendance?.status
      : liveWorkedMinutes >= 9 * 60
        ? 1
        : liveWorkedMinutes >= 4.5 * 60
          ? 0.5
          : 0,
  );
  // ======================================================
  // STATUS
  // ======================================================

  const hasCheckedIn = !!todayAttendance?.inTime;

  const hasCheckedOut = !!todayAttendance?.outTime;

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
  // FORMAT MINUTES
  // ======================================================

  const formatMinutes = (minutes = 0) => {
    const hours = Math.floor(minutes / 60);

    const remainingMinutes = minutes % 60;

    return `${hours}H ${remainingMinutes}M`;
  };

  // ======================================================
  // STATUS COLOR
  // ======================================================

  // ======================================================
  // UI
  // ======================================================

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-6">
      {/* ==================================================
          PAGE HEADER
      ================================================== */}

      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Attendance</h1>

          <p className="mt-1 text-sm text-gray-500">
            Manage your daily attendance and attendance history
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 shadow-sm">
          <FaClock className="text-green-600" />

          <span className="font-semibold text-gray-700">
            {currentTime.toLocaleTimeString("en-IN", {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
              hour12: true,
            })}
          </span>
        </div>
      </div>

      {/* ==================================================
          TOP SECTION
      ================================================== */}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[380px_1fr]">
        {/* ==================================================
            ATTENDANCE CARD
        ================================================== */}

        <div className="rounded-xl bg-white p-5 shadow-md">
          <div className="mb-4 flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
              <FaUserClock className="text-green-600" />
            </div>

            <div>
              <h2 className="font-bold text-gray-800">Today's Attendance</h2>

              <p className="text-xs text-gray-500">{formatDate(new Date())}</p>
            </div>
          </div>

          {/* CAMERA */}

          <div className="relative mb-4 flex h-[260px] items-center justify-center overflow-hidden rounded-xl bg-black">
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
                muted
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex flex-col items-center text-gray-400">
                <FaCamera size={50} />

                <p className="mt-3 text-sm">Camera preview</p>
              </div>
            )}
          </div>

          <canvas ref={canvasRef} className="hidden" />

          {/* CAPTURE */}

          {cameraOpen && (
            <button
              type="button"
              onClick={captureSelfie}
              disabled={isCheckingIn || isCheckingOut}
              className="mb-3 w-full rounded-lg bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Capture Selfie
            </button>
          )}

          {/* TODAY STATUS */}

          <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-lg bg-gray-50 p-3">
              <p className="text-xs text-gray-500">Check In</p>

              <p className="mt-1 font-semibold text-gray-800">
                {formatTime(todayAttendance?.inTime)}
              </p>
            </div>

            <div className="rounded-lg bg-gray-50 p-3">
              <p className="text-xs text-gray-500">Check Out</p>

              <p className="mt-1 font-semibold text-gray-800">
                {formatTime(todayAttendance?.outTime)}
              </p>
            </div>
            <div className="rounded-lg bg-blue-50 p-3">
              <p className="text-xs text-gray-500">Remaining</p>

              <p className="mt-1 font-semibold text-blue-600">
                {formatMinutes(remainingMinutes)}
              </p>
            </div>
          </div>

          {/* ACTION BUTTONS */}

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              disabled={hasCheckedIn || isCheckingIn}
              onClick={() => openCamera("check-in")}
              className="flex items-center justify-center gap-2 rounded-lg bg-green-600 py-3 font-semibold text-white shadow-sm transition hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-gray-300"
            >
              <FaSignInAlt />

              {hasCheckedIn ? "Checked In" : "Check In"}
            </button>

            <button
              type="button"
              disabled={!hasCheckedIn || hasCheckedOut || isCheckingOut}
              onClick={() => openCamera("check-out")}
              className="flex items-center justify-center gap-2 rounded-lg bg-orange-500 py-3 font-semibold text-white shadow-sm transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-gray-300"
            >
              <FaSignOutAlt />

              {hasCheckedOut ? "Checked Out" : "Check Out"}
            </button>
          </div>
        </div>

        {/* ==================================================
          HISTORY
      ================================================== */}

        <div className="mt-6 rounded-xl bg-white shadow-md">
          {/* HEADER */}

          <div className="flex flex-col gap-4 border-b p-5 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-800">
                Attendance History
              </h2>

              <p className="text-sm text-gray-500">
                View your previous attendance records
              </p>
            </div>

            <div className="flex items-center gap-2">
              <FaCalendarAlt className="text-gray-500" />

              <input
                type="month"
                value={month}
                onChange={(e) => {
                  setMonth(e.target.value);

                  setCurrentPage(1);
                }}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
              />
            </div>
          </div>

          {/* TABLE */}

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px]">
              <thead className="bg-black text-white">
                <tr>
                  <th className="px-5 py-4 text-left text-sm font-semibold">
                    Date
                  </th>

                  <th className="px-5 py-4 text-left text-sm font-semibold">
                    Employee ID
                  </th>

                  <th className="px-5 py-4 text-left text-sm font-semibold">
                    Employee Name
                  </th>

                  <th className="px-5 py-4 text-left text-sm font-semibold">
                    In Time
                  </th>

                  <th className="px-5 py-4 text-left text-sm font-semibold">
                    In Selfie
                  </th>

                  <th className="px-5 py-4 text-left text-sm font-semibold">
                    Out Time
                  </th>

                  <th className="px-5 py-4 text-left text-sm font-semibold">
                    Out Selfie
                  </th>

                  <th className="px-5 py-4 text-left text-sm font-semibold">
                    Total Hours
                  </th>

                  <th className="px-5 py-4 text-left text-sm font-semibold">
                    OverTime
                  </th>

                  <th className="px-5 py-4 text-left text-sm font-semibold">
                    Deficit Hours
                  </th>

                  <th className="px-5 py-4 text-left text-sm font-semibold">
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
                      className="border-b hover:bg-gray-50"
                    >
                      {/* DATE */}

                      <td className="px-5 py-4 text-sm text-gray-700">
                        {formatDate(attendance.attendanceDate)}
                      </td>

                      {/* EMPLOYEE ID */}

                      <td className="px-5 py-4 text-sm font-medium text-gray-700">
                        {attendance.employeeId?.employeeId}
                      </td>

                      {/* EMPLOYEE NAME */}

                      <td className="px-5 py-4 text-sm font-medium text-gray-800">
                        {attendance.employeeId?.employeeName}
                      </td>

                      {/* IN TIME */}

                      <td className="px-5 py-4 text-sm text-gray-700">
                        {formatTime(attendance.inTime)}
                      </td>

                      {/* IN SELFIE */}

                      <td className="px-5 py-4">
                        {attendance.inSelfie?.url ? (
                          <img
                            src={attendance.inSelfie.url}
                            alt="In"
                            className="h-12 w-12 rounded-lg object-cover"
                          />
                        ) : (
                          <span className="text-xs text-gray-400">--</span>
                        )}
                      </td>

                      {/* OUT TIME */}

                      <td className="px-5 py-4 text-sm text-gray-700">
                        {formatTime(attendance.outTime)}
                      </td>

                      {/* OUT SELFIE */}

                      <td className="px-5 py-4">
                        {attendance.outSelfie?.url ? (
                          <img
                            src={attendance.outSelfie.url}
                            alt="Out"
                            className="h-12 w-12 rounded-lg object-cover"
                          />
                        ) : (
                          <span className="text-xs text-gray-400">--</span>
                        )}
                      </td>

                      {/* TOTAL */}

                      <td className="px-5 py-4 text-sm font-medium text-gray-700">
                        {formatMinutes(attendance.totalMinutes)}
                      </td>

                      {/* OVERTIME */}

                      <td className="px-5 py-4 text-sm text-gray-700">
                        {formatMinutes(attendance.overtimeMinutes)}
                      </td>

                      {/* DEFICIT */}

                      <td className="px-5 py-4 text-sm text-gray-700">
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

          {/* PAGINATION */}

          <div className="flex items-center justify-between border-t p-4">
            <p className="text-sm text-gray-500">
              Page {pagination.page || 1} of {pagination.totalPages || 1}
            </p>

            <div className="flex gap-2">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => prev - 1)}
                className="rounded-lg border px-4 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-40"
              >
                Previous
              </button>

              <button
                type="button"
                disabled={currentPage >= (pagination.totalPages || 1)}
                onClick={() => setCurrentPage((prev) => prev + 1)}
                className="rounded-lg border px-4 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendanceTable;

// import React, { useEffect, useRef, useState } from "react";

// import {
//   FaCamera,
//   FaClock,
//   FaSignInAlt,
//   FaSignOutAlt,
//   FaUserClock,
//   FaCalendarAlt,
//   FaCheckCircle,
// } from "react-icons/fa";

// import {
//   useTodayAttendance,
//   useMyAttendance,
//   useCheckInAttendance,
//   useCheckOutAttendance,
// } from "./services/index";

// const AttendanceTable = () => {
//   // ======================================================
//   // STATE
//   // ======================================================

//   const [currentPage, setCurrentPage] = useState(1);

//   const [month, setMonth] = useState("");

//   const [currentTime, setCurrentTime] = useState(new Date());

//   const [cameraOpen, setCameraOpen] = useState(false);

//   const [cameraMode, setCameraMode] = useState(null);

//   const [capturedImage, setCapturedImage] = useState(null);

//   const videoRef = useRef(null);

//   const canvasRef = useRef(null);

//   const streamRef = useRef(null);

//   // ======================================================
//   // API
//   // ======================================================

//   const { data: todayResponse, isLoading: isTodayLoading } =
//     useTodayAttendance();

//   const { data: historyResponse, isLoading: isHistoryLoading } =
//     useMyAttendance({
//       page: currentPage,
//       limit: 10,
//       month,
//     });

//   const { mutate: checkIn, isPending: isCheckingIn } = useCheckInAttendance();

//   const { mutate: checkOut, isPending: isCheckingOut } =
//     useCheckOutAttendance();

//   // ======================================================
//   // DATA
//   // ======================================================

//   const todayAttendance = todayResponse?.data || null;

//   const attendanceList = historyResponse?.data || [];

//   const pagination = historyResponse?.pagination || {};

//   // ======================================================
//   // CURRENT TIME
//   // ======================================================

//   useEffect(() => {
//     const interval = setInterval(() => {
//       setCurrentTime(new Date());
//     }, 1000);

//     return () => clearInterval(interval);
//   }, []);

//   // ======================================================
//   // CAMERA
//   // ======================================================

//   const openCamera = async (mode) => {
//     try {
//       setCameraMode(mode);
//       setCapturedImage(null);

//       const stream = await navigator.mediaDevices.getUserMedia({
//         video: {
//           facingMode: "user",
//         },
//         audio: false,
//       });

//       streamRef.current = stream;

//       setCameraOpen(true);

//       setTimeout(() => {
//         if (videoRef.current) {
//           videoRef.current.srcObject = stream;
//         }
//       }, 100);
//     } catch (error) {
//       console.error("Camera Error:", error);

//       alert("Unable to access camera. Please allow camera permission.");
//     }
//   };

//   // ======================================================
//   // STOP CAMERA
//   // ======================================================

//   const stopCamera = () => {
//     if (streamRef.current) {
//       streamRef.current.getTracks().forEach((track) => track.stop());

//       streamRef.current = null;
//     }

//     setCameraOpen(false);
//   };

//   // ======================================================
//   // CAPTURE SELFIE
//   // ======================================================

//   const captureSelfie = () => {
//     const video = videoRef.current;

//     const canvas = canvasRef.current;

//     if (!video || !canvas) return;

//     canvas.width = video.videoWidth;
//     canvas.height = video.videoHeight;

//     const context = canvas.getContext("2d");

//     context.drawImage(video, 0, 0, canvas.width, canvas.height);

//     canvas.toBlob(
//       (blob) => {
//         if (!blob) return;

//         const imageUrl = URL.createObjectURL(blob);

//         setCapturedImage({
//           blob,
//           url: imageUrl,
//         });

//         stopCamera();
//       },
//       "image/jpeg",
//       0.85,
//     );
//   };

//   // ======================================================
//   // SUBMIT ATTENDANCE
//   // ======================================================

//   const submitAttendance = () => {
//     if (!capturedImage?.blob) {
//       alert("Please capture your selfie first.");

//       return;
//     }

//     const formData = new FormData();

//     formData.append("selfie", capturedImage.blob, "attendance-selfie.jpg");

//     if (cameraMode === "check-in") {
//       checkIn(formData, {
//         onSuccess: () => {
//           setCapturedImage(null);
//           setCameraMode(null);
//         },

//         onError: (error) => {
//           console.error("Check In Error:", error);

//           alert(error?.response?.data?.message || "Check-in failed");
//         },
//       });
//     }

//     if (cameraMode === "check-out") {
//       checkOut(formData, {
//         onSuccess: () => {
//           setCapturedImage(null);
//           setCameraMode(null);
//         },

//         onError: (error) => {
//           console.error("Check Out Error:", error);

//           alert(error?.response?.data?.message || "Check-out failed");
//         },
//       });
//     }
//   };

//   // ======================================================
//   // STATUS
//   // ======================================================

//   const hasCheckedIn = !!todayAttendance?.inTime;

//   const hasCheckedOut = !!todayAttendance?.outTime;

//   // ======================================================
//   // FORMAT TIME
//   // ======================================================

//   const formatTime = (date) => {
//     if (!date) return "--";

//     return new Date(date).toLocaleTimeString("en-IN", {
//       hour: "2-digit",
//       minute: "2-digit",
//       hour12: true,
//     });
//   };

//   // ======================================================
//   // FORMAT DATE
//   // ======================================================

//   const formatDate = (date) => {
//     if (!date) return "--";

//     return new Date(date).toLocaleDateString("en-IN", {
//       day: "numeric",
//       month: "short",
//       year: "numeric",
//     });
//   };

//   // ======================================================
//   // FORMAT MINUTES
//   // ======================================================

//   const formatMinutes = (minutes = 0) => {
//     const hours = Math.floor(minutes / 60);

//     const remainingMinutes = minutes % 60;

//     return `${hours}H ${remainingMinutes}M`;
//   };

//   // ======================================================
//   // STATUS COLOR
//   // ======================================================

//   // ======================================================
//   // STATUS
//   // ======================================================

//   const getAttendanceStatus = (status) => {
//     const numericStatus = Number(status);

//     switch (numericStatus) {
//       case 1:
//         return {
//           label: "Present",
//           className: "text-green-600 bg-green-50",
//         };

//       case 0.5:
//         return {
//           label: "Half Day",
//           className: "text-yellow-600 bg-yellow-50",
//         };

//       case 0:
//       default:
//         return {
//           label: "Absent",
//           className: "text-red-600 bg-red-50",
//         };
//     }
//   };

//   // ======================================================
//   // UI
//   // ======================================================

//   return (
//     <div className="min-h-screen bg-gray-100 p-4 md:p-6">
//       {/* ==================================================
//           PAGE HEADER
//       ================================================== */}

//       <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
//         <div>
//           <h1 className="text-2xl font-bold text-gray-800">Attendance</h1>

//           <p className="mt-1 text-sm text-gray-500">
//             Manage your daily attendance and attendance history
//           </p>
//         </div>

//         <div className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 shadow-sm">
//           <FaClock className="text-green-600" />

//           <span className="font-semibold text-gray-700">
//             {currentTime.toLocaleTimeString("en-IN", {
//               hour: "2-digit",
//               minute: "2-digit",
//               second: "2-digit",
//               hour12: true,
//             })}
//           </span>
//         </div>
//       </div>

//       {/* ==================================================
//           TOP SECTION
//       ================================================== */}

//       <div className="grid grid-cols-1 gap-6 xl:grid-cols-[380px_1fr]">
//         {/* ==================================================
//             ATTENDANCE CARD
//         ================================================== */}

//         <div className="rounded-xl bg-white p-5 shadow-md">
//           <div className="mb-4 flex items-center gap-2">
//             <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
//               <FaUserClock className="text-green-600" />
//             </div>

//             <div>
//               <h2 className="font-bold text-gray-800">Today's Attendance</h2>

//               <p className="text-xs text-gray-500">{formatDate(new Date())}</p>
//             </div>
//           </div>

//           {/* CAMERA */}

//           <div className="relative mb-4 flex h-[260px] items-center justify-center overflow-hidden rounded-xl bg-black">
//             {capturedImage ? (
//               <img
//                 src={capturedImage.url}
//                 alt="Attendance selfie"
//                 className="h-full w-full object-cover"
//               />
//             ) : cameraOpen ? (
//               <video
//                 ref={videoRef}
//                 autoPlay
//                 playsInline
//                 muted
//                 className="h-full w-full object-cover"
//               />
//             ) : (
//               <div className="flex flex-col items-center text-gray-400">
//                 <FaCamera size={50} />

//                 <p className="mt-3 text-sm">Camera preview</p>
//               </div>
//             )}
//           </div>

//           <canvas ref={canvasRef} className="hidden" />

//           {/* CAPTURE */}

//           {cameraOpen && (
//             <button
//               type="button"
//               onClick={captureSelfie}
//               className="mb-3 w-full rounded-lg bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-700"
//             >
//               Capture Selfie
//             </button>
//           )}

//           {/* SUBMIT CAPTURED */}

//           {capturedImage && (
//             <button
//               type="button"
//               onClick={submitAttendance}
//               disabled={isCheckingIn || isCheckingOut}
//               className={`mb-3 w-full rounded-lg py-3 font-semibold text-white ${
//                 cameraMode === "check-in"
//                   ? "bg-green-600 hover:bg-green-700"
//                   : "bg-orange-500 hover:bg-orange-600"
//               } disabled:cursor-not-allowed disabled:opacity-50`}
//             >
//               {isCheckingIn || isCheckingOut
//                 ? "Processing..."
//                 : cameraMode === "check-in"
//                   ? "Confirm Check In"
//                   : "Confirm Check Out"}
//             </button>
//           )}

//           {/* TODAY STATUS */}

//           <div className="mb-4 grid grid-cols-2 gap-3">
//             <div className="rounded-lg bg-gray-50 p-3">
//               <p className="text-xs text-gray-500">Check In</p>

//               <p className="mt-1 font-semibold text-gray-800">
//                 {formatTime(todayAttendance?.inTime)}
//               </p>
//             </div>

//             <div className="rounded-lg bg-gray-50 p-3">
//               <p className="text-xs text-gray-500">Check Out</p>

//               <p className="mt-1 font-semibold text-gray-800">
//                 {formatTime(todayAttendance?.outTime)}
//               </p>
//             </div>
//           </div>

//           {/* ACTION BUTTONS */}

//           <div className="grid grid-cols-2 gap-3">
//             <button
//               type="button"
//               disabled={hasCheckedIn || isCheckingIn}
//               onClick={() => openCamera("check-in")}
//               className="flex items-center justify-center gap-2 rounded-lg bg-green-600 py-3 font-semibold text-white shadow-sm transition hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-gray-300"
//             >
//               <FaSignInAlt />

//               {hasCheckedIn ? "Checked In" : "Check In"}
//             </button>

//             <button
//               type="button"
//               disabled={!hasCheckedIn || hasCheckedOut || isCheckingOut}
//               onClick={() => openCamera("check-out")}
//               className="flex items-center justify-center gap-2 rounded-lg bg-orange-500 py-3 font-semibold text-white shadow-sm transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-gray-300"
//             >
//               <FaSignOutAlt />

//               {hasCheckedOut ? "Checked Out" : "Check Out"}
//             </button>
//           </div>
//         </div>

//         {/* ==================================================
//           HISTORY
//       ================================================== */}

//         <div className="mt-6 rounded-xl bg-white shadow-md">
//           {/* HEADER */}

//           <div className="flex flex-col gap-4 border-b p-5 md:flex-row md:items-center md:justify-between">
//             <div>
//               <h2 className="text-lg font-bold text-gray-800">
//                 Attendance History
//               </h2>

//               <p className="text-sm text-gray-500">
//                 View your previous attendance records
//               </p>
//             </div>

//             <div className="flex items-center gap-2">
//               <FaCalendarAlt className="text-gray-500" />

//               <input
//                 type="month"
//                 value={month}
//                 onChange={(e) => {
//                   setMonth(e.target.value);

//                   setCurrentPage(1);
//                 }}
//                 className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
//               />
//             </div>
//           </div>

//           {/* TABLE */}

//           <div className="overflow-x-auto">
//             <table className="w-full min-w-[1100px]">
//               <thead className="bg-black text-white">
//                 <tr>
//                   <th className="px-5 py-4 text-left text-sm font-semibold">
//                     Date
//                   </th>

//                   <th className="px-5 py-4 text-left text-sm font-semibold">
//                     Employee ID
//                   </th>

//                   <th className="px-5 py-4 text-left text-sm font-semibold">
//                     Employee Name
//                   </th>

//                   <th className="px-5 py-4 text-left text-sm font-semibold">
//                     In Time
//                   </th>

//                   <th className="px-5 py-4 text-left text-sm font-semibold">
//                     In Selfie
//                   </th>

//                   <th className="px-5 py-4 text-left text-sm font-semibold">
//                     Out Time
//                   </th>

//                   <th className="px-5 py-4 text-left text-sm font-semibold">
//                     Out Selfie
//                   </th>

//                   <th className="px-5 py-4 text-left text-sm font-semibold">
//                     Total Hours
//                   </th>

//                   <th className="px-5 py-4 text-left text-sm font-semibold">
//                     OverTime
//                   </th>

//                   <th className="px-5 py-4 text-left text-sm font-semibold">
//                     Deficit Hours
//                   </th>

//                   <th className="px-5 py-4 text-left text-sm font-semibold">
//                     Status
//                   </th>
//                 </tr>
//               </thead>

//               <tbody>
//                 {isHistoryLoading ? (
//                   <tr>
//                     <td
//                       colSpan="11"
//                       className="py-10 text-center text-gray-500"
//                     >
//                       Loading attendance...
//                     </td>
//                   </tr>
//                 ) : attendanceList.length === 0 ? (
//                   <tr>
//                     <td
//                       colSpan="11"
//                       className="py-10 text-center text-gray-500"
//                     >
//                       No attendance records found.
//                     </td>
//                   </tr>
//                 ) : (
//                   attendanceList.map((attendance) => (
//                     <tr
//                       key={attendance._id}
//                       className="border-b hover:bg-gray-50"
//                     >
//                       {/* DATE */}

//                       <td className="px-5 py-4 text-sm text-gray-700">
//                         {formatDate(attendance.attendanceDate)}
//                       </td>

//                       {/* EMPLOYEE ID */}

//                       <td className="px-5 py-4 text-sm font-medium text-gray-700">
//                         {attendance.employeeId?.employeeId}
//                       </td>

//                       {/* EMPLOYEE NAME */}

//                       <td className="px-5 py-4 text-sm font-medium text-gray-800">
//                         {attendance.employeeId?.employeeName}
//                       </td>

//                       {/* IN TIME */}

//                       <td className="px-5 py-4 text-sm text-gray-700">
//                         {formatTime(attendance.inTime)}
//                       </td>

//                       {/* IN SELFIE */}

//                       <td className="px-5 py-4">
//                         {attendance.inSelfie?.url ? (
//                           <img
//                             src={attendance.inSelfie.url}
//                             alt="In"
//                             className="h-12 w-12 rounded-lg object-cover"
//                           />
//                         ) : (
//                           <span className="text-xs text-gray-400">--</span>
//                         )}
//                       </td>

//                       {/* OUT TIME */}

//                       <td className="px-5 py-4 text-sm text-gray-700">
//                         {formatTime(attendance.outTime)}
//                       </td>

//                       {/* OUT SELFIE */}

//                       <td className="px-5 py-4">
//                         {attendance.outSelfie?.url ? (
//                           <img
//                             src={attendance.outSelfie.url}
//                             alt="Out"
//                             className="h-12 w-12 rounded-lg object-cover"
//                           />
//                         ) : (
//                           <span className="text-xs text-gray-400">--</span>
//                         )}
//                       </td>

//                       {/* TOTAL */}

//                       <td className="px-5 py-4 text-sm font-medium text-gray-700">
//                         {formatMinutes(attendance.totalMinutes)}
//                       </td>

//                       {/* OVERTIME */}

//                       <td className="px-5 py-4 text-sm text-gray-700">
//                         {formatMinutes(attendance.overtimeMinutes)}
//                       </td>

//                       {/* DEFICIT */}

//                       <td className="px-5 py-4 text-sm text-gray-700">
//                         {formatMinutes(attendance.deficitMinutes)}
//                       </td>

//                       {/* STATUS */}

//                       <td className="px-5 py-4">
//                         {(() => {
//                           const status = getAttendanceStatus(attendance.status);

//                           return (
//                             <span
//                               className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${status.className}`}
//                             >
//                               {status.label}
//                             </span>
//                           );
//                         })()}
//                       </td>
//                     </tr>
//                   ))
//                 )}
//               </tbody>
//             </table>
//           </div>

//           {/* PAGINATION */}

//           <div className="flex items-center justify-between border-t p-4">
//             <p className="text-sm text-gray-500">
//               Page {pagination.page || 1} of {pagination.totalPages || 1}
//             </p>

//             <div className="flex gap-2">
//               <button
//                 type="button"
//                 disabled={currentPage === 1}
//                 onClick={() => setCurrentPage((prev) => prev - 1)}
//                 className="rounded-lg border px-4 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-40"
//               >
//                 Previous
//               </button>

//               <button
//                 type="button"
//                 disabled={currentPage >= (pagination.totalPages || 1)}
//                 onClick={() => setCurrentPage((prev) => prev + 1)}
//                 className="rounded-lg border px-4 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-40"
//               >
//                 Next
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default AttendanceTable;

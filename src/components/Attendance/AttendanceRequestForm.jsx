import React, { useMemo, useState, useEffect } from "react";
import {
  X,
  UserRound,
  Paperclip,
  ClipboardCheck,
  FileText,
} from "lucide-react";
import FilePreview from "../common/FilePreview";
import { compressAttachment } from "../../utils/compressFile";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Select from "react-select";
import { toast } from "react-toastify";
import { selectStyles } from "../../utils/selectStyles";
import { useManagerEmployees } from "../EmployeeDetails/Services/index";
const getDateInputValue = (value) => {
  if (!value) return "";

  // Keep the date portion when the API returns an ISO date string.
  const match = String(value).match(/^\d{4}-\d{2}-\d{2}/);
  if (match) return match[0];

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

// ✅ Convert string "YYYY-MM-DD" -> Date object (same as regularization modal)
const getDateObject = (dateValue) => {
  if (!dateValue) return null;

  const date = new Date(`${dateValue}T00:00:00`);

  if (isNaN(date.getTime())) return null;

  return date;
};

const EmployeeAttendanceRequestModal = ({
  attendance,
  managers = [],
  onClose,
  onSubmit,
}) => {
  const [date, setDate] = useState(
    getDateInputValue(attendance?.attendanceDate),
  );
  const [managerId, setManagerId] = useState("");
  const [attachment, setAttachment] = useState(null);
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isCompressing, setIsCompressing] = useState(false);
  const [compressionProgress, setCompressionProgress] = useState(0);
  const [compressionFileName, setCompressionFileName] = useState("");
  const [pendingFiles, setPendingFiles] = useState([]);
  const hasExistingDate = Boolean(
    getDateInputValue(attendance?.attendanceDate),
  );
  const { data: managerData } = useManagerEmployees();

  // ✅ Build react-select options from managers prop

  const managerOptions = useMemo(() => {
    return (
      managerData?.data
        ?.filter((employee) => employee.loginEnabled === true)
        ?.map((employee) => ({
          value: employee._id, // ✅ ObjectId
          label: employee.employeeName, // display name
        })) || []
    );
  }, [managerData]);

  // ✅ Currently selected option (kept in sync with managerId state)
  const selectedManagerOption = useMemo(
    () => managerOptions.find((option) => option.value === managerId) || null,
    [managerOptions, managerId],
  );
  const isDateValid = Boolean(date && getDateObject(date));
  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage("");
    if (!isDateValid) {
      setErrorMessage("Please select an attendance date before submitting.");
      return;
    }
    if (!onSubmit) {
      setErrorMessage(
        "The attendance regularization submission handler is not configured.",
      );
      return;
    }

    // ✅ Extract employee ID from the attendance record
    const employeeId =
      attendance?.employeeId?._id || attendance?.employeeId || "";

    if (!employeeId) {
      setErrorMessage("Unable to determine the employee for this request.");
      return;
    }
    if (!managerId) {
      setErrorMessage("Please select a manager for this request.");
      return;
    }

    if (!managerOptions.some((manager) => manager.value === managerId)) {
      setErrorMessage("Please select a valid manager.");
      return;
    }
    const formData = new FormData();
    formData.append("requestedBy", employeeId); // ✅ employee ID
    formData.append("requestedTo", managerId); // ✅ manager ID
    formData.append("attendanceDate", date); // ✅ already correct name
    formData.append("reason", reason.trim());
    // NOTE: do NOT append attendanceId — backend doesn't accept it

    if (attachment) {
      formData.append("attachment", attachment);
    }

    try {
      setIsSubmitting(true);

      await onSubmit(formData);
      toast.dismiss();
      toast.success(
        "Attendance regularization request submitted successfully!",
      );

      onClose();
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Unable to submit the regularization request.";

      setErrorMessage(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleClose = () => {
    if (!isSubmitting) onClose();
  };
  const handleAttachmentChange = async (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    setPendingFiles([file]);
    setIsCompressing(true);
    setCompressionProgress(0);
    setCompressionFileName(file.name);

    try {
      const compressedFile = await compressAttachment(file, (progress) => {
        setCompressionProgress(progress);
      });

      // Original and compressed sizes
      // const originalSize = file.size;
      // const compressedSize = compressedFile.size;
      // const savedSize = originalSize - compressedSize;

      // const reductionPercentage =
      //   originalSize > 0 ? (savedSize / originalSize) * 100 : 0;

      // console.group("📷 Attachment Compression Details");

      // console.log("File Name:", file.name);

      // console.log(
      //   "Original Size:",
      //   `${(originalSize / 1024).toFixed(2)} KB`,
      //   `(${(originalSize / 1024 / 1024).toFixed(2)} MB)`,
      // );

      // console.log(
      //   "Compressed Size:",
      //   `${(compressedSize / 1024).toFixed(2)} KB`,
      //   `(${(compressedSize / 1024 / 1024).toFixed(2)} MB)`,
      // );

      // console.log("Space Saved:", `${(savedSize / 1024).toFixed(2)} KB`);

      // console.log(
      //   "Compression Reduction:",
      //   `${reductionPercentage.toFixed(2)}%`,
      // );

      // console.groupEnd();

      setAttachment(compressedFile);

      setAttachment(compressedFile);

      // toast.dismiss();
      // toast.success(
      //   file.type.startsWith("image/")
      //     ? "Image processed successfully."
      //     : "Attachment selected successfully.",
      // );
    } catch (error) {
      console.error("Attachment compression failed:", error);

      toast.dismiss();
      toast.error(error?.message || "Failed to process the attachment.");
    } finally {
      setPendingFiles([]);
      setIsCompressing(false);
      setCompressionProgress(0);
      setCompressionFileName("");

      event.target.value = "";
    }
  };
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 p-3 backdrop-blur-[2px] sm:p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) handleClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="employee-attendance-request-title"
        className="flex max-h-[94vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-gray-200 bg-gray-50 shadow-2xl"
      >
        {/* HEADER */}
        <div className="shrink-0 border-b border-gray-200 bg-white px-5 py-4 sm:px-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 ring-1 ring-inset ring-blue-100">
                <ClipboardCheck size={21} className="text-blue-600" />
              </div>

              <div className="min-w-0">
                <h2
                  id="employee-attendance-request-title"
                  className="text-lg font-bold text-gray-900 sm:text-xl"
                >
                  Attendance Regularization
                </h2>
                <p className="mt-0.5 text-xs text-gray-500 sm:text-sm">
                  Submit an attendance correction request for review
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              aria-label="Close attendance regularization modal"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-gray-500 transition hover:bg-gray-100 hover:text-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* FORM */}
        <form
          onSubmit={handleSubmit}
          className="min-h-0 flex-1 overflow-y-auto"
        >
          <div className="space-y-5 p-4 sm:p-6">
            {/* ATTENDANCE DETAILS */}
            <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
              <div className="mb-5">
                <h3 className="text-base font-semibold text-gray-800">
                  Request Details
                </h3>
                <p className="mt-1 text-xs text-gray-500">
                  Select the attendance date and the manager who should review
                  your request.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                {/* DATE — matches AttendanceRegularizationModal */}
                <div className={`datepicker-group ${date ? "has-value" : ""}`}>
                  <label className="datepicker-label required-label">
                    Attendance Date
                  </label>

                  <DatePicker
                    selected={getDateObject(date)}
                      onChange={(selectedDate) => {
    if (!selectedDate) {
      setDate("");
      return;
    }

    // Prevent future dates
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate > today) {
      return;
    }

    const year = selectedDate.getFullYear();
    const month = String(selectedDate.getMonth() + 1).padStart(2, "0");
    const day = String(selectedDate.getDate()).padStart(2, "0");

    setDate(`${year}-${month}-${day}`);
  }}
                    // onChange={(selectedDate) => {
                    //   if (!selectedDate) {
                    //     setDate("");
                    //     return;
                    //   }

                    //   const year = selectedDate.getFullYear();
                    //   const month = String(
                    //     selectedDate.getMonth() + 1,
                    //   ).padStart(2, "0");
                    //   const day = String(selectedDate.getDate()).padStart(
                    //     2,
                    //     "0",
                    //   );

                    //   setDate(`${year}-${month}-${day}`);
                    // }}
                    dateFormat="dd MMM yyyy"
                    placeholderText=""
                    isClearable={!hasExistingDate}
                    disabled={isSubmitting || hasExistingDate}
                    className="custom-datepicker"
                  />
                  {!isDateValid && (
                    <p className="mt-2 text-xs text-amber-600">
                      Please select the attendance date to continue.
                    </p>
                  )}
                </div>

                {/* MANAGER — now uses react-select + floating label like regularization modal */}
                <div className={`select-group ${managerId ? "has-value" : ""}`}>
                  <label className="select-label required-label">
                    Assign Manager
                  </label>

                  <Select
                    value={selectedManagerOption}
                    onChange={(option) => setManagerId(option?.value || "")}
                    options={managerOptions}
                    isClearable
                    isSearchable
                    isDisabled={isSubmitting || managerOptions.length === 0}
                    placeholder=""
                    styles={selectStyles}
                    // ✅ no classNamePrefix → uses default "select__*" classes
                    // ✅ no portal → menu stays inside modal, no clipping issues
                  />

                  {managerOptions.length === 0 && (
                    <p className="mt-2 text-xs text-amber-600">
                      No managers are available. Please load manager options.
                    </p>
                  )}
                </div>
              </div>
            </section>
            {/* SUPPORTING DOCUMENT */}

            {/* SUPPORTING DOCUMENT */}
            <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
              <div className="mb-4">
                <h3 className="text-base font-semibold text-gray-800">
                  Supporting Document
                </h3>

                <p className="mt-1 text-xs text-gray-500">
                  Attach a document or image that supports your correction
                  request.
                </p>
              </div>

              <label
                htmlFor="regularization-attachment"
                className={`flex items-center gap-3 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 p-4 transition ${
                  isCompressing
                    ? "cursor-not-allowed opacity-60"
                    : "cursor-pointer hover:border-blue-400 hover:bg-blue-50/50"
                }`}
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-white text-blue-600 shadow-sm">
                  <Paperclip size={20} />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-gray-700">
                    {attachment ? attachment.name : "Upload attachment"}
                  </p>

                  <p className="mt-1 text-xs text-gray-500">
                    {attachment
                      ? `${(attachment.size / 1024 / 1024).toFixed(2)} MB`
                      : "PDF, Word document, or image. Optional."}
                  </p>
                </div>

                <span className="shrink-0 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-600">
                  Browse files
                </span>
              </label>

              <input
                id="regularization-attachment"
                type="file"
                accept="image/*,.pdf,.doc,.docx"
                disabled={isCompressing || isSubmitting}
                onChange={handleAttachmentChange}
                className="sr-only"
              />

              <FilePreview
                files={attachment ? [attachment] : []}
                pendingFiles={pendingFiles}
                existingFiles={[]}
                isCompressing={isCompressing}
                compressionProgress={compressionProgress}
                compressionFileName={compressionFileName}
                onRemoveExisting={() => {}}
                onRemoveNew={() => {
                  setAttachment(null);
                }}
              />
            </section>

            {/* REASON */}
            <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
              <div className="mb-4">
                <h3 className="text-base font-semibold text-gray-800">
                  Reason for Correction
                </h3>
                <p className="mt-1 text-xs text-gray-500">
                  Explain why the attendance record needs to be corrected.
                </p>
              </div>

              <label
                htmlFor="regularization-reason"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Reason <span className="text-red-500">*</span>
              </label>
              <textarea
                id="regularization-reason"
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                placeholder="Enter the reason for your attendance correction..."
                required
                minLength={5}
                maxLength={1000}
                rows={4}
                className="w-full resize-y rounded-lg border border-gray-300 bg-white px-3 py-3 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
              <p className="mt-1.5 text-right text-xs text-gray-400">
                {reason.length}/1000 characters
              </p>
            </section>
            {/* ERROR */}
            {errorMessage && (
              <div
                role="alert"
                className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
              >
                {errorMessage}
              </div>
            )}
          </div>

          {/* FOOTER */}
          <div className="sticky bottom-0 flex shrink-0 flex-col-reverse gap-3 border-t border-gray-200 bg-white px-4 py-4 sm:flex-row sm:justify-end sm:px-6">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting || managerOptions.length === 0}
              className="theme-btn text-white px-4 py-2 rounded-lg hover:bg-gray-700 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <span className="theme-btn text-white px-4 py-2 rounded-lg hover:bg-gray-700" />
                  Submitting...
                </>
              ) : (
                "Submit Request"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EmployeeAttendanceRequestModal;
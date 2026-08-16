import React, { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { X, ClipboardCheck } from "lucide-react";
import { toast } from "react-toastify";
import Select from "react-select";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import { selectStyles } from "../../utils/selectStyles";
import { useRegularizeAttendance } from "./services/index";

// ============================================================
// CONSTANTS
// ============================================================

const STATUS_OPTIONS = [
  {
    value: "1",
    label: "Present",
  },
  {
    value: "0.5",
    label: "Half Day",
  },
  {
    value: "0",
    label: "Absent",
  },
];

const MAX_DOCUMENTS = 5;
const MAX_FILE_SIZE = 5 * 1024 * 1024;

// ============================================================
// COMPONENT
// ============================================================

const AttendanceRegularizationModal = ({
  isOpen,
  attendance,
  employees = [],
  onClose,
  onSuccess,
}) => {
  // ============================================================
  // STATE
  // ============================================================

  const [employeeSearch, setEmployeeSearch] = useState("");
  const [employeeResults, setEmployeeResults] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const [supportingDocuments, setSupportingDocuments] = useState([]);

  const regularizeMutation = useRegularizeAttendance();

  const isEditing = Boolean(attendance);

  // ============================================================
  // REACT HOOK FORM
  // ============================================================

  const {
    control,
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      employeeId: "",
      attendanceDate: "",
      status: "",
      remarks: "",
    },
    mode: "onSubmit",
  });

  const attendanceDate = watch("attendanceDate");
  const status = watch("status");
  const remarks = watch("remarks") || "";
  const employeeId = watch("employeeId");

  // ============================================================
  // RESET FORM
  // ============================================================

  const resetForm = () => {
    reset({
      employeeId: "",
      attendanceDate: "",
      status: "",
      remarks: "",
    });

    setSupportingDocuments([]);
    setSelectedEmployee(null);
    setEmployeeSearch("");
    setEmployeeResults(employees);
  };

  // ============================================================
  // FORMAT DATE FOR INDIA TIMEZONE
  // ============================================================

  const getISTDate = (dateValue) => {
    if (!dateValue) return "";

    const date = new Date(dateValue);

    if (isNaN(date.getTime())) return "";

    const parts = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).formatToParts(date);

    const year = parts.find((part) => part.type === "year")?.value;
    const month = parts.find((part) => part.type === "month")?.value;
    const day = parts.find((part) => part.type === "day")?.value;

    if (!year || !month || !day) return "";

    return `${year}-${month}-${day}`;
  };

  // ============================================================
  // DISPLAY DATE
  // ============================================================

  const formatDisplayDate = (dateValue) => {
    if (!dateValue) return "--";

    const date = new Date(`${dateValue}T00:00:00`);

    if (isNaN(date.getTime())) return "--";

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // ============================================================
  // CONVERT STRING DATE -> DATE OBJECT
  // ============================================================

  const getDateObject = (dateValue) => {
    if (!dateValue) return null;

    const date = new Date(`${dateValue}T00:00:00`);

    if (isNaN(date.getTime())) return null;

    return date;
  };

  // ============================================================
  // EMPLOYEE SEARCH
  // ============================================================

  useEffect(() => {
    const search = employeeSearch.trim().toLowerCase();

    if (!search) {
      setEmployeeResults(employees);
      return;
    }

    const filtered = employees.filter((employee) => {
      const name = employee.employeeName?.toLowerCase() || "";
      const id = employee.employeeId?.toLowerCase() || "";

      return name.includes(search) || id.includes(search);
    });

    setEmployeeResults(filtered);
  }, [employeeSearch, employees]);

  // ============================================================
  // LOAD ATTENDANCE / RESET
  // ============================================================

  useEffect(() => {
    if (!isOpen) return;

    if (attendance) {
      const employee = attendance.employeeId;

      const employeeIdValue = employee?._id || "";

      const attendanceDateValue = getISTDate(attendance.attendanceDate);

      const statusValue =
        attendance.status !== undefined && attendance.status !== null
          ? String(attendance.status)
          : "";

      reset({
        employeeId: employeeIdValue,
        attendanceDate: attendanceDateValue,
        status: statusValue,
        remarks: attendance.remarks || "",
      });

      setSelectedEmployee(employee || null);

      setEmployeeSearch(
        employee
          ? `${employee.employeeName || ""} (${employee.employeeId || ""})`
          : "",
      );

      setSupportingDocuments([]);
      setEmployeeResults([]);
    } else {
      resetForm();
    }
  }, [isOpen, attendance, employees, reset]);

  // ============================================================
  // EMPLOYEE OPTIONS
  // ============================================================

  const selectedEmployeeOption = useMemo(() => {
    if (!selectedEmployee) return null;

    return {
      value: selectedEmployee._id,
      label: `${selectedEmployee.employeeName || ""} (${
        selectedEmployee.employeeId || ""
      })`,
      employee: selectedEmployee,
    };
  }, [selectedEmployee]);

  // ============================================================
  // EMPLOYEE SEARCH HANDLER
  // ============================================================

  const handleEmployeeSearch = (value) => {
    setEmployeeSearch(value);

    setSelectedEmployee(null);
    setValue("employeeId", "", {
      shouldValidate: false,
      shouldDirty: true,
    });

    const search = value.trim().toLowerCase();

    if (!search) {
      setEmployeeResults(employees);
      return;
    }

    const filtered = employees.filter((employee) => {
      const name = employee.employeeName?.toLowerCase() || "";
      const id = employee.employeeId?.toLowerCase() || "";

      return name.includes(search) || id.includes(search);
    });

    setEmployeeResults(filtered);
  };

  // ============================================================
  // SELECT EMPLOYEE
  // ============================================================

  const handleSelectEmployee = (employee) => {
    if (!employee) return;

    setSelectedEmployee(employee);

    setValue("employeeId", employee._id, {
      shouldValidate: true,
      shouldDirty: true,
    });

    setEmployeeSearch(
      `${employee.employeeName || ""} (${employee.employeeId || ""})`,
    );

    setEmployeeResults([]);
  };

  // ============================================================
  // CLEAR EMPLOYEE
  // ============================================================

  const handleClearEmployee = () => {
    setSelectedEmployee(null);

    setValue("employeeId", "", {
      shouldValidate: true,
      shouldDirty: true,
    });

    setEmployeeSearch("");
    setEmployeeResults(employees);
  };

  // ============================================================
  // FILE HANDLER
  // ============================================================

  const handleSupportingDocuments = (event) => {
    const files = Array.from(event.target.files || []);

    if (!files.length) return;

    if (files.length > MAX_DOCUMENTS) {
      toast.error(`You can upload maximum ${MAX_DOCUMENTS} documents`);

      event.target.value = "";
      return;
    }

    const invalidFile = files.find((file) => file.size > MAX_FILE_SIZE);

    if (invalidFile) {
      toast.error(`${invalidFile.name} is larger than 5 MB`);

      event.target.value = "";
      return;
    }

    setSupportingDocuments(files);

    // Allow selecting the same files again later.
    event.target.value = "";
  };

  // ============================================================
  // REMOVE SUPPORTING DOCUMENT
  // ============================================================

  const handleRemoveSupportingDocument = (index) => {
    setSupportingDocuments((prev) =>
      prev.filter((_, fileIndex) => fileIndex !== index),
    );
  };

  // ============================================================
  // SUBMIT
  // ============================================================

  const onSubmit = (data) => {
    // ----------------------------------------------------------
    // Employee validation
    // ----------------------------------------------------------

    if (!data.employeeId) {
      toast.error("Please select an employee");
      return;
    }

    // ----------------------------------------------------------
    // Date validation
    // ----------------------------------------------------------

    if (!data.attendanceDate) {
      toast.error("Please select attendance date");
      return;
    }

    // ----------------------------------------------------------
    // Status validation
    // ----------------------------------------------------------

    if (data.status === "") {
      toast.error("Please select attendance status");
      return;
    }

    const numericStatus = Number(data.status);

    if (![0, 0.5, 1].includes(numericStatus)) {
      toast.error("Invalid attendance status");
      return;
    }

    // ==========================================================
    // PAYLOAD
    // ==========================================================
    // IMPORTANT:
    // No inTime / outTime are sent.
    //
    // Backend will preserve existing inTime/outTime.
    // For a new attendance record they remain null.

    const formData = new FormData();

    formData.append("employeeId", data.employeeId);
    formData.append("attendanceDate", data.attendanceDate);
    formData.append("status", numericStatus);
    formData.append("remarks", data.remarks.trim());

    supportingDocuments.forEach((file) => {
      formData.append("supportingDocuments", file);
    });

    // ==========================================================
    // API
    // ==========================================================

    regularizeMutation.mutate(formData, {
      onSuccess: (response) => {
        toast.dismiss();
        toast.success(
          response?.message ||
            (isEditing
              ? "Attendance status updated successfully"
              : "Attendance created successfully"),
        );

        onSuccess?.(response);

        handleClose();
      },

      onError: (error) => {
        console.error("Regularize Attendance Error:", error);

        toast.error(
          error?.response?.data?.message || "Failed to update attendance",
        );
      },
    });
  };

  // ============================================================
  // CLOSE
  // ============================================================

  const handleClose = () => {
    if (regularizeMutation.isPending) return;

    resetForm();
    onClose();
  };

  // ============================================================
  // UI
  // ============================================================

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 p-4">
      <div className="flex max-h-[94vh] w-full max-w-5xl flex-col overflow-hidden rounded-xl bg-gray-50 shadow-xl">
        {/* ======================================================
            HEADER
        ====================================================== */}

        <div className="shrink-0 border-b border-gray-200 bg-white px-5 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50">
                <ClipboardCheck size={20} className="text-blue-600" />
              </div>

              <div className="min-w-0">
                <h2 className="text-xl font-bold text-gray-800">
                  {isEditing ? "Regularize Attendance" : "Create Attendance"}
                </h2>

                <p className="mt-0.5 text-sm text-gray-500">
                  {isEditing
                    ? "Update attendance status and remarks"
                    : "Create a manual attendance record"}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleClose}
              disabled={regularizeMutation.isPending}
              aria-label="Close"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-gray-500 transition hover:bg-gray-100 hover:text-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* ======================================================
            FORM
        ====================================================== */}

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="min-h-0 flex-1 overflow-y-auto"
        >
          <div className="space-y-5 p-5">
            {/* ==================================================
                ATTENDANCE DETAILS
            ================================================== */}

            <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="mb-5">
                <h3 className="text-base font-semibold text-gray-800">
                  Attendance Details
                </h3>

                <p className="mt-1 text-xs text-gray-500">
                  Select the employee and attendance information.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                {/* ==================================================
                    EMPLOYEE
                ================================================== */}

                <div className="md:col-span-2">
                  {isEditing ? (
                    <div className="form-group">
                      <input
                        type="text"
                        value={
                          selectedEmployee
                            ? `${selectedEmployee.employeeName || ""} (${
                                selectedEmployee.employeeId || ""
                              })`
                            : ""
                        }
                        placeholder=" "
                        readOnly
                        className="form-input bg-gray-50"
                      />

                      <label className="form-label required-label">
                        Employee
                      </label>
                    </div>
                  ) : (
                    <div className="relative">
                      <div className="form-group">
                        <input
                          type="text"
                          value={
                            selectedEmployeeOption
                              ? selectedEmployeeOption.label
                              : employeeSearch
                          }
                          placeholder=" "
                          autoComplete="off"
                          onFocus={() => {
                            if (!selectedEmployee) {
                              setEmployeeResults(employees);
                            }
                          }}
                          onChange={(e) => handleEmployeeSearch(e.target.value)}
                          className={`form-input ${
                            errors.employeeId ? "border-red-500" : ""
                          }`}
                        />

                        <label className="form-label required-label">
                          Employee
                        </label>

                        {selectedEmployee && (
                          <button
                            type="button"
                            onClick={handleClearEmployee}
                            className="absolute right-2 top-1/2 z-10 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-gray-400 transition hover:bg-red-50 hover:text-red-500"
                            aria-label="Clear employee"
                          >
                            <X size={15} />
                          </button>
                        )}
                      </div>

                      {/* Employee search dropdown */}

                      {!selectedEmployee && (
                        <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-52 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg">
                          {employeeResults.length > 0 ? (
                            employeeResults.map((employee) => (
                              <button
                                key={employee._id}
                                type="button"
                                onClick={() => handleSelectEmployee(employee)}
                                className="w-full border-b border-gray-100 px-3 py-2.5 text-left transition last:border-b-0 hover:bg-blue-50"
                              >
                                <p className="truncate text-sm font-medium text-gray-800">
                                  {employee.employeeName}
                                </p>

                                <p className="mt-0.5 text-xs text-gray-500">
                                  ID: {employee.employeeId}
                                </p>
                              </button>
                            ))
                          ) : (
                            <div className="px-3 py-3 text-sm text-gray-500">
                              No employees found
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  <input
                    type="hidden"
                    {...register("employeeId", {
                      required: true,
                    })}
                  />

                  {errors.employeeId && (
                    <p className="mt-1 text-xs text-red-500">
                      Please select an employee
                    </p>
                  )}
                </div>

                {/* ==================================================
                    DATE
                ================================================== */}

                <Controller
                  name="attendanceDate"
                  control={control}
                  rules={{
                    required: "Please select attendance date",
                  }}
                  render={({ field }) => (
                    <div
                      className={`datepicker-group ${
                        field.value ? "has-value" : ""
                      }`}
                    >
                      <label className="datepicker-label required-label">
                        Attendance Date
                      </label>

                      <DatePicker
                        selected={getDateObject(field.value)}
                        onChange={(date) => {
                          if (!date) {
                            field.onChange("");
                            return;
                          }

                          const year = date.getFullYear();
                          const month = String(date.getMonth() + 1).padStart(
                            2,
                            "0",
                          );
                          const day = String(date.getDate()).padStart(2, "0");

                          field.onChange(`${year}-${month}-${day}`);
                        }}
                        dateFormat="dd MMM yyyy"
                        placeholderText=""
                        isClearable={!isEditing}
                        disabled={isEditing}
                        className={`custom-datepicker ${
                          errors.attendanceDate ? "border-red-500" : ""
                        }`}
                      />

                      {errors.attendanceDate && (
                        <p className="mt-1 text-xs text-red-500">
                          {errors.attendanceDate.message}
                        </p>
                      )}
                    </div>
                  )}
                />

                {/* ==================================================
                    STATUS
                ================================================== */}

                <div className="md:col-span-1">
                  <Controller
                    name="status"
                    control={control}
                    rules={{
                      validate: (value) =>
                        value !== "" || "Please select attendance status",
                    }}
                    render={({ field }) => {
                      const selectedStatus =
                        STATUS_OPTIONS.find(
                          (option) => option.value === field.value,
                        ) || null;

                      return (
                        <>
                          <div
                            className={`select-group ${
                              field.value ? "has-value" : ""
                            }`}
                          >
                            <label className="select-label required-label">
                              Attendance Status
                            </label>

                            <Select
                              value={selectedStatus}
                              onChange={(option) =>
                                field.onChange(option?.value || "")
                              }
                              options={STATUS_OPTIONS}
                              isClearable
                              isSearchable={false}
                              placeholder=""
                              styles={selectStyles}
                              classNamePrefix="attendance-select"
                            />
                          </div>

                          {errors.status && (
                            <p className="mt-1 text-xs text-red-500">
                              {errors.status.message}
                            </p>
                          )}
                        </>
                      );
                    }}
                  />
                </div>
              </div>
            </section>

            {/* ====================================================
                REMARKS
            ==================================================== */}

            <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="mb-5 flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-semibold text-gray-800">
                    Remarks
                  </h3>

                  <p className="mt-1 text-xs text-gray-500">
                    Add a reason or note for this attendance regularization.
                  </p>
                </div>

                <span className="shrink-0 text-xs text-gray-400">
                  {remarks.length}/500
                </span>
              </div>

              <div className="form-group">
                <textarea
                  {...register("remarks", {
                    maxLength: 500,
                  })}
                  placeholder=" "
                  rows={3}
                  maxLength={500}
                  className="form-input min-h-[90px] resize-none"
                />

                <label className="form-label">
                  Remarks
                  <span className="ml-1 text-xs font-normal text-gray-400">
                    (Optional)
                  </span>
                </label>
              </div>
            </section>

            {/* ====================================================
                SUPPORTING DOCUMENTS
            ==================================================== */}

            <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="mb-5 flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-semibold text-gray-800">
                    Supporting Documents
                  </h3>

                  <p className="mt-1 text-xs text-gray-500">
                    Upload documents related to attendance regularization.
                  </p>
                </div>

                <span className="shrink-0 text-xs text-gray-400">
                  Max 5 files
                </span>
              </div>

              <div className="form-group">
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  multiple
                  onChange={handleSupportingDocuments}
                  className="form-input cursor-pointer file:mr-3 file:rounded-md file:border-0 file:bg-gray-100 file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-gray-700 hover:file:bg-gray-200"
                />

                <label className="form-label">
                  Supporting Documents
                  <span className="ml-1 text-xs font-normal text-gray-400">
                    (Optional)
                  </span>
                </label>
              </div>

              <p className="mt-2 text-xs text-gray-400">
                PDF, JPG, JPEG or PNG · Maximum 5 MB per file
              </p>

              {/* Selected files */}

              {supportingDocuments.length > 0 && (
                <div className="mt-4 space-y-2">
                  {supportingDocuments.map((file, index) => (
                    <div
                      key={`${file.name}-${index}`}
                      className="flex items-center justify-between gap-3 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-gray-700">
                          {file.name}
                        </p>

                        <p className="text-xs text-gray-400">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveSupportingDocument(index)}
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-gray-400 transition hover:bg-red-50 hover:text-red-500"
                        aria-label={`Remove ${file.name}`}
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* ====================================================
                EXISTING DOCUMENTS
            ==================================================== */}

            {isEditing && attendance?.regularizationDocuments?.length > 0 && (
              <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                <div className="mb-5">
                  <h3 className="text-base font-semibold text-gray-800">
                    Existing Documents
                  </h3>

                  <p className="mt-1 text-xs text-gray-500">
                    Documents already attached to this attendance record.
                  </p>
                </div>

                <div className="space-y-2">
                  {attendance.regularizationDocuments.map((document, index) => (
                    <a
                      key={document.publicId || index}
                      href={document.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between gap-3 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 transition hover:border-blue-200 hover:bg-blue-50"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-gray-700">
                          {document.originalName}
                        </p>

                        <p className="truncate text-xs text-gray-400">
                          {document.mimeType}
                        </p>
                      </div>

                      <span className="shrink-0 rounded-md bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-600">
                        View
                      </span>
                    </a>
                  ))}
                </div>
              </section>
            )}

            {/* ====================================================
                EDIT INFORMATION
            ==================================================== */}

            {isEditing && (
              <section className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3">
                <div className="flex gap-3">
                  <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-blue-100">
                    <ClipboardCheck size={15} className="text-blue-600" />
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-blue-800">
                      Editing Attendance
                    </p>

                    <p className="mt-0.5 text-xs leading-5 text-blue-700">
                      Only attendance status and remarks will be updated.
                      Existing check-in and check-out times remain unchanged.
                    </p>
                  </div>
                </div>
              </section>
            )}
          </div>

          {/* ======================================================
              FOOTER
          ====================================================== */}

          <div className="sticky bottom-0 flex shrink-0 items-center justify-end gap-3 border-t border-gray-200 bg-white px-5 py-4">
            <button
              type="button"
              onClick={handleClose}
              disabled={regularizeMutation.isPending}
              className="rounded-lg border border-gray-600 px-6 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-700 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={regularizeMutation.isPending}
              className="theme-btn rounded-lg px-5 py-2 text-sm font-medium text-white transition hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {regularizeMutation.isPending
                ? "Saving..."
                : isEditing
                  ? "Update Status"
                  : "Create Attendance"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AttendanceRegularizationModal;
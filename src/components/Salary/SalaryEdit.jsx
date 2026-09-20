import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { ArrowLeft } from "lucide-react";
import { toast } from "react-toastify";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { formatDateAndTime } from "../../utils/dateFormatter";
import { useEmployeeSalary, useUpdateSalary } from "./services/index";
import { useAuth } from "../../context/authContext";
const SalaryEdit = () => {
  const navigate = useNavigate();
  const { employeeId } = useParams();
  const [searchParams] = useSearchParams();

  const month = Number(searchParams.get("month"));
  const year = Number(searchParams.get("year"));

  const { register, handleSubmit, reset, watch } = useForm({
    defaultValues: {
      paidLeaveDays: 0,
      publicHolidayDays: 0,
      monthlySalary: 0,

      // WorkLog
      newWorkLog: "",

      // Adjustment Amount Details
      adjustmentDetails: {
        specialPerks: [],
        deductions: [],

        newSpecialPerk: {
          label: "",
          amount: "",
          comments: "",
        },

        newDeduction: {
          label: "",
          amount: "",
          comments: "",
        },
      },

      // Paid Amount Details
      paidAmountDetails: {
        advanceAmount: [],

        newAdvanceAmount: {
          label: "",
          amount: "",
          comments: "",
        },

        deductedAmount: {
          label: "",
          amount: 0,
          comments: "",
        },
      },

      adjustedAmount: 0,
      paidAmount: 0,
      previousDue: 0,
      comments: "",
    },
  });
  const formValues = watch();
  const [workLogs, setWorkLogs] = useState([]);
  const { data, isLoading, isFetching } = useEmployeeSalary({
    employeeId,
    month,
    year,
  });

  const { mutate: updateSalary, isPending } = useUpdateSalary();

  const salary = data?.data || null;
  const { user } = useAuth();
  const userName =
    user?.Name || user?.name || user?.fullName || user?.username || "System";
  // ============================================================
  // SET API DATA
  // ============================================================
  useEffect(() => {
    if (!salary) return;

    // ============================================================
    // SET WORK LOG HISTORY
    // ============================================================

    setWorkLogs(Array.isArray(salary.workLogs) ? salary.workLogs : []);

    // ============================================================
    // SET FORM DATA USING REACT HOOK FORM
    // ============================================================
    // reset() replaces the complete RHF form state with API data.
    // This is better than manually calling setValue() for every field.
    reset({
      paidLeaveDays: salary.paidLeaveDays ?? 0,
      publicHolidayDays: salary.publicHolidayDays ?? 0,
      monthlySalary: salary.monthlySalary ?? 0,

      // Always empty when opening/editing salary.
      // This field is only for adding a NEW worklog.
      newWorkLog: "",

      adjustmentDetails: {
        specialPerks: salary.adjustmentDetails?.specialPerks ?? [],
        deductions: salary.adjustmentDetails?.deductions ?? [],

        newSpecialPerk: {
          label: "",
          amount: "",
          comments: "",
        },

        newDeduction: {
          label: "",
          amount: "",
          comments: "",
        },
      },

      paidAmount: salary.paidAmount ?? 0,

      paidAmountDetails: {
        advanceAmount: Array.isArray(salary.paidAmountDetails?.advanceAmount)
          ? salary.paidAmountDetails.advanceAmount
          : salary.paidAmountDetails?.advanceAmount
            ? [salary.paidAmountDetails.advanceAmount]
            : [],

        newAdvanceAmount: {
          label: "",
          amount: "",
          comments: "",
        },

        deductedAmount: salary.paidAmountDetails?.deductedAmount ?? {
          label: "",
          amount: 0,
          comments: "",
        },
      },

      previousDue: salary.previousDue ?? 0,
      comments: salary.comments ?? "",
    });
  }, [salary, reset]);

  const formatAdjustmentHistory = (items = []) => {
    return items
      .filter((item) => Number(item.amount) > 0)
      .map((item) => Number(item.amount).toLocaleString("en-IN"))
      .join(" + ");
  };
  const previousSpecialPerks = formatAdjustmentHistory(
    formValues.adjustmentDetails?.specialPerks,
  );

  const previousDeductions = formatAdjustmentHistory(
    formValues.adjustmentDetails?.deductions,
  );
  const getTotalAdjustment = (items = []) => {
    return items.reduce((total, item) => total + (Number(item.amount) || 0), 0);
  };
  const totalSpecialPerks = getTotalAdjustment(
    formValues.adjustmentDetails?.specialPerks,
  );

  const totalDeductions = getTotalAdjustment(
    formValues.adjustmentDetails?.deductions,
  );

  const netAdjustment = totalSpecialPerks - totalDeductions;
  const getTotalAdvanceAmount = (items = []) => {
    return items.reduce((total, item) => total + (Number(item.amount) || 0), 0);
  };

  const previousAdvancePayments =
    formValues.paidAmountDetails?.advanceAmount || [];

  const totalAdvanceAmount = getTotalAdvanceAmount(previousAdvancePayments);
  // ============================================================
  // SUBMIT
  // ============================================================

  // ============================================================
  // SUBMIT
  // ============================================================

  const onSubmit = (formData) => {
    // ============================================================
    // NEW SPECIAL PERK
    // ============================================================

    const newSpecialPerk = {
      label: formData.adjustmentDetails?.newSpecialPerk?.label?.trim() || "",

      amount: Number(formData.adjustmentDetails?.newSpecialPerk?.amount) || 0,

      comments:
        formData.adjustmentDetails?.newSpecialPerk?.comments?.trim() || "",
    };

    // ============================================================
    // NEW DEDUCTION
    // ============================================================

    const newDeduction = {
      label: formData.adjustmentDetails?.newDeduction?.label?.trim() || "",

      amount: Number(formData.adjustmentDetails?.newDeduction?.amount) || 0,

      comments:
        formData.adjustmentDetails?.newDeduction?.comments?.trim() || "",
    };

    // ============================================================
    // KEEP PREVIOUS ADJUSTMENT HISTORY
    // ============================================================

    const specialPerks = [...(formData.adjustmentDetails?.specialPerks || [])];

    const deductions = [...(formData.adjustmentDetails?.deductions || [])];

    // ============================================================
    // ADD NEW PERK ONLY IF AMOUNT > 0
    // ============================================================

    if (newSpecialPerk.amount > 0) {
      specialPerks.push(newSpecialPerk);
    }

    // ============================================================
    // ADD NEW DEDUCTION ONLY IF AMOUNT > 0
    // ============================================================

    if (newDeduction.amount > 0) {
      deductions.push(newDeduction);
    }

    // ============================================================
    // TOTAL ADJUSTMENTS
    // ============================================================

    const totalSpecialPerks = specialPerks.reduce(
      (total, item) => total + (Number(item.amount) || 0),
      0,
    );

    const totalDeductions = deductions.reduce(
      (total, item) => total + (Number(item.amount) || 0),
      0,
    );

    const adjustedAmount = totalSpecialPerks - totalDeductions;

    // ============================================================
    // NEW ADVANCE AMOUNT
    // ============================================================

    const newAdvanceAmount = {
      label: formData.paidAmountDetails?.newAdvanceAmount?.label?.trim() || "",

      amount: Number(formData.paidAmountDetails?.newAdvanceAmount?.amount) || 0,

      comments:
        formData.paidAmountDetails?.newAdvanceAmount?.comments?.trim() || "",
    };

    // ============================================================
    // KEEP PREVIOUS ADVANCE HISTORY
    // ============================================================

    const advanceAmount = [
      ...(formData.paidAmountDetails?.advanceAmount || []),
    ];

    // ============================================================
    // ADD NEW ADVANCE ONLY IF AMOUNT > 0
    // ============================================================

    if (newAdvanceAmount.amount > 0) {
      advanceAmount.push(newAdvanceAmount);
    }

    // ============================================================
    // TOTAL ADVANCE AMOUNT
    // ============================================================

    const totalAdvanceAmount = advanceAmount.reduce(
      (total, item) => total + (Number(item.amount) || 0),
      0,
    );

    // ============================================================
    // DEDUCTED PAID AMOUNT
    // ============================================================

    const deductedPaidAmount =
      Number(formData.paidAmountDetails?.deductedAmount?.amount) || 0;

    // ============================================================
    // FINAL PAID AMOUNT
    // ============================================================

    const paidAmount = totalAdvanceAmount - deductedPaidAmount;

    // ============================================================
    // PAYLOAD
    // ============================================================

    const payload = {
      month,
      year,

      paidLeaveDays: Number(formData.paidLeaveDays) || 0,
      publicHolidayDays: Number(formData.publicHolidayDays) || 0,
      monthlySalary: Number(formData.monthlySalary) || 0,

      adjustedAmount,

      adjustmentDetails: {
        specialPerks,
        deductions,
      },

      paidAmount,

      paidAmountDetails: {
        advanceAmount,

        deductedAmount: {
          label:
            formData.paidAmountDetails?.deductedAmount?.label?.trim() || "",

          amount: deductedPaidAmount,

          comments:
            formData.paidAmountDetails?.deductedAmount?.comments?.trim() || "",
        },
      },

      previousDue: Number(formData.previousDue) || 0,

      comments: formData.comments?.trim() || "",

      // ==========================================================
      // MANUAL WORKLOG
      // ==========================================================

      newWorkLog: formData.newWorkLog?.trim() || "",

      // ==========================================================
      // CURRENT USER NAME
      // ==========================================================

      updatedByName: userName,
    };

    // ============================================================
    // DEBUG
    // ============================================================

    // console.log("Salary update payload:", {
    //   employeeId,
    //   payload,
    // });

    // ============================================================
    // CALL API
    // ============================================================

    updateSalary(
      {
        employeeId,
        payload,
      },
      {
        onSuccess: (response) => {
          toast.success(response?.message || "Salary updated successfully");

          navigate(`/salary/all?month=${month}&year=${year}`);
        },

        onError: (error) => {
          console.error("Salary update error:", error);

          toast.error(
            error?.response?.data?.message ||
              error?.message ||
              "Failed to update salary",
          );
        },
      },
    );
  };
  // ============================================================
  // LOADING
  // ============================================================

  if (isLoading || isFetching) {
    return (
      <div className="max-w-12xl mx-auto px-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-700 rounded-full animate-spin" />
            <span className="text-sm text-gray-600">
              Loading salary details...
            </span>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================
  // PAGE
  // ============================================================

  return (
    <div className="max-w-12xl mx-auto px-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* ============================================================
            HEADER
        ============================================================ */}

        <div className="bg-white rounded-xl shadow-sm border border-gray-400 px-4 py-3">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() =>
                  navigate(`/salary/all?month=${month}&year=${year}`)
                }
                className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 transition"
                title="Back"
              >
                <ArrowLeft size={20} />
              </button>

              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  Edit Salary
                </h1>

                <p className="text-sm text-gray-500">
                  {salary?.employeeName ||
                    salary?.employee?.employeeName ||
                    "Employee"}{" "}
                  ({employeeId})
                </p>
              </div>
            </div>

            <div className="text-sm text-gray-500">
              Salary Period:{" "}
              <span className="font-medium text-gray-700">
                {month}/{year}
              </span>
            </div>
          </div>
        </div>

        {/* ============================================================
            SALARY DETAILS
        ============================================================ */}

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-5">
            Salary Details
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* PAID LEAVES */}

            <div className="form-group">
              <input
                type="number"
                {...register("paidLeaveDays")}
                min="0"
                step="0.5"
                placeholder=" "
                className="form-input"
              />

              <label className="form-label">Paid Leaves</label>
            </div>
            {/* PUBLIC HOLIDAY */}

            <div className="form-group">
              <input
                type="number"
                {...register("publicHolidayDays")}
                min="0"
                step="0.5"
                placeholder=" "
                className="form-input"
              />

              <label className="form-label">Public Holiday</label>
            </div>
            {/* FIXED SALARY */}

            <div className="form-group">
              <input
                type="number"
                {...register("monthlySalary")}
                min="0"
                step="0.01"
                placeholder=" "
                className="form-input"
              />

              <label className="form-label">Fixed Salary</label>
            </div>
            {/* TOTAL DAYS IN MONTH */}
            <div className="form-group">
              <input
                type="text"
                value={salary?.totalDays ?? 0}
                readOnly
                placeholder=" "
                className="form-input bg-gray-50 cursor-not-allowed"
              />
              <label className="form-label">Total Days in Month</label>
            </div>

            {/* TOTAL PRESENT DAYS */}
            <div className="form-group">
              <input
                type="text"
                value={salary?.totalPresentDays ?? 0}
                readOnly
                placeholder=" "
                className="form-input bg-gray-50 cursor-not-allowed"
              />
              <label className="form-label">Total Present Days</label>
            </div>

            {/* PER DAY SALARY */}
            <div className="form-group">
              <input
                type="text"
                value={`₹ ${Number(salary?.perDaySalary ?? 0).toFixed(2)}`}
                readOnly
                placeholder=" "
                className="form-input bg-gray-50 cursor-not-allowed"
              />
              <label className="form-label">Per Day Salary</label>
            </div>

            {/* TOTAL PAYABLE DAYS */}
            <div className="form-group">
              <input
                type="text"
                value={salary?.totalPayableDays ?? 0}
                readOnly
                placeholder=" "
                className="form-input bg-gray-50 cursor-not-allowed"
              />
              <label className="form-label">Total Payable Days</label>
            </div>
            {/* PAYABLE SALARY */}

            <div className="form-group">
              <input
                type="text"
                value={`₹ ${Number(salary?.payableSalary || 0).toFixed(2)}`}
                readOnly
                placeholder=" "
                className="form-input bg-gray-50 cursor-not-allowed"
              />

              <label className="form-label">Payable Salary</label>
            </div>
          </div>

          <p className="text-xs text-gray-500 mt-3">
            Payable salary is automatically calculated from attendance, paid
            leaves, salary and adjustments.
          </p>
        </div>
        {/* adjustment and payment */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          {/* ============================================================
    ADJUSTMENT AMOUNT DETAILS
============================================================ */}

          <div className="w-full bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-800">
                  Adjustment Amount Details
                </h2>
                <p className="text-xs text-gray-500 mt-1">
                  Add perks or deductions to this salary
                </p>
              </div>

              {netAdjustment !== 0 && (
                <div
                  className={`px-3 py-1.5 rounded-lg text-sm font-semibold ${
                    netAdjustment > 0
                      ? "bg-green-50 text-green-700"
                      : "bg-red-50 text-red-700"
                  }`}
                >
                  {netAdjustment > 0 ? "+" : "-"} ₹
                  {Math.abs(netAdjustment).toLocaleString("en-IN")}
                </div>
              )}
            </div>

            {/* SPECIAL PERK */}
            <div className="mb-7">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-700">
                  Special Perk
                </h3>

                {totalSpecialPerks > 0 && (
                  <span className="text-xs font-medium text-green-600">
                    Total: ₹ {totalSpecialPerks.toLocaleString("en-IN")}
                  </span>
                )}
              </div>

              {/* Previous perks */}
              {formValues.adjustmentDetails?.specialPerks?.length > 0 && (
                <div className="mb-4 rounded-lg border border-green-100 bg-green-50/60 px-4 py-3">
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-xs font-medium text-gray-500 whitespace-nowrap">
                      Previous Perks
                    </p>

                    <p className="text-sm font-semibold text-green-700 text-right">
                      {formValues.adjustmentDetails?.specialPerks
                        .map(
                          (item) =>
                            `₹ ${Number(item.amount || 0).toLocaleString("en-IN")}`,
                        )
                        .join(" + ")}
                    </p>
                  </div>
                </div>
              )}

              {/* New perk */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-group">
                  <input
                    type="number"
                    {...register("adjustmentDetails.newSpecialPerk.amount")}
                    min="0"
                    step="0.01"
                    placeholder=" "
                    className="form-input"
                  />
                  <label className="form-label">New Perk ₹</label>
                </div>

                <div className="form-group">
                  <input
                    type="text"
                    {...register("adjustmentDetails.newSpecialPerk.comments")}
                    placeholder=" "
                    className="form-input"
                  />

                  <label className="form-label">Comments</label>
                </div>
              </div>
            </div>

            {/* DIVIDER */}
            <div className="border-t border-gray-100 my-6" />

            {/* DEDUCTION */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-700">
                  Deducted Amount
                </h3>

                {totalDeductions > 0 && (
                  <span className="text-xs font-medium text-red-600">
                    Total: ₹ {totalDeductions.toLocaleString("en-IN")}
                  </span>
                )}
              </div>

              {/* Previous deductions */}
              {formValues.adjustmentDetails?.deductions?.length > 0 && (
                <div className="mb-4 rounded-lg border border-red-100 bg-red-50/60 px-4 py-3">
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-xs font-medium text-gray-500 whitespace-nowrap">
                      Previous Deductions
                    </p>

                    <p className="text-sm font-semibold text-red-700 text-right">
                      {formValues.adjustmentDetails?.deductions
                        .map(
                          (item) =>
                            `₹ ${Number(item.amount || 0).toLocaleString("en-IN")}`,
                        )
                        .join(" + ")}
                    </p>
                  </div>
                </div>
              )}

              {/* New deduction */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-group">
                  <input
                    type="number"
                    {...register("adjustmentDetails.newDeduction.amount")}
                    min="0"
                    step="0.01"
                    placeholder=" "
                    className="form-input"
                  />
                  <label className="form-label">New Deduction ₹</label>
                </div>

                <div className="form-group">
                  <input
                    type="text"
                    {...register("adjustmentDetails.newDeduction.comments")}
                    placeholder=" "
                    className="form-input"
                  />
                  <label className="form-label">Comments</label>
                </div>
              </div>
            </div>
          </div>

          {/* ============================================================
            PAID AMOUNT DETAILS
        ============================================================ */}

          {/* ============================================================
    PAID AMOUNT DETAILS
============================================================ */}

          <div className="w-full bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-800">
                  Paid Amount Details
                </h2>

                <p className="text-xs text-gray-500 mt-1">
                  Manage advance and paid amount deductions
                </p>
              </div>

              <div className="text-right">
                <p className="text-xs text-gray-500">Advance Total</p>
                <p className="text-lg font-bold text-gray-800">
                  ₹ {totalAdvanceAmount.toLocaleString("en-IN")}
                </p>
              </div>
            </div>

            {/* ADVANCE AMOUNT */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-700">
                  Advance Amount
                </h3>

                {totalAdvanceAmount > 0 && (
                  <span className="text-xs font-medium text-blue-600">
                    Previous: ₹ {totalAdvanceAmount.toLocaleString("en-IN")}
                  </span>
                )}
              </div>

              {/* Previous advance history */}
              {formValues.paidAmountDetails?.advanceAmount?.length > 0 ? (
                <div className="mb-4 rounded-lg border border-blue-100 bg-blue-50/60 px-4 py-3">
                  <p className="text-xs font-medium text-gray-500 mb-2">
                    Previous Advances
                  </p>

                  <div className="space-y-2">
                    {formValues.paidAmountDetails?.advanceAmount?.length >
                      0 && (
                      <div className="mb-4 rounded-lg border border-blue-100 bg-blue-50/60 px-4 py-3">
                        <div className="flex items-center justify-between gap-4">
                          <p className="text-xs font-medium text-gray-500 whitespace-nowrap">
                            Previous Advances
                          </p>

                          <p className="text-sm font-semibold text-blue-700 text-right">
                            {formValues.paidAmountDetails?.advanceAmount
                              .map(
                                (item) =>
                                  `₹ ${Number(item.amount || 0).toLocaleString("en-IN")}`,
                              )
                              .join(" + ")}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="mb-4 rounded-lg border border-dashed border-gray-300 bg-gray-50 px-4 py-3">
                  <p className="text-sm text-gray-400">
                    No previous advance payment
                  </p>
                </div>
              )}

              {/* New advance */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-group">
                  <input
                    type="number"
                    {...register("paidAmountDetails.newAdvanceAmount.amount")}
                    min="0"
                    step="0.01"
                    placeholder=" "
                    className="form-input"
                  />

                  <label className="form-label">New Advance ₹</label>
                </div>

                <div className="form-group">
                  <input
                    type="text"
                    {...register("paidAmountDetails.newAdvanceAmount.comments")}
                    placeholder=" "
                    className="form-input"
                  />

                  <label className="form-label">Comments</label>
                </div>
              </div>
            </div>

            {/* DIVIDER */}
            <div className="border-t border-gray-100 my-6" />

            {/* DEDUCTED AMOUNT */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-700">
                  Deducted Amount
                </h3>

                {Number(
                  formValues.paidAmountDetails?.deductedAmount?.amount || 0,
                ) > 0 && (
                  <span className="text-xs font-medium text-red-600">
                    ₹{" "}
                    {Number(
                      formValues.paidAmountDetails?.deductedAmount?.amount || 0,
                    ).toLocaleString("en-IN")}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="form-group">
                  <input
                    type="text"
                    {...register("paidAmountDetails.deductedAmount.label")}
                    placeholder=" "
                    className="form-input"
                  />

                  <label className="form-label">Label</label>
                </div>

                <div className="form-group">
                  <input
                    type="number"
                    {...register("paidAmountDetails.deductedAmount.amount")}
                    min="0"
                    step="0.01"
                    placeholder=" "
                    className="form-input"
                  />

                  <label className="form-label">Deducted Amt ₹</label>
                </div>

                <div className="form-group">
                  <input
                    type="text"
                    {...register("paidAmountDetails.deductedAmount.comments")}
                    placeholder=" "
                    className="form-input"
                  />

                  <label className="form-label">Comments</label>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* ============================================================
            ADDITIONAL DETAILS
        ============================================================ */}

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-5">
            Additional Details
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* PREVIOUS DUE */}

            <div className="form-group">
              <input
                type="number"
                {...register("previousDue")}
                step="0.01"
                placeholder=" "
                className="form-input"
              />

              <label className="form-label">Previous Due ₹</label>
            </div>
          </div>

          {/* COMMENTS */}

          <div className="form-group mt-4">
            <textarea
              {...register("comments")}
              rows={3}
              placeholder=" "
              className="form-input resize-none"
            />

            <label className="form-label">Comments</label>
          </div>
        </div>
        {/* ============================================================
    WORK LOG
============================================================ */}

        {salary && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* ====================== ADD WORK LOG ====================== */}

            <div className="form-group">
              <textarea
                {...register("newWorkLog")}
                rows={5}
                placeholder=" "
                className="form-input resize-none"
              />
              <label className="form-label">Add WorkLog</label>
            </div>
            {/* ====================== WORK LOG HISTORY ====================== */}

            <div className="border rounded-lg bg-gray-50 p-4 h-64 flex flex-col">
              <h3 className="font-semibold text-lg mb-3">Work Log History</h3>

              <div className="flex-1 overflow-y-auto pr-2">
                {workLogs.length > 0 ? (
                  [...workLogs].reverse().map((log) => (
                    <div
                      key={log._id}
                      className="border-b border-gray-200 py-3 last:border-b-0"
                    >
                      <div className="flex items-center justify-between gap-3 mb-1">
                        <small className="text-gray-500">
                          {log.createdBy || "System"} •{" "}
                          {formatDateAndTime(log.createdAt)}
                        </small>
                      </div>

                      <p className="text-sm text-gray-700 whitespace-pre-line break-words">
                        {log.message}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400 text-center mt-10">
                    No Work Logs Available
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
        {/* ============================================================
            FOOTER
        ============================================================ */}

        <div className="flex justify-end gap-5 pb-6">
          <button
            type="button"
            onClick={() => navigate(`/salary/all?month=${month}&year=${year}`)}
            disabled={isPending}
            className="border border-gray-600 hover:bg-gray-700 hover:text-white px-6 py-2 rounded-lg font-medium transition"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={isPending}
            className="theme-btn text-white px-6 py-2 rounded-lg hover:bg-gray-700"
          >
            {isPending ? "Updating..." : "Update Salary"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SalaryEdit;
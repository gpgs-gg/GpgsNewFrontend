import React, { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { toast } from "react-toastify";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";

import { useEmployeeSalary, useUpdateSalary } from "./services/index";

const SalaryEdit = () => {
  const navigate = useNavigate();
  const { employeeId } = useParams();
  const [searchParams] = useSearchParams();

  const month = Number(searchParams.get("month"));
  const year = Number(searchParams.get("year"));

  const [formData, setFormData] = useState({
    paidLeaveDays: 0,
    monthlySalary: 0,

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
  });

  const { data, isLoading, isFetching } = useEmployeeSalary({
    employeeId,
    month,
    year,
  });

  const { mutate: updateSalary, isPending } = useUpdateSalary();

  const salary = data?.data || null;

  // ============================================================
  // SET API DATA
  // ============================================================
  useEffect(() => {
    if (!salary) return;

    setFormData({
      paidLeaveDays: salary.paidLeaveDays ?? 0,
      monthlySalary: salary.monthlySalary ?? 0,

      adjustmentDetails: {
        specialPerks: salary.adjustmentDetails?.specialPerks ?? [],
        deductions: salary.adjustmentDetails?.deductions ?? [],

        // ALWAYS EMPTY FOR NEW ENTRY
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
  }, [salary]);
  // ============================================================
  // NORMAL FIELD CHANGE
  // ============================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ============================================================
  // GENERIC DETAIL CHANGE
  // ============================================================

  const handleDetailChange = (section, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  // ============================================================
  // ADJUSTMENT DETAIL CHANGE
  // ============================================================

  const handleAdjustmentDetailChange = (type, field, value) => {
    setFormData((prev) => ({
      ...prev,
      adjustmentDetails: {
        ...prev.adjustmentDetails,
        [type]: {
          ...prev.adjustmentDetails[type],
          [field]: value,
        },
      },
    }));
  };

  // ============================================================
  // PAID AMOUNT DETAIL CHANGE
  // ============================================================

  const handlePaidAmountDetailChange = (type, field, value) => {
    setFormData((prev) => ({
      ...prev,
      paidAmountDetails: {
        ...prev.paidAmountDetails,
        [type]: {
          ...prev.paidAmountDetails[type],
          [field]: value,
        },
      },
    }));
  };

  const formatAdjustmentHistory = (items = []) => {
    return items
      .filter((item) => Number(item.amount) > 0)
      .map((item) => Number(item.amount).toLocaleString("en-IN"))
      .join(" + ");
  };
  const previousSpecialPerks = formatAdjustmentHistory(
    formData.adjustmentDetails.specialPerks,
  );

  const previousDeductions = formatAdjustmentHistory(
    formData.adjustmentDetails.deductions,
  );
  const getTotalAdjustment = (items = []) => {
    return items.reduce((total, item) => total + (Number(item.amount) || 0), 0);
  };
  const totalSpecialPerks = getTotalAdjustment(
    formData.adjustmentDetails.specialPerks,
  );

  const totalDeductions = getTotalAdjustment(
    formData.adjustmentDetails.deductions,
  );

  const netAdjustment = totalSpecialPerks - totalDeductions;
  const getTotalAdvanceAmount = (items = []) => {
    return items.reduce((total, item) => total + (Number(item.amount) || 0), 0);
  };

  const previousAdvancePayments =
    formData.paidAmountDetails.advanceAmount || [];

  const totalAdvanceAmount = getTotalAdvanceAmount(previousAdvancePayments);
  // ============================================================
  // SUBMIT
  // ============================================================

  const handleSubmit = (e) => {
    e.preventDefault();

    // ============================================================
    // NEW ADJUSTMENT VALUES
    // ============================================================

    const newSpecialPerk = {
      label: formData.adjustmentDetails.newSpecialPerk.label?.trim() || "",

      amount: Number(formData.adjustmentDetails.newSpecialPerk.amount) || 0,

      comments:
        formData.adjustmentDetails.newSpecialPerk.comments?.trim() || "",
    };

    const newDeduction = {
      label: formData.adjustmentDetails.newDeduction.label?.trim() || "",

      amount: Number(formData.adjustmentDetails.newDeduction.amount) || 0,

      comments: formData.adjustmentDetails.newDeduction.comments?.trim() || "",
    };

    // ============================================================
    // KEEP PREVIOUS ADJUSTMENT HISTORY
    // ============================================================

    const specialPerks = [...(formData.adjustmentDetails.specialPerks || [])];

    const deductions = [...(formData.adjustmentDetails.deductions || [])];

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
    // PAID AMOUNT
    // ============================================================

    // ============================================================
    // ADVANCE PAYMENT
    // ============================================================

    const newAdvanceAmount = {
      label: formData.paidAmountDetails?.newAdvanceAmount?.label?.trim() || "",

      amount: Number(formData.paidAmountDetails?.newAdvanceAmount?.amount) || 0,

      comments:
        formData.paidAmountDetails?.newAdvanceAmount?.comments?.trim() || "",
    };

    // Keep previous advance payment history
    const advanceAmount = [
      ...(formData.paidAmountDetails?.advanceAmount || []),
    ];

    // Add new advance only when amount > 0
    if (newAdvanceAmount.amount > 0) {
      advanceAmount.push(newAdvanceAmount);
    }

    // ============================================================
    // TOTAL ADVANCE
    // ============================================================

    const totalAdvanceAmount = advanceAmount.reduce(
      (total, item) => total + (Number(item.amount) || 0),
      0,
    );

    // ============================================================
    // DEDUCTED PAID AMOUNT
    // ============================================================

    // ============================================================
    // FINAL PAID AMOUNT
    // ============================================================

    const deductedPaidAmount =
      Number(formData.paidAmountDetails?.deductedAmount?.amount) || 0;

    const paidAmount = advanceAmount - deductedPaidAmount;

    // ============================================================
    // PAYLOAD
    // ============================================================

    const payload = {
      month,
      year,

      paidLeaveDays: Number(formData.paidLeaveDays) || 0,

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
    };

    // ============================================================
    // UPDATE
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
            error?.response?.data?.message || "Failed to update salary",
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
      <form onSubmit={handleSubmit} className="space-y-6">
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
                name="paidLeaveDays"
                min="0"
                step="0.5"
                value={formData.paidLeaveDays}
                onChange={handleChange}
                placeholder=" "
                className="form-input"
              />

              <label className="form-label">Paid Leaves</label>
            </div>

            {/* FIXED SALARY */}

            <div className="form-group">
              <input
                type="number"
                name="monthlySalary"
                min="0"
                step="0.01"
                value={formData.monthlySalary}
                onChange={handleChange}
                placeholder=" "
                className="form-input"
              />

              <label className="form-label">Fixed Salary</label>
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
              {formData.adjustmentDetails.specialPerks?.length > 0 && (
                <div className="mb-4 rounded-lg border border-green-100 bg-green-50/60 px-4 py-3">
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-xs font-medium text-gray-500 whitespace-nowrap">
                      Previous Perks
                    </p>

                    <p className="text-sm font-semibold text-green-700 text-right">
                      {formData.adjustmentDetails.specialPerks
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
                    min="0"
                    step="0.01"
                    value={formData.adjustmentDetails.newSpecialPerk.amount}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        adjustmentDetails: {
                          ...prev.adjustmentDetails,
                          newSpecialPerk: {
                            ...prev.adjustmentDetails.newSpecialPerk,
                            amount: e.target.value,
                          },
                        },
                      }))
                    }
                    placeholder=" "
                    className="form-input"
                  />

                  <label className="form-label">New Perk ₹</label>
                </div>

                <div className="form-group">
                  <input
                    type="text"
                    value={formData.adjustmentDetails.newSpecialPerk.comments}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        adjustmentDetails: {
                          ...prev.adjustmentDetails,
                          newSpecialPerk: {
                            ...prev.adjustmentDetails.newSpecialPerk,
                            comments: e.target.value,
                          },
                        },
                      }))
                    }
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
              {formData.adjustmentDetails.deductions?.length > 0 && (
                <div className="mb-4 rounded-lg border border-red-100 bg-red-50/60 px-4 py-3">
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-xs font-medium text-gray-500 whitespace-nowrap">
                      Previous Deductions
                    </p>

                    <p className="text-sm font-semibold text-red-700 text-right">
                      {formData.adjustmentDetails.deductions
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
                    min="0"
                    step="0.01"
                    value={formData.adjustmentDetails.newDeduction.amount}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        adjustmentDetails: {
                          ...prev.adjustmentDetails,
                          newDeduction: {
                            ...prev.adjustmentDetails.newDeduction,
                            amount: e.target.value,
                          },
                        },
                      }))
                    }
                    placeholder=" "
                    className="form-input"
                  />

                  <label className="form-label">New Deduction ₹</label>
                </div>

                <div className="form-group">
                  <input
                    type="text"
                    value={formData.adjustmentDetails.newDeduction.comments}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        adjustmentDetails: {
                          ...prev.adjustmentDetails,
                          newDeduction: {
                            ...prev.adjustmentDetails.newDeduction,
                            comments: e.target.value,
                          },
                        },
                      }))
                    }
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
              {formData.paidAmountDetails.advanceAmount?.length > 0 ? (
                <div className="mb-4 rounded-lg border border-blue-100 bg-blue-50/60 px-4 py-3">
                  <p className="text-xs font-medium text-gray-500 mb-2">
                    Previous Advances
                  </p>

                  <div className="space-y-2">
                    {formData.paidAmountDetails.advanceAmount?.length > 0 && (
                      <div className="mb-4 rounded-lg border border-blue-100 bg-blue-50/60 px-4 py-3">
                        <div className="flex items-center justify-between gap-4">
                          <p className="text-xs font-medium text-gray-500 whitespace-nowrap">
                            Previous Advances
                          </p>

                          <p className="text-sm font-semibold text-blue-700 text-right">
                            {formData.paidAmountDetails.advanceAmount
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
                    min="0"
                    step="0.01"
                    value={formData.paidAmountDetails.newAdvanceAmount.amount}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        paidAmountDetails: {
                          ...prev.paidAmountDetails,
                          newAdvanceAmount: {
                            ...prev.paidAmountDetails.newAdvanceAmount,
                            amount: e.target.value,
                          },
                        },
                      }))
                    }
                    placeholder=" "
                    className="form-input"
                  />

                  <label className="form-label">New Advance ₹</label>
                </div>

                <div className="form-group">
                  <input
                    type="text"
                    value={formData.paidAmountDetails.newAdvanceAmount.comments}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        paidAmountDetails: {
                          ...prev.paidAmountDetails,
                          newAdvanceAmount: {
                            ...prev.paidAmountDetails.newAdvanceAmount,
                            comments: e.target.value,
                          },
                        },
                      }))
                    }
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

                {Number(formData.paidAmountDetails.deductedAmount.amount) >
                  0 && (
                  <span className="text-xs font-medium text-red-600">
                    ₹{" "}
                    {Number(
                      formData.paidAmountDetails.deductedAmount.amount,
                    ).toLocaleString("en-IN")}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="form-group">
                  <input
                    type="text"
                    value={formData.paidAmountDetails.deductedAmount.label}
                    onChange={(e) =>
                      handlePaidAmountDetailChange(
                        "deductedAmount",
                        "label",
                        e.target.value,
                      )
                    }
                    placeholder=" "
                    className="form-input"
                  />

                  <label className="form-label">Label</label>
                </div>

                <div className="form-group">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.paidAmountDetails.deductedAmount.amount}
                    onChange={(e) =>
                      handlePaidAmountDetailChange(
                        "deductedAmount",
                        "amount",
                        e.target.value,
                      )
                    }
                    placeholder=" "
                    className="form-input"
                  />

                  <label className="form-label">Deducted Amt ₹</label>
                </div>

                <div className="form-group">
                  <input
                    type="text"
                    value={formData.paidAmountDetails.deductedAmount.comments}
                    onChange={(e) =>
                      handlePaidAmountDetailChange(
                        "deductedAmount",
                        "comments",
                        e.target.value,
                      )
                    }
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
                name="previousDue"
                step="0.01"
                value={formData.previousDue}
                onChange={handleChange}
                placeholder=" "
                className="form-input"
              />

              <label className="form-label">Previous Due ₹</label>
            </div>
          </div>

          {/* COMMENTS */}

          <div className="form-group mt-4">
            <textarea
              name="comments"
              rows={3}
              value={formData.comments}
              onChange={handleChange}
              placeholder=" "
              className="form-input resize-none"
            />

            <label className="form-label">Comments</label>
          </div>
        </div>

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
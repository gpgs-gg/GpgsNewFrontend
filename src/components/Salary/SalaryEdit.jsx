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
    adjustedAmount: 0,
    adjustmentDetails: "",
    paidAmount: 0,
    paidAmountDetails: "",
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

  useEffect(() => {
    if (!salary) return;

    setFormData({
      paidLeaveDays: salary.paidLeaveDays ?? 0,
      monthlySalary: salary.monthlySalary ?? 0,

      adjustedAmount: salary.adjustedAmount ?? 0,
      adjustmentDetails: salary.adjustmentDetails ?? "",

      paidAmount: salary.paidAmount ?? 0,
      paidAmountDetails: salary.paidAmountDetails ?? "",

      previousDue: salary.previousDue ?? 0,

      comments: salary.comments ?? "",
    });
  }, [salary]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const payload = {
      month,
      year,

      paidLeaveDays: Number(formData.paidLeaveDays) || 0,

      monthlySalary: Number(formData.monthlySalary) || 0,

      adjustedAmount: Number(formData.adjustedAmount) || 0,

      adjustmentDetails: formData.adjustmentDetails?.trim() || "",

      paidAmount: Number(formData.paidAmount) || 0,

      paidAmountDetails: formData.paidAmountDetails?.trim() || "",

      previousDue: Number(formData.previousDue) || 0,

      comments: formData.comments?.trim() || "",
    };

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
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="bg-white rounded-xl border shadow-sm p-6">
          Loading salary details...
        </div>
      </div>
    );
  }

  // ============================================================
  // PAGE
  // ============================================================

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* HEADER */}

      <div className="bg-white rounded-xl border shadow-sm px-5 py-4 mb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate("/salary/all")}
              className="p-2 rounded-lg border border-gray-200 hover:bg-gray-100"
              title="Back"
            >
              <ArrowLeft size={20}/>
            </button>

            <div>
              <h1 className="text-xl font-semibold text-gray-800">
                Edit Salary
              </h1>

              <p className="text-sm text-gray-500 mt-1">
                {salary?.employeeName ||
                  salary?.employee?.employeeName ||
                  "Employee"}{" "}
                ({employeeId})
              </p>
            </div>
          </div>

          <div className="text-sm text-gray-500">
            {month}/{year}
          </div>
        </div>
      </div>

      {/* FORM */}

      <div className="bg-white rounded-xl border shadow-sm">
        <form onSubmit={handleSubmit}>
          <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* PAID LEAVES */}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Paid Leaves
              </label>

              <input
                type="number"
                name="paidLeaveDays"
                min="0"
                step="0.5"
                value={formData.paidLeaveDays}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
            </div>

            {/* FIXED SALARY */}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fixed Salary
              </label>

              <input
                type="number"
                name="monthlySalary"
                min="0"
                value={formData.monthlySalary}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
            </div>

            {/* PAYABLE */}
            {/* 
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Payable Salary
              </label>

              <input
                type="number"
                name="payableSalary"
                min="0"
                value={formData.payableSalary}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
            </div> */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Payable Salary
              </label>

              <input
                type="text"
                value={`₹ ${Number(salary?.payableSalary || 0).toFixed(2)}`}
                readOnly
                className="w-full border border-gray-200 bg-gray-100 text-gray-700 rounded-lg px-3 py-2 cursor-not-allowed"
              />

              <p className="text-xs text-gray-500 mt-1">
                Automatically calculated from attendance, paid leaves, salary
                and adjustments.
              </p>
            </div>
            {/* PAID */}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Paid Amount
              </label>

              <input
                type="number"
                name="paidAmount"
                min="0"
                value={formData.paidAmount}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
            </div>

            {/* ADJUSTMENT */}
            {/* 
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Adjustment
              </label>

              <input
                type="text"
                name="adjustmentDetails"
                value={formData.adjustmentDetails}
                onChange={handleChange}
                placeholder="e.g. Bonus, deduction, advance..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
            </div> */}

            {/* COMMENTS */}

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Comments
              </label>

              <textarea
                name="comments"
                rows={4}
                value={formData.comments}
                onChange={handleChange}
                placeholder="Enter comments..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 resize-none"
              />
            </div>
          </div>

          {/* FOOTER */}

          <div className="flex justify-end gap-3 px-5 py-4 border-t bg-gray-50 rounded-b-xl">
            <button
              type="button"
              onClick={() =>
                navigate(`/salary/all?month=${month}&year=${year}`)
              }
              disabled={isPending}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isPending}
              className="theme-btn"
            >
              {isPending ? "Updating..." : "Update Salary"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SalaryEdit;

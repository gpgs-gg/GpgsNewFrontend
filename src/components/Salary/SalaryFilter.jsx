import React, { useEffect, useState } from "react";

const SalaryFilter = ({ isOpen, onClose, onApply, handleReset }) => {
  const [status, setStatus] = useState("");
  const [salaryBasis, setSalaryBasis] = useState("");

  useEffect(() => {
    if (!isOpen) return;
  }, [isOpen]);

  if (!isOpen) return null;

  const handleApply = () => {
    const data = {
      status,
      salaryCalculationBasis: salaryBasis,
    };

    const labels = [];

    if (status) {
      labels.push({
        key: "status",
        label: `Status: ${status === "true" ? "Active" : "Inactive"}`,
      });
    }

    if (salaryBasis) {
      labels.push({
        key: "salaryCalculationBasis",
        label: `Basis: ${
          salaryBasis === "CALENDAR_DAYS" ? "Calendar Days" : "Working Days"
        }`,
      });
    }

    onApply(data, labels);
    onClose();
  };

  const handleClear = () => {
    setStatus("");
    setSalaryBasis("");
    handleReset();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-md rounded-xl bg-white shadow-xl">
        {/* HEADER */}

        <div className="flex items-center justify-between border-b px-5 py-4">
          <div>
            <h2 className="text-lg font-semibold">Salary Filters</h2>

            <p className="text-sm text-gray-500">
              Filter employee salary records
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-xl text-gray-400 hover:text-red-500"
          >
            ✕
          </button>
        </div>

        {/* BODY */}

        <div className="space-y-5 px-5 py-5">
          {/* STATUS */}

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Status
            </label>

            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2"
            >
              <option value="">All</option>

              <option value="true">Active</option>

              <option value="false">Inactive</option>
            </select>
          </div>

          {/* SALARY BASIS */}

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Salary Calculation Basis
            </label>

            <select
              value={salaryBasis}
              onChange={(e) => setSalaryBasis(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2"
            >
              <option value="">All</option>

              <option value="CALENDAR_DAYS">Calendar Days</option>

              <option value="WORKING_DAYS">Working Days</option>
            </select>
          </div>
        </div>

        {/* FOOTER */}

        <div className="flex justify-end gap-2 border-t px-5 py-4">
          <button
            type="button"
            onClick={handleClear}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-red-500"
          >
            Reset
          </button>

          <button
            type="button"
            onClick={handleApply}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
};

export default SalaryFilter;

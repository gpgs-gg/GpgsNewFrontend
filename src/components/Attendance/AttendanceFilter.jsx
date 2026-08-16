import React, { useEffect, useMemo } from "react";
import { X } from "lucide-react";
import Select from "react-select";
import { useForm, Controller } from "react-hook-form";
import { selectStyles } from "../../utils/selectStyles";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
const AttendanceFilter = ({
  isOpen,
  onClose,
  onApply,
  handleReset,
  resetTrigger,
  employees = [],
}) => {
  const { control, handleSubmit, reset } = useForm({
    defaultValues: {
      month: "",
      date: "",
      employeeId: null,
      status: null,
    },
  });

  // ======================================================
  // STATUS OPTIONS
  // ======================================================

  const statusOptions = useMemo(
    () => [
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
    ],
    [],
  );
  const employeeOptions = useMemo(
    () =>
      employees.map((employee) => ({
        value: employee._id,
        label: `${employee.employeeName} `,
        // label: `${employee.employeeName} (${employee.employeeId})`,
      })),
    [employees],
  );
  // ======================================================
  // SUBMIT FILTERS
  // ======================================================

  const onSubmit = (data) => {
    const filters = {
      month: data.month || "",
      date: data.date || "",
      status: data.status?.value || "",
      employeeId: data.employeeId?.value || "",
    };

    const labels = [
      data.month && {
        key: "month",
        label: `Month : ${data.month}`,
      },

      data.date && {
        key: "date",
        label: `Date : ${data.date}`,
      },

      data.status && {
        key: "status",
        label: `Status : ${data.status.label}`,
      },
      data.employeeId && {
        key: "employeeId",
        label: `Employee : ${data.employeeId.label}`,
      },
    ].filter(Boolean);

    onApply(filters, labels);

    onClose();
  };

  // ======================================================
  // RESET FORM WHEN RESET TRIGGER CHANGES
  // ======================================================

  useEffect(() => {
    reset({
      month: "",
      date: "",
      status: null,
      employeeId: null,
    });
  }, [resetTrigger, reset]);

  return (
    <>
      {/* BACKDROP */}

      {isOpen && (
        <div className="fixed inset-0 z-40 bg-black/20" onClick={onClose} />
      )}

      {/* FILTER DRAWER */}

      <div
        className={`fixed top-0 right-0 z-50 h-full w-96 bg-white shadow-xl transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* HEADER */}

        <div className="flex items-center justify-between border-b border-slate-600 bg-gradient-to-r from-slate-800 via-slate-700 to-slate-900 p-5 text-white">
          <h2 className="text-lg font-bold">Filters</h2>

          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 transition hover:bg-white/10"
          >
            <X size={20} />
          </button>
        </div>

        {/* FORM */}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 p-5">
          {/* ==================================================
    MONTH
================================================== */}

          <div>
            <label className="block text-sm font-medium mb-2">Month</label>

            <Controller
              name="month"
              control={control}
              render={({ field }) => (
                <div
                  className={`datepicker-group ${field.value ? "has-value" : ""}`}
                >
                  <DatePicker
                    selected={
                      field.value ? new Date(`${field.value}-01`) : null
                    }
                    onChange={(date) => {
                      if (date) {
                        const year = date.getFullYear();
                        const month = String(date.getMonth() + 1).padStart(
                          2,
                          "0",
                        );

                        field.onChange(`${year}-${month}`);
                      } else {
                        field.onChange("");
                      }
                    }}
                    dateFormat="MMM yyyy"
                    showMonthYearPicker
                    isClearable
                    placeholderText="Select Month"
                    className="custom-datepicker w-full"
                  />
                </div>
              )}
            />
          </div>

          {/* ==================================================
    DATE
================================================== */}

          <div>
            <label className="block text-sm font-medium mb-2">Date</label>

            <Controller
              name="date"
              control={control}
              render={({ field }) => (
                <div
                  className={`datepicker-group ${field.value ? "has-value" : ""}`}
                >
                  <DatePicker
                    selected={field.value ? new Date(field.value) : null}
                    onChange={(date) => {
                      if (date) {
                        const year = date.getFullYear();
                        const month = String(date.getMonth() + 1).padStart(
                          2,
                          "0",
                        );
                        const day = String(date.getDate()).padStart(2, "0");

                        field.onChange(`${year}-${month}-${day}`);
                      } else {
                        field.onChange("");
                      }
                    }}
                    dateFormat="dd MMM yyyy"
                    isClearable
                    placeholderText="Select Date"
                    className="custom-datepicker w-full"
                  />
                </div>
              )}
            />
          </div>
          {/* ==================================================
              STATUS
          ================================================== */}

          <Controller
            name="status"
            control={control}
            render={({ field }) => (
              <div className={`select-group ${field.value ? "has-value" : ""}`}>
                <label className="select-label">Status</label>

                <Select
                  options={statusOptions}
                  isSearchable
                  isClearable
                  placeholder="Status"
                  value={field.value}
                  onChange={(option) => field.onChange(option)}
                  styles={selectStyles}
                />
              </div>
            )}
          />
          <Controller
            name="employeeId"
            control={control}
            render={({ field }) => (
              <div className={`select-group ${field.value ? "has-value" : ""}`}>
                <label className="select-label">Employee</label>

                <Select
                  options={employeeOptions}
                  isSearchable
                  isClearable
                  placeholder="Select "
                  value={field.value}
                  onChange={(option) => field.onChange(option)}
                  styles={selectStyles}
                />
              </div>
            )}
          />
          {/* ==================================================
              ACTION BUTTONS
          ================================================== */}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => {
                reset({
                  month: "",
                  date: "",
                  status: null,
                  employeeId: null,
                });

                handleReset();
              }}
              className="w-full rounded-lg border border-gray-300 py-2 transition hover:bg-gray-50"
            >
              Reset
            </button>

            <button
              type="submit"
              className="w-full rounded-lg bg-gradient-to-r from-slate-800 via-slate-700 to-slate-900 py-2 text-white transition hover:opacity-90"
            >
              Apply Filters
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default AttendanceFilter;
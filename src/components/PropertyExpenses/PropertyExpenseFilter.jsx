import React, { useEffect, useMemo } from "react";
import { X } from "lucide-react";
import Select from "react-select";
import { Controller, useForm, useWatch } from "react-hook-form";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { selectStyles } from "../../utils/selectStyles";

const DEFAULT_EXPENSE_FILTERS = {
  expenseType: "",
  fromDate: null,
  toDate: null,
};

const PropertyExpenseFilter = ({
  isOpen,
  onClose,
  onApply,
  handleReset,
  initialFilters = {},
  apiData = [],
}) => {
  const { control, handleSubmit, reset } = useForm({
    defaultValues: DEFAULT_EXPENSE_FILTERS,
  });

  const fromDate = useWatch({ control, name: "fromDate" });
  const toDate = useWatch({ control, name: "toDate" });

  // Expense category dropdown options
  // Expense category dropdown options - all unique categories

  const expenseCategoryOptions = useMemo(() => {
    const categories = [
      ...new Set(
        apiData.map((expense) => expense.category?.trim()).filter(Boolean),
      ),
    ];
 
    // Include the currently selected category if it isn't in apiData.
    if (
      initialFilters.expenseType &&
      !categories.includes(initialFilters.expenseType)
    ) {
      categories.push(initialFilters.expenseType);
    }

    return categories
      .sort((a, b) => a.localeCompare(b))
      .map((category) => ({
        value: category,
        label: category,
      }));
  }, [apiData, initialFilters.expenseType]);
 //console.log(1111111111, expenseCategoryOptions);
  useEffect(() => {
    if (!isOpen) return;

    reset({
      expenseType: initialFilters.expenseType || "",
      fromDate: initialFilters.fromDate
        ? new Date(`${initialFilters.fromDate}T00:00:00`)
        : null,
      toDate: initialFilters.toDate
        ? new Date(`${initialFilters.toDate}T00:00:00`)
        : null,
    });
  }, [
    isOpen,
    initialFilters.expenseType,
    initialFilters.fromDate,
    initialFilters.toDate,
    reset,
  ]);

  const formatDateForFilter = (date) => {
    if (!date) return "";

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  const onSubmit = (data) => {
    onApply({
      expenseType: data.expenseType || "",
      fromDate: formatDateForFilter(data.fromDate),
      toDate: formatDateForFilter(data.toDate),
    });

    onClose();
  };

  const resetForm = () => {
    reset(DEFAULT_EXPENSE_FILTERS);
    handleReset();
  };

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />
      )}

      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-96 bg-white z-50 shadow-xl transition-transform duration-300 flex flex-col ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-5 text-white bg-linear-to-r from-slate-800 via-slate-700 to-slate-900">
          <h2 className="font-bold text-lg">Expense Filters</h2>

          <button type="button" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col flex-1 min-h-0 overflow-hidden"
        >
          <div className="flex-1 overflow-y-auto min-h-0 p-5 space-y-5">
            {/* Expense Category */}
            <Controller
              name="expenseType"
              control={control}
              render={({ field }) => (
                <div
                  className={`select-group ${field.value ? "has-value" : ""}`}
                >
                  <label className="select-label">Expense Category</label>

                  <Select
                    options={expenseCategoryOptions}
                    isSearchable
                    isClearable
                    placeholder=""
                    styles={selectStyles}
                    value={
                      expenseCategoryOptions.find(
                        (option) => option.value === field.value,
                      ) || null
                    }
                    onChange={(option) => field.onChange(option?.value || "")}
                  />
                </div>
              )}
            />

            {/* From Date */}
            <Controller
              name="fromDate"
              control={control}
              render={({ field }) => (
                <div
                  className={`datepicker-group ${
                    field.value ? "has-value" : ""
                  }`}
                >
                  <label className="datepicker-label">From Date</label>

                  <DatePicker
                    selected={field.value}
                    onChange={field.onChange}
                    isClearable
                    placeholderText="From Date"
                    dateFormat="dd MMM yyyy"
                    className="custom-datepicker"
                    maxDate={toDate || undefined}
                  />
                </div>
              )}
            />

            {/* To Date */}
            <Controller
              name="toDate"
              control={control}
              render={({ field }) => (
                <div
                  className={`datepicker-group ${
                    field.value ? "has-value" : ""
                  }`}
                >
                  <label className="datepicker-label">To Date</label>

                  <DatePicker
                    selected={field.value}
                    onChange={field.onChange}
                    isClearable
                    placeholderText="To Date"
                    dateFormat="dd MMM yyyy"
                    className="custom-datepicker"
                    minDate={fromDate || undefined}
                  />
                </div>
              )}
            />
          </div>

          {/* Sticky Footer */}
          <div className="shrink-0 bg-white border-t border-gray-200 p-5 shadow-[0_-4px_12px_rgba(0,0,0,0.06)]">
            <div className="flex gap-3">
              <button
                type="button"
                onClick={resetForm}
                className="w-full border border-gray-300 py-2 rounded-lg"
              >
                Reset
              </button>

              <button
                type="submit"
                className="w-full bg-linear-to-r from-slate-800 via-slate-700 to-slate-900 border-b border-slate-600 text-white py-2 rounded-lg"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </form>
      </div>
    </>
  );
};;

export default PropertyExpenseFilter;
import { useEffect } from "react";
import { X } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import CreatableSelect from "react-select/creatable";
import { selectStyles } from "../../utils/selectStyles";
import { useBatchOptions } from "../../components/Options/services";
const paymentModeOptions = [
  { value: "Cash", label: "Cash" },
  { value: "Bank", label: "Bank" },
  { value: "UPI", label: "UPI" },
];

const PropertyExpenseModal = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isSaving = false,
  categoryOptions = [],
}) => {
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      expenseCategory: "",
      expenseDate: new Date(),
      amount: "",
      paymentMode: "",
      comment: "",
    },
  });
  const expenseWorkLogs = initialData?.workLogs || [];
  useEffect(() => {
    if (!isOpen) return;

    reset({
      expenseCategory:
        initialData?.category || initialData?.expenseCategory || "",
      expenseDate: initialData?.expenseDate
        ? new Date(initialData.expenseDate)
        : new Date(),
      amount: initialData?.amount ?? "",
      paymentMode: initialData?.paymentMode || "",
      comment: initialData?.comment || "",
    });
  }, [isOpen, initialData, reset]);
  const { data: options = {} } = useBatchOptions([
    "propertyexpensecategory",
   
  ]);
  if (!isOpen) return null;
  const dummyCategoryOptions = [
    { value: "Electricity", label: "Electricity" },
    { value: "Plumbing", label: "Plumbing" },
    { value: "Maintenance", label: "Maintenance" },
    { value: "Cleaning", label: "Cleaning" },
    { value: "Repairs", label: "Repairs" },
    { value: "Furniture", label: "Furniture" },
    { value: "Internet", label: "Internet" },
    { value: "Water Bill", label: "Water Bill" },
    { value: "Painting", label: "Painting" },
    { value: "Other", label: "Other" },
  ];
 const expenseCategoryOptions = options.propertyexpensecategory || [];
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4">
      <div className="flex max-h-[95vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl">
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-gray-200 px-5 py-4">
          <div>
            <h2 className="text-xl font-semibold">
              {initialData ? "Edit Property Expense" : "Add Property Expense"}
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Enter the expense details below.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-red-500"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex min-h-[420px] flex-1 flex-col space-y-5 overflow-y-auto p-5"
        >
          <div className="grid grid-cols-1 gap-5 ">
            {/* Expense Category */}
            <Controller
              name="expenseCategory"
              control={control}
              rules={{
                required: "Expense category is required",
                validate: (value) =>
                  value?.trim() !== "" || "Expense category is required",
              }}
              render={({ field }) => {
                const options = categoryOptions.map((option) => {
                  if (typeof option === "string") {
                    return { value: option, label: option };
                  }

                  return {
                    value:
                      option.value ||
                      option.label ||
                      option.category ||
                      option.expenseCategory ||
                      "",
                    label:
                      option.label ||
                      option.category ||
                      option.expenseCategory ||
                      option.value ||
                      "",
                  };
                });

                const selectedOption =
                  options.find((option) => option.value === field.value) ||
                  (field.value
                    ? { value: field.value, label: field.value }
                    : null);

                return (
                  <div>
                    <div className="select-group has-value">
                      <label className="select-label required-label">
                        Expense Category
                      </label>

                      <CreatableSelect
                        value={selectedOption}
                        onChange={(option) =>
                          field.onChange(option?.value || "")
                        }
                        onBlur={field.onBlur}
                        options={expenseCategoryOptions}
                        isClearable
                        isSearchable
                        placeholder="Select or enter expense category"
                        formatCreateLabel={(inputValue) =>
                          `Create "${inputValue}"`
                        }
                        styles={selectStyles}
                      />
                    </div>

                    {errors.expenseCategory && (
                      <p className="mt-1 text-xs text-red-500">
                        {errors.expenseCategory.message}
                      </p>
                    )}
                  </div>
                );
              }}
            />

            {/* Expense Date */}
            <Controller
              name="expenseDate"
              control={control}
              rules={{ required: "Expense date is required" }}
              render={({ field }) => (
                <div>
                  <div
                    className={`datepicker-group ${
                      field.value ? "has-value" : ""
                    }`}
                  >
                    <label className="datepicker-label required-label">
                      Expense Date
                    </label>

                    <DatePicker
                      selected={field.value}
                      onChange={field.onChange}
                      dateFormat="dd MMM yyyy"
                      className="custom-datepicker"
                      placeholderText="Select expense date"
                      maxDate={new Date()}
                      isClearable
                    />
                  </div>

                  {errors.expenseDate && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.expenseDate.message}
                    </p>
                  )}
                </div>
              )}
            />

            {/* Amount */}
            <div>
              <div className="form-group">
                <input
                  {...register("amount", {
                    required: "Amount is required",
                    validate: (value) =>
                      (Number.isFinite(Number(value)) && Number(value) > 0) ||
                      "Amount must be greater than zero",
                  })}
                  type="number"
                  min="0.01"
                  step="0.01"
                  placeholder=" "
                  className={`form-input ${
                    errors.amount ? "border-red-500" : ""
                  }`}
                />

                <label className="form-label required-label">Amount (₹)</label>
              </div>

              {errors.amount && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.amount.message}
                </p>
              )}
            </div>

            {/* Payment Mode - Radio Buttons */}
            <Controller
              name="paymentMode"
              control={control}
              rules={{ required: "Payment mode is required" }}
              render={({ field }) => (
                <div>
                  <label className="mb-3 block text-sm font-medium text-gray-700">
                    Payment Mode <span className="text-red-500">*</span>
                  </label>

                  <div className="flex flex-wrap gap-3">
                    {paymentModeOptions.map((option) => (
                      <label
                        key={option.value}
                        className={`flex cursor-pointer items-center gap-2 rounded-lg border px-4 py-3 transition-colors ${
                          field.value === option.value
                            ? "border-green-600 bg-green-50 text-green-700"
                            : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        <input
                          type="radio"
                          name={field.name}
                          value={option.value}
                          checked={field.value === option.value}
                          onChange={() => field.onChange(option.value)}
                          onBlur={field.onBlur}
                          ref={field.ref}
                          className="h-4 w-4 accent-green-600"
                        />

                        <span className="text-sm font-medium">
                          {option.label}
                        </span>
                      </label>
                    ))}
                  </div>

                  {errors.paymentMode && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.paymentMode.message}
                    </p>
                  )}
                </div>
              )}
            />
            {/* Comment */}
            <div className="form-group">
              <textarea
                {...register("comment")}
                rows={3}
                placeholder=" "
                className="form-input resize-y"
              />

              <label className="form-label">Comment</label>
            </div>
          </div>
          {/* Work Log History - Edit Mode Only */}
          {/* {initialData?._id && (
            <div className="border rounded-lg bg-gray-50 p-4">
              <h3 className="font-semibold text-lg mb-2">Work Log History</h3>

              <div className="max-h-48 overflow-y-auto">
                {expenseWorkLogs.length > 0 ? (
                  expenseWorkLogs
                    .slice()
                    .reverse()
                    .map((log) => (
                      <div
                        key={log._id}
                        className="border-b border-gray-200 py-3 last:border-b-0"
                      >
                        <small className="text-gray-500">
                          {log.createdBy || "System"} • {log.createdAt || ""}
                        </small>

                        <p className="whitespace-pre-line text-sm mt-1">
                          {log.message}
                        </p>
                      </div>
                    ))
                ) : (
                  <p className="text-gray-400 text-center py-6">
                    No Work Logs Available
                  </p>
                )}
              </div>
            </div>
          )} */}
          {/* Footer */}
          <div className="mt-auto flex shrink-0 justify-end gap-3 border-t border-gray-200 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="rounded-lg border border-gray-300 px-5 py-2 font-medium hover:bg-gray-100 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSaving}
              className="theme-btn rounded-lg px-5 py-2 text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSaving
                ? "Processing..."
                : initialData
                  ? "Update Expense"
                  : "Save Expense"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PropertyExpenseModal;
import { useEffect } from "react";
import { X } from "lucide-react";
import Select from "react-select";
import { useForm, Controller } from "react-hook-form";
import { selectStyles } from "../../utils/selectStyles";
import { useBatchOptions } from "../Options/services";
const EmployeeFilter = ({
  isOpen,
  onClose,
  onApply,
  handleReset,
  resetTrigger,
  initialFilters = {},
  employees = [],
}) => {
  const { control, handleSubmit, reset } = useForm({
    defaultValues: {
      departmentId: null,
      teamCodeId: null,
      statusId: null,
    },
  });
  const { data: options = {} } = useBatchOptions([
    "department",
    "activeinactivestatus",
    "teamcode",
  ]);

  const departmentOptions = options.department || [];
  const statusOptions = options.activeinactivestatus || [];
  const teamCodeOptions = options.teamcode || [];
  // ======================================================
  // DEPARTMENT OPTIONS
  // ======================================================

  // ======================================================
  // SUBMIT
  // ======================================================

  const onSubmit = (data) => {
    const filters = {
      departmentId: data.departmentId?.value || "",
      teamCodeId: data.teamCodeId?.value || "",
      statusId: data.statusId?.value || "",
    };

    const labels = [
      data.departmentId && {
        key: "departmentId",
        label: `Department : ${data.departmentId.label}`,
      },

      data.teamCodeId && {
        key: "teamCodeId",
        label: `Team : ${data.teamCodeId.label}`,
      },

      data.statusId && {
        key: "statusId",
        label: `Status : ${data.statusId.label}`,
      },
    ].filter(Boolean);

    onApply(filters, labels);
    onClose();
  };

  // ======================================================
  // RESTORE SELECTED FILTERS
  // ======================================================

  useEffect(() => {
    if (!isOpen) return;

    const selectedDepartment =
      departmentOptions.find(
        (option) => option.value === initialFilters.departmentId,
      ) || null;

    const selectedStatus =
      statusOptions.find(
        (option) => option.value === initialFilters.statusId,
      ) || null;

    reset({
      departmentId: selectedDepartment,
      teamCodeId: null,
      statusId: selectedStatus,
    });
  }, [
    isOpen,
    initialFilters.departmentId,
    initialFilters.statusId,
    departmentOptions,
    statusOptions,
    reset,
  ]);
  // ======================================================
  // RESET TRIGGER
  // ======================================================

  useEffect(() => {
    if (!resetTrigger) return;

    reset({
      departmentId: null,
      teamCodeId: null,
      statusId: null,
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
          {/* DEPARTMENT */}

          <Controller
            name="departmentId"
            control={control}
            render={({ field }) => (
              <div className={`select-group ${field.value ? "has-value" : ""}`}>
                <label className="select-label">Department</label>

                <Select
                  options={departmentOptions}
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

          {/* TEAM */}

          {/* <Controller
            name="teamCodeId"
            control={control}
            render={({ field }) => (
              <div className={`select-group ${field.value ? "has-value" : ""}`}>
                <label className="select-label">Team</label>

                <Select
                  options={teamCodeOptions}
                  isSearchable
                  isClearable
                  placeholder="Select "
                  value={field.value}
                  onChange={(option) => field.onChange(option)}
                  styles={selectStyles}
                />
              </div>
            )}
          /> */}

          {/* STATUS */}

          <Controller
            name="statusId"
            control={control}
            render={({ field }) => (
              <div className={`select-group ${field.value ? "has-value" : ""}`}>
                <label className="select-label">Status</label>

                <Select
                  options={statusOptions}
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

          {/* BUTTONS */}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => {
                reset({
                  departmentId: null,
                  teamCodeId: null,
                  statusId: null,
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

export default EmployeeFilter;
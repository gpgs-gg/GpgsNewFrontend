import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import Select from "react-select";
import { X } from "lucide-react";
import { selectStyles } from "../../utils/selectStyles";
import { getPropertyDropdown } from "../properties/services/index";
import { AsyncPaginate } from "react-select-async-paginate";
import { useBatchOptions } from "../Options/services";
const FnfFilter = ({
  isOpen,
  onClose,
  onApply,
  handleReset,
  resetTrigger,
  initialFilters = {},
}) => {
  const defaultValues = {
    propertyId: null,
    fnfStatus: "",
    stayType: "",
    hasCvd: false,
  };

  const { control, handleSubmit, reset } = useForm({
    defaultValues,
  });
  const { data: options = {} } = useBatchOptions(["fnfStatus"]);

  const fnfStatusOptions = options.fnfstatus || [];

  // ===========================
  // Property Options
  // ===========================
  const loadPropertyOptions = async (search, loadedOptions, { page }) => {
    const res = await getPropertyDropdown({
      page,
      limit: 10,
      search,
    });

    return {
      options: res.data.map((item) => ({
        value: item._id,
        label: item.propertyCode,
      })),
      hasMore: res.hasMore,
      additional: {
        page: page + 1,
      },
    };
  };

  // ===========================
  // FNF Status Options
  // ===========================

  // const fnfStatusOptions = [
  //   { value: "HANDOVER_DONE", label: "Handover Done" },
  //   { value: "F_F_DETAILS_SENT", label: "F & F Details Sent" },
  //   { value: "BANK_DETAILS_RECEIVED", label: "Bank Details Received" },
  //   { value: "F_F_CLOSED", label: "F & F Closed" },
  // ];

  // ===========================
  // Stay Type Options
  // ===========================
  const stayTypeOptions = [
    {
      value: "P. Booked",
      label: "P. Booked",
    },
    {
      value: "T. Booked",
      label: "T. Booked",
    },
  ];

  // ===========================
  // Submit
  // ===========================
  const onSubmit = (data) => {
    const filters = {
      propertyId: data.propertyId?.value || "",
      propertyCode: data.propertyId?.label || "",
      fnfStatus: data.fnfStatus || "",
      stayType: data.stayType || "",
      hasCvd: data.hasCvd || false,
    };

    onApply(filters);
    onClose();
  };

  // ===========================
  // Reset Form When Open
  // ===========================
  useEffect(() => {
    if (!isOpen) return;

    reset({
      propertyId: initialFilters.propertyId
        ? {
            value: initialFilters.propertyId,
            label: initialFilters.propertyCode || initialFilters.propertyId,
          }
        : null,

      fnfStatus: initialFilters.fnfStatus || "",
      stayType: initialFilters.stayType || "",
      hasCvd: initialFilters.hasCvd || false,
    });
  }, [isOpen, initialFilters, reset, resetTrigger]);

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />
      )}

      <div
        className={`fixed top-0 right-0 h-full w-96 bg-white z-50 shadow-xl transition-transform duration-300 flex flex-col ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-5 text-white bg-linear-to-r from-slate-800 via-slate-700 to-slate-900 border-b border-slate-600">
          <h2 className="font-bold text-lg">Filters</h2>

          <button type="button" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form
          className="flex flex-col h-[calc(100%-72px)]"
          id="fnf-filter-form"
          onSubmit={handleSubmit(onSubmit)}
        >
          <div className="flex-1 overflow-y-auto p-5 space-y-5">
            {/* CVD- Client Vacating Date */}
            <Controller
              name="hasCvd"
              control={control}
              render={({ field }) => (
                <div className="flex items-center justify-between rounded-lg border border-gray-400 bg-white p-3 shadow-sm">
                  <div>
                    <label className="text-md font-medium text-gray-900">
                      CVD
                    </label>
                  </div>

                  <button
                    type="button"
                    onClick={() => field.onChange(!field.value)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 ${
                      field.value ? "bg-blue-600" : "bg-gray-300"
                    }`}
                  >
                    <span
                      className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform duration-300 ${
                        field.value ? "translate-x-5" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
              )}
            />
            {/* ===========================
                Property Code
            =========================== */}
            <Controller
              name="propertyId"
              control={control}
              render={({ field }) => (
                <div
                  className={`select-group ${field.value ? "has-value" : ""}`}
                >
                  <label className="select-label">Property Code</label>

                  <AsyncPaginate
                    additional={{ page: 1 }}
                    debounceTimeout={500}
                    loadOptions={loadPropertyOptions}
                    isClearable
                    placeholder=""
                    styles={selectStyles}
                    value={field.value}
                    onChange={(selectedOption) =>
                      field.onChange(selectedOption)
                    }
                  />
                </div>
              )}
            />

            {/* ===========================
                FNF Status
            =========================== */}
            <Controller
              name="fnfStatus"
              control={control}
              render={({ field }) => (
                <div
                  className={`select-group ${field.value ? "has-value" : ""}`}
                >
                  <label className="select-label">FNF Status</label>

                  <Select
                    options={fnfStatusOptions}
                    isClearable
                    placeholder=""
                    styles={selectStyles}
                    value={
                      fnfStatusOptions.find(
                        (option) => option.value === field.value,
                      ) || null
                    }
                    onChange={(selected) =>
                      field.onChange(selected?.value || "")
                    }
                  />
                </div>
              )}
            />

            {/* ===========================
                Stay Type
            =========================== */}
            <Controller
              name="stayType"
              control={control}
              render={({ field }) => (
                <div
                  className={`select-group ${field.value ? "has-value" : ""}`}
                >
                  <label className="select-label">Stay Type</label>

                  <Select
                    options={stayTypeOptions}
                    isClearable
                    placeholder=""
                    styles={selectStyles}
                    value={
                      stayTypeOptions.find(
                        (option) => option.value === field.value,
                      ) || null
                    }
                    onChange={(selected) =>
                      field.onChange(selected?.value || "")
                    }
                  />
                </div>
              )}
            />
          </div>

          {/* ===========================
              Buttons
          =========================== */}
          <div className="">
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={handleReset}
                className="w-full border border-gray-300 py-2 rounded-lg hover:bg-gray-100"
              >
                Reset
              </button>

              <button
                type="submit"
                className="w-full bg-linear-to-r from-slate-800 via-slate-700 to-slate-900 text-white py-2 rounded-lg"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </form>
      </div>
    </>
  );
};

export default FnfFilter;
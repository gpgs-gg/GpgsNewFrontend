import React, { useEffect } from "react";
import { X } from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import { selectStyles } from "../../utils/selectStyles";
import { AsyncPaginate } from "react-select-async-paginate";
import { getPropertyDropdown } from "../properties/services";

const RnrFilter = ({
  isOpen,
  onClose,
  onApply,
  handleReset,
  initialFilters = {},
}) => {
  const { control, handleSubmit, reset } = useForm({
    defaultValues: {
      propertyId: null,
    },
  });

  // ======================================================
  // PROPERTY DROPDOWN
  // Backend pagination + search
  // ======================================================

  const loadPropertyOptions = async (search, loadedOptions, { page }) => {
    try {
      const res = await getPropertyDropdown({
        page,
        limit: 10,
        search: search?.trim() || "",
      });

      return {
        options: (res?.data || []).map((item) => ({
          value: item._id,
          label: item.propertyCode,
        })),

        hasMore: Boolean(res?.hasMore),

        additional: {
          page: page + 1,
        },
      };
    } catch (error) {
      console.error("RNR Property Dropdown Error:", error);

      return {
        options: [],
        hasMore: false,
        additional: {
          page,
        },
      };
    }
  };

  // ======================================================
  // SUBMIT FILTER
  // ======================================================

  const onSubmit = (data) => {
    console.log("Selected Property:", data.propertyId);

    const filters = {
      propertyId: data.propertyId?.value || "",

      propertyCode: data.propertyId?.label || "",
    };

    const labels = data.propertyId
      ? [
          {
            key: "propertyCode",
            label: `Property : ${data.propertyId.label}`,
          },
        ]
      : [];

    onApply(filters, labels);

    onClose();
  };

  // ======================================================
  // LOAD EXISTING FILTER
  // ======================================================

  useEffect(() => {
    if (!isOpen) return;

    const selectedProperty =
      initialFilters.propertyId || initialFilters.propertyCode
        ? {
            value: initialFilters.propertyId || "",
            label: initialFilters.propertyCode || "",
          }
        : null;

    reset({
      propertyId: selectedProperty,
    });
  }, [isOpen, initialFilters.propertyId, initialFilters.propertyCode, reset]);

  // ======================================================
  // UI
  // ======================================================

  return (
    <>
      {/* BACKDROP */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />
      )}

      {/* DRAWER */}
      <div
        className={`fixed top-0 right-0 h-full w-96 bg-white z-50 shadow-xl transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* HEADER */}
        <div className="flex justify-between items-center p-5 text-white bg-linear-to-r from-slate-800 via-slate-700 to-slate-900 border-b border-slate-600">
          <h2 className="font-bold text-lg">Filters</h2>

          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 hover:bg-white/10"
          >
            <X size={20} />
          </button>
        </div>

        {/* FORM */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col h-[calc(100%-72px)]"
        >
          <div className="flex-1 overflow-y-auto p-5 space-y-5">
            <Controller
              name="propertyId"
              control={control}
              render={({ field }) => (
                <div
                  className={`select-group ${field.value ? "has-value" : ""}`}
                >
                  <label className="select-label">Property Code</label>

                  <AsyncPaginate
                    additional={{
                      page: 1,
                    }}
                    debounceTimeout={500}
                    isClearable
                    isSearchable
                    placeholder=""
                    loadOptions={loadPropertyOptions}
                    styles={selectStyles}
                    value={field.value}
                    onChange={(selectedOption) =>
                      field.onChange(selectedOption)
                    }
                  />
                </div>
              )}
            />
          </div>

          {/* ACTION BUTTONS */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleReset}
              className="w-full border border-gray-300 py-2 rounded-lg transition hover:bg-gray-50"
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
        </form>
      </div>
    </>
  );
};

export default RnrFilter;
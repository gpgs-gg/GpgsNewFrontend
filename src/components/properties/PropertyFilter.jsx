import React, { useEffect, useMemo } from "react";
import { X } from "lucide-react";
import Select from "react-select";
import { useForm, Controller } from "react-hook-form";
import { selectStyles } from "../../utils/selectStyles";
import { getPropertyDropdown, usePropertyDropdown } from "./services";
import { AsyncPaginate } from "react-select-async-paginate";

const PropertyFilter = ({
  isOpen,
  onClose,
  apiData = [],
  onApply,
  handleReset,
  resetTrigger,
}) => {
  const { data: dropdownData } = usePropertyDropdown({
    page: 1,
    limit: 10,
    search: "",
  });

  const locations = dropdownData?.locations || [];
  const bedCounts = dropdownData?.bedCounts || [];
  const statuses = dropdownData?.statuses || [];
  const { control, handleSubmit, reset } = useForm({
    defaultValues: {
      propertyId: null,
      propertyLocation: null,
      bedCount: null,
      status: "",
    },
  });

  const loadPropertyOptions = async (search, loadedOptions, { page }) => {
    const res = await getPropertyDropdown({ page, limit: 10, search });
    return {
      options: res.data.map((item) => ({
        value: item._id,
        label: item.propertyCode,
        location: item.propertyLocation,
        bedCount: item.bedCount,
      })),
      hasMore: res.hasMore,
      additional: { page: page + 1 },
    };
  };
  const locationOptions = useMemo(
    () =>
      locations.map((location) => ({
        value: location,
        label: location,
      })),
    [locations],
  );

  const bedCountOptions = useMemo(
    () =>
      bedCounts.map((count) => ({
        value: count,
        label: String(count),
      })),
    [bedCounts],
  );

  const statusOptions = useMemo(
    () =>
      statuses.map((status) => ({
        value: status,
        label: status,
      })),
    [statuses],
  );

  const onSubmit = (data) => {
    const filters = {
      propertyId: data.propertyId?.value || "",
      propertyLocation: data.propertyLocation?.value || "",
      bedCount: data.bedCount?.value || "",
      status: data.status?.value || "",
    };

    const labels = [
      data.propertyId && {
        key: "propertyId",
        label: `Property : ${data.propertyId.label}`,
      },
      data.propertyLocation && {
        key: "propertyLocation",
        label: `Location : ${data.propertyLocation.label}`,
      },
      data.bedCount && {
        key: "bedCount",
        label: `Beds : ${data.bedCount.label}`,
      },
      data.status && {
        key: "status",
        label: `Status : ${data.status.label}`,
      },
    ].filter(Boolean);

    onApply(filters, labels);

    onClose();
  };
  useEffect(() => {
    reset({
      propertyCode: null,
      propertyLocation: null,
      bedCount: null,
      status: null,
    });
  }, [resetTrigger, reset]);

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />
      )}

      <div
        className={`fixed top-0 right-0 h-full w-96 bg-white z-50 shadow-xl transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex justify-between items-center p-5 text-white bg-linear-to-r from-slate-800 via-slate-700 to-slate-900 border-b border-slate-600">
          <h2 className="font-bold text-lg">Filters</h2>

          <button onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-5 space-y-5">
          {/* Property Code */}
          <Controller
            name="propertyId"
            control={control}
            render={({ field }) => (
              <div className={`select-group ${field.value ? "has-value" : ""}`}>
                <label className="select-label">Property Code</label>

                <AsyncPaginate
                  additional={{
                    page: 1,
                  }}
                  debounceTimeout={500}
                  isClearable
                  placeholder=""
                  loadOptions={loadPropertyOptions}
                  styles={selectStyles}
                  value={field.value}
                  onChange={(selectedOption) => field.onChange(selectedOption)}
                />
              </div>
            )}
          />

          {/* Location */}
          <Controller
            name="propertyLocation"
            control={control}
            render={({ field }) => (
              <div className={`select-group ${field.value ? "has-value" : ""}`}>
                <label className="select-label">Location</label>

                <Select
                  options={locationOptions}
                  isSearchable
                  isClearable
                  placeholder="Location"
                  value={field.value}
                  onChange={(option) => field.onChange(option)}
                  styles={selectStyles}
                />
              </div>
            )}
          />

          {/* Bed Count */}
          <Controller
            name="bedCount"
            control={control}
            render={({ field }) => (
              <div className={`select-group ${field.value ? "has-value" : ""}`}>
                <label className="select-label">Bed Count</label>

                <Select
                  options={bedCountOptions}
                  isSearchable
                  isClearable
                  placeholder="Bed Count"
                  value={field.value}
                  onChange={(option) => field.onChange(option)}
                  styles={selectStyles}
                />
              </div>
            )}
          />

          {/* Status */}
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

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleReset}
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
        </form>
      </div>
    </>
  );
};

export default PropertyFilter;
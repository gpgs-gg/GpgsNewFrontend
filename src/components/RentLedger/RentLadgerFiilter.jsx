import React, { useEffect, useMemo } from "react";
import { X } from "lucide-react";
import Select from "react-select";
import { useForm, Controller } from "react-hook-form";
import { selectStyles } from "../../utils/selectStyles";

const RentLadgerFiilter= ({
  isOpen,
  onClose,
  apiData = [],
  onApply,
  handleReset,
  resetTrigger,
}) => {
  const {
    control,
    handleSubmit,
    reset,
  } = useForm({
    defaultValues: {
      propertyCode: "",
      propertyLocation: "",
      bedCount: "",
      status: "",
    },
  });
  const propertyCodeOptions = useMemo(() => {
    return [
      ...new Set(
        apiData?.map((item) => item?.propertyId?.propertyCode).filter(Boolean)
      ),
    ].map((item) => ({
      value: item,
      label: item,
    }));
  }, [apiData]);

  const locationOptions = useMemo(() => {
    return [
      ...new Set(
        apiData?.map((item) => item?.propertyId?.propertyLocation).filter(Boolean)
      ),
    ].map((item) => ({
      value: item,
      label: item,
    }));
  }, [apiData]);

  const bedCountOptions = useMemo(() => {
    return [
      ...new Set(
        apiData?.map((item) => item.bedCount).filter(Boolean)
      ),
    ]
      .sort((a, b) => a - b)
      .map((item) => ({
        value: item,
        label: String(item),
      }));
  }, [apiData]);

  const statusOptions = [
    { value: "Active", label: "Active" },
    { value: "Inactive", label: "Inactive" },
  ];

  const onSubmit = (data) => {
    console.log(2222222, data);
    
    onApply(data);
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
        <div
          className="fixed inset-0 bg-black/40 z-40"
          onClick={onClose}
        />
      )}

      <div
        className={`fixed top-0 right-0 h-full w-96 bg-white z-50 shadow-xl transition-transform duration-300 ${isOpen
          ? "translate-x-0"
          : "translate-x-full"
          }`}
      >
        <div className="flex justify-between items-center p-5 text-white bg-linear-to-r from-slate-800 via-slate-700 to-slate-900 border-b border-slate-600">
          <h2 className="font-bold text-lg">
            Filters
          </h2>

          <button onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="p-5 space-y-5"
        >
          {/* Property Code */}
          <Controller
            name="propertyCode"
            control={control}
            render={({ field }) => (
              <div
                className={`select-group ${field.value ? "has-value" : ""
                  }`}
              >
                <label className="select-label">
                  Property Code
                </label>

                <Select
                  {...field}
                  options={propertyCodeOptions}
                  isClearable
                  placeholder=""
                  value={
                    propertyCodeOptions.find(
                      (option) => option.value === field.value
                    ) || null
                  }
                  onChange={(selectedOption) =>
                    field.onChange(
                      selectedOption?.value || ""
                    )
                  }
                  styles={selectStyles}
                />
              </div>
            )}
          />

          {/* Location */}
          <Controller
            name="propertyLocation"
            control={control}
            render={({ field }) => (
              <div
                className={`select-group ${field.value ? "has-value" : ""
                  }`}
              >
                <label className="select-label">
                  Location
                </label>

                <Select
                  {...field}
                  options={locationOptions}
                  isClearable
                  placeholder=""
                  value={
                    locationOptions.find(
                      (option) => option.value === field.value
                    ) || null
                  }
                  onChange={(selectedOption) =>
                    field.onChange(
                      selectedOption?.value || ""
                    )
                  }
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
              <div
                className={`select-group ${field.value ? "has-value" : ""
                  }`}
              >
                <label className="select-label">
                  Bed Count
                </label>

                <Select
                  {...field}
                  options={bedCountOptions}
                  isClearable
                  placeholder=""
                  value={
                    bedCountOptions.find(
                      (option) =>
                        String(option.value) === String(field.value)
                    ) || null
                  }
                  onChange={(selectedOption) =>
                    field.onChange(
                      selectedOption?.value || ""
                    )
                  }
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
              <div
                className={`select-group ${field.value ? "has-value" : ""
                  }`}
              >
                <label className="select-label">
                  Status
                </label>

                <Select
                  {...field}
                  options={statusOptions}
                  isClearable
                  placeholder=""
                  value={
                    statusOptions.find(
                      (option) => option.value === field.value
                    ) || null
                  }
                  onChange={(selectedOption) =>
                    field.onChange(
                      selectedOption?.value || ""
                    )
                  }
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

export default RentLadgerFiilter;
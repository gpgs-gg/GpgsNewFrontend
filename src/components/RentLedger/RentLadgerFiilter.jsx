import React, { useEffect, useMemo } from "react";
import { X } from "lucide-react";
import Select from "react-select";
import { useForm, Controller } from "react-hook-form";
import { selectStyles } from "../../utils/selectStyles";
import { usePropertyDropdown } from "../../components/properties/services/index";
import { useRentHistoryData } from "./services/index";
const RentLadgerFiilter = ({
  isOpen,
  onClose,

  onApply,
  handleReset,
  resetTrigger,
}) => {
  const { control, handleSubmit, reset, watch, setValue } = useForm({
    defaultValues: {
      propertyCode: "",
      propertyId: "",
      clientId: "",
    },
  });

  const selectedProperty = watch("propertyId");

  const { data: properties } = usePropertyDropdown({
    page: 1,
    limit: 1000,
    search: "",
  });
  const { data: rentHistory } = useRentHistoryData({
    propertyId: selectedProperty,
  });
  const clientOptions = useMemo(() => {
    if (!rentHistory?.data) return [];

    const uniqueClients = new Map();

    rentHistory.data.forEach((item) => {
      if (item.clientId?._id) {
        uniqueClients.set(item.clientId._id, {
          value: item.clientId._id,
          label: item.clientId.fullName,
        });
      }
    });

    return Array.from(uniqueClients.values());
  }, [rentHistory]);
  const propertyOptions = useMemo(() => {
    return (
      properties?.data?.map((item) => ({
        value: item._id,
        label: item.propertyCode,
      })) || []
    );
  }, [properties]);
  const onSubmit = (data) => {
    console.log(2222222, data);

    onApply(data);
    onClose();
  };
  useEffect(() => {
    reset({
      propertyId: "",
      clientId: "",
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

                <Select
                  {...field}
                  options={propertyOptions}
                  isClearable
                  placeholder=""
                  value={
                    propertyOptions.find(
                      (option) => option.value === field.value,
                    ) || null
                  }
                  onChange={(option) => {
                    field.onChange(option?.value || "");
                    setValue("clientId", "");
                  }}
                  styles={selectStyles}
                />
              </div>
            )}
          />
          {/* client */}
          {/* Client */}
          <Controller
            name="clientId"
            control={control}
            render={({ field }) => (
              <div className={`select-group ${field.value ? "has-value" : ""}`}>
                <label className="select-label">Client</label>

                <Select
                  {...field}
                  options={clientOptions}
                  isClearable
                  // isDisabled={!selectedProperty}
                  placeholder=""
                  styles={selectStyles}
                  value={
                    clientOptions.find(
                      (option) => option.value === field.value,
                    ) || null
                  }
                  onChange={(option) => field.onChange(option?.value || "")}
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
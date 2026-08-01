import React, { useEffect, useMemo } from "react";
import { X } from "lucide-react";
import Select from "react-select";
import { Controller, useForm } from "react-hook-form";
import { selectStyles } from "../../utils/selectStyles";
import { AsyncPaginate } from "react-select-async-paginate";
import { getPropertyDropdown } from "../properties/services";
const ClientsFilter = ({
  isOpen,
  onClose,
  apiData = [],
  onApply,
  handleReset,
  resetTrigger,
}) => {
  const { control, handleSubmit, reset } = useForm({
    defaultValues: {
      propertyId: "",
      propertyLocation: "",
      roomNo: "",
      bedNo: "",
      stayType: "",
      loginEnabled: "",
      clientStatus: "",
    },
  });
  // ===============================
  // PROPERTY OPTIONS
  // ===============================
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

  // ===============================
  // LOCATION OPTIONS
  // ===============================

  const locationOptions = useMemo(() => {
    return [
      ...new Set(
        apiData?.map((x) => x.propertyId?.propertyLocation).filter(Boolean),
      ),
    ].map((item) => ({
      value: item,
      label: item,
    }));
  }, [apiData]);

  // ===============================
  // ROOM OPTIONS
  // ===============================

  const roomOptions = useMemo(() => {
    return [...new Set(apiData?.map((x) => x.bedId?.roomNo).filter(Boolean))]
      .sort()
      .map((item) => ({
        value: item,
        label: item,
      }));
  }, [apiData]);

  // ===============================
  // BED OPTIONS
  // ===============================

  const bedOptions = useMemo(() => {
    return [...new Set(apiData?.map((x) => x.bedId?.bedNo).filter(Boolean))]
      .sort()
      .map((item) => ({
        value: item,
        label: item,
      }));
  }, [apiData]);

  // ===============================
  // STAY TYPE
  // ===============================

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

  // ===============================
  // LOGIN ENABLED
  // ===============================

  const loginOptions = [
    {
      value: true,
      label: "Enabled",
    },
    {
      value: false,
      label: "Disabled",
    },
  ];

  // ===============================
  // CLIENT STATUS
  // ===============================

  const clientStatusOptions = [
    { value: "Active", label: "Active" },
    { value: "Notice", label: "Notice" },
    { value: "Vacated", label: "Vacated" },
    { value: "Cancelled", label: "Cancelled" },
  ];

  const onSubmit = (data) => {
    const filters = {
      ...data,
      propertyId: data.propertyId?.value || "",
      clientStatus: data.clientStatus,
    };

    const labels = [
      data.propertyId && {
        key: "propertyId",
        title: "Property",
        value: data.propertyId.label,
      },

      data.propertyLocation && {
        key: "propertyLocation",
        title: "Location",
        value: data.propertyLocation,
      },

      data.roomNo && {
        key: "roomNo",
        title: "Room",
        value: data.roomNo,
      },

      data.bedNo && {
        key: "bedNo",
        title: "Bed",
        value: data.bedNo,
      },

      data.stayType && {
        key: "stayType",
        title: "Stay Type",
        value: data.stayType,
      },

      data.loginEnabled !== "" && {
        key: "loginEnabled",
        title: "Login",
        value: data.loginEnabled ? "Enabled" : "Disabled",
      },

      data.clientStatus && {
        key: "clientStatus",
        title: "Status",
        value: data.clientStatus,
      },
    ].filter(Boolean);

    onApply(filters, labels);

    onClose();
  };

  useEffect(() => {
    reset({
      propertyId: null,
      propertyLocation: "",
      roomNo: "",
      bedNo: "",
      stayType: "",
      loginEnabled: "",
      clientStatus: "",
    });
  }, [resetTrigger, reset]);
  {
    /* ================= Property ================= */
  }
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
        {/* Header */}
        <div className="flex justify-between items-center p-5 text-white bg-linear-to-r from-slate-800 via-slate-700 to-slate-900">
          <h2 className="font-bold text-lg">Client Filters</h2>

          <button onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Body */}
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
                    additional={{ page: 1 }}
                    debounceTimeout={500}
                    loadOptions={loadPropertyOptions}
                    value={field.value}
                    isClearable
                    placeholder=""
                    styles={selectStyles}
                    onChange={(option) => field.onChange(option)}
                  />
                </div>
              )}
            />

            {/* ================= Property Location ================= */}

            <Controller
              name="propertyLocation"
              control={control}
              render={({ field }) => (
                <div
                  className={`select-group ${field.value ? "has-value" : ""}`}
                >
                  <label className="select-label">Property Location</label>

                  <Select
                    {...field}
                    options={locationOptions}
                    isClearable
                    placeholder=""
                    styles={selectStyles}
                    value={
                      locationOptions.find(
                        (option) => option.value === field.value,
                      ) || null
                    }
                    onChange={(selectedOption) =>
                      field.onChange(selectedOption?.value || "")
                    }
                  />
                </div>
              )}
            />

            {/* ================= Room No ================= */}

            <Controller
              name="roomNo"
              control={control}
              render={({ field }) => (
                <div
                  className={`select-group ${field.value ? "has-value" : ""}`}
                >
                  <label className="select-label">Room No</label>

                  <Select
                    {...field}
                    options={roomOptions}
                    isClearable
                    placeholder=""
                    styles={selectStyles}
                    value={
                      roomOptions.find(
                        (option) => option.value === field.value,
                      ) || null
                    }
                    onChange={(selectedOption) =>
                      field.onChange(selectedOption?.value || "")
                    }
                  />
                </div>
              )}
            />

            {/* ================= Bed No ================= */}

            <Controller
              name="bedNo"
              control={control}
              render={({ field }) => (
                <div
                  className={`select-group ${field.value ? "has-value" : ""}`}
                >
                  <label className="select-label">Bed No</label>

                  <Select
                    {...field}
                    options={bedOptions}
                    isClearable
                    placeholder=""
                    styles={selectStyles}
                    value={
                      bedOptions.find(
                        (option) => option.value === field.value,
                      ) || null
                    }
                    onChange={(selectedOption) =>
                      field.onChange(selectedOption?.value || "")
                    }
                  />
                </div>
              )}
            />

            {/* ================= Stay Type ================= */}

            <Controller
              name="stayType"
              control={control}
              render={({ field }) => (
                <div
                  className={`select-group ${field.value ? "has-value" : ""}`}
                >
                  <label className="select-label">Stay Type</label>

                  <Select
                    {...field}
                    options={stayTypeOptions}
                    isClearable
                    placeholder=""
                    styles={selectStyles}
                    value={
                      stayTypeOptions.find(
                        (option) => option.value === field.value,
                      ) || null
                    }
                    onChange={(selectedOption) =>
                      field.onChange(selectedOption?.value || "")
                    }
                  />
                </div>
              )}
            />

            {/* ================= Login Enabled ================= */}

            <Controller
              name="loginEnabled"
              control={control}
              render={({ field }) => (
                <div
                  className={`select-group ${field.value !== "" ? "has-value" : ""}`}
                >
                  <label className="select-label">Login Enabled</label>

                  <Select
                    options={loginOptions}
                    isClearable
                    placeholder=""
                    styles={selectStyles}
                    value={
                      loginOptions.find(
                        (option) => option.value === field.value,
                      ) || null
                    }
                    onChange={(selectedOption) =>
                      field.onChange(selectedOption ? selectedOption.value : "")
                    }
                  />
                </div>
              )}
            />

            {/* ================= Client Status ================= */}

            <Controller
              name="clientStatus"
              control={control}
              render={({ field }) => (
                <div
                  className={`select-group ${field.value ? "has-value" : ""}`}
                >
                  <label className="select-label">Client Status</label>

                  <Select
                    {...field}
                    options={clientStatusOptions}
                    isClearable
                    placeholder=""
                    styles={selectStyles}
                    value={
                      clientStatusOptions.find(
                        (option) => option.value === field.value,
                      ) || null
                    }
                    onChange={(selectedOption) =>
                      field.onChange(selectedOption?.value || "")
                    }
                  />
                </div>
              )}
            />
          </div>
          {/* ================= Sticky Footer ================= */}

          <div className="sticky bottom-0 bg-white pt-4 border-t border-gray-200 flex gap-3">
            <button
              type="button"
              onClick={() => {
                reset({
                  propertyId: "",
                  propertyLocation: "",
                  roomNo: "",
                  bedNo: "",
                  stayType: "",
                  loginEnabled: "",
                  clientStatus: "",
                });

                handleReset();
              }}
              className="w-full border border-gray-300 py-2.5 rounded-lg font-medium hover:bg-gray-100 transition"
            >
              Reset
            </button>

            <button
              type="submit"
              className="w-full bg-linear-to-r from-slate-800 via-slate-700 to-slate-900 text-white py-2.5 rounded-lg font-medium hover:opacity-90 transition"
            >
              Apply Filters
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default ClientsFilter;
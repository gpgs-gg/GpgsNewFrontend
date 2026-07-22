import { useEffect, useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import Select from "react-select";
import { X } from "lucide-react";
import { selectStyles } from "../../utils/selectStyles";
import { getPropertyDropdown } from "../properties/services/index";
import { AsyncPaginate } from "react-select-async-paginate";
const AvailableBedsFilter = ({
  isOpen,
  onClose,
  apiData = [],
  onApply,
  handleReset,
  resetTrigger,
}) => {
  const defaultValues = {
    propertyId: null,
    propertyLocation: "",
    roomNo: "",
    bedNo: "",
    sharingType: "",
    acRoom: "",
    bathAttached: "",

    availableFrom: "",
    redFlag: "",

    monthlyRentMin: "",
    monthlyRentMax: "",

    depositAmountMin: "",
    depositAmountMax: "",

    clientName: "",
    hasCvd: false,
    sortByRent:false,
  };

  const { control, handleSubmit, reset } = useForm({
    defaultValues,
  });

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
  // Location Options
  // ===========================
  const locationOptions = useMemo(() => {
    return [
      ...new Set(
        apiData
          .map((item) => item?.propertyId?.propertyLocation)
          .filter(Boolean),
      ),
    ].map((item) => ({
      value: item,
      label: item,
    }));
  }, [apiData]);

  // ===========================
  // Room Options
  // ===========================
  const roomOptions = useMemo(() => {
    return [...new Set(apiData.map((i) => i.roomNo).filter(Boolean))]
      .sort()
      .map((room) => ({
        value: room,
        label: room,
      }));
  }, [apiData]);

  // ===========================
  // Bed Options
  // ===========================
  const bedOptions = useMemo(() => {
    return [...new Set(apiData.map((i) => i.bedNo).filter(Boolean))]
      .sort()
      .map((bed) => ({
        value: bed,
        label: bed,
      }));
  }, [apiData]);

  // ===========================
  // Sharing Options
  // ===========================
  const sharingTypeOptions = [
    {
      value: "Single",
      label: "Single",
    },
    {
      value: "Double",
      label: "Double",
    },
    {
      value: "Triple",
      label: "Triple",
    },
    {
      value: "Four Sharing",
      label: "Four Sharing",
    },
  ];

  // ===========================
  // AC Room
  // ===========================
  const acRoomOptions = [
    {
      value: "AC",
      label: "AC",
    },
    {
      value: "Non AC",
      label: "Non AC",
    },
  ];
  // ===========================
  // Bath Attached
  // ===========================
  const bathAttachedOptions = [
    {
      value: "Yes",
      label: "Yes",
    },
    {
      value: "No",
      label: "No",
    },
  ];

  // ===========================
  // Available From
  // ===========================
  const availableFromOptions = [
    {
      value: "Immediate Available",
      label: "Immediate Available",
    },
    {
      value: "CVD",
      label: "After CVD",
    },
  ];

  // ===========================
  // Red Flag
  // ===========================
  const redFlagOptions = [
    {
      value: "Yes",
      label: "Red Flag",
    },
    {
      value: "No",
      label: "Normal",
    },
  ];

  const onSubmit = (data) => {
    const filters = {
      ...data,
      propertyId: data.propertyId?.value || "",
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
      data.hasCvd && {
        key: "hasCvd",
        title: "CVD",
        value: "Yes",
      },
      data.sortByRent && {
        key: "sortByRent",
        title: "Rent",
        value: "Low → High",
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

      data.sharingType && {
        key: "sharingType",
        title: "Sharing",
        value: data.sharingType,
      },

      data.acRoom && {
        key: "acRoom",
        title: "AC",
        value: data.acRoom,
      },

      data.bathAttached && {
        key: "bathAttached",
        title: "Bath",
        value: data.bathAttached,
      },

      data.availableFrom && {
        key: "availableFrom",
        title: "Available",
        value: data.availableFrom,
      },

      data.redFlag && {
        key: "redFlag",
        title: "Red Flag",
        value: data.redFlag === "Yes" ? "Yes" : "No",
      },

      data.monthlyRentMin && {
        key: "monthlyRentMin",
        title: "Rent ≥",
        value: data.monthlyRentMin,
      },

      data.monthlyRentMax && {
        key: "monthlyRentMax",
        title: "Rent ≤",
        value: data.monthlyRentMax,
      },

      data.depositAmountMin && {
        key: "depositAmountMin",
        title: "Deposit ≥",
        value: data.depositAmountMin,
      },

      data.depositAmountMax && {
        key: "depositAmountMax",
        title: "Deposit ≤",
        value: data.depositAmountMax,
      },

      data.clientName && {
        key: "clientName",
        title: "Client",
        value: data.clientName,
      },
    ].filter(Boolean);

    onApply(filters, labels);

    onClose();
  };

  useEffect(() => {
    reset(defaultValues);
  }, [resetTrigger, reset]);
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

          <button onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form
          className="flex-1 overflow-y-auto  space-y-5"
          id="available-bed-filter-form"
          onSubmit={handleSubmit(onSubmit)}
        >
          <div className="flex-1 overflow-y-auto p-5 space-y-5 ">
            {/* Property Code */}
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

            {/* Property Location */}
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
                      locationOptions.find((o) => o.value === field.value) ||
                      null
                    }
                    onChange={(selected) =>
                      field.onChange(selected?.value || "")
                    }
                  />
                </div>
              )}
            />
         
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
            {/* Rent Sorting */}
            <Controller
              name="sortByRent"
              control={control}
              render={({ field }) => (
                <div className="flex items-center justify-between rounded-lg border border-gray-400 bg-white p-3  shadow-sm">
                  <div>
                    <label className="text-md font-medium text-gray-900">
                      Rent
                    </label>
                  </div>

                  <button
                    type="button"
                    onClick={() => field.onChange(!field.value)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 ${
                      field.value ? "bg-green-600" : "bg-gray-300"
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
           
          
            {/* Room No */}
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
                      roomOptions.find((o) => o.value === field.value) || null
                    }
                    onChange={(selected) =>
                      field.onChange(selected?.value || "")
                    }
                  />
                </div>
              )}
            />

            {/* Bed No */}
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
                      bedOptions.find((o) => o.value === field.value) || null
                    }
                    onChange={(selected) =>
                      field.onChange(selected?.value || "")
                    }
                  />
                </div>
              )}
            />

            {/* Sharing Type */}
            <Controller
              name="sharingType"
              control={control}
              render={({ field }) => (
                <div
                  className={`select-group ${field.value ? "has-value" : ""}`}
                >
                  <label className="select-label">Sharing Type</label>

                  <Select
                    {...field}
                    options={sharingTypeOptions}
                    isClearable
                    placeholder=""
                    styles={selectStyles}
                    value={
                      sharingTypeOptions.find((o) => o.value === field.value) ||
                      null
                    }
                    onChange={(selected) =>
                      field.onChange(selected?.value || "")
                    }
                  />
                </div>
              )}
            />

            {/* AC Room */}
            <Controller
              name="acRoom"
              control={control}
              render={({ field }) => (
                <div
                  className={`select-group ${field.value ? "has-value" : ""}`}
                >
                  <label className="select-label">AC Room</label>

                  <Select
                    {...field}
                    options={acRoomOptions}
                    isClearable
                    placeholder=""
                    styles={selectStyles}
                    value={
                      acRoomOptions.find((o) => o.value === field.value) || null
                    }
                    onChange={(selected) =>
                      field.onChange(selected?.value || "")
                    }
                  />
                </div>
              )}
            />

            {/* Bath Attached */}
            <Controller
              name="bathAttached"
              control={control}
              render={({ field }) => (
                <div
                  className={`select-group ${field.value ? "has-value" : ""}`}
                >
                  <label className="select-label">Bath Attached</label>

                  <Select
                    {...field}
                    options={bathAttachedOptions}
                    isClearable
                    placeholder=""
                    styles={selectStyles}
                    value={
                      bathAttachedOptions.find(
                        (o) => o.value === field.value,
                      ) || null
                    }
                    onChange={(selected) =>
                      field.onChange(selected?.value || "")
                    }
                  />
                </div>
              )}
            />
            {/* Available From */}
            {/* <Controller
              name="availableFrom"
              control={control}
              render={({ field }) => (
                <div
                  className={`select-group ${field.value ? "has-value" : ""}`}
                >
                  <label className="select-label">Available From</label>

                  <Select
                    {...field}
                    options={availableFromOptions}
                    isClearable
                    placeholder=""
                    styles={selectStyles}
                    value={
                      availableFromOptions.find(
                        (o) => o.value === field.value,
                      ) || null
                    }
                    onChange={(selected) =>
                      field.onChange(selected?.value || "")
                    }
                  />
                </div>
              )}
            /> */}

            {/* Red Flag */}
            {/* <Controller
              name="redFlag"
              control={control}
              render={({ field }) => (
                <div
                  className={`select-group ${field.value ? "has-value" : ""}`}
                >
                  <label className="select-label">Red Flag</label>

                  <Select
                    {...field}
                    options={redFlagOptions}
                    isClearable
                    placeholder=""
                    styles={selectStyles}
                    value={
                      redFlagOptions.find((o) => o.value === field.value) ||
                      null
                    }
                    onChange={(selected) =>
                      field.onChange(selected?.value || "")
                    }
                  />
                </div>
              )}
            /> */}

            {/* Monthly Rent */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Monthly Rent
              </label>

              <div className="grid grid-cols-2 gap-3">
                <Controller
                  name="monthlyRentMin"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="number"
                      placeholder="Min"
                      className="border rounded-lg px-3 py-2 w-full"
                    />
                  )}
                />

                <Controller
                  name="monthlyRentMax"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="number"
                      placeholder="Max"
                      className="border rounded-lg px-3 py-2 w-full"
                    />
                  )}
                />
              </div>
            </div>

            {/* Deposit Amount */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Deposit Amount
              </label>

              <div className="grid grid-cols-2 gap-3">
                <Controller
                  name="depositAmountMin"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="number"
                      placeholder="Min"
                      className="border rounded-lg px-3 py-2 w-full"
                    />
                  )}
                />

                <Controller
                  name="depositAmountMax"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="number"
                      placeholder="Max"
                      className="border rounded-lg px-3 py-2 w-full"
                    />
                  )}
                />
              </div>
            </div>

            {/* Existing Client Name */}
            {/* <Controller
            name="clientName"
            control={control}
            render={({ field }) => (
              <div>
                <label className="block text-sm font-medium mb-2">
                  Existing Client Name
                </label>

                <input
                  {...field}
                  type="text"
                  placeholder="Enter Client Name"
                  className="border rounded-lg px-3 py-2 w-full"
                />
              </div>
            )}
          /> */}
          </div>
          {/* Buttons */}
          <div className="sticky bottom-0 bg-white border-t border-gray-200 p-5 shadow-[0_-4px_12px_rgba(0,0,0,0.06)]">
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

export default AvailableBedsFilter;
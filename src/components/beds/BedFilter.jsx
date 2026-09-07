import { useEffect, useMemo } from "react";
import { X } from "lucide-react";
import Select from "react-select";
import { useForm, Controller } from "react-hook-form";
import { selectStyles } from "../../utils/selectStyles";
import { AsyncPaginate } from "react-select-async-paginate";
import { getPropertyDropdown } from "../properties/services/index";
const BedFilter = ({
  isOpen,
  onClose,
  apiData = [],
  onApply,
  handleReset,
  resetTrigger,
  initialFilters = {},
}) => {
  const { control, handleSubmit, reset } = useForm({
    defaultValues: {
      propertyId: null,
      propertyLocation: "",
      roomNo: "",
      bedNo: "",
      gender: "",
      sharingType: "",
      bathAttached: "",
      acRoom: "",

      monthlyRentMin: "",
      monthlyRentMax: "",

      sdmfMin: "",
      sdmfMax: "",

      depositAmountMin: "",
      depositAmountMax: "",

      upcomingRentHikeDateFrom: "",
      upcomingRentHikeDateTo: "",

      upcomingRentHikeAmountMin: "",
      upcomingRentHikeAmountMax: "",

      previousRentHikeDateFrom: "",
      previousRentHikeDateTo: "",

      status: "",
    },
  });
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
  // Location Options
  const locationOptions = useMemo(() => {
    return [
      ...new Set(
        apiData
          ?.map((item) => item?.propertyId?.propertyLocation)
          .filter(Boolean),
      ),
    ].map((item) => ({
      value: item,
      label: item,
    }));
  }, [apiData]);
  // Status Options
  const statusOptions = [
    { value: "Active", label: "Active" },
    { value: "Inactive", label: "Inactive" },
  ];
  //room Options
  const roomOptions = useMemo(() => {
    return [...new Set(apiData.map((item) => item.roomNo).filter(Boolean))]
      .sort()
      .map((item) => ({
        value: item,
        label: item,
      }));
  }, [apiData]);
  //  Bed Options
  const bedOptions = useMemo(() => {
    return [...new Set(apiData.map((item) => item.bedNo).filter(Boolean))]
      .sort()
      .map((item) => ({
        value: item,
        label: item,
      }));
  }, [apiData]);
  // Gender Options
  const genderOptions = [
    { value: "Male", label: "Male" },
    { value: "Female", label: "Female" },
  ];
  // Sharing Type Options
  const sharingTypeOptions = [
    { value: "Private", label: "Private" },
    { value: "Double", label: "Double" },
    { value: "Triple", label: "Triple" },
    { value: "Quad", label: "Quad" },
  ];
  // Bath Attached Options
  const bathAttachedOptions = [
    { value: "Yes", label: "Yes" },
    { value: "No", label: "No" },
  ];
  // AC Attached Options
  const acRoomOptions = [
    { value: "AC", label: "AC" },
    { value: "Non AC", label: "Non AC" },
  ];
  const onSubmit = (data) => {
    const filters = {
      propertyId: data.propertyId?.value || "",
      propertyCode: data.propertyId?.label || "",

      propertyLocation: data.propertyLocation || "",
      roomNo: data.roomNo || "",
      bedNo: data.bedNo || "",
      gender: data.gender || "",
      sharingType: data.sharingType || "",
      bathAttached: data.bathAttached || "",
      acRoom: data.acRoom || "",

      monthlyRentMin: data.monthlyRentMin || "",
      monthlyRentMax: data.monthlyRentMax || "",

      depositAmountMin: data.depositAmountMin || "",
      depositAmountMax: data.depositAmountMax || "",

      status: data.status || "",
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

      data.gender && {
        key: "gender",
        title: "Gender",
        value: data.gender,
      },

      data.sharingType && {
        key: "sharingType",
        title: "Sharing",
        value: data.sharingType,
      },

      data.bathAttached && {
        key: "bathAttached",
        title: "Bath",
        value: data.bathAttached,
      },

      data.acRoom && {
        key: "acRoom",
        title: "AC",
        value: data.acRoom,
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

      data.status && {
        key: "status",
        title: "Status",
        value: data.status,
      },
    ].filter(Boolean);

    onApply(filters, labels);

    onClose();
  };
  useEffect(() => {
    if (!isOpen) return;

    reset({
      propertyId: initialFilters.propertyId
        ? {
            value: initialFilters.propertyId,
            label: initialFilters.propertyCode || initialFilters.propertyId,
          }
        : null,

      propertyLocation: initialFilters.propertyLocation || "",
      roomNo: initialFilters.roomNo || "",
      bedNo: initialFilters.bedNo || "",
      gender: initialFilters.gender || "",
      sharingType: initialFilters.sharingType || "",
      bathAttached: initialFilters.bathAttached || "",
      acRoom: initialFilters.acRoom || "",

      monthlyRentMin: initialFilters.monthlyRentMin || "",
      monthlyRentMax: initialFilters.monthlyRentMax || "",

      depositAmountMin: initialFilters.depositAmountMin || "",
      depositAmountMax: initialFilters.depositAmountMax || "",

      upcomingRentHikeDateFrom: initialFilters.upcomingRentHikeDateFrom || "",
      upcomingRentHikeDateTo: initialFilters.upcomingRentHikeDateTo || "",

      upcomingRentHikeAmountMin: initialFilters.upcomingRentHikeAmountMin || "",
      upcomingRentHikeAmountMax: initialFilters.upcomingRentHikeAmountMax || "",

      previousRentHikeDateFrom: initialFilters.previousRentHikeDateFrom || "",
      previousRentHikeDateTo: initialFilters.previousRentHikeDateTo || "",

      status: initialFilters.status || "",
    });
  }, [isOpen, reset]);
  useEffect(() => {
    if (!resetTrigger) return;

    reset({
      propertyId: null,
      propertyLocation: "",
      roomNo: "",
      bedNo: "",
      gender: "",
      sharingType: "",
      bathAttached: "",
      acRoom: "",

      monthlyRentMin: "",
      monthlyRentMax: "",

      sdmfMin: "",
      sdmfMax: "",

      depositAmountMin: "",
      depositAmountMax: "",

      upcomingRentHikeDateFrom: "",
      upcomingRentHikeDateTo: "",

      upcomingRentHikeAmountMin: "",
      upcomingRentHikeAmountMax: "",

      previousRentHikeDateFrom: "",
      previousRentHikeDateTo: "",

      status: "",
    });
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
        <div className="flex justify-between items-center p-5 text-white bg-linear-to-r from-slate-800 via-slate-700 to-slate-900 border-b border-slate-600">
          <h2 className="font-bold text-lg">Filters</h2>

          <button onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form
          className="flex-1 overflow-y-auto  space-y-5"
          id="bed-filter-form"
          onSubmit={handleSubmit(onSubmit)}
        >
          <div className="flex-1 overflow-y-auto p-5 space-y-5">
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
                    value={field.value}
                    isClearable
                    placeholder=""
                    styles={selectStyles}
                    onChange={(option) => field.onChange(option)}
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
                  className={`select-group ${field.value ? "has-value" : ""}`}
                >
                  <label className="select-label">Location</label>

                  <Select
                    {...field}
                    options={locationOptions}
                    isClearable
                    placeholder=""
                    value={
                      locationOptions.find(
                        (option) => option.value === field.value,
                      ) || null
                    }
                    onChange={(selectedOption) =>
                      field.onChange(selectedOption?.value || "")
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
                  className={`select-group ${field.value ? "has-value" : ""}`}
                >
                  <label className="select-label">Status</label>

                  <Select
                    {...field}
                    options={statusOptions}
                    isClearable
                    placeholder=""
                    value={
                      statusOptions.find(
                        (option) => option.value === field.value,
                      ) || null
                    }
                    onChange={(selectedOption) =>
                      field.onChange(selectedOption?.value || "")
                    }
                    styles={selectStyles}
                  />
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
                    value={
                      roomOptions.find((o) => o.value === field.value) || null
                    }
                    onChange={(selected) =>
                      field.onChange(selected?.value || "")
                    }
                    styles={selectStyles}
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
                    value={
                      bedOptions.find((o) => o.value === field.value) || null
                    }
                    onChange={(selected) =>
                      field.onChange(selected?.value || "")
                    }
                    styles={selectStyles}
                  />
                </div>
              )}
            />
            {/* Gender */}
            <Controller
              name="gender"
              control={control}
              render={({ field }) => (
                <div
                  className={`select-group ${field.value ? "has-value" : ""}`}
                >
                  <label className="select-label">Gender</label>

                  <Select
                    {...field}
                    options={genderOptions}
                    isClearable
                    placeholder=""
                    value={
                      genderOptions.find((o) => o.value === field.value) || null
                    }
                    onChange={(selected) =>
                      field.onChange(selected?.value || "")
                    }
                    styles={selectStyles}
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
                    value={
                      sharingTypeOptions.find((o) => o.value === field.value) ||
                      null
                    }
                    onChange={(selected) =>
                      field.onChange(selected?.value || "")
                    }
                    styles={selectStyles}
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
                    value={
                      bathAttachedOptions.find(
                        (o) => o.value === field.value,
                      ) || null
                    }
                    onChange={(selected) =>
                      field.onChange(selected?.value || "")
                    }
                    styles={selectStyles}
                  />
                </div>
              )}
            />
            {/* AC Attached */}
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
                    value={
                      acRoomOptions.find((o) => o.value === field.value) || null
                    }
                    onChange={(selected) =>
                      field.onChange(selected?.value || "")
                    }
                    styles={selectStyles}
                  />
                </div>
              )}
            />
            {/* Monthly Rent (Min/Max) */}
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
            {/* SDMF (Min/Max) */}
            {/* <div>
            <label className="block text-sm font-medium mb-2">SDMF</label>

            <div className="grid grid-cols-2 gap-3">
              <Controller
                name="sdmfMin"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    type="number"
                    placeholder="Min"
                    className="border rounded-lg px-3 py-2"
                  />
                )}
              />

              <Controller
                name="sdmfMax"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    type="number"
                    placeholder="Max"
                    className="border rounded-lg px-3 py-2"
                  />
                )}
              />
            </div>
          </div> */}

            {/* Deposit Amount (Min/Max) */}
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
                      className="border rounded-lg px-3 py-2"
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
                      className="border rounded-lg px-3 py-2"
                    />
                  )}
                />
              </div>
            </div>
            {/* Upcoming Rent Hike Date */}
            {/* <div>
            <label className="block text-sm font-medium mb-2">
              Upcoming Rent Hike Date
            </label>

            <div className="grid grid-cols-2 gap-3">
              <Controller
                name="upcomingRentHikeDateFrom"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    type="date"
                    className="border rounded-lg px-3 py-2"
                  />
                )}
              />

              <Controller
                name="upcomingRentHikeDateTo"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    type="date"
                    className="border rounded-lg px-3 py-2"
                  />
                )}
              />
            </div>
          </div> */}
            {/* Upcoming Rent Hike Amount */}
            {/* <div>
            <label className="block text-sm font-medium mb-2">
              Upcoming Rent Hike Amount
            </label>

            <div className="grid grid-cols-2 gap-3">
              <Controller
                name="upcomingRentHikeAmountMin"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    type="number"
                    placeholder="Min"
                    className="border rounded-lg px-3 py-2"
                  />
                )}
              />

              <Controller
                name="upcomingRentHikeAmountMax"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    type="number"
                    placeholder="Max"
                    className="border rounded-lg px-3 py-2"
                  />
                )}
              />
            </div>
          </div> */}
            {/* Previous Rent Hike Date */}
            {/* <div>
            <label className="block text-sm font-medium mb-2">
              Previous Rent Hike Date
            </label>

            <div className="grid grid-cols-2 gap-3">
              <Controller
                name="previousRentHikeDateFrom"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    type="date"
                    className="border rounded-lg px-3 py-2"
                  />
                )}
              />

              <Controller
                name="previousRentHikeDateTo"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    type="date"
                    className="border rounded-lg px-3 py-2"
                  />
                )}
              />
            </div>
          </div> */}
          </div>
          {/* Reset Button */}
          <div className="sticky bottom-0 bg-white border-t border-gray-200 p-5 shadow-[0_-4px_12px_rgba(0,0,0,0.06)]">
            <div className="flex gap-3 ">
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
          </div>
        </form>
      </div>
    </>
  );
};

export default BedFilter;
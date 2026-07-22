import React, { useMemo, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import Select from "react-select";
import { selectStyles } from "../../utils/selectStyles";
import { AsyncPaginate } from "react-select-async-paginate";
import { X } from "lucide-react";
import { getPropertyDropdown } from "../properties/services/index";

const NewBookingFilter = ({
  isOpen,
  onClose,
  apiData = [],
  onApply,
  handleReset,
  resetTrigger,
}) => {
  const { control, handleSubmit, reset } = useForm({
    defaultValues: {
      // Text/Select filters
      teamCode: "",
      fullName: "",
      callingNo: "",
      whatsappNo: "",
      status: "",
      bookingType: "",

      // Property related
      propertyId: null,
      propertyLocation: "",
      roomNo: "",
      bedNo: "",

      // Temporary property related
      temporaryPropertyId: null,
      temporaryBedNo: "",

      // Date filters
      clientDojFrom: "",
      clientDojTo: "",
      temporaryClientDojFrom: "",
      temporaryClientDojTo: "",

      // Amount filters
      monthlyRentMin: "",
      monthlyRentMax: "",
      depositAmountMin: "",
      depositAmountMax: "",
      processingFeesMin: "",
      processingFeesMax: "",
      totalAmountMin: "",
      totalAmountMax: "",
      bookingAmountMin: "",
      bookingAmountMax: "",
      balanceAmountMin: "",
      balanceAmountMax: "",
    },
  });

  // Load property options for async select
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
    { value: "Booked", label: "Booked" },
    { value: "Not Booked", label: "Not Booked" },
  ];

  // Booking Type Options
  const bookingTypeOptions = [
    { value: "Permanent", label: "Permanent" },
    { value: "Temporary", label: "Temporary" },
  ];

  const teamCodeOptions = [
    { value: "Sales 1", label: "Sales 1" },
    { value: "Sales 2", label: "Sales 2" },
  ];
  const onSubmit = (data) => {
    const filters = {
      ...data,
      propertyId: data.propertyId?.value || "",
      temporaryPropertyId: data.temporaryPropertyId?.value || "",
    };

    const labels = [
      data.fullName && {
        key: "fullName",
        title: "Client Name",
        value: data.fullName,
      },
      data.callingNo && {
        key: "callingNo",
        title: "Calling No",
        value: data.callingNo,
      },
      data.whatsappNo && {
        key: "whatsappNo",
        title: "WhatsApp No",
        value: data.whatsappNo,
      },
      data.status && {
        key: "status",
        title: "Status",
        value: data.status,
      },
      data.bookingType && {
        key: "bookingType",
        title: "Booking Type",
        value: data.bookingType,
      },
      data.teamCode && {
        key: "teamCode",
        title: "Team Code",
        value: data.teamCode,
      },
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
        title: "Room No",
        value: data.roomNo,
      },
      data.bedNo && {
        key: "bedNo",
        title: "Bed No",
        value: data.bedNo,
      },
      data.temporaryPropertyId && {
        key: "temporaryPropertyId",
        title: "Temp Property",
        value: data.temporaryPropertyId.label,
      },
      data.temporaryBedNo && {
        key: "temporaryBedNo",
        title: "Temp Bed No",
        value: data.temporaryBedNo,
      },
      data.clientDojFrom && {
        key: "clientDojFrom",
        title: "DOJ From",
        value: data.clientDojFrom,
      },
      data.clientDojTo && {
        key: "clientDojTo",
        title: "DOJ To",
        value: data.clientDojTo,
      },
      data.temporaryClientDojFrom && {
        key: "temporaryClientDojFrom",
        title: "Temp DOJ From",
        value: data.temporaryClientDojFrom,
      },
      data.temporaryClientDojTo && {
        key: "temporaryClientDojTo",
        title: "Temp DOJ To",
        value: data.temporaryClientDojTo,
      },
      data.monthlyRentMin && {
        key: "monthlyRentMin",
        title: "Rent ≥",
        value: `₹${data.monthlyRentMin}`,
      },
      data.monthlyRentMax && {
        key: "monthlyRentMax",
        title: "Rent ≤",
        value: `₹${data.monthlyRentMax}`,
      },
      data.depositAmountMin && {
        key: "depositAmountMin",
        title: "Deposit ≥",
        value: `₹${data.depositAmountMin}`,
      },
      data.depositAmountMax && {
        key: "depositAmountMax",
        title: "Deposit ≤",
        value: `₹${data.depositAmountMax}`,
      },
      data.processingFeesMin && {
        key: "processingFeesMin",
        title: "Proc. Fee ≥",
        value: `₹${data.processingFeesMin}`,
      },
      data.processingFeesMax && {
        key: "processingFeesMax",
        title: "Proc. Fee ≤",
        value: `₹${data.processingFeesMax}`,
      },
      data.totalAmountMin && {
        key: "totalAmountMin",
        title: "Total Amt ≥",
        value: `₹${data.totalAmountMin}`,
      },
      data.totalAmountMax && {
        key: "totalAmountMax",
        title: "Total Amt ≤",
        value: `₹${data.totalAmountMax}`,
      },
      data.bookingAmountMin && {
        key: "bookingAmountMin",
        title: "Booking Amt ≥",
        value: `₹${data.bookingAmountMin}`,
      },
      data.bookingAmountMax && {
        key: "bookingAmountMax",
        title: "Booking Amt ≤",
        value: `₹${data.bookingAmountMax}`,
      },
      data.balanceAmountMin && {
        key: "balanceAmountMin",
        title: "Balance Amt ≥",
        value: `₹${data.balanceAmountMin}`,
      },
      data.balanceAmountMax && {
        key: "balanceAmountMax",
        title: "Balance Amt ≤",
        value: `₹${data.balanceAmountMax}`,
      },
    ].filter(Boolean);

    onApply(filters, labels);
    onClose();
  };

  // Reset form when resetTrigger changes
  useEffect(() => {
    reset({
      teamCode: "",
      fullName: "",
      callingNo: "",
      whatsappNo: "",
      status: "",
      bookingType: "",
      propertyId: "",
      propertyLocation: "",
      roomNo: "",
      bedNo: "",
      temporaryPropertyId: "",
      temporaryBedNo: "",
      clientDojFrom: "",
      clientDojTo: "",
      temporaryClientDojFrom: "",
      temporaryClientDojTo: "",
      monthlyRentMin: "",
      monthlyRentMax: "",
      depositAmountMin: "",
      depositAmountMax: "",
      processingFeesMin: "",
      processingFeesMax: "",
      totalAmountMin: "",
      totalAmountMax: "",
      bookingAmountMin: "",
      bookingAmountMax: "",
      balanceAmountMin: "",
      balanceAmountMax: "",
    });
  }, [resetTrigger, reset]);

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />
      )}

      <div
        className={`fixed top-0 right-0 h-full w-[380px] bg-white z-50 shadow-xl transition-transform duration-300 flex flex-col ${
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
          className="flex flex-col flex-1 overflow-y-auto"
          id="new-booking-filter-form"
          onSubmit={handleSubmit(onSubmit)}
        >
          <div className="flex-1 overflow-y-auto p-5 space-y-5 ">
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

            {/* Booking Type */}
            <Controller
              name="bookingType"
              control={control}
              render={({ field }) => (
                <div
                  className={`select-group ${field.value ? "has-value" : ""}`}
                >
                  <label className="select-label">Booking Type</label>
                  <Select
                    {...field}
                    options={bookingTypeOptions}
                    isClearable
                    placeholder=""
                    value={
                      bookingTypeOptions.find(
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
            {/* Team Code */}
            <Controller
              name="teamCode"
              control={control}
              render={({ field }) => (
                <div
                  className={`select-group ${field.value ? "has-value" : ""}`}
                >
                  <label className="select-label">Team Code</label>

                  <Select
                    {...field}
                    options={teamCodeOptions}
                    isClearable
                    placeholder=""
                    value={
                      teamCodeOptions.find(
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

            {/* Client DOJ Range */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Client DOJ
              </label>
              <div className="grid grid-cols-2 gap-3">
                <Controller
                  name="clientDojFrom"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="date"
                      className="border rounded-lg px-3 py-2 w-full"
                    />
                  )}
                />
                <Controller
                  name="clientDojTo"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="date"
                      className="border rounded-lg px-3 py-2 w-full"
                    />
                  )}
                />
              </div>
            </div>

            {/* Temporary Client DOJ Range */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Temp Client DOJ
              </label>
              <div className="grid grid-cols-2 gap-3">
                <Controller
                  name="temporaryClientDojFrom"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="date"
                      className="border rounded-lg px-3 py-2 w-full"
                    />
                  )}
                />
                <Controller
                  name="temporaryClientDojTo"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="date"
                      className="border rounded-lg px-3 py-2 w-full"
                    />
                  )}
                />
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="sticky bottom-0 bg-white border-t border-gray-200 p-5 shadow-[0_-4px_12px_rgba(0,0,0,0.06)]">
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleReset}
                className="w-full border border-gray-300 py-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Reset
              </button>
              <button
                type="submit"
                className="w-full bg-linear-to-r from-slate-800 via-slate-700 to-slate-900 text-white py-2 rounded-lg hover:opacity-90 transition-opacity"
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

export default NewBookingFilter;
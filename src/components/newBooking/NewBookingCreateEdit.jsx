import React, { useEffect, useState } from "react";
import Select from "react-select";
import { useForm, Controller } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { selectStyles } from "../../utils/selectStyles";
import Loader from "../common/Loader";
import { usePropertiesDropdown } from "../beds/services";
import { useAvailableBedsData, useCreateNewBooking, useSingleNewBookingData, useUpdateNewBooking } from "./services";
import BookingConfirmationModal from "./BookingConfirmationModal";
import { formatDate } from "../../utils/dateFormatter";
import { getPropertyDropdown } from "../properties/services";
import { AsyncPaginate } from "react-select-async-paginate";

const NewBookingCreateEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const {
    control,
    register,
    handleSubmit,
    reset,
    setValue,
    watch
  } = useForm();

  // States for dropdown options
  const [propertyOptions, setPropertyOptions] = useState([]);
  const [roomOptions, setRoomOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [formPreviewData, setFormPreviewData] = useState(null);
  const [activeTab, setActiveTab] = useState("Permanent");
  const { data: propertiesDropdown, isPending: ispropertiesDropdown } = usePropertiesDropdown()
  const { data: bedAvailableData, isPending: isBedAvailableData } = useAvailableBedsData()
  const { mutate: submitNewBooking, isPending: isSubmitNewBooking } = useCreateNewBooking();
  const { mutate: updateNewBooking, isPending: isUpdateNewBooking } = useUpdateNewBooking();
  // const { mutate: updateNewBooking, isPending: isUpdateNewBooking } = useUpdateNewBooking();
  const { data: bookingData, isPending: isBookingLoading } = useSingleNewBookingData(id);
  // watch section Permanent
  const selectedPropertyId = watch("propertyId")?.value;

  const selectedbedId = watch("bedId");
  const watchClientDoj = watch("clientDoj");
  const watchClientLastDate = watch("clientLastDate");
  const watchMonthlyRent = watch("monthlyRent");
  // watch section Temporary
  const selectedTempPropertyId = watch("temporaryPropertyId")?.value;
  const selectedTempbedId = watch("temporaryBedId");
  const watchTempClientDoj = watch("temporaryClientDoj");
  const watchTempClientLastDate = watch("temporaryClientLastDate");
  const watchTempMonthlyRent = watch("temporaryMonthlyRent");
  const watchAskFor = watch("askFor");

  const loadPropertyOptions = async (search, loadedOptions, { page }) => {
    const res = await getPropertyDropdown({ page, limit: 10, search });
    return {
      options: res.data.map((item) => ({
        value: `${item._id},${item.propertyCode}`,
        label: item.propertyCode,
        location: item.propertyLocation,
        bedCount: item.bedCount,
      })),
      hasMore: res.hasMore,
      additional: { page: page + 1 },
    };
  };

  // permanent property Logic ............................... start
  const bedOptions = bedAvailableData?.data
    ?.filter(
      (bed) => bed.propertyId?._id === selectedPropertyId?.split(",")[0]
    )
    ?.map((bed) => ({
      value: `${bed._id},${bed.bedNo}`,
      label: `${bed.bedNo}`,
      bedData: bed,
    })) || [];

  useEffect(() => {
    if (!selectedbedId) {
      setValue("roomNo", "");
      setValue("acRoom", "");
      setValue("monthlyRent", "");
      setValue("depositAmount", "");
      setValue("comments", "");
      setValue("clientCalculatedRent", "");
      return;
    }
    const selectedBed = bedOptions.find(
      (bed) => bed.value === selectedbedId
    );
    if (!selectedBed) return;
    const bedData = selectedBed.bedData;
    setValue("roomNo", bedData.roomNo);
    setValue("acRoom", bedData.acRoom);
    setValue("monthlyRent", bedData.monthlyRent);
    setValue("depositAmount", bedData.depositAmount);
    setValue("URHD", formatDate(bedData.upcomingRentHikeDate));
    setValue("URHA", bedData.upcomingRentHikeAmount);
    // setValue("comments", bedData.comment);
  }, [selectedbedId, bedOptions, setValue]);
  // Auto Calculate Client Rent
  useEffect(() => {
    if (watchClientDoj && watchMonthlyRent) {
      const start = new Date(watchClientDoj);
      const end = watchClientLastDate
        ? new Date(watchClientLastDate)
        : null;
      start.setHours(0, 0, 0, 0);
      if (end) end.setHours(0, 0, 0, 0);
      if (isNaN(start.getTime())) {
        setValue("clientCalculatedRent", "");
        return;
      }
      const dailyRent = Number(watchMonthlyRent) / 30;
      let totalRent = 0;
      if (end && !isNaN(end.getTime())) {
        const startDay = start.getDate();
        const endDay = end.getDate();
        const monthDiff =
          (end.getFullYear() - start.getFullYear()) * 12 +
          (end.getMonth() - start.getMonth());
        const diffDays =
          monthDiff * 30 + (endDay - startDay + 1);
        totalRent = Math.round(dailyRent * diffDays);
      } else {
        const startDay = start.getDate();
        const remainingDays = 30 - startDay + 1;
        totalRent = Math.round(dailyRent * remainingDays);
      }
      setValue("clientCalculatedRent", totalRent);
    } else {
      setValue("clientCalculatedRent", "");
    }
  }, [watchClientDoj, watchClientLastDate, watchMonthlyRent, setValue,]);

  useEffect(() => {
    if (!selectedPropertyId) {
      setValue("bedId", null);
      setValue("roomNo", "");
      setValue("acRoom", "");
      setValue("monthlyRent", "");
      setValue("depositAmount", "");
      setValue("comments", "");
      setValue("clientCalculatedRent", "");
    }
  }, [selectedPropertyId, setValue]);
  // permanent property Logic ...............................end

  // Temporary property Logic ...............................start
  const TempBedOptions = bedAvailableData?.data
    ?.filter(
      (bed) => bed.propertyId?._id === selectedTempPropertyId?.split(",")[0]
    )
    ?.map((bed) => ({
      value: `${bed._id},${bed.bedNo}`,
      label: `${bed.bedNo}`,
      bedData: bed,
    })) || [];
  useEffect(() => {

    if (!selectedTempbedId) {
      setValue("temporaryRoomNo", "");
      setValue("temporaryAcRoom", "");
      setValue("temporaryMonthlyRent", "");
      setValue("temporaryComments", "");
      setValue("temporaryclientCalculatedRent", "");
      return;
    }

    const selectedTempBed = TempBedOptions.find(
      (bed) => bed.value === selectedTempbedId
    );
    if (!selectedTempBed) return;
    const bedData = selectedTempBed.bedData;
    setValue("temporaryRoomNo", bedData.roomNo);
    setValue("temporaryAcRoom", bedData.acRoom);
    setValue("temporaryMonthlyRent", bedData.monthlyRent);
    // setValue("temporaryComments", bedData.comment);
  }, [selectedTempbedId, TempBedOptions, setValue]);
  // Auto Calculate Client Rent
  useEffect(() => {
    if (watchTempClientDoj && watchTempMonthlyRent) {
      const start = new Date(watchTempClientDoj);
      const end = watchTempClientLastDate
        ? new Date(watchTempClientLastDate)
        : null;
      start.setHours(0, 0, 0, 0);
      if (end) end.setHours(0, 0, 0, 0);
      if (isNaN(start.getTime())) {
        setValue("tempclientCalculatedRent", "");
        return;
      } const dailyRent = Number(watchTempMonthlyRent) / 30;
      let totalTempRent = 0;
      if (end && !isNaN(end.getTime())) {
        const startDay = start.getDate();
        const endDay = end.getDate();
        const monthDiff =
          (end.getFullYear() - start.getFullYear()) * 12 +
          (end.getMonth() - start.getMonth());
        const diffDays =
          monthDiff * 30 + (endDay - startDay + 1);
        totalTempRent = Math.round(dailyRent * diffDays);
      } else {
        const startDay = start.getDate();
        const remainingDays = 30 - startDay + 1;
        totalTempRent = Math.round(dailyRent * remainingDays);
      }
      setValue("temporaryclientCalculatedRent", totalTempRent);
    } else {
      setValue("temporaryclientCalculatedRent", "");
    }
  }, [watchTempClientDoj, watchTempClientLastDate, watchTempMonthlyRent, setValue,]);

  useEffect(() => {
    if (!selectedTempPropertyId) {
      setValue("temporaryBedId", null);
      setValue("temporaryRoomNo", "");
      setValue("temporaryAcRoom", "");
      setValue("temporaryMonthlyRent", "");
      setValue("temporaryComments", "");
      setValue("temporaryclientCalculatedRent", "");
    }
  }, [selectedTempPropertyId, setValue]);

  const acNonAcOptions = [
    { value: "AC", label: "AC" },
    { value: "Non AC", label: "Non AC" },
  ];

  const askForOptions = [
    { value: "PA", label: "Partial Amount" },
    { value: "BA", label: "Booking Amount" },
    { value: "FA", label: "Full Amount" },
  ];

  useEffect(() => {

    // Fetch data if editing
    if (id) {
      // Fetch booking data here
    }
  }, [id]);




  useEffect(() => {
    if (!bookingData?.data) return;

    const booking = bookingData.data;
    reset({
      ...booking,
      // React Select values
      propertyId: booking.propertyId
        ? {
          value: `${booking.propertyId._id},${booking.propertyId.propertyCode}`,
          label: booking.propertyId.propertyCode,
          location: booking.propertyId.propertyLocation,
          bedCount: booking.propertyId.bedCount,
        }
        : null,
      bedId: booking.bedId
        ? `${booking.bedId._id},${booking.bedId.bedNo}`
        : null,
      temporaryPropertyId: booking.temporaryPropertyId
        ? {
          value: `${booking.temporaryPropertyId._id},${booking.temporaryPropertyId.propertyCode}`,
          label: booking.temporaryPropertyId.propertyCode,
          location: booking.temporaryPropertyId.propertyLocation,
          bedCount: booking.temporaryPropertyId.bedCount,
        }
        : null,
      temporaryBedId: booking.temporaryBedId
        ? `${booking.temporaryBedId._id},${booking.temporaryBedId.bedNo}`
        : null,
      // DatePicker values
      clientDoj: booking.clientDoj ? new Date(booking.clientDoj) : null,
      clientLastDate: booking.clientLastDate
        ? new Date(booking.clientLastDate)
        : null,
      temporaryClientDoj: booking.temporaryClientDoj
        ? new Date(booking.temporaryClientDoj)
        : null,
      temporaryClientLastDate: booking.temporaryClientLastDate
        ? new Date(booking.temporaryClientLastDate)
        : null,
      // Bed details
      roomNo: booking.bedId?.roomNo || "",
      acRoom: booking.bedId?.acRoom || "",
      monthlyRent: booking.monthlyRent,
      depositAmount: booking.depositAmount,
      URHD: booking.URHD,
      URHA: booking.URHA,
      // Temporary bed
      temporaryRoomNo: booking.temporaryBedId?.roomNo || "",
      temporaryAcRoom: booking.temporaryBedId?.acRoom || "",
      temporaryMonthlyRent: booking.temporaryBedId?.monthlyRent || "",
      // Remaining fields
      askFor: booking.askFor,
      processingFees: booking.processingFees,
      parkingCharges: booking.parkingCharges,
      temporaryParkingCharges: booking.temporaryParkingCharges,
      clientCalculatedRent: booking.clientCalculatedRent,
      temporaryclientCalculatedRent:
        booking.temporaryclientCalculatedRent,
      partialAmount: booking.partialAmount,
    });
  }, [bookingData, reset]);

  useEffect(() => {
    if (!bookingData?.data || bedOptions.length === 0) return;

    const booking = bookingData.data;

    setValue(
      "bedId",
      `${booking.bedId._id},${booking.bedId.bedNo}`
    );
  }, [bedOptions]);



  const onSubmit = (data) => {
    setFormPreviewData(data);
    setShowConfirmationModal(true);
  };


  const handleFinalSubmit = async () => {
    try {
      setIsLoading(true);

      const payload = {};
      Object.keys(formPreviewData).forEach((key) => {
        let value = formPreviewData[key];

        if (
          [
            "propertyId",
            "temporaryPropertyId",
            "bedId",
            "temporaryBedId",
          ].includes(key)
        ) {
          // AsyncPaginate object
          if (value && typeof value === "object") {
            value = value.value;
          }

          // "id,label" => only id
          if (typeof value === "string" && value.includes(",")) {
            value = value.split(",")[0];
          }
        }

        // Date fields
        if (value instanceof Date) {
          const year = value.getFullYear();
          const month = String(value.getMonth() + 1).padStart(2, "0");
          const day = String(value.getDate()).padStart(2, "0");

          payload[key] = `${year}-${month}-${day}`;
        }

        // 👇 Ye 4 fields hamesha payload me bhejo
        else if (
          [
            "clientLastDate",
            "temporaryClientLastDate",
            "clientDoj",
            "temporaryClientDoj",
          ].includes(key)
        ) {
          payload[key] = value ?? null;
        }

        // Baaki fields
        else if (
          value !== undefined &&
          value !== null &&
          value !== ""
        ) {
          payload[key] = value;
        }
      });

      const monthlyRent = Number(payload.monthlyRent || 0);
      const clientCalculatedRent = Number(payload.clientCalculatedRent || 0);
      const depositAmount = Number(payload.depositAmount || 0);
      const processingFees = Number(payload.processingFees || 0);
      const parkingCharges = Number(payload.parkingCharges || 0);
      const temporaryParkingCharges = Number(payload.temporaryParkingCharges || 0);
      const temporaryclientCalculatedRent = Number(payload.temporaryclientCalculatedRent || 0);
      const partialAmount = Number(payload.partialAmount || 0);

      payload.totalAmount = clientCalculatedRent + depositAmount + processingFees + parkingCharges + temporaryclientCalculatedRent + temporaryParkingCharges
      // payload.bookingAmount = payload.askFor === "FA" ? payload.totalAmount : monthlyRent;
      payload.bookingAmount = payload.askFor === "FA" ? payload.totalAmount : payload.askFor === "PA" ? partialAmount : monthlyRent;
      payload.balanceAmount =
        payload.totalAmount - payload.bookingAmount;
      payload.temporaryTotalAmount = temporaryclientCalculatedRent + temporaryParkingCharges;
      // return

      console.log(payload)
      if (id) {
        updateNewBooking(
          { id, payload },
          {
            onSuccess: (response) => {
              toast.success(
                response?.message || "Booking Updated Successfully"
              );

              reset();
              setShowConfirmationModal(false);
              navigate("/new-bookings");
            },

            onError: (error) => {
              toast.error(
                error?.response?.data?.message ||
                error?.message ||
                "Something went wrong"
              );
            },
          }
        );
      } else {
        submitNewBooking(payload, {
          onSuccess: (response) => {
            toast.success(
              response?.message || "Booking Created Successfully"
            );

            reset();
            setShowConfirmationModal(false);
            navigate("/new-bookings");
          },

          onError: (error) => {
            toast.error(
              error?.response?.data?.message ||
              error?.message ||
              "Something went wrong"
            );
          },
        });
      }
    } catch (error) {
      console.error(error);

      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-12xl mx-auto px-4 ">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Client Details Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Client Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="form-group">
              <input
                {...register("fullName")}
                placeholder=" "
                className="form-input"
              />
              <label className="form-label required-label">
                Full Name </label>
            </div>
            <div className="form-group">
              <input
                {...register("whatsappNo")}
                placeholder=" "
                type="number"
                className="form-input"
              />
              <label className="form-label required-label">
                WhatsApp No.
              </label>
            </div>


            <div className="form-group">
              <input
                {...register("callingNo")}
                placeholder=" "
                type="number"
                className="form-input"
              />
              <label className="form-label required-label">
                Calling No.
              </label>
            </div>
            <div className="form-group">
              <input
                {...register("emergencyContact1FullName")}
                placeholder=" "
                className="form-input"
              />
              <label className="form-label required-label">
                Emergency Contact1 Full Name </label>
            </div>

            <div className="form-group">
              <input
                {...register("emergencyContact1No")}
                placeholder=" "
                type="number"
                className="form-input"
              />
              <label className="form-label required-label">
                Emergency Contact1 No.
              </label>
            </div>
            <div className="form-group">
              <input
                {...register("emergencyContact2FullName")}
                placeholder=" "
                className="form-input"
              />
              <label className="form-label required-label">
                Emergency Contact2 Full Name </label>
            </div>

            <div className="form-group">
              <input
                {...register("emergencyContact2No")}
                placeholder=" "
                type="number"
                className="form-input"
              />
              <label className="form-label required-label">
                Emergency Contact2 No.
              </label>
            </div>


            <div className="form-group">
              <input
                {...register("emailId")}
                placeholder=" "
                className="form-input"
              />
              <label className="form-label required-label">
                Email Id </label>
            </div>
            <Controller
              name="askFor"
              control={control}
              defaultValue={null}
              render={({ field }) => (
                <div className={`select-group ${field.value ? "has-value" : ""}`}>
                  <label className="select-label required-label">
                    AskFor
                  </label>

                  <Select
                    {...field}
                    options={askForOptions}
                    isClearable
                    placeholder=""
                    value={askForOptions.find(
                      (option) => option.value === field.value
                    )}
                    onChange={(selectedOption) =>
                      field.onChange(selectedOption?.value)
                    }
                    styles={selectStyles}
                  />
                </div>
              )}
            />
          </div>
        </div>
        {/* Tabs Section */}
        <div className="flex justify-center items-center gap-2 mb-6">
          <button
            type="button"
            onClick={() => setActiveTab("Permanent")}
            className={`px-4 py-2 rounded-lg font-medium  ${activeTab === "Permanent"
              ? "theme-btn text-white"
              : "bg-gray-100 text-gray-700"
              }`}
          >
            Permanent Property Details
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("Temporary")}
            className={`px-4 py-2 rounded-lg font-medium ${activeTab === "Temporary"
              ? "theme-btn text-white"
              : "bg-gray-100 text-gray-700"
              }`}
          >
            Temporary Property Details
          </button>
        </div>

        {/* Permanent Property Details Section */}
        {activeTab === "Permanent" && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Permanent Property Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Controller
                name="propertyId"
                control={control}
                defaultValue={null}
                render={({ field }) => (
                  <div className={`select-group ${field.value ? "has-value" : ""}`}>
                    <label className="select-label required-label">
                      Property Code
                    </label>

                    <AsyncPaginate
                      additional={{ page: 1 }}
                      debounceTimeout={500}
                      loadOptions={loadPropertyOptions}
                      placeholder="search/select"
                      value={field.value}
                      onChange={(option) => {
                        field.onChange(option);
                      }}
                      isClearable
                      styles={selectStyles}
                    />
                  </div>
                )}
              />
              <Controller
                name="bedId"
                control={control}
                defaultValue={null}
                render={({ field }) => (
                  <div className={`select-group ${field.value ? "has-value" : ""}`}>
                    <label className="select-label required-label">
                      Bed No
                    </label>

                    <Select
                      {...field}
                      options={bedOptions}
                      isClearable
                      placeholder=""
                      value={bedOptions.find(
                        (option) => option.value === field.value
                      )}
                      onChange={(selectedOption) =>
                        field.onChange(selectedOption?.value || null)
                      }
                      styles={selectStyles}
                    />
                  </div>
                )}
              />

              <div className="form-group">
                <input
                  {...register("roomNo")}
                  placeholder=" "
                  type="text"
                  className="form-input"
                />
                <label className="form-label required-label">
                  Room No
                </label>
              </div>




              <div className="form-group">
                <input
                  {...register("acRoom")}
                  placeholder=" "
                  type="text"
                  className="form-input"
                />
                <label className="form-label required-label">
                  AC / Non AC
                </label>
              </div>



              <div className="form-group">
                <input
                  {...register("monthlyRent")}
                  placeholder=" "
                  type="number"
                  className="form-input"
                />
                <label className="form-label required-label">
                  Monthly Fixed Rent ( ₹ )
                </label>
              </div>
              <div className="form-group">
                <input
                  {...register("depositAmount")}
                  placeholder=" "
                  type="number"
                  className="form-input"
                />
                <label className="form-label required-label">
                  Deposit Amount ( ₹ )
                </label>
              </div>

              <Controller
                name="clientDoj"
                control={control}
                render={({ field }) => (
                  <div
                    className={`datepicker-group ${field.value ? "has-value" : ""
                      }`}
                  >
                    <label className="datepicker-label required-label">
                      Client DOJ
                    </label>
                    <DatePicker
                      isClearable
                      selected={field.value}
                      onChange={(date) => {
                        const selectedBed = bedOptions.find(
                          (bed) => bed.value === selectedbedId
                        );
                        const cvd =
                          selectedBed?.bedData?.client?.clientVacatingDate;
                        if (
                          date &&
                          cvd &&
                          new Date(cvd) > date
                        ) {
                          const proceed = window.confirm(
                            "Client DOJ is earlier than the existing client's Vacating Date.\n\nDo you want to continue?"
                          );

                          if (!proceed) return;
                        }
                        field.onChange(date);
                      }}
                      dateFormat="dd MMM yyyy"
                      className="custom-datepicker"
                    />
                  </div>
                )}
              />

              <Controller
                name="clientLastDate"
                control={control}
                render={({ field }) => (
                  <div
                    className={`datepicker-group ${field.value ? "has-value" : ""
                      }`}
                  >
                    <label className="datepicker-label required-label">
                      Client Last Date (Optional)
                    </label>
                    <DatePicker
                      isClearable
                      selected={field.value}
                      onChange={(date) => field.onChange(date)}
                      dateFormat="dd MMM yyyy"
                      className="custom-datepicker"
                    />
                  </div>
                )}
              />

              <div className="form-group">
                <input
                  {...register("clientCalculatedRent")}
                  placeholder=" "
                  type="number"
                  className="form-input"
                />
                <label className="form-label required-label">
                  Rent Amount As Per Client DOJ ( ₹ )
                </label>
              </div>
              <div className="form-group">
                <input
                  {...register("processingFees")}
                  placeholder=" "
                  type="number"
                  className="form-input"
                />
                <label className="form-label required-label">
                  Processing Fees ( ₹ )
                </label>
              </div>
              <div className="form-group">
                <input
                  {...register("parkingCharges")}
                  placeholder=" "
                  type="number"
                  className="form-input"
                />
                <label className="form-label required-label">
                  Parking Charges ( ₹ )
                </label>
              </div>

              <div className="form-group">
                <input
                  {...register("URHD")}
                  placeholder=" "
                  type="text"
                  className="form-input"
                />
                <label className="form-label required-label">
                  Upcoming Rent Hike Date
                </label>
              </div>
              <div className="form-group">
                <input
                  {...register("URHA")}
                  placeholder=" "
                  type="text"
                  className="form-input"
                />
                <label className="form-label required-label">
                  Upcoming Rent Hike Amount
                </label>
              </div>




              <div className="form-group">
                <input
                  {...register("comments")}
                  placeholder=" "
                  type="text"
                  className="form-input"
                />
                <label className="form-label required-label">
                  Comments
                </label>
              </div>

              {watchAskFor === "PA" && (
                <div className="form-group">
                  <input
                    {...register("partialAmount")}
                    placeholder=" "
                    type="number"
                    className="form-input"
                  />
                  <label className="form-label required-label">
                    Partial Amount ( ₹ )
                  </label>
                </div>
              )}


            </div>
          </div>
        )}


        {activeTab === "Temporary" && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Temporary Property Details</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

              <Controller
                name="temporaryPropertyId"
                control={control}
                defaultValue={null}
                render={({ field }) => (
                  <div className={`select-group ${field.value ? "has-value" : ""}`}>
                    <label className="select-label required-label">
                      Temporary Property Code
                    </label>

                    <AsyncPaginate
                      additional={{ page: 1 }}
                      debounceTimeout={500}
                      loadOptions={loadPropertyOptions}
                      placeholder="search/select"
                      value={field.value}
                      onChange={(option) => {
                        field.onChange(option);
                      }}
                      isClearable
                      styles={selectStyles}
                    />
                  </div>
                )}
              />

              <Controller
                name="temporaryBedId"
                control={control}
                defaultValue={null}
                render={({ field }) => (
                  <div className={`select-group ${field.value ? "has-value" : ""}`}>
                    <label className="select-label required-label">
                      Bed No
                    </label>

                    <Select
                      {...field}
                      options={TempBedOptions}
                      isClearable
                      placeholder=""
                      value={TempBedOptions.find(
                        (option) => option.value === field.value
                      )}
                      onChange={(selectedOption) =>
                        field.onChange(selectedOption?.value || null)
                      }
                      styles={selectStyles}
                    />
                  </div>
                )}
              />

              <div className="form-group">
                <input
                  {...register("temporaryRoomNo")}
                  placeholder=" "
                  type="text"
                  className="form-input"
                />
                <label className="form-label required-label">
                  Room No
                </label>
              </div>
              <div className="form-group">
                <input
                  {...register("temporaryAcRoom")}
                  placeholder=" "
                  type="text"
                  className="form-input"
                />
                <label className="form-label required-label">
                  AC / Non AC
                </label>
              </div>



              <div className="form-group">
                <input
                  {...register("temporaryMonthlyRent")}
                  placeholder=" "
                  type="number"
                  className="form-input"
                />
                <label className="form-label required-label">
                  Monthly Fixed Rent ( ₹ )
                </label>
              </div>

              <Controller
                name="temporaryClientDoj"
                control={control}
                render={({ field }) => (
                  <div
                    className={`datepicker-group ${field.value ? "has-value" : ""
                      }`}
                  >
                    <label className="datepicker-label required-label">
                      Client DOJ
                    </label>
                    <DatePicker
                      isClearable
                      selected={field.value}
                      onChange={(date) => field.onChange(date)}
                      dateFormat="dd MMM yyyy"
                      className="custom-datepicker"
                    />
                  </div>
                )}
              />

              <Controller
                name="temporaryClientLastDate"
                control={control}
                render={({ field }) => (
                  <div
                    className={`datepicker-group ${field.value ? "has-value" : ""
                      }`}
                  >
                    <label className="datepicker-label required-label">
                      Client Last Date
                    </label>
                    <DatePicker
                      isClearable
                      selected={field.value}
                      onChange={(date) => field.onChange(date)}
                      dateFormat="dd MMM yyyy"
                      className="custom-datepicker"
                    />
                  </div>
                )}
              />

              <div className="form-group">
                <input
                  {...register("temporaryclientCalculatedRent")}
                  placeholder=" "
                  type="number"
                  className="form-input"
                />
                <label className="form-label required-label">
                  Rent Amount As Per Client DOJ ( ₹ )
                </label>
              </div>

              <div className="form-group">
                <input
                  {...register("temporaryParkingCharges")}
                  placeholder=" "
                  type="number"
                  className="form-input"
                />
                <label className="form-label required-label">
                  Parking Charges ( ₹ )
                </label>
              </div>
              <div className="form-group">
                <input
                  {...register("temporaryComments")}
                  placeholder=" "
                  type="text"
                  className="form-input"
                />
                <label className="form-label required-label">
                  Comments
                </label>
              </div>
            </div>
          </div>
        )}
        {/* Footer Buttons */}
        <div className="flex flex-col sm:flex-row justify-end gap-3">
          <button
            type="button"
            onClick={() => window.history.back()}
            className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 sm:flex-none px-6 py-2.5 theme-btn transition-colors flex items-center justify-center gap-2"                    >
            {isLoading ? (
              <>
                <Loader />
                Processing...
              </>
            ) : (
              "Submit Booking"
            )}
          </button>
        </div>
      </form>
      <BookingConfirmationModal
        isOpen={showConfirmationModal}
        data={formPreviewData}
        isLoading={isLoading}
        onClose={() => setShowConfirmationModal(false)}
        onConfirm={handleFinalSubmit}
      />

    </div>
  );
};

export default NewBookingCreateEdit;
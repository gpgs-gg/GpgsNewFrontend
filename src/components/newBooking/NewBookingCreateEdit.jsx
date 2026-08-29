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
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
const NewBookingCreateEdit = () => {
  const dailyDetailsSchema = yup.object({
    dailyPropertyId: yup
      .mixed()
      .required("Daily Property Code is required"),

    dailyBedId: yup
      .string()
      .required("Bed No is required"),

    dailyRoomNo: yup
      .string()
      .trim()
      .required("Room No is required"),

    dailyAcRoom: yup
      .string()
      .required("AC / Non AC is required")
      .oneOf(
        ["AC", "Non AC"],
        "Select a valid AC / Non AC "
      ),

    dailyMonthlyRent: yup
      .number()
      .typeError("Daily Rent is required")
      .required("Daily Rent is required")
      .min(1, "Daily Rent must be greater than 0"),

    dailyClientDoj: yup
      .date()
      .typeError("Client DOJ is required")
      .required("Client DOJ is required"),

    dailyClientLastDate: yup
      .date()
      .nullable()
      .typeError("Invalid Client Last Date")
      .min(
        yup.ref("dailyClientDoj"),
        "Client Last Date cannot be before Client DOJ"
      ),

    dailyclientCalculatedRent: yup
      .number()
      .typeError("Rent Amount is required")
      .required("Rent Amount is required")
      .min(0, "Rent Amount cannot be negative"),

    // dailyParkingCharges: yup
    //   .number()
    //   .typeError("Parking Charges is required")
    //   .required("Parking Charges is required")
    //   .min(0, "Parking Charges cannot be negative"),

    // dailyComments: yup
    //   .string()
    //   .trim()
    //   .required("Comments are required"),
  });

  const clientDetailsAndPropertyDetailsSchema = yup.object({
    fullName: yup
      .string()
      .trim()
      .required("Full Name is required")
      .min(2, "Full Name must be at least 2 characters")
      .max(50, "Full Name cannot exceed 50 characters")
      .matches(/^[A-Za-z\s]+$/, "Only letters and spaces are allowed"),

    whatsappNo: yup
      .string()
      .required("WhatsApp No. is required")
      .matches(/^[6-9]\d{9}$/, "Enter a valid 10 digit mobile number"),

    callingNo: yup
      .string()
      .required("Calling No. is required")
      .matches(/^[6-9]\d{9}$/, "Enter a valid 10 digit mobile number"),

    emergencyContact1FullName: yup
      .string()
      .trim()
      .required("Emergency Contact 1 Name is required")
      .min(2, "Name must be at least 2 characters")
      .matches(/^[A-Za-z\s]+$/, "Only letters and spaces are allowed"),

    emergencyContact1No: yup
      .string()
      .required("Emergency Contact 1 No. is required")
      .matches(/^[6-9]\d{9}$/, "Enter a valid 10 digit mobile number"),

    emergencyContact2FullName: yup
      .string()
      .trim()
      .required("Emergency Contact 2 Name is required")
      .min(2, "Name must be at least 2 characters")
      .matches(/^[A-Za-z\s]+$/, "Only letters and spaces are allowed"),

    emergencyContact2No: yup
      .string()
      .required("Emergency Contact 2 No. is required")
      .matches(/^[6-9]\d{9}$/, "Enter a valid 10 digit mobile number"),

    emailId: yup
      .string()
      .trim()
      .required("Email is required")
      .email("Enter a valid email address"),
    // Ask For Select
    askFor: yup
      .string()
      .required("Please select Ask For")
      .oneOf(
        ["PA", "BA", "FA"],
        "Please select a valid Ask For option"
      ),

    // ================= PERMANENT PROPERTY =================
    propertyId: yup
      .mixed()
      .required("Property Code is required"),

    bedId: yup
      .string()
      .required("Bed No is required"),

    roomNo: yup
      .string()
      .trim()
      .required("Room No is required"),

    acRoom: yup
      .string()
      .required("AC / Non AC is required")
      .oneOf(["AC", "Non AC"], "Please select a valid AC / Non AC option"),

    monthlyRent: yup
      .number()
      .typeError("Monthly Fixed Rent is required")
      .required("Monthly Fixed Rent is required")
      .min(1, "Monthly Rent must be greater than 0"),

    depositAmount: yup
      .number()
      .typeError("Deposit Amount is required")
      .required("Deposit Amount is required")
      .min(0, "Deposit Amount cannot be negative"),

    clientDoj: yup
      .date()
      .typeError("Client DOJ is required")
      .required("Client DOJ is required"),

    clientLastDate: yup
      .date()
      .nullable()
      .typeError("Invalid Client Last Date")
      .min(
        yup.ref("clientDoj"),
        "Client Last Date cannot be before Client DOJ"
      ),

    clientCalculatedRent: yup
      .number()
      .typeError("Rent Amount is required")
      .required("Rent Amount is required")
      .min(0, "Rent Amount cannot be negative"),

    processingFees: yup
      .number()
      .typeError("Processing Fees is required")
      .required("Processing Fees is required")
      .min(0, "Processing Fees cannot be negative"),

    parkingCharges: yup
      .number()
      .typeError("Parking Charges is required")
      .required("Parking Charges is required")
      .min(0, "Parking Charges cannot be negative"),

    // URHD: yup
    //   .string()
    //   .required("Upcoming Rent Hike Date is required"),

    // URHA: yup
    //   .number()
    //   .typeError("Upcoming Rent Hike Amount is required")
    //   .required("Upcoming Rent Hike Amount is required")
    //   .min(0, "Upcoming Rent Hike Amount cannot be negative"),

    // comments: yup
    //   .string()
    //   .trim()
    //   .required("Comments are required"),

    // PA select hone par only required
    partialAmount: yup
      .number()
      .transform((value, originalValue) => {
        return originalValue === "" || originalValue === null
          ? undefined
          : value;
      })
      .nullable()
      .when("askFor", {
        is: (value) => value === "PA",
        then: (schema) =>
          schema
            .required("Partial Amount is required")
            .min(1, "Partial Amount must be greater than 0"),
        otherwise: (schema) =>
          schema.notRequired().nullable(),
      }),
  });

  const clientDetailsSchema = yup.object({
    fullName: yup
      .string()
      .trim()
      .required("Full Name is required")
      .min(2, "Full Name must be at least 2 characters")
      .max(50, "Full Name cannot exceed 50 characters")
      .matches(/^[A-Za-z\s]+$/, "Only letters and spaces are allowed"),

    whatsappNo: yup
      .string()
      .required("WhatsApp No. is required")
      .matches(/^[6-9]\d{9}$/, "Enter a valid 10 digit mobile number"),

    callingNo: yup
      .string()
      .required("Calling No. is required")
      .matches(/^[6-9]\d{9}$/, "Enter a valid 10 digit mobile number"),

    emergencyContact1FullName: yup
      .string()
      .trim()
      .required("Emergency Contact 1 Name is required")
      .min(2, "Name must be at least 2 characters")
      .matches(/^[A-Za-z\s]+$/, "Only letters and spaces are allowed"),

    emergencyContact1No: yup
      .string()
      .required("Emergency Contact 1 No. is required")
      .matches(/^[6-9]\d{9}$/, "Enter a valid 10 digit mobile number"),

    emergencyContact2FullName: yup
      .string()
      .trim()
      .required("Emergency Contact 2 Name is required")
      .min(2, "Name must be at least 2 characters")
      .matches(/^[A-Za-z\s]+$/, "Only letters and spaces are allowed"),

    emergencyContact2No: yup
      .string()
      .required("Emergency Contact 2 No. is required")
      .matches(/^[6-9]\d{9}$/, "Enter a valid 10 digit mobile number"),

    emailId: yup
      .string()
      .trim()
      .required("Email is required")
      .email("Enter a valid email address"),
    // Ask For Select
    askFor: yup
      .string()
      .required("Please select Ask For")
      .oneOf(
        ["PA", "BA", "FA"],
        "Please select a valid Ask For option"
      ),
    })


  const validationSchema = yup.object({
    ...clientDetailsSchema.fields,
    ...dailyDetailsSchema.fields,
  });

  const navigate = useNavigate();
  const { id } = useParams();
  const {
    control,
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(clientDetailsAndPropertyDetailsSchema),
    mode: "onBlur",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [formPreviewData, setFormPreviewData] = useState(null);
  const [activeTab, setActiveTab] = useState("Permanent");
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

      const getBillingDays = (year, month) => {
        const actualDays = new Date(year, month + 1, 0).getDate();

        // Business rule:
        // 31 -> 30
        // 30 -> 30
        // 29 -> 29
        // 28 -> 28
        return actualDays === 31 ? 30 : actualDays;
      };

      let totalRent = 0;

      if (end && !isNaN(end.getTime())) {
        let currentDate = new Date(start);
        let remainingDays = 0;

        while (
          currentDate.getFullYear() < end.getFullYear() ||
          (
            currentDate.getFullYear() === end.getFullYear() &&
            currentDate.getMonth() <= end.getMonth()
          )
        ) {
          const year = currentDate.getFullYear();
          const month = currentDate.getMonth();

          const billingDays = getBillingDays(year, month);

          const startDay =
            currentDate.getFullYear() === start.getFullYear() &&
              currentDate.getMonth() === start.getMonth()
              ? start.getDate()
              : 1;

          const endDay =
            currentDate.getFullYear() === end.getFullYear() &&
              currentDate.getMonth() === end.getMonth()
              ? end.getDate()
              : new Date(year, month + 1, 0).getDate();

          const daysInPeriod =
            endDay - startDay + 1;

          remainingDays += Math.max(daysInPeriod, 0);

          currentDate = new Date(year, month + 1, 1);
        }

        // Rent calculation month-wise
        currentDate = new Date(start);

        while (
          currentDate.getFullYear() < end.getFullYear() ||
          (
            currentDate.getFullYear() === end.getFullYear() &&
            currentDate.getMonth() <= end.getMonth()
          )
        ) {
          const year = currentDate.getFullYear();
          const month = currentDate.getMonth();

          const billingDays = getBillingDays(year, month);

          const startDay =
            currentDate.getFullYear() === start.getFullYear() &&
              currentDate.getMonth() === start.getMonth()
              ? start.getDate()
              : 1;

          const endDay =
            currentDate.getFullYear() === end.getFullYear() &&
              currentDate.getMonth() === end.getMonth()
              ? end.getDate()
              : new Date(year, month + 1, 0).getDate();

          const daysInPeriod =
            endDay - startDay + 1;

          const dailyRent =
            Number(watchMonthlyRent) / billingDays;

          totalRent += dailyRent * Math.max(daysInPeriod, 0);

          currentDate = new Date(year, month + 1, 1);
        }

        totalRent = Math.round(totalRent);
      } else {
        const year = start.getFullYear();
        const month = start.getMonth();

        const billingDays = getBillingDays(year, month);

        const startDay = start.getDate();

        const remainingDays =
          billingDays - startDay + 1;

        const dailyRent =
          Number(watchMonthlyRent) / billingDays;

        totalRent = Math.round(
          dailyRent * remainingDays
        );
      }

      setValue("clientCalculatedRent", totalRent);
    } else {
      setValue("clientCalculatedRent", "");
    }
  }, [
    watchClientDoj,
    watchClientLastDate,
    watchMonthlyRent,
    setValue,
  ]);


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

  const selectedDailyPropertyId =
    watch("dailyPropertyId")?.value;
  const watchDailyClientDoj = watch("dailyClientDoj");
  const watchDailyClientLastDate = watch("dailyClientLastDate");
  const watchDailyMonthlyRent = watch("dailyMonthlyRent");

  const DailyBedOptions =
    bedAvailableData?.data
      ?.filter(
        (bed) =>
          bed.propertyId?._id ===
          selectedDailyPropertyId?.split(",")[0]
      )
      ?.map((bed) => ({
        value: `${bed._id},${bed.bedNo}`,
        label: `${bed.bedNo}`,
        bedData: bed,
      })) || [];


  useEffect(() => {
    if (watchDailyClientDoj && watchDailyMonthlyRent) {
      const start = new Date(watchDailyClientDoj);
      const end = watchDailyClientLastDate
        ? new Date(watchDailyClientLastDate)
        : null;

      start.setHours(0, 0, 0, 0);

      if (end) {
        end.setHours(0, 0, 0, 0);
      }

      if (isNaN(start.getTime())) {
        setValue("dailyclientCalculatedRent", "");
        return;
      }

      // ================= BILLING DAYS =================
      const getBillingDays = (year, month) => {
        const actualDays = new Date(
          year,
          month + 1,
          0
        ).getDate();

        // 31 days => 30
        // 30 days => 30
        // February => 28 / 29
        return actualDays === 31 ? 30 : actualDays;
      };

      let totalRent = 0;

      // ================= LAST DATE GIVEN =================
      if (end && !isNaN(end.getTime())) {
        let currentDate = new Date(start);

        while (
          currentDate.getFullYear() < end.getFullYear() ||
          (
            currentDate.getFullYear() === end.getFullYear() &&
            currentDate.getMonth() <= end.getMonth()
          )
        ) {
          const year = currentDate.getFullYear();
          const month = currentDate.getMonth();

          const billingDays = getBillingDays(year, month);

          const startDay =
            year === start.getFullYear() &&
              month === start.getMonth()
              ? start.getDate()
              : 1;

          const actualLastDay = new Date(
            year,
            month + 1,
            0
          ).getDate();

          const endDay =
            year === end.getFullYear() &&
              month === end.getMonth()
              ? end.getDate()
              : actualLastDay;

          const daysInPeriod =
            endDay - startDay + 1;

          // Monthly rent → Daily rent
          const dailyRent =
            Number(watchDailyMonthlyRent) /
            billingDays;

          totalRent +=
            dailyRent * Math.max(daysInPeriod, 0);

          currentDate = new Date(
            year,
            month + 1,
            1
          );
        }

        totalRent = Math.round(totalRent);
      }

      // ================= NO LAST DATE =================
      else {
        const year = start.getFullYear();
        const month = start.getMonth();

        const billingDays = getBillingDays(
          year,
          month
        );

        const startDay = start.getDate();

        const remainingDays =
          billingDays - startDay + 1;

        const dailyRent =
          Number(watchDailyMonthlyRent) /
          billingDays;

        totalRent = Math.round(
          dailyRent * remainingDays
        );
      }

      setValue(
        "dailyclientCalculatedRent",
        totalRent * 2
      );
    } else {
      setValue(
        "dailyclientCalculatedRent",
        ""
      );
    }
  }, [
    watchDailyClientDoj,
    watchDailyClientLastDate,
    watchDailyMonthlyRent,
    setValue,
  ]);


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

      if (end) {
        end.setHours(0, 0, 0, 0);
      }

      if (isNaN(start.getTime())) {
        setValue("temporaryclientCalculatedRent", "");
        return;
      }

      const getBillingDays = (year, month) => {
        const actualDays = new Date(
          year,
          month + 1,
          0
        ).getDate();

        return actualDays === 31 ? 30 : actualDays;
      };

      let totalTempRent = 0;

      if (end && !isNaN(end.getTime())) {
        let currentDate = new Date(start);

        while (
          currentDate.getFullYear() < end.getFullYear() ||
          (
            currentDate.getFullYear() === end.getFullYear() &&
            currentDate.getMonth() <= end.getMonth()
          )
        ) {
          const year = currentDate.getFullYear();
          const month = currentDate.getMonth();

          const billingDays = getBillingDays(
            year,
            month
          );

          const startDay =
            year === start.getFullYear() &&
              month === start.getMonth()
              ? start.getDate()
              : 1;

          const actualLastDay = new Date(
            year,
            month + 1,
            0
          ).getDate();

          const endDay =
            year === end.getFullYear() &&
              month === end.getMonth()
              ? end.getDate()
              : actualLastDay;

          const diffDays =
            endDay - startDay + 1;

          const dailyRent =
            Number(watchTempMonthlyRent) /
            billingDays;

          totalTempRent +=
            dailyRent * Math.max(diffDays, 0);

          currentDate = new Date(
            year,
            month + 1,
            1
          );
        }

        totalTempRent = Math.round(totalTempRent);
      } else {
        const year = start.getFullYear();
        const month = start.getMonth();

        const billingDays = getBillingDays(
          year,
          month
        );

        const startDay = start.getDate();

        const remainingDays =
          billingDays - startDay + 1;

        const dailyRent =
          Number(watchTempMonthlyRent) /
          billingDays;

        totalTempRent = Math.round(
          dailyRent * remainingDays
        );
      }

      setValue(
        "temporaryclientCalculatedRent",
        totalTempRent
      );
    } else {
      setValue(
        "temporaryclientCalculatedRent",
        ""
      );
    }
  }, [
    watchTempClientDoj,
    watchTempClientLastDate,
    watchTempMonthlyRent,
    setValue,
  ]);



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



  useEffect(() => {
    if (!selectedDailyPropertyId) {
      setValue("dailyBedId", null);
      setValue("dailyRoomNo", "");
      setValue("dailyAcRoom", "");
      setValue("dailyMonthlyRent", "");
      setValue("dailyclientCalculatedRent", "");
      return;
    }
  }, [selectedDailyPropertyId, setValue]);


  const selectedDailyBedId = watch("dailyBedId");

  useEffect(() => {
    if (!selectedDailyBedId) {
      setValue("dailyRoomNo", "");
      setValue("dailyAcRoom", "");
      setValue("dailyMonthlyRent", "");
      setValue("dailyclientCalculatedRent", "");
      return;
    }

    const selectedBed = DailyBedOptions.find(
      (bed) => bed.value === selectedDailyBedId
    );

    if (!selectedBed) return;

    const bedData = selectedBed.bedData;

    setValue("dailyRoomNo", bedData.roomNo || "");
    setValue("dailyAcRoom", bedData.acRoom || "");
    setValue("dailyMonthlyRent", bedData.monthlyRent || "");
  }, [selectedDailyBedId, DailyBedOptions, setValue]);


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
            // "dailyPropertyId",
            // "dailyBedId",
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
            // "dailyClientDoj",
            // "dailyClientLastDate",
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
      // const dailyMonthlyRent = Number(
      //   payload.dailyMonthlyRent || 0
      // );

      // const dailyclientCalculatedRent = Number(
      //   payload.dailyclientCalculatedRent || 0
      // );

      // const dailyParkingCharges = Number(
      //   payload.dailyParkingCharges || 0
      // );

      // agr daily boking uncomment kro to ye comment kro .....................
      payload.totalAmount = clientCalculatedRent + depositAmount + processingFees + parkingCharges + temporaryclientCalculatedRent + temporaryParkingCharges
      // payload.bookingAmount = payload.askFor === "FA" ? payload.totalAmount : monthlyRent;
      payload.bookingAmount = payload.askFor === "FA" ? payload.totalAmount : payload.askFor === "PA" ? partialAmount : monthlyRent;
      payload.balanceAmount =
        payload.totalAmount - payload.bookingAmount;
      payload.temporaryTotalAmount = temporaryclientCalculatedRent + temporaryParkingCharges;

      // ================= DAILY BOOKING =================
      // if (formPreviewData?.isDailyBooking) {
      //   // Rent × 2
      //   payload.dailyclientCalculatedRent =
      //     dailyclientCalculatedRent * 2;

      //   // Deposit = original rent amount
      //   payload.depositAmount =
      //     dailyclientCalculatedRent;

      //   // Parking same rahega
      //   payload.dailyTotalAmount =
      //     payload.dailyclientCalculatedRent +
      //     payload.depositAmount +
      //     dailyParkingCharges;

      //   payload.totalAmount =
      //     payload.dailyTotalAmount;

      //   payload.bookingAmount =
      //     payload.totalAmount;

      //   payload.balanceAmount = 0;

      //   payload.isDailyBooking = true;
      // } else {
      //   // ================= NORMAL BOOKING =================
      //   payload.totalAmount =
      //     clientCalculatedRent +
      //     depositAmount +
      //     processingFees +
      //     parkingCharges +
      //     temporaryclientCalculatedRent +
      //     temporaryParkingCharges;

      //   payload.bookingAmount =
      //     payload.askFor === "FA"
      //       ? payload.totalAmount
      //       : payload.askFor === "PA"
      //         ? partialAmount
      //         : monthlyRent;

      //   payload.balanceAmount =
      //     payload.totalAmount - payload.bookingAmount;

      //   payload.temporaryTotalAmount =
      //     temporaryclientCalculatedRent +
      //     temporaryParkingCharges;
      // }





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

      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };



  const handleDailySubmit = async () => {
    try {
      const data = watch();

      await validationSchema.validate(data, {
        abortEarly: false,
      });

      setFormPreviewData({
        ...data,

        // Daily ko Temporary ke through handle karenge
        stayType: "T. Booked",
        bookingType: "Daily",

        // Daily fields → Temporary fields
        temporaryPropertyId: data.dailyPropertyId,
        temporaryBedId: data.dailyBedId,
        temporaryRoomNo: data.dailyRoomNo,
        temporaryAcRoom: data.dailyAcRoom,

        temporaryClientDoj: data.dailyClientDoj,
        temporaryClientLastDate: data.dailyClientLastDate,

        temporaryMonthlyRent: data.dailyMonthlyRent,
        temporaryclientCalculatedRent:
          data.dailyclientCalculatedRent,

        temporaryParkingCharges:
          data.dailyParkingCharges,

        temporaryComments: data.dailyComments,

        // Daily ki identification key nahi bhejni
        // isDailyBooking: true ❌
      });

      setShowConfirmationModal(true);

    } 
   catch (error) {
  if (error.inner?.length) {
    toast.dismiss();

    // Sirf first error show hoga
    toast.error(error.inner[0].message, {
      autoClose: 3000,
    });
  } else {
    toast.error(
      error.message || "Please check the form"
    );
  }
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

              {errors.fullName && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.fullName.message}
                </p>
              )}
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
              {errors.whatsappNo && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.whatsappNo.message}
                </p>
              )}
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
              {errors.callingNo && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.callingNo.message}
                </p>
              )}
            </div>
            <div className="form-group">
              <input
                {...register("emergencyContact1FullName")}
                placeholder=" "
                className="form-input"
              />
              <label className="form-label required-label">
                Emergency Contact1 Full Name </label>
              {errors.emergencyContact1FullName && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.emergencyContact1FullName.message}
                </p>
              )}
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
              {errors.emergencyContact1No && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.emergencyContact1No.message}
                </p>
              )}
            </div>
            <div className="form-group">
              <input
                {...register("emergencyContact2FullName")}
                placeholder=" "
                className="form-input"
              />
              <label className="form-label required-label">
                Emergency Contact2 Full Name </label>
              {errors.emergencyContact2FullName && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.emergencyContact2FullName.message}
                </p>
              )}
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
              {errors.emergencyContact2No && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.emergencyContact2No.message}
                </p>
              )}
            </div>


            <div className="form-group">
              <input
                {...register("emailId")}
                placeholder=" "
                className="form-input"
              />
              <label className="form-label required-label">
                Email Id </label>
              {errors.emailId && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.emailId.message}
                </p>
              )}
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
                  {errors.askFor && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.askFor.message}
                    </p>
                  )}
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

          <button
            type="button"
            onClick={() => setActiveTab("daily")}
            className={`px-4 py-2 rounded-lg font-medium ${activeTab === "daily"
              ? "theme-btn text-white"
              : "bg-gray-100 text-gray-700"
              }`}
          >
            Daily Basis Property Detials
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
                    {errors.propertyId && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.propertyId.message}
                      </p>
                    )}
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
                    {errors.bedId && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.bedId.message}
                      </p>
                    )}
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
                {errors.roomNo && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.roomNo.message}
                  </p>
                )}
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
                {errors.acRoom && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.acRoom.message}
                  </p>
                )}
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
                {errors.monthlyRent && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.monthlyRent.message}
                  </p>
                )}
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
                {errors.depositAmount && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.depositAmount.message}
                  </p>
                )}
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
                    {errors.clientDoj && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.clientDoj.message}
                      </p>
                    )}
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
                    <label className="datepicker-label">
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
                {errors.clientCalculatedRent && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.clientCalculatedRent.message}
                  </p>
                )}
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
                {errors.processingFees && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.processingFees.message}
                  </p>
                )}
              </div>
              <div className="form-group">
                <input
                  {...register("parkingCharges")}
                  placeholder=" "
                  type="number"
                  className="form-input"
                />
                <label className="form-label ">
                  Parking Charges ( ₹ )
                </label>
                {errors.parkingCharges && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.parkingCharges.message}
                  </p>
                )}
              </div>

              <div className="form-group">
                <input
                  {...register("URHD")}
                  placeholder=" "
                  type="text"
                  className="form-input"
                />
                <label className="form-label">
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
                <label className="form-label ">
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
                <label className="form-label ">
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
                  {errors.partialAmount && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.partialAmount.message}
                    </p>
                  )}
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
                <label className="form-label ">
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
                <label className="form-label ">
                  Comments
                </label>
              </div>
            </div>
          </div>
        )}

        {activeTab === "daily" && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Daily Basis Property Details</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

              <Controller
                name="dailyPropertyId"
                control={control}
                defaultValue={null}
                render={({ field }) => (
                  <div className={`select-group ${field.value ? "has-value" : ""}`}>
                    <label className="select-label required-label">
                      Daily Property Code
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
                name="dailyBedId"
                control={control}
                defaultValue={null}
                render={({ field }) => (
                  <div className={`select-group ${field.value ? "has-value" : ""}`}>
                    <label className="select-label required-label">
                      Bed No
                    </label>

                    <Select
                      {...field}
                      options={DailyBedOptions}
                      isClearable
                      placeholder=""
                      value={DailyBedOptions.find(
                        (option) => option.value === field.value
                      ) || null}
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
                  {...register("dailyRoomNo")}
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
                  {...register("dailyAcRoom")}
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
                  {...register("dailyMonthlyRent")}
                  placeholder=" "
                  type="number"
                  className="form-input"
                />
                <label className="form-label required-label">
                  Monthly Fixed Rent ( ₹ )
                </label>
              </div>

              <Controller
                name="dailyClientDoj"
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
                name="dailyClientLastDate"
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
                  {...register("dailyclientCalculatedRent")}
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
                  {...register("dailyParkingCharges")}
                  placeholder=" "
                  type="number"
                  className="form-input"
                />
                <label className="form-label ">
                  Parking Charges ( ₹ )
                </label>
              </div>
              <div className="form-group">
                <input
                  {...register("dailyComments")}
                  placeholder=" "
                  type="text"
                  className="form-input"
                />
                <label className="form-label ">
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
          {activeTab === "daily" ? (
            <button
              type="button"
              onClick={handleDailySubmit}
              disabled={isLoading}
              className="flex-1 sm:flex-none px-6 py-2.5 theme-btn transition-colors flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader />
                  Processing...
                </>
              ) : (
                "Submit Daily Booking"
              )}
            </button>
          ) : (
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 sm:flex-none px-6 py-2.5 theme-btn transition-colors flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader />
                  Processing...
                </>
              ) : (
                "Submit Booking"
              )}
            </button>
          )}
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
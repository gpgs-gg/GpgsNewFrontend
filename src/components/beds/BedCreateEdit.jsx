import React, { useEffect, useState } from "react";
import Select from "react-select";

import { useForm, Controller } from "react-hook-form";
import { XCircle } from "lucide-react";
import { selectStyles } from "../../utils/selectStyles";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useParams } from "react-router-dom";
import FilePreview from "../common/FilePreview";
import Loader from "../common/Loader";
import {
  usecreateBedData,
  usePropertiesDropdown,
  useSingleBedsData,
  useUpdateBedsData,
} from "./services";
import { AsyncPaginate } from "react-select-async-paginate";
import { getPropertyDropdown } from "../properties/services";
import { useSharingTypes } from "../Options/services";
const BedCreateEdit = () => {
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
    defaultValues: {
      status: "Active",
    },
    mode: "onSubmit",
  });
  const { mutate: submitBed, isPending: isSubmitBed } = usecreateBedData();
  const { data: singleBedData, isPending: isSingleBed } = useSingleBedsData(id);
  const { mutate: updateBedData, isPending: isUpdateBed } =
    useUpdateBedsData(id);
  const { data: propertiesDropdown, isPending: ispropertiesDropdown } =
    usePropertiesDropdown();
  const { data: sharingTypeData } = useSharingTypes();

  const sharingTypes = sharingTypeData?.[0]?.items || [];

  const Bed = singleBedData?.data;

  const genderOptions = [
    { value: "Male", label: "Male" },
    { value: "Female", label: "Female" },
    { value: "Any", label: "Any" },
  ];

  const sharingTypeOptions = sharingTypes.map((type) => ({
    value: type.value,
    label: type.label,
  }));
  const bathAttachedOptions = [
    { value: "Yes", label: "Yes" },
    { value: "No", label: "No" },
  ];

  const acRoomOptions = [
    { value: "AC", label: "AC" },
    { value: "Non AC", label: "Non AC" },
  ];

  const statusOptions = [
    { value: "Active", label: "Active" },
    { value: "Inactive", label: "Inactive" },
  ];

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

  const selectedProperty = watch("propertyId");

  const bedCountOptions = Array.from(
    { length: Number(selectedProperty?.bedCount || 0) },
    (_, index) => ({
      value: `${index + 1}`,
      label: `${index + 1}`,
    }),
  );

  useEffect(() => {
    const Bed = singleBedData?.data;
    console.log(Bed);
    if (!Bed) return;
    reset({
      propertyId: {
        value: Bed.propertyId._id,
        label: Bed.propertyId.propertyCode,
        bedCount: Bed.propertyId.bedCount,
        location: Bed.propertyId.propertyLocation,
      },
      roomNo: Bed.roomNo,
      freeEbAsPerBed: Bed.freeEbAsPerBed,
      bedNo: Bed.bedNo,
      gender: Bed.gender,
      sharingType: Bed.sharingType,
      bathAttached: Bed.bathAttached,
      acRoom: Bed.acRoom,
      monthlyRent: Bed.monthlyRent,
      securityDepositMultiplicationFactor:
        Bed.securityDepositMultiplicationFactor,
      upcomingRentHikeDate: Bed.upcomingRentHikeDate
        ? new Date(Bed.upcomingRentHikeDate)
        : null,
      upcomingRentHikeAmount: Bed.upcomingRentHikeAmount,
      previousRentHikeDate: Bed.previousRentHikeDate
        ? new Date(Bed.previousRentHikeDate)
        : null,
      comment: Bed.comment,
      status: Bed.status || "Active",
    });
  }, [singleBedData, reset]);

  const onSubmit = (data) => {
    // Convert dates to ISO string
    const payload = {};
    Object.keys(data).forEach((key) => {
      const value = data[key];

      if (key === "propertyId") {
        payload.propertyId = value?.value || null;
      } else if (value instanceof Date) {
        payload[key] = value.toISOString();
      } else if (value !== undefined && value !== null) {
        payload[key] = value;
      }
    });
    // CREATE MODE
    // Status is always Active when creating a bed
    if (!id) {
      payload.status = "Active";
    }
    // EDIT MODE
    if (id) {
      updateBedData(
        { id, data: payload }, // Sending as object, not FormData
        {
          onSuccess: (response) => {
            toast.dismiss();
            toast.success(response?.message || "Updated successfully");
            navigate("/Beds");
          },
          onError: (error) => {
            toast.dismiss();
            toast.error(error?.response?.data?.message || "Update failed");
          },
        },
      );
      return;
    }
    // CREATE MODE
    submitBed(payload, {
      // Sending as object, not FormData
      onSuccess: (response) => {
        toast.dismiss();
        toast.success(response?.message || "Created successfully");
        navigate("/Beds");
      },
      onError: (error) => {
        const errorMessage =
          error?.response?.data?.message ||
          error?.message ||
          "Something went wrong";
        toast.dismiss();
        toast.error(errorMessage);
      },
    });
  };

  const input =
    "w-full border border-gray-300 rounded-lg px-3 py-2 hover focus:ring-2 focus:ring-gray-500 outline-none";

  return (
    <div className="max-w-12xl mx-auto px-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">
                {id ? "Update Bed" : "Create Bed"}
              </h1>
              <p className="text-sm text-gray-500">
                {id
                  ? "Update existing Bed details"
                  : "Create and manage PG Beds"}
              </p>
            </div>
            <div className="flex justify-end gap-5">
              <button
                type="button"
                onClick={() => window.history.back()}
                className="border border-gray-600 hover:bg-gray-700 hover:text-white px-6 py-2 rounded-lg font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isUpdateBed || isSubmitBed}
                className="theme-btn text-white px-4 py-2 rounded-lg hover:bg-gray-700"
              >
                {isUpdateBed || isSubmitBed ? (
                  <>
                    <Loader />
                    Processing...
                  </>
                ) : id ? (
                  "Update Bed"
                ) : (
                  "Create Bed"
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Bed Details */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold mb-4">Bed Details</h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* property code  */}
            <Controller
              name="propertyId"
              control={control}
              rules={{
                required: "Property Code is required",
              }}
              render={({ field }) => {
                return (
                  <div>
                    <div
                      className={`select-group ${
                        field.value ? "has-value" : ""
                      }`}
                    >
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
                        isDisabled={!!id}
                        styles={selectStyles}
                      />
                    </div>

                    {errors.propertyId && (
                      <p className="mt-1 text-xs text-red-500">
                        {errors.propertyId.message}
                      </p>
                    )}
                  </div>
                );
              }}
            />
            {/*Bed No.  */}
            <Controller
              name="bedNo"
              control={control}
              rules={{
                required: "Bed No is required",
              }}
              render={({ field }) => (
                <div>
                  <div
                    className={`select-group ${field.value ? "has-value" : ""}`}
                  >
                    <label className="select-label required-label">
                      Bed No
                    </label>

                    <Select
                      options={bedCountOptions}
                      isClearable
                      placeholder=""
                      value={
                        bedCountOptions.find(
                          (option) => option.value === field.value,
                        ) || null
                      }
                      onChange={(selectedOption) =>
                        field.onChange(selectedOption?.value || "")
                      }
                      isDisabled={!!id}
                      styles={selectStyles}
                    />
                  </div>

                  {errors.bedNo && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.bedNo.message}
                    </p>
                  )}
                </div>
              )}
            />
            {/* Room No. */}
            <div className="form-group">
              <input
                {...register("roomNo", {
                  required: "Room No is required",
                  validate: (value) =>
                    value?.trim() !== "" || "Room No is required",
                })}
                placeholder=" "
                className={`form-input ${
                  errors.roomNo ? "border-red-500" : ""
                }`}
              />

              <label className="form-label required-label">Room No</label>

              {errors.roomNo && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.roomNo.message}
                </p>
              )}
            </div>

            {/* Gender */}
            <Controller
              name="gender"
              control={control}
              rules={{
                required: "Gender is required",
              }}
              render={({ field }) => (
                <div>
                  <div
                    className={`select-group ${field.value ? "has-value" : ""}`}
                  >
                    <label className="select-label required-label">
                      Gender
                    </label>

                    <Select
                      options={genderOptions}
                      isClearable
                      placeholder=""
                      value={
                        genderOptions.find(
                          (option) => option.value === field.value,
                        ) || null
                      }
                      onChange={(selectedOption) =>
                        field.onChange(selectedOption?.value || "")
                      }
                      styles={selectStyles}
                    />
                  </div>

                  {errors.gender && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.gender.message}
                    </p>
                  )}
                </div>
              )}
            />
            {/* Sharing Type */}
            <Controller
              name="sharingType"
              control={control}
              rules={{
                required: "Sharing Type is required",
              }}
              render={({ field }) => (
                <div>
                  <div
                    className={`select-group ${field.value ? "has-value" : ""}`}
                  >
                    <label className="select-label required-label">
                      Sharing Type
                    </label>

                    <Select
                      options={sharingTypeOptions}
                      isClearable
                      placeholder=""
                      value={
                        sharingTypeOptions.find(
                          (option) => option.value === field.value,
                        ) || null
                      }
                      onChange={(selectedOption) =>
                        field.onChange(selectedOption?.value || "")
                      }
                      styles={selectStyles}
                    />
                  </div>

                  {errors.sharingType && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.sharingType.message}
                    </p>
                  )}
                </div>
              )}
            />
            {/* Bath Attached */}
            <Controller
              name="bathAttached"
              control={control}
              rules={{
                required: "Bath Attached is required",
              }}
              render={({ field }) => (
                <div>
                  <div
                    className={`select-group ${field.value ? "has-value" : ""}`}
                  >
                    <label className="select-label required-label">
                      Bath Attached
                    </label>

                    <Select
                      options={bathAttachedOptions}
                      isClearable
                      placeholder=""
                      value={
                        bathAttachedOptions.find(
                          (option) => option.value === field.value,
                        ) || null
                      }
                      onChange={(selectedOption) =>
                        field.onChange(selectedOption?.value || "")
                      }
                      styles={selectStyles}
                    />
                  </div>

                  {errors.bathAttached && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.bathAttached.message}
                    </p>
                  )}
                </div>
              )}
            />
            {/* AC / Non AC */}
            <Controller
              name="acRoom"
              control={control}
              rules={{
                required: "AC Room is required",
              }}
              render={({ field }) => (
                <div>
                  <div
                    className={`select-group ${field.value ? "has-value" : ""}`}
                  >
                    <label className="select-label required-label">
                      AC Room
                    </label>

                    <Select
                      options={acRoomOptions}
                      isClearable
                      placeholder=""
                      value={
                        acRoomOptions.find(
                          (option) => option.value === field.value,
                        ) || null
                      }
                      onChange={(selectedOption) =>
                        field.onChange(selectedOption?.value || "")
                      }
                      styles={selectStyles}
                    />
                  </div>

                  {errors.acRoom && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.acRoom.message}
                    </p>
                  )}
                </div>
              )}
            />
            {/* Monthly Rent */}
            <div className="form-group">
              <input
                {...register("monthlyRent", {
                  required: "Monthly Rent is required",
                  validate: (value) => {
                    if (value === "" || value === null) {
                      return "Monthly Rent is required";
                    }

                    if (Number(value) <= 0) {
                      return "Monthly Rent must be greater than 0";
                    }

                    return true;
                  },
                })}
                placeholder=" "
                type="number"
                min="0"
                step="0.01"
                className={`form-input ${
                  errors.monthlyRent ? "border-red-500" : ""
                }`}
              />

              <label className="form-label required-label">Monthly Rent</label>

              {errors.monthlyRent && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.monthlyRent.message}
                </p>
              )}
            </div>
            {/* Security Deposit Multiplier Validation */}
            <div className="form-group">
              <input
                {...register("securityDepositMultiplicationFactor", {
                  required: "Security Deposit Multiplier is required",
                  validate: (value) => {
                    if (value === "" || value === null) {
                      return "Security Deposit Multiplier is required";
                    }

                    if (Number(value) <= 0) {
                      return "Security Deposit Multiplier must be greater than 0";
                    }

                    return true;
                  },
                })}
                placeholder=" "
                type="number"
                min="0"
                step="0.01"
                className={`form-input ${
                  errors.securityDepositMultiplicationFactor
                    ? "border-red-500"
                    : ""
                }`}
              />

              <label className="form-label required-label">
                Security Deposit (Multiplier)
              </label>

              {errors.securityDepositMultiplicationFactor && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.securityDepositMultiplicationFactor.message}
                </p>
              )}
            </div>

            <Controller
              name="upcomingRentHikeDate"
              control={control}
              render={({ field }) => (
                <div
                  className={`datepicker-group ${field.value ? "has-value" : ""}`}
                >
                  <label className="datepicker-label">
                    Upcoming Rent Hike Date
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
                {...register("upcomingRentHikeAmount")}
                placeholder=" "
                type="number"
                className="form-input"
              />
              <label className="form-label">Upcoming Rent Hike Amount</label>
            </div>







            <Controller
              name="previousRentHikeDate"
              control={control}
              render={({ field }) => (
                <div
                  className={`datepicker-group ${field.value ? "has-value" : ""}`}
                >
                  <label className="datepicker-label">
                    Previous Rent Hike Date
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
                {...register("freeEbAsPerBed", 
                   {
                  required: "Free EB Amount is required",
                  validate: (value) =>
                    value?.trim() !== "" || "Free EB Amount is required",
                }
                )}
                placeholder="eg - 5,6,8"
                type="number"
                className="form-input"
              />
              <label className="form-label required-label">Free EB As Per Bed</label>
                 {errors.freeEbAsPerBed && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.freeEbAsPerBed.message}
                </p>
              )}
            </div>



            <div className="form-group">
              <input
                {...register("comment")}
                placeholder=" "
                className="form-input"
              />
              <label className="form-label">Comment</label>
            </div>
            {/* Bed Status */}
            {id && (
              <Controller
                name="status"
                control={control}
                rules={{
                  required: "Status is required",
                }}
                render={({ field }) => (
                  <div>
                    <div
                      className={`select-group ${
                        field.value ? "has-value" : ""
                      }`}
                    >
                      <label className="select-label required-label">
                        Status
                      </label>

                      <Select
                        value={
                          statusOptions.find(
                            (option) => option.value === field.value,
                          ) || null
                        }
                        onChange={(selectedOption) =>
                          field.onChange(selectedOption?.value || "")
                        }
                        options={statusOptions}
                        isClearable
                        isSearchable={false}
                        placeholder=""
                        styles={selectStyles}
                      />
                    </div>

                    {errors.status && (
                      <p className="mt-1 text-xs text-red-500">
                        {errors.status.message}
                      </p>
                    )}
                  </div>
                )}
              />
            )}
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex justify-end gap-5">
          <button
            type="button"
            onClick={() => window.history.back()}
            className="border border-gray-600 hover:bg-gray-700 hover:text-white px-6 py-2 rounded-lg font-medium"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isUpdateBed || isSubmitBed}
            className="theme-btn text-white px-4 py-2 rounded-lg hover:bg-gray-700"
          >
            {isUpdateBed || isSubmitBed ? (
              <>
                <Loader />
                Processing...
              </>
            ) : id ? (
              "Update Bed"
            ) : (
              "Create Bed"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default BedCreateEdit;
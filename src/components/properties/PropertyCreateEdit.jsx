import React, { useEffect, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import Select from "react-select";
import { useForm, Controller } from "react-hook-form";
import { XCircle } from "lucide-react";
import { selectStyles } from "../../utils/selectStyles";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  usecreatePropertyData,
  useSinglePropertiesData,
  useUpdatePropertiesData,
} from "./services";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useParams } from "react-router-dom";
import FilePreview from "../common/FilePreview";
import Loader from "../common/Loader";
import { convertStringFormatDate } from "../../utils/dateFormatter";
import { useLocations } from "../Options/services";
const PropertyCreateEdit = () => {
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
      propertyCode: "",
      status: "Active",
      propertyLocation: "",
      bedCount: "",
      propertyAddress: "",
      internet: {
        vendorLoginId: "",
        vendorLoginPassword: "",
        consumerId: "",
        contactNo1: "",
        contactNo2: "",
        wifiName: "",
        wifiPwd: "",
        routerConnectionType: "",
        mainRouterPropertyCode: "",
        gpgsRegisteredNoWithInternetVendor: "",
      },
    },
    mode: "onSubmit",
  });
  // API hooks and mutations
  const { mutate: submitProperty, isPending: isSubmitProperty } =
    usecreatePropertyData();
  const { data: singlePropertyData, isPending: isSingleProperty } =
    useSinglePropertiesData(id);
  const { mutate: updatePropertyData, isPending: isUpdateProperty } =
    useUpdatePropertiesData(id);
  // get locations
  const { data, error } = useLocations();
  const locations = data?.[0]?.items || [];

  //    define for global scope
  const property = singlePropertyData?.data;
  const [aadharFiles, setAadharFiles] = useState([]);
  const [photoFiles, setPhotoFiles] = useState([]);
  const [agreementFiles, setAgreementFiles] = useState([]);
  const [existingAadhar, setExistingAadhar] = useState([]);
  const [existingPhoto, setExistingPhoto] = useState([]);
  const [existingAgreementFiles, setExistingAgreementFiles] = useState([]);
  const [showVendorPassword, setShowVendorPassword] = useState(false);
  useEffect(() => {
    const property = singlePropertyData?.data;
    if (!property) return;

    reset({
      propertyCode: property.propertyCode,
      status: property.status || "Active",
      propertyLocation: property.propertyLocation,
      bedCount: property.bedCount,
      propertyAddress: property.propertyAddress,

      internet: {
        ...property.internet,
      },

      utility: {
        ...property.utility,

        ebStartCycle: property.utility?.ebStartCycle ?? "",
        ebEndCycle: property.utility?.ebEndCycle ?? "",

        gasBillStartCycle: property.utility?.gasBillStartCycle ?? "",
        gasBillEndCycle: property.utility?.gasBillEndCycle ?? "",

        waterBillStartCycle: property.utility?.waterBillStartCycle ?? "",
        waterBillEndCycle: property.utility?.waterBillEndCycle ?? "",
      },

      owner: {
        fullName: property.owner?.fullName,
        contactNo1: property.owner?.contactNo1,
        contactNo2: property.owner?.contactNo2,
        emergencyContactName: property.owner?.emergencyContactName,
        emergencyContactNo: property.owner?.emergencyContactNo,
      },

      agreement: {
        ...property.agreement,
        propertyStartDate: property.agreement?.propertyStartDate
          ? new Date(property.agreement.propertyStartDate)
          : null,
        propertyEndDate: property.agreement?.propertyEndDate
          ? new Date(property.agreement.propertyEndDate)
          : null,
        agreementStartDate: property.agreement?.agreementStartDate
          ? new Date(property.agreement.agreementStartDate)
          : null,
        agreementEndDate: property.agreement?.agreementEndDate
          ? new Date(property.agreement.agreementEndDate)
          : null,
      },
    });
  }, [singlePropertyData, reset]);

  useEffect(() => {
    const property = singlePropertyData?.data;
    if (!property) return;

    setExistingAadhar(property?.owner?.aadharCard || []);
    setExistingPhoto(property?.owner?.photo || []);
    setExistingAgreementFiles(property?.agreement?.attachment || []);
  }, [singlePropertyData]);

  const statusOptions = [
    { value: "Active", label: "Active" },
    { value: "Inactive", label: "Inactive" },
  ];
  const PoliceNocStatusOptions = [
    { value: "Approved", label: "Approved" },
    { value: "Rejected", label: "Rejected" },
  ];

  const RouterConnectionTypeOptions = [
    { value: "Main Router", label: "Main Router" },
    { value: "Sub Router", label: "Sub Router" },
  ];
  const LocationOptions = locations.map((location) => ({
    value: location.value,
    label: location.label,
  }));

  const buildFormData = (formData, data, parentKey = "") => {
    Object.keys(data).forEach((key) => {
      const value = data[key];

      const formKey = parentKey ? `${parentKey}[${key}]` : key;

      // File
      if (value instanceof File) {
        formData.append(formKey, value);
      }

      // Array (MULTIPLE FILE FIX)
      else if (Array.isArray(value)) {
        value.forEach((file) => {
          formData.append(formKey, file);
        });
      }

      // Nested object
      else if (value && typeof value === "object" && !(value instanceof Date)) {
        buildFormData(formData, value, formKey);
      }

      // Date
      else if (value instanceof Date) {
        formData.append(formKey, convertStringFormatDate(value));
      }

      // Normal value
      else {
        formData.append(formKey, value ?? "");
      }
    });
  };

  const onSubmit = (data) => {
    if (!id) {
      data.status = "Active";
    }
    const formData = new FormData();

    buildFormData(formData, data);

    // ✅ existing files (correct way)
    existingAadhar.forEach((url) => {
      formData.append("owner[aadharCardExisting]", url);
    });

    existingPhoto.forEach((url) => {
      formData.append("owner[photoExisting]", url);
    });
    existingAgreementFiles.forEach((url) => {
      formData.append("agreement[attachmentExisting]", url);
    });

    // 👉 EDIT MODE
    if (id) {
      updatePropertyData(
        { id, data: formData },
        {
          onSuccess: (response) => {
            toast.dismiss();
            toast.success(response?.message || "Updated successfully");
            navigate("/properties");
          },
          onError: (error) => {
            const errorMessage =
              error?.response?.data?.message ||
              error?.message ||
              "Something went wrong";
            toast.dismiss();
            toast.error(errorMessage);
          },
        },
      );
      return;
    }
    // 👉 CREATE MODE
    submitProperty(formData, {
      onSuccess: (response) => {
        toast.dismiss();
        toast.success(response?.message || "Created successfully");
        navigate("/properties");
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

  const removeFile = (type, index, isExisting = false) => {
    if (type === "aadharCard") {
      if (isExisting) {
        setExistingAadhar((prev) => prev.filter((_, i) => i !== index));
      } else {
        setAadharFiles((prev) => {
          const updated = prev.filter((_, i) => i !== index);
          setValue("owner.aadharCard", updated);
          return updated;
        });
      }
    }

    if (type === "photo") {
      if (isExisting) {
        setExistingPhoto((prev) => prev.filter((_, i) => i !== index));
      } else {
        setPhotoFiles((prev) => {
          const updated = prev.filter((_, i) => i !== index);
          setValue("owner.photo", updated);
          return updated;
        });
      }
    }
  };

  const input =
    "w-full border border-gray-300 rounded-lg px-3 py-2 hover  focus:ring-2 focus:ring-gray-500 outline-none";
  return (
    <div className="max-w-12xl mx-auto px-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-400 px-4 py-2">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">
                {id ? "Update Property" : "Create Property"}
              </h1>

              <p className="text-sm text-gray-500">
                {id
                  ? "Update existing property details"
                  : "Create and manage PG properties"}
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
                disabled={isUpdateProperty || isSubmitProperty}
                className="theme-btn text-white px-4 py-2 rounded-lg hover:bg-gray-700"
              >
                {isUpdateProperty || isSubmitProperty ? (
                  <>
                    <Loader />
                    Processing...
                  </>
                ) : id ? (
                  "Update Property"
                ) : (
                  "Create Property"
                )}
              </button>
            </div>
          </div>
        </div>
        {/* Property Details */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between">
            <h2 className="text-xl font-semibold mb-4">Property Details</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {/* property code  */}
            <div className="form-group">
              <input
                {...register("propertyCode", {
                  required: "Property code is required",
                  validate: (value) =>
                    value?.trim() !== "" || "Property code is required",
                })}
                placeholder=" "
                className={`form-input ${
                  errors.propertyCode ? "border-red-500" : ""
                }`}
              />

              <label className="form-label required-label">Property Code</label>

              {errors.propertyCode && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.propertyCode.message}
                </p>
              )}
            </div>
            {/* status */}
            {id && (
              <Controller
                name="status"
                control={control}
                rules={{
                  required: "Please select status",
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
            {/* location */}
            <Controller
              name="propertyLocation"
              control={control}
              rules={{
                required: "Please select property location",
                validate: (value) =>
                  value?.trim() !== "" || "Please select property location",
              }}
              render={({ field }) => (
                <div>
                  <div
                    className={`select-group ${field.value ? "has-value" : ""}`}
                  >
                    <label className="select-label required-label">
                      Location
                    </label>

                    <Select
                      value={
                        LocationOptions.find(
                          (option) => option.value === field.value,
                        ) || null
                      }
                      onChange={(selectedOption) =>
                        field.onChange(selectedOption?.value || "")
                      }
                      options={LocationOptions}
                      isClearable
                      isSearchable
                      placeholder=""
                      styles={selectStyles}
                    />
                  </div>

                  {errors.propertyLocation && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.propertyLocation.message}
                    </p>
                  )}
                </div>
              )}
            />
            {/*  bed count  */}
            <div className="form-group">
              <input
                {...register("bedCount", {
                  required: "Bed count is required",
                  validate: (value) => {
                    const number = Number(value);

                    if (value === "" || value === null) {
                      return "Bed count is required";
                    }

                    if (!Number.isInteger(number)) {
                      return "Bed count must be a whole number";
                    }

                    if (number <= 0) {
                      return "Bed count must be greater than 0";
                    }

                    return true;
                  },
                })}
                placeholder=" "
                type="number"
                min="1"
                step="1"
                className={`form-input ${
                  errors.bedCount ? "border-red-500" : ""
                }`}
              />

              <label className="form-label required-label">Bed Count</label>

              {errors.bedCount && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.bedCount.message}
                </p>
              )}
            </div>
            {/* address */}
            <div className="form-group">
              <input
                {...register("propertyAddress", {
                  required: "Property address is required",
                  validate: (value) =>
                    value?.trim() !== "" || "Property address is required",
                })}
                placeholder=" "
                type="text"
                className={`form-input ${
                  errors.propertyAddress ? "border-red-500" : ""
                }`}
              />

              <label className="form-label required-label">Address</label>

              {errors.propertyAddress && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.propertyAddress.message}
                </p>
              )}
            </div>
            <div className="form-group">
              <input
                {...register("subMeterDetails")}
                placeholder=" "
                type="text"
                className={`form-input ${
                  errors.propertyAddress ? "border-red-500" : ""
                }`}
              />

              <label className="form-label">Sub Meter Details</label>

              
            </div>


          </div>
        </div>

        {/* Internet Details */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold mb-4">Internet Details</h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="form-group">
              <input
                {...register("internet.vendorLoginId")}
                placeholder=" "
                className="form-input"
              />
              <label className="form-label">Vendor Login ID</label>
            </div>
            <div className="form-group relative">
              <input
                {...register("internet.vendorLoginPassword")}
                type={showVendorPassword ? "text" : "password"}
                placeholder=" "
                className="form-input pr-10"
              />

              <label className="form-label">Vendor Password</label>

              <button
                type="button"
                onClick={() => setShowVendorPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                tabIndex={-1}
              >
                {showVendorPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <div className="form-group">
              <input
                {...register("internet.consumerId")}
                placeholder=" "
                className="form-input"
              />
              <label className="form-label">Consumer ID</label>
            </div>
            <div className="form-group">
              <input
                {...register("internet.contactNo1")}
                placeholder=" "
                type="number"
                className="form-input"
              />
              <label className="form-label">Contact No 1</label>
            </div>
            <div className="form-group">
              <input
                {...register("internet.contactNo2")}
                placeholder=" "
                type="number"
                className="form-input"
              />
              <label className="form-label">Contact No 2</label>
            </div>
            <div className="form-group">
              <input
                {...register("internet.wifiName")}
                placeholder=" "
                className="form-input"
              />
              <label className="form-label">WiFi Name </label>
            </div>
            <div className="form-group">
              <input
                {...register("internet.wifiPwd")}
                placeholder=" "
                className="form-input"
              />
              <label className="form-label">WiFi Password </label>
            </div>
            {/* router connection type  */}
            <Controller
              name="internet.routerConnectionType"
              control={control}
              rules={{
                required: "Please select router connection type",
              }}
              render={({ field }) => (
                <div>
                  <div
                    className={`select-group ${field.value ? "has-value" : ""}`}
                  >
                    <label className="select-label required-label">
                      Router Connection Type
                    </label>

                    <Select
                      value={
                        RouterConnectionTypeOptions.find(
                          (option) => option.value === field.value,
                        ) || null
                      }
                      onChange={(selectedOption) =>
                        field.onChange(selectedOption?.value || "")
                      }
                      options={RouterConnectionTypeOptions}
                      isClearable
                      isSearchable={false}
                      placeholder=""
                      styles={selectStyles}
                    />
                  </div>

                  {errors.internet?.routerConnectionType && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.internet.routerConnectionType.message}
                    </p>
                  )}
                </div>
              )}
            />
            <div className="form-group">
              <input
                {...register("internet.mainRouterPropertyCode")}
                placeholder=" "
                className="form-input"
              />
              <label className="form-label">Main Router Property Code </label>
            </div>
            <div className="form-group">
              <input
                {...register("internet.gpgsRegisteredNoWithInternetVendor")}
                placeholder=" "
                className="form-input"
              />
              <label className="form-label">GPGS Registered Number </label>
            </div>
          </div>
        </div>

        {/* Utility Details */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold mb-4">Utility Details</h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="form-group">
              <input
                {...register("utility.ebConsumerNo")}
                placeholder=" "
                type="number"
                className="form-input"
              />
              <label className="form-label">EB Consumer No </label>
            </div>
            <div className="form-group">
              <input
                {...register("utility.ebBillingUnit")}
                placeholder=" "
                type="number"
                className="form-input"
              />
              <label className="form-label">EB Billing Unit </label>
            </div>

            <div className="form-group">
              <input
                {...register("utility.ebStartCycle")}
                placeholder=" "
                type="number"
                min="1"
                max="31"
                className="form-input"
              />
              <label className="form-label">EB Start Cycle</label>
            </div>

            <div className="form-group">
              <input
                {...register("utility.ebEndCycle")}
                placeholder=" "
                type="number"
                min="1"
                max="31"
                className="form-input"
              />
              <label className="form-label">EB End Cycle</label>
            </div>

            <div className="form-group">
              <input
                {...register("utility.ebPcWebLink")}
                placeholder=" "
                type="url"
                className="form-input"
              />
              <label className="form-label">EB Website Link </label>
            </div>
            <div className="form-group">
              <input
                {...register("utility.gasConsumerNo")}
                placeholder=" "
                type="number"
                className="form-input"
              />
              <label className="form-label">Gas Consumer No </label>
            </div>

            <div className="form-group">
              <input
                {...register("utility.gasBillStartCycle")}
                placeholder=" "
                type="number"
                min="1"
                max="31"
                className="form-input"
              />
              <label className="form-label">Gas Start Cycle</label>
            </div>

            <div className="form-group">
              <input
                {...register("utility.gasBillEndCycle")}
                placeholder=" "
                type="number"
                min="1"
                max="31"
                className="form-input"
              />
              <label className="form-label">Gas End Cycle</label>
            </div>

            <div className="form-group">
              <input
                {...register("utility.waterBillConsumerNo")}
                placeholder=" "
                type="number"
                className="form-input"
              />
              <label className="form-label">Water Bill Consumer No </label>
            </div>

            <div className="form-group">
              <input
                {...register("utility.waterBillStartCycle")}
                placeholder=" "
                type="number"
                min="1"
                max="31"
                className="form-input"
              />
              <label className="form-label">Water Start Cycle</label>
            </div>

            <div className="form-group">
              <input
                {...register("utility.waterBillEndCycle")}
                placeholder=" "
                type="number"
                min="1"
                max="31"
                className="form-input"
              />
              <label className="form-label">Water End Cycle</label>
            </div>
          </div>
        </div>

        {/* Owner Details */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold mb-4">Owner Details</h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="form-group">
              <input
                {...register("owner.fullName")}
                placeholder=" "
                type="text"
                className="form-input"
              />
              <label className="form-label">Owner Full Name </label>
            </div>
            <div className="form-group">
              <input
                {...register("owner.contactNo1")}
                placeholder=" "
                type="number"
                className="form-input"
              />
              <label className="form-label">Owner Contact No 1 </label>
            </div>
            <div className="form-group">
              <input
                {...register("owner.contactNo2")}
                placeholder=" "
                type="number"
                className="form-input"
              />
              <label className="form-label">Owner Contact No 2 </label>
            </div>
            <div className="form-group">
              <input
                {...register("owner.emergencyContactName")}
                placeholder=" "
                type="text"
                className="form-input"
              />
              <label className="form-label">Emergency Contact Name </label>
            </div>
            <div className="form-group">
              <input
                {...register("owner.emergencyContactNo")}
                placeholder=" "
                type="number"
                className="form-input"
              />
              <label className="form-label">Emergency Contact No </label>
            </div>

            <div className="form-group">
              <input
                type="file"
                multiple
                className="form-input"
                onChange={(e) => {
                  const files = Array.from(e.target.files);

                  setAadharFiles((prev) => {
                    const updated = [...prev, ...files];

                    setValue("owner.aadharCard", updated);

                    return updated;
                  });
                  e.target.value = "";
                }}
              />
              <label className="form-label">Aadhar Card </label>
              <FilePreview
                files={aadharFiles}
                existingFiles={existingAadhar}
                onRemoveExisting={(index) => {
                  setExistingAadhar((prev) =>
                    prev.filter((_, i) => i !== index),
                  );
                }}
                onRemoveNew={(index) => removeFile("aadharCard", index)}
              />
            </div>
            <div className="form-group">
              <input
                type="file"
                multiple
                className="form-input"
                onChange={(e) => {
                  const files = Array.from(e.target.files);

                  setPhotoFiles((prev) => {
                    const updated = [...prev, ...files];

                    setValue("owner.photo", updated);

                    return updated;
                  });

                  e.target.value = "";
                }}
              />
              <label className="form-label">Photo </label>
              <FilePreview
                files={photoFiles}
                existingFiles={existingPhoto}
                onRemoveExisting={(index) => {
                  setExistingPhoto((prev) =>
                    prev.filter((_, i) => i !== index),
                  );
                }}
                onRemoveNew={(index) => removeFile("photo", index)}
              />
            </div>
          </div>
        </div>

        {/* Agreement Details */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold mb-4">Agreement Details</h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Controller
              name="agreement.propertyStartDate"
              control={control}
              render={({ field }) => (
                <div
                  className={`datepicker-group ${
                    field.value ? "has-value" : ""
                  }`}
                >
                  <label className="datepicker-label">
                    Property Start Date
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
              name="agreement.propertyEndDate"
              control={control}
              render={({ field }) => (
                <div
                  className={`datepicker-group ${
                    field.value ? "has-value" : ""
                  }`}
                >
                  <label className="datepicker-label">Property End Date</label>
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
              name="agreement.agreementStartDate"
              control={control}
              render={({ field }) => (
                <div
                  className={`datepicker-group ${
                    field.value ? "has-value" : ""
                  }`}
                >
                  <label className="datepicker-label">
                    Agreement Start Date
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
              name="agreement.agreementEndDate"
              control={control}
              render={({ field }) => (
                <div
                  className={`datepicker-group ${
                    field.value ? "has-value" : ""
                  }`}
                >
                  <label className="datepicker-label">Agreement End Date</label>
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
              name="agreement.agreementStatus"
              control={control}
              defaultValue={null}
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
                    value={statusOptions.find(
                      (option) => option.value === field.value,
                    )}
                    onChange={(selectedOption) =>
                      field.onChange(selectedOption?.value)
                    }
                    styles={selectStyles}
                  />
                </div>
              )}
            />

            <div className="form-group">
              <input
                {...register("agreement.policeNocNo")}
                placeholder=" "
                type="text"
                className="form-input"
              />
              <label className="form-label">Police Noc No </label>
            </div>

            <Controller
              name="agreement.policeNocStatus"
              control={control}
              defaultValue={null}
              render={({ field }) => (
                <div
                  className={`select-group ${field.value ? "has-value" : ""}`}
                >
                  <label className="select-label">Police Noc Status</label>

                  <Select
                    {...field}
                    options={PoliceNocStatusOptions}
                    isClearable
                    placeholder=""
                    value={PoliceNocStatusOptions.find(
                      (option) => option.value === field.value,
                    )}
                    onChange={(selectedOption) =>
                      field.onChange(selectedOption?.value)
                    }
                    styles={selectStyles}
                  />
                </div>
              )}
            />

            <div className="form-group">
              <input
                {...register("agreement.dealDetails")}
                placeholder=" "
                type="text"
                className="form-input"
              />
              <label className="form-label">Deal Details</label>
            </div>
            {/* Agreement Attachment */}
            <div className="form-group">
              <input
                type="file"
                multiple
                className="form-input"
                onChange={(e) => {
                  const files = Array.from(e.target.files);

                  setAgreementFiles((prev) => {
                    const updated = [...prev, ...files];

                    setValue("agreement.attachment", updated);

                    return updated;
                  });

                  e.target.value = "";
                }}
              />

              <label className="form-label">Attachment</label>

              <FilePreview
                files={agreementFiles}
                existingFiles={existingAgreementFiles}
                onRemoveExisting={(index) => {
                  setExistingAgreementFiles((prev) =>
                    prev.filter((_, i) => i !== index),
                  );
                }}
                onRemoveNew={(index) => {
                  setAgreementFiles((prev) => {
                    const updated = prev.filter((_, i) => i !== index);

                    setValue("agreement.attachment", updated);

                    return updated;
                  });
                }}
              />
            </div>
            <div className="form-group md:col-span-3">
              <textarea
                {...register("agreement.comment")}
                placeholder=""
                className="form-input md:col-span-4"
              />
              <label className="form-label">Agreement Comment</label>
            </div>
          </div>
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
            disabled={isUpdateProperty || isSubmitProperty}
            className="theme-btn text-white px-4 py-2 rounded-lg hover:bg-gray-700"
          >
            {isUpdateProperty || isSubmitProperty ? (
              <>
                <Loader />
                Processing...
              </>
            ) : id ? (
              "Update Property"
            ) : (
              "Create Property"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PropertyCreateEdit;
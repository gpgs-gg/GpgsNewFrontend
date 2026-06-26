
import React, { useEffect, useState } from "react";
import Select from "react-select";
import { useForm, Controller } from "react-hook-form";
import { XCircle } from "lucide-react";
import { selectStyles } from "../../utils/selectStyles";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { usecreatePropertyData, useSinglePropertiesData, useUpdatePropertiesData } from "./services";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useParams } from "react-router-dom";
import FilePreview from "../common/FilePreview";
import Loader from "../common/Loader";

const PropertyCreateEdit = () => {
    const navigate = useNavigate()
    const { id } = useParams();
    const {
        control,
        register,
        handleSubmit,
        reset,
        setValue,
        watch
    } = useForm();
    // API hooks and mutations
    const { mutate: submitProperty, isPending: isSubmitProperty } = usecreatePropertyData();
    const { data: singlePropertyData, isPending: isSingleProperty } = useSinglePropertiesData(id)
    const { mutate: updatePropertyData, isPending: isUpdateProperty } = useUpdatePropertiesData(id)
    //    define for global scope 
    const property = singlePropertyData?.data;
    const [aadharFiles, setAadharFiles] = useState([]);
    const [photoFiles, setPhotoFiles] = useState([]);
    const [existingAadhar, setExistingAadhar] = useState([]);
    const [existingPhoto, setExistingPhoto] = useState([]);

    useEffect(() => {
        const property = singlePropertyData?.data;
        if (!property) return;

        reset({
            propertyCode: property.propertyCode,
            status: property.status,
            propertyLocation: property.propertyLocation,
            bedCount: property.bedCount,
            propertyAddress: property.propertyAddress,

            internet: {
                ...property.internet,
            },

            utility: {
                ...property.utility,
                ebStartDate: property.utility?.ebStartDate
                    ? new Date(property.utility.ebStartDate)
                    : null,
                ebEndDate: property.utility?.ebEndDate
                    ? new Date(property.utility.ebEndDate)
                    : null,
                gasBillStartDate: property.utility?.gasBillStartDate
                    ? new Date(property.utility.gasBillStartDate)
                    : null,
                gasBillEndDate: property.utility?.gasBillEndDate
                    ? new Date(property.utility.gasBillEndDate)
                    : null,
                waterBillStartDate: property.utility?.waterBillStartDate
                    ? new Date(property.utility.waterBillStartDate)
                    : null,
                waterBillEndDate: property.utility?.waterBillEndDate
                    ? new Date(property.utility.waterBillEndDate)
                    : null,
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
    const LocationOptions = [
        { value: "Nerul ( E )", label: "Nerul ( E )" },
        { value: "Nerul ( W )", label: "Nerul ( W )" },
    ];




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
                formData.append(formKey, value.toISOString());
            }

            // Normal value
            else {
                formData.append(formKey, value ?? "");
            }
        });
    };



    const onSubmit = (data) => {
        const formData = new FormData();

        buildFormData(formData, data);

        // ✅ existing files (correct way)
        existingAadhar.forEach((url) => {
            formData.append("owner[aadharCardExisting]", url);
        });

        existingPhoto.forEach((url) => {
            formData.append("owner[photoExisting]", url);
        });

        // 👉 EDIT MODE
        if (id) {
            updatePropertyData(
                { id, data: formData },
                {
                    onSuccess: (response) => {
                        toast.dismiss()
                        toast.success(response?.message || "Updated successfully");
                        navigate("/properties");
                    },
                    onError: (error) => {
                        const errorMessage =
                            error?.response?.data?.message ||
                            error?.message ||
                            "Something went wrong";
                        toast.dismiss()
                        toast.error(errorMessage);
                    },
                }
            );
            return;
        }
        // 👉 CREATE MODE
        submitProperty(formData, {
            onSuccess: (response) => {
                toast.dismiss()
                toast.success(response?.message || "Created successfully");
                navigate("/properties");
            },
            onError: (error) => {
                const errorMessage =
                    error?.response?.data?.message ||
                    error?.message ||
                    "Something went wrong";
                toast.dismiss()
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
                                ) : (
                                    id ? "Update Property" : "Create Property"
                                )}
                            </button>
                        </div>
                    </div>
                </div>
                {/* Property Details */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex justify-between">
                        <h2 className="text-xl font-semibold mb-4">
                            Property Details
                        </h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                        <div className="form-group">
                            <input
                                {...register("propertyCode")}
                                placeholder=" "
                                className="form-input"
                            />
                            <label className="form-label">
                                Property Code </label>
                        </div>


                        
                        <Controller
                            name="status"
                            control={control}
                            defaultValue={null}
                            render={({ field }) => (
                                <div className={`select-group ${field.value ? "has-value" : ""}`}>
                                    <label className="select-label">
                                        Status
                                    </label>

                                    <Select
                                        {...field}
                                        options={statusOptions}
                                        isClearable
                                        placeholder=""
                                        value={statusOptions.find(
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



                        <Controller
                            name="propertyLocation"
                            control={control}
                            defaultValue={null}
                            render={({ field }) => (
                                <div className={`select-group ${field.value ? "has-value" : ""}`}>
                                    <label className="select-label">
                                        Location
                                    </label>

                                    <Select
                                        {...field}
                                        options={LocationOptions}
                                        isClearable
                                        placeholder=""
                                        value={LocationOptions.find(
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

                        <div className="form-group">
                            <input
                                {...register("bedCount")}
                                placeholder=" "
                                type="number"
                                className="form-input"
                            />
                            <label className="form-label">Bed Count </label>

                        </div>


                        <div className="form-group">
                            <input
                                {...register("propertyAddress")}
                                placeholder=" "
                                type="text"
                                className="form-input"
                            />
                            <label className="form-label">Address </label>

                        </div>



                    </div>
                </div>

                {/* Internet Details */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h2 className="text-xl font-semibold mb-4">
                        Internet Details
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

                        <div className="form-group">
                            <input
                                {...register("internet.vendorLoginId")}
                                placeholder=" "
                                className="form-input"
                            />
                            <label className="form-label">
                                Vendor Login ID
                            </label>
                        </div>
                        <div className="form-group">
                            <input
                                {...register("internet.vendorLoginPassword")}
                                placeholder=" "
                                className="form-input"
                            />
                            <label className="form-label">
                                Vendor Password
                            </label>
                        </div>
                        <div className="form-group">
                            <input
                                {...register("internet.consumerId")}
                                placeholder=" "
                                className="form-input"
                            />
                            <label className="form-label">
                                Consumer ID
                            </label>
                        </div>
                        <div className="form-group">
                            <input
                                {...register("internet.contactNo1")}
                                placeholder=" "
                                type="number"
                                className="form-input"
                            />
                            <label className="form-label">
                                Contact No 1
                            </label>
                        </div>
                        <div className="form-group">
                            <input
                                {...register("internet.contactNo2")}
                                placeholder=" "
                                type="number"
                                className="form-input"
                            />
                            <label className="form-label">
                                Contact No 2
                            </label>
                        </div>
                        <div className="form-group">
                            <input
                                {...register("internet.wifiName")}
                                placeholder=" "
                                className="form-input"
                            />
                            <label className="form-label">
                                WiFi Name  </label>
                        </div>
                        <div className="form-group">
                            <input
                                {...register("internet.wifiPwd")}
                                placeholder=" "
                                className="form-input"
                            />
                            <label className="form-label">
                                WiFi Password  </label>
                        </div>

                        <Controller
                            name="internet.routerConnectionType"
                            control={control}
                            defaultValue={null}
                            render={({ field }) => (
                                <div className={`select-group ${field.value ? "has-value" : ""}`}>
                                    <label className="select-label">
                                        Router Connection Type
                                    </label>

                                    <Select
                                        {...field}
                                        options={RouterConnectionTypeOptions}
                                        isClearable
                                        placeholder=""
                                        value={RouterConnectionTypeOptions.find(
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
                        <div className="form-group">
                            <input
                                {...register("internet.mainRouterPropertyCode")}
                                placeholder=" "
                                className="form-input"
                            />
                            <label className="form-label">
                                Main Router Property Code  </label>
                        </div>
                        <div className="form-group">
                            <input
                                {...register(
                                    "internet.gpgsRegisteredNoWithInternetVendor"
                                )}
                                placeholder=" "
                                className="form-input"
                            />
                            <label className="form-label">
                                GPGS Registered Number </label>
                        </div>
                    </div>
                </div>

                {/* Utility Details */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h2 className="text-xl font-semibold mb-4">
                        Utility Details
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

                        <div className="form-group">
                            <input
                                {...register("utility.ebConsumerNo")}
                                placeholder=" "
                                type="number"
                                className="form-input"
                            />
                            <label className="form-label">
                                EB Consumer No </label>
                        </div>
                        <div className="form-group">
                            <input
                                {...register("utility.ebBillingUnit")}
                                placeholder=" "
                                type="number"
                                className="form-input"
                            />
                            <label className="form-label">
                                EB Billing Unit </label>
                        </div>

                        <Controller
                            name="utility.ebStartDate"
                            control={control}
                            render={({ field }) => (
                                <div
                                    className={`datepicker-group ${field.value ? "has-value" : ""
                                        }`}
                                >
                                    <label className="datepicker-label">
                                        EB Start Date
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
                            name="utility.ebEndDate"
                            control={control}
                            render={({ field }) => (
                                <div
                                    className={`datepicker-group ${field.value ? "has-value" : ""
                                        }`}
                                >
                                    <label className="datepicker-label">
                                        EB End Date
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
                                {...register("utility.ebPcWebLink")}
                                placeholder=" "
                                type="url"
                                className="form-input"
                            />
                            <label className="form-label">
                                EB Website Link </label>
                        </div>
                        <div className="form-group">
                            <input
                                {...register("utility.gasConsumerNo")}
                                placeholder=" "
                                type="number"
                                className="form-input"
                            />
                            <label className="form-label">
                                Gas Consumer No </label>
                        </div>




                        <Controller
                            name="utility.gasBillStartDate"
                            control={control}
                            render={({ field }) => (
                                <div
                                    className={`datepicker-group ${field.value ? "has-value" : ""
                                        }`}
                                >
                                    <label className="datepicker-label">
                                        Gas Bill Start Date
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
                            name="utility.gasBillEndDate"
                            control={control}
                            render={({ field }) => (
                                <div
                                    className={`datepicker-group ${field.value ? "has-value" : ""
                                        }`}
                                >
                                    <label className="datepicker-label">
                                        Gas Bill End Date
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
                                {...register("utility.waterBillConsumerNo")}
                                placeholder=" "
                                type="number"
                                className="form-input"
                            />
                            <label className="form-label">
                                Water Bill Consumer No </label>
                        </div>

                        <Controller
                            name="utility.waterBillStartDate"
                            control={control}
                            render={({ field }) => (
                                <div
                                    className={`datepicker-group ${field.value ? "has-value" : ""
                                        }`}
                                >
                                    <label className="datepicker-label">
                                        Water Bill Start Date
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
                            name="utility.waterBillEndDate"
                            control={control}
                            render={({ field }) => (
                                <div
                                    className={`datepicker-group ${field.value ? "has-value" : ""
                                        }`}
                                >
                                    <label className="datepicker-label">
                                        Water Bill End Date
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

                    </div>
                </div>

                {/* Owner Details */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h2 className="text-xl font-semibold mb-4">
                        Owner Details
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

                        <div className="form-group">
                            <input
                                {...register("owner.fullName")}
                                placeholder=" "
                                type="text"
                                className="form-input"
                            />
                            <label className="form-label">
                                Owner Full Name </label>
                        </div>
                        <div className="form-group">
                            <input
                                {...register("owner.contactNo1")}
                                placeholder=" "
                                type="number"
                                className="form-input"
                            />
                            <label className="form-label">
                                Owner Contact No 1 </label>
                        </div>
                        <div className="form-group">
                            <input
                                {...register("owner.contactNo2")}
                                placeholder=" "
                                type="number"
                                className="form-input"
                            />
                            <label className="form-label">
                                Owner Contact No 2 </label>
                        </div>
                        <div className="form-group">
                            <input
                                {...register("owner.emergencyContactName")}
                                placeholder=" "
                                type="text"
                                className="form-input"
                            />
                            <label className="form-label">
                                Emergency Contact Name </label>
                        </div>
                        <div className="form-group">
                            <input
                                {...register("owner.emergencyContactNo")}
                                placeholder=" "
                                type="number"
                                className="form-input"
                            />
                            <label className="form-label">
                                Emergency Contact No </label>
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
                            <label className="form-label">
                                Aadhar Card </label>
                            <FilePreview
                                files={aadharFiles}
                                existingFiles={existingAadhar}
                                onRemoveExisting={(index) => {
                                    setExistingAadhar((prev) =>
                                        prev.filter((_, i) => i !== index)
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
                            <label className="form-label">
                                Photo </label>
                            <FilePreview
                                files={photoFiles}
                                existingFiles={existingPhoto}
                                onRemoveExisting={(index) => {
                                    setExistingPhoto((prev) =>
                                        prev.filter((_, i) => i !== index)
                                    );
                                }}
                                onRemoveNew={(index) => removeFile("photo", index)}
                            />
                        </div>
                    </div>
                </div>

                {/* Agreement Details */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h2 className="text-xl font-semibold mb-4">
                        Agreement Details
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <Controller
                            name="agreement.propertyStartDate"
                            control={control}
                            render={({ field }) => (
                                <div
                                    className={`datepicker-group ${field.value ? "has-value" : ""
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
                                    className={`datepicker-group ${field.value ? "has-value" : ""
                                        }`}
                                >
                                    <label className="datepicker-label">
                                        Property End Date
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
                            name="agreement.agreementStartDate"
                            control={control}
                            render={({ field }) => (
                                <div
                                    className={`datepicker-group ${field.value ? "has-value" : ""
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
                                    className={`datepicker-group ${field.value ? "has-value" : ""
                                        }`}
                                >
                                    <label className="datepicker-label">
                                        Agreement End Date
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
                            name="agreement.agreementStatus"
                            control={control}
                            defaultValue={null}
                            render={({ field }) => (
                                <div className={`select-group ${field.value ? "has-value" : ""}`}>
                                    <label className="select-label">
                                        Status
                                    </label>

                                    <Select
                                        {...field}
                                        options={statusOptions}
                                        isClearable
                                        placeholder=""
                                        value={statusOptions.find(
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

                        <div className="form-group">
                            <input
                                {...register("agreement.policeNocNo")}
                                placeholder=" "
                                type="text"
                                className="form-input"
                            />
                            <label className="form-label">
                                Police Noc No </label>
                        </div>

                        <Controller
                            name="agreement.policeNocStatus"
                            control={control}
                            defaultValue={null}
                            render={({ field }) => (
                                <div className={`select-group ${field.value ? "has-value" : ""}`}>
                                    <label className="select-label">
                                        Police Noc Status
                                    </label>

                                    <Select
                                        {...field}
                                        options={PoliceNocStatusOptions}
                                        isClearable
                                        placeholder=""
                                        value={PoliceNocStatusOptions.find(
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

                        <div className="form-group">
                            <input
                                {...register("agreement.dealDetails")}
                                placeholder=" "
                                type="text"
                                className="form-input"
                            />
                            <label className="form-label">
                                Deal Details</label>
                        </div>

                        <div className="form-group md:col-span-4">
                            <textarea
                                {...register("agreement.comment")}
                                placeholder=""
                                className="form-input md:col-span-4"
                            />
                            <label className="form-label">
                                Agreement Comment</label>
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
                        ) : (
                            id ? "Update Property" : "Create Property"
                        )}
                    </button>
                </div>

            </form>
        </div>
    );
};

export default PropertyCreateEdit;

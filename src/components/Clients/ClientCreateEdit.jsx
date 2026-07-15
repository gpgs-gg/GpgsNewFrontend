import React, { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form';
import { selectStyles } from '../../utils/selectStyles';
import Select from "react-select";
import { useBedsData, useCreateClientData, usePropertiesDropdown, useSingleClientData, useUpdateClientData } from './services';
import DatePicker from 'react-datepicker';
import FilePreview from "../common/FilePreview";
import { useNavigate, useParams } from 'react-router-dom';
import Loader from '../common/Loader';
import { convertStringFormatDate } from '../../utils/dateFormatter';
import { toast } from 'react-toastify';

const ClientCreateEdit = () => {
    const navigate = useNavigate()
    const { clientId } = useParams();
    const { data: propertiesDropdown, isPending: ispropertiesDropdown } = usePropertiesDropdown()
    const { mutate: createClientData, isPending: isSubmitClientData } = useCreateClientData();
    const { data: singleClientData, isPending: isSingleClientData } = useSingleClientData(clientId)
    const { mutate: updateClientData, isPending: isUpdateClientData } = useUpdateClientData(clientId)


    const { data: bedData } = useBedsData();
    const [photoFiles, setPhotoFiles] = useState([]);
    const [aadhaarFiles, setAadhaarFiles] = useState([]);
    const [companyFiles, setCompanyFiles] = useState([]);
    const [nocFiles, setNocFiles] = useState([]);
    const [agreementFiles, setAgreementFiles] = useState([]);

    const [existingPhoto, setExistingPhoto] = useState([]);
    const [existingAadhaar, setExistingAadhaar] = useState([]);
    const [existingCompanyFiles, setExistingCompanyFiles] = useState([]);
    const [existingNocFiles, setExistingNocFiles] = useState([]);
    const [existingAgreementFiles, setExistingAgreementFiles] = useState([]);

    const {
        control,
        register,
        handleSubmit,
        reset,
        setValue,
        watch
    } = useForm();


    const propertiesOptions =
        propertiesDropdown?.data?.map((property) => ({
            value: property._id,
            label: property.propertyCode,
        })) || [];


    const bedOptions =
        bedData?.data
            ?.filter((bed) => bed.propertyId?._id === watch("propertyId"))
            .map((bed) => ({
                value: bed._id,
                label: bed.bedNo,
            })) || [];

    const isBookingCancelledOptions = [
        {
            value: true,
            label: "Yes",
        },
        {
            value: false,
            label: "No",
        },
    ];

    const isStayTypeOptions = [
        {
            value: "T. Booked",
            label: "T. Booked",
        },
        {
            value: "P. Booked",
            label: "P. Booked",
        },
    ];

    useEffect(() => {
        const ClientData = singleClientData?.data;
        if (!ClientData) return;

        reset({
            propertyId: ClientData.propertyId?._id,
            roomNo: ClientData?.bedId?.roomNo,
            bedId: ClientData.bedId?._id,
            stayType : ClientData?.stayType,
            fullName: ClientData.fullName,
            whatsappNo: ClientData.whatsappNo,
            callingNo: ClientData.callingNo,
            clientDoj: ClientData.clientDoj,
            ebDoj: ClientData.ebDoj,
            emailId: ClientData.emailId,
            parkingCharges: ClientData.parkingCharges,
            processingFees: ClientData.processingFees,
            isBookingCancelled: ClientData.isBookingCancelled,
            noticeStartDate: ClientData.noticeStartDate,
            noticeLastDate: ClientData.noticeLastDate,
            clientVacatingDate: ClientData.clientVacatingDate,
            vacationStartDate1: ClientData.vacationStartDate1,
            vacationLastDate1: ClientData.vacationLastDate1,
            vacationStartDate2: ClientData.vacationStartDate2,
            vacationLastDate2: ClientData.vacationLastDate2,
            upcomingRentHikeDate: ClientData.upcomingRentHikeDate ? new Date(ClientData.upcomingRentHikeDate) : null,
            upcomingRentHikeAmount: ClientData.upcomingRentHikeAmount,
            previousRentHikeDate: ClientData.previousRentHikeDate ? new Date(ClientData.previousRentHikeDate) : null,
            comment: ClientData.comment,
            status: ClientData.status,
        });

        setExistingPhoto(ClientData.photo || []);
        setExistingAadhaar(ClientData.aadhaarCard || []);
        setExistingCompanyFiles(ClientData.collegeIdentification || []);
        setExistingAgreementFiles(ClientData.clientRentalAgreement || []);
        setExistingNocFiles(ClientData.clientPoliceNOC || []);

    }, [singleClientData, reset]);

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
        const formData = new FormData();
        buildFormData(formData, data);
        // ✅ existing files (correct way)
        existingPhoto.forEach((url) => {
            formData.append("photoExisting", url);
        });

        existingAadhaar.forEach((url) => {
            formData.append("aadhaarCardExisting", url);
        });

        existingCompanyFiles.forEach((url) => {
            formData.append("collegeIdentificationExisting", url);
        });

        existingAgreementFiles.forEach((url) => {
            formData.append("clientRentalAgreementExisting", url);
        });

        existingNocFiles.forEach((url) => {
            formData.append("clientPoliceNOCExisting", url);
        });

        // 👉 EDIT MODE
        if (clientId) {
            updateClientData(
                { clientId, data: formData },
                {
                    onSuccess: (response) => {
                        toast.dismiss()
                        toast.success(response?.message || "Updated successfully");
                        navigate("/clients");
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
        createClientData(formData, {
            onSuccess: (response) => {
                toast.dismiss()
                toast.success(response?.message || "Created successfully");
                navigate("/client");
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
        const config = {
            photo: {
                existing: setExistingPhoto,
                files: setPhotoFiles,
                field: "photo",
            },
            aadhaarCard: {
                existing: setExistingAadhaar,
                files: setAadhaarFiles,
                field: "aadhaarCard",
            },
            collegeIdentification: {
                existing: setExistingCompanyFiles,
                files: setCompanyFiles,
                field: "collegeIdentification",
            },
            clientRentalAgreement: {
                existing: setExistingAgreementFiles,
                files: setAgreementFiles,
                field: "clientRentalAgreement",
            },
            clientPoliceNOC: {
                existing: setExistingNocFiles,
                files: setNocFiles,
                field: "clientPoliceNOC",
            },
        };

        const current = config[type];

        if (!current) return;

        if (isExisting) {
            current.existing((prev) => prev.filter((_, i) => i !== index));
        } else {
            current.files((prev) => {
                const updated = prev.filter((_, i) => i !== index);
                setValue(current.field, updated);
                return updated;
            });
        }
    };



    return (
        <div className="max-w-12xl mx-auto px-6">

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-400 px-4 py-2">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-bold">
                                {clientId ? "Update Client" : "Create Client"}
                            </h1>

                            <p className="text-sm text-gray-500">
                                {clientId
                                    ? "Update existing Cleint details"
                                    : "Create and manage PG clents"}
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
                                disabled={isUpdateClientData || isSubmitClientData}
                                className="theme-btn text-white px-4 py-2 rounded-lg hover:bg-gray-700"
                            >
                                {isUpdateClientData || isSubmitClientData ? (
                                    <div className='flex justify-center items-center gap-2'>
                                        <Loader />
                                        Processing...
                                    </div>
                                ) : (
                                    clientId ? "Update client" : "Create Client"
                                )}
                            </button>
                        </div>
                    </div>
                </div>
                {/* Client Permanent Details */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex justify-between">
                        <h2 className="text-xl font-semibold mb-4">
                            Permanent Client Details
                        </h2>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">

                        <Controller
                            name="propertyId"
                            control={control}
                            defaultValue={null}
                            render={({ field }) => (
                                <div className={`select-group ${field.value ? "has-value" : ""}`}>
                                    <label className="select-label required-label">
                                        Property Code
                                    </label>

                                    <Select
                                        {...field}
                                        options={propertiesOptions}
                                        isClearable
                                        placeholder=""
                                        isDisabled
                                        value={propertiesOptions.find(
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
                                        isDisabled
                                        placeholder=""
                                        value={bedOptions.find(
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
                                {...register("roomNo")}
                                placeholder=" "
                                type="text"
                                className="form-input"
                            />
                            <label className="form-label required-label">Room No</label>

                        </div>
                        <Controller
                            name="stayType"
                            control={control}
                            defaultValue={null}
                            render={({ field }) => (
                                <div className={`select-group ${field.value != null ? "has-value" : ""
                                    }`}>
                                    <label className="select-label required-label">
                                       Stay Type
                                    </label>

                                    <Select
                                        {...field}
                                        options={isStayTypeOptions}
                                        isClearable
                                        placeholder=""
                                        value={isStayTypeOptions.find(
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
                                {...register("fullName")}
                                placeholder=" "
                                type="text"
                                className="form-input"
                            />
                            <label className="form-label required-label">Client Name </label>

                        </div>
                        <div className="form-group">
                            <input
                                {...register("whatsappNo")}
                                placeholder=" "
                                type="text"
                                className="form-input"
                            />
                            <label className="form-label required-label">Whatapp No </label>

                        </div>
                        <div className="form-group">
                            <input
                                {...register("callingNo")}
                                placeholder=" "
                                type="text"
                                className="form-input"
                            />
                            <label className="form-label required-label">Calling No</label>

                        </div>
                        <div className="form-group">
                            <input
                                {...register("emailId")}
                                placeholder=" "
                                type="eamil"
                                className="form-input"
                            />
                            <label className="form-label required-label">Email Id </label>

                        </div>
                        <div className="form-group">
                            <input
                                {...register("parkingCharges")}
                                placeholder=" "
                                type="text"
                                className="form-input"
                            />
                            <label className="form-label required-label">Parking Charges </label>

                        </div>
                        <div className="form-group">
                            <input
                                {...register("processingFees")}
                                placeholder=" "
                                type="text"
                                className="form-input"
                            />
                            <label className="form-label required-label">Processing Fees</label>

                        </div>
                        <Controller
                            name="isBookingCancelled"
                            control={control}
                            defaultValue={null}
                            render={({ field }) => (
                                <div className={`select-group ${field.value != null ? "has-value" : ""
                                    }`}>
                                    <label className="select-label required-label">
                                        Booking Cancelled
                                    </label>

                                    <Select
                                        {...field}
                                        options={isBookingCancelledOptions}
                                        isClearable
                                        placeholder=""
                                        value={isBookingCancelledOptions.find(
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
                            name="clientDoj"
                            control={control}
                            render={({ field }) => (
                                <div
                                    className={`datepicker-group ${field.value ? "has-value" : ""
                                        }`}
                                >
                                    <label className="datepicker-label required-label">
                                        Client Doj
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
                            name="ebDoj"
                            control={control}
                            render={({ field }) => (
                                <div
                                    className={`datepicker-group ${field.value ? "has-value" : ""
                                        }`}
                                >
                                    <label className="datepicker-label required-label">
                                        EB Doj
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
                            name="vacationStartDate1"
                            control={control}
                            render={({ field }) => (
                                <div
                                    className={`datepicker-group ${field.value ? "has-value" : ""
                                        }`}
                                >
                                    <label className="datepicker-label required-label">
                                        Vacation Start Date1
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
                            name="vacationLastDate1"
                            control={control}
                            render={({ field }) => (
                                <div
                                    className={`datepicker-group ${field.value ? "has-value" : ""
                                        }`}
                                >
                                    <label className="datepicker-label required-label">
                                        Vacation Last Date 1
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
                            name="vacationStartDate2"
                            control={control}
                            render={({ field }) => (
                                <div
                                    className={`datepicker-group ${field.value ? "has-value" : ""
                                        }`}
                                >
                                    <label className="datepicker-label required-label">
                                        Vacation Start Date 2
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
                            name="vacationLastDate2"
                            control={control}
                            render={({ field }) => (
                                <div
                                    className={`datepicker-group ${field.value ? "has-value" : ""
                                        }`}
                                >
                                    <label className="datepicker-label required-label">
                                        Vacation Last Date 2
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
                            name="noticeStartDate"
                            control={control}
                            render={({ field }) => (
                                <div
                                    className={`datepicker-group ${field.value ? "has-value" : ""
                                        }`}
                                >
                                    <label className="datepicker-label required-label">
                                        Notice Start Date
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
                            name="noticeLastDate"
                            control={control}
                            render={({ field }) => (
                                <div
                                    className={`datepicker-group ${field.value ? "has-value" : ""
                                        }`}
                                >
                                    <label className="datepicker-label required-label">
                                        Notice Last Date
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
                            name="clientVacatingDate"
                            control={control}
                            render={({ field }) => (
                                <div
                                    className={`datepicker-group ${field.value ? "has-value" : ""
                                        }`}
                                >
                                    <label className="datepicker-label required-label">
                                        Client Vacating Date
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
                {/* Client Document Details */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h2 className="text-xl font-semibold mb-4">
                        Client Document Details
                    </h2>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                        <div className="form-group">
                            <input
                                type="file"
                                multiple
                                className="form-input"
                                onChange={(e) => {
                                    const files = Array.from(e.target.files);

                                    setPhotoFiles((prev) => {
                                        const updated = [...prev, ...files];

                                        setValue("photo", updated);

                                        return updated;
                                    });
                                    e.target.value = "";

                                }}
                            />
                            <label className="form-label required-label">
                                Photo</label>
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


                        <div className="form-group">
                            <input
                                type="file"
                                multiple
                                className="form-input"
                                onChange={(e) => {
                                    const files = Array.from(e.target.files);

                                    setAadhaarFiles((prev) => {
                                        const updated = [...prev, ...files];

                                        setValue("aadhaarCard", updated);

                                        return updated;
                                    });

                                    e.target.value = "";
                                }}
                            />
                            <label className="form-label required-label">
                                Aadhaar Card / Pan Card </label>
                            <FilePreview
                                files={aadhaarFiles}
                                existingFiles={existingAadhaar}
                                onRemoveExisting={(index) => {
                                    setExistingAadhaar((prev) =>
                                        prev.filter((_, i) => i !== index)
                                    );
                                }}
                                onRemoveNew={(index) => removeFile("aadhaarCard", index)}
                            />
                        </div>


                        <div className="form-group">
                            <input
                                type="file"
                                multiple
                                className="form-input"
                                onChange={(e) => {
                                    const files = Array.from(e.target.files);

                                    setCompanyFiles((prev) => {
                                        const updated = [...prev, ...files];

                                        setValue("collegeIdentification", updated);

                                        return updated;
                                    });

                                    e.target.value = "";
                                }}
                            />
                            <label className="form-label required-label">
                                College Id / Company Id</label>
                            <FilePreview
                                files={companyFiles}
                                existingFiles={existingCompanyFiles}
                                onRemoveExisting={(index) => {
                                    setExistingCompanyFiles((prev) =>
                                        prev.filter((_, i) => i !== index)
                                    );
                                }}
                                onRemoveNew={(index) => removeFile("collegeIdentification", index)}
                            />
                        </div>


                        <Controller
                            name="agreementStartDate"
                            control={control}
                            render={({ field }) => (
                                <div
                                    className={`datepicker-group ${field.value ? "has-value" : ""
                                        }`}
                                >
                                    <label className="datepicker-label required-label">
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
                        />     <Controller
                            name="agreementLastDate"
                            control={control}
                            render={({ field }) => (
                                <div
                                    className={`datepicker-group ${field.value ? "has-value" : ""
                                        }`}
                                >
                                    <label className="datepicker-label required-label">
                                        Agreement Last Date
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
                                type="file"
                                multiple
                                className="form-input"
                                onChange={(e) => {
                                    const files = Array.from(e.target.files);

                                    setAgreementFiles((prev) => {
                                        const updated = [...prev, ...files];

                                        setValue("clientRentalAgreement", updated);

                                        return updated;
                                    });

                                    e.target.value = "";
                                }}
                            />
                            <label className="form-label required-label">
                                Client Rental Agreement</label>
                            <FilePreview
                                files={agreementFiles}
                                existingFiles={existingAgreementFiles}
                                onRemoveExisting={(index) => {
                                    setExistingAgreementFiles((prev) =>
                                        prev.filter((_, i) => i !== index)
                                    );
                                }}
                                onRemoveNew={(index) => removeFile("clientRentalAgreement", index)}
                            />
                        </div>
                        <div className="form-group">
                            <input
                                type="file"
                                multiple
                                className="form-input"
                                onChange={(e) => {
                                    const files = Array.from(e.target.files);

                                    setNocFiles((prev) => {
                                        const updated = [...prev, ...files];

                                        setValue("clientPoliceNOC", updated);

                                        return updated;
                                    });

                                    e.target.value = "";
                                }}
                            />
                            <label className="form-label required-label">
                                Client Police NOC</label>
                            <FilePreview
                                files={nocFiles}
                                existingFiles={existingNocFiles}
                                onRemoveExisting={(index) => {
                                    setExistingNocFiles((prev) =>
                                        prev.filter((_, i) => i !== index)
                                    );
                                }}
                                onRemoveNew={(index) => removeFile("clientPoliceNOC", index)}
                            />
                        </div>

                    </div>
                </div>
            </form>

        </div>
    )
}

export default ClientCreateEdit



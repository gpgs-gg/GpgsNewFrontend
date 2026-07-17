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
import { usecreateBedData, usePropertiesDropdown, useSingleBedsData, useUpdateBedsData } from "./services";
import { AsyncPaginate } from "react-select-async-paginate";
import { getPropertyDropdown } from "../properties/services";

const BedCreateEdit = () => {
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

    const { mutate: submitBed, isPending: isSubmitBed } = usecreateBedData();
    const { data: singleBedData, isPending: isSingleBed } = useSingleBedsData(id)
    const { mutate: updateBedData, isPending: isUpdateBed } = useUpdateBedsData(id)
    const { data: propertiesDropdown, isPending: ispropertiesDropdown } = usePropertiesDropdown()


    const Bed = singleBedData?.data;
    const [aadharFiles, setAadharFiles] = useState([]);
    const [photoFiles, setPhotoFiles] = useState([]);
    const [existingAadhar, setExistingAadhar] = useState([]);
    const [existingPhoto, setExistingPhoto] = useState([]);


    const genderOptions = [
        { value: "Male", label: "Male" },
        { value: "Female", label: "Female" },
        { value: "Any", label: "Any" },
    ];

    const sharingTypeOptions = [
        { value: "Private", label: "Private" },
        { value: "Double", label: "Double" },
        { value: "Triple", label: "Triple" },
        { value: "Quad", label: "Quad" },
    ];
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
        { value: "Booked", label: "Booked" },
        { value: "Maintenance", label: "Maintenance" },
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
    console.log("loadPropertyOptions", loadPropertyOptions)

    const selectedProperty = watch("propertyId")

    const bedCountOptions = Array.from(
        { length: Number(selectedProperty?.bedCount || 0) },
        (_, index) => ({
            value: `${index + 1}`,
            label: `${index + 1}`,
        })
    );

    useEffect(() => {
        const Bed = singleBedData?.data;
        console.log(Bed)
        if (!Bed) return;
        reset({
            propertyId: {
                value: Bed.propertyId._id,
                label: Bed.propertyId.propertyCode,
                bedCount: Bed.propertyId.bedCount,
                location: Bed.propertyId.propertyLocation,
            },
            roomNo: Bed.roomNo,
            bedNo: Bed.bedNo,
            gender: Bed.gender,
            sharingType: Bed.sharingType,
            bathAttached: Bed.bathAttached,
            acRoom: Bed.acRoom,
            monthlyRent: Bed.monthlyRent,
            securityDepositMultiplicationFactor: Bed.securityDepositMultiplicationFactor,
            upcomingRentHikeDate: Bed.upcomingRentHikeDate ? new Date(Bed.upcomingRentHikeDate) : null,
            upcomingRentHikeAmount: Bed.upcomingRentHikeAmount,
            previousRentHikeDate: Bed.previousRentHikeDate ? new Date(Bed.previousRentHikeDate) : null,
            comment: Bed.comment,
            status: Bed.status,
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


        if (id) {
            updateBedData(
                { id, data: payload },  // Sending as object, not FormData
                {
                    onSuccess: (response) => {
                        toast.dismiss()
                        toast.success(response?.message || "Updated successfully");
                        navigate("/Beds");
                    },
                    onError: (error) => {
                        toast.dismiss()
                        toast.error(error?.response?.data?.message || "Update failed");
                    },
                }
            );
            return;
        }

        submitBed(payload, {  // Sending as object, not FormData
            onSuccess: (response) => {
                toast.dismiss()
                toast.success(response?.message || "Created successfully");
                navigate("/Beds");
            },
            onError: (error) => {
                const errorMessage = error?.response?.data?.message || error?.message || "Something went wrong";
                toast.dismiss()
                toast.error(errorMessage);
            },
        });
    };

    const input = "w-full border border-gray-300 rounded-lg px-3 py-2 hover focus:ring-2 focus:ring-gray-500 outline-none";

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
                                {id ? "Update existing Bed details" : "Create and manage PG Beds"}
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
                                ) : (
                                    id ? "Update Bed" : "Create Bed"
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Bed Details */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h2 className="text-xl font-semibold mb-4">Bed Details</h2>


                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <Controller
                            name="propertyId"
                            control={control}
                            rules={{
                                required: "Property is required",
                            }}
                            render={({ field }) => {
                                return (
                                    <div
                                        className={`select-group ${field.value ? "has-value" : ""}`}
                                    >
                                        <label className="select-label">Property Code</label>

                                        <AsyncPaginate
                                            additional={{ page: 1 }}
                                            debounceTimeout={500}
                                            loadOptions={loadPropertyOptions}
                                            placeholder = "search/select"
                                            value={field.value}
                                            onChange={(option) => {
                                                field.onChange(option);
                                            }}
                                            isClearable
                                            styles={selectStyles}
                                        />
                                    </div>
                                );
                            }}
                        />


                        <div className="form-group">
                            <input
                                {...register("roomNo")}
                                placeholder=" "
                                className="form-input"
                            />
                            <label className="form-label">Room No</label>
                        </div>

                        <Controller
                            name="bedNo"
                            control={control}
                            defaultValue={null}
                            render={({ field }) => (
                                <div className={`select-group ${field.value ? "has-value" : ""}`}>
                                    <label className="select-label">Bed No</label>
                                    <Select
                                        {...field}
                                        options={bedCountOptions}
                                        isClearable
                                        placeholder=""
                                        value={bedCountOptions.find(option => option.value === field.value)}
                                        onChange={(selectedOption) => field.onChange(selectedOption?.value)}
                                        styles={selectStyles}
                                    />
                                </div>
                            )}
                        />
                        <Controller
                            name="gender"
                            control={control}
                            defaultValue={null}
                            render={({ field }) => (
                                <div className={`select-group ${field.value ? "has-value" : ""}`}>
                                    <label className="select-label">Gender</label>
                                    <Select
                                        {...field}
                                        options={genderOptions}
                                        isClearable
                                        placeholder=""
                                        value={genderOptions.find(option => option.value === field.value)}
                                        onChange={(selectedOption) => field.onChange(selectedOption?.value)}
                                        styles={selectStyles}
                                    />
                                </div>
                            )}
                        />

                        <Controller
                            name="sharingType"
                            control={control}
                            defaultValue={null}
                            render={({ field }) => (
                                <div className={`select-group ${field.value ? "has-value" : ""}`}>
                                    <label className="select-label">Sharing Type</label>
                                    <Select
                                        {...field}
                                        options={sharingTypeOptions}
                                        isClearable
                                        placeholder=""
                                        value={sharingTypeOptions.find(option => option.value === field.value)}
                                        onChange={(selectedOption) => field.onChange(selectedOption?.value)}
                                        styles={selectStyles}
                                    />
                                </div>
                            )}
                        />

                        <Controller
                            name="bathAttached"
                            control={control}
                            defaultValue={null}
                            render={({ field }) => (
                                <div className={`select-group ${field.value ? "has-value" : ""}`}>
                                    <label className="select-label">Bath Attached</label>
                                    <Select
                                        {...field}
                                        options={bathAttachedOptions}
                                        isClearable
                                        placeholder=""
                                        value={bathAttachedOptions.find(option => option.value === field.value)}
                                        onChange={(selectedOption) => field.onChange(selectedOption?.value)}
                                        styles={selectStyles}
                                    />
                                </div>
                            )}
                        />

                        <Controller
                            name="acRoom"
                            control={control}
                            defaultValue={null}
                            render={({ field }) => (
                                <div className={`select-group ${field.value ? "has-value" : ""}`}>
                                    <label className="select-label">AC Room</label>
                                    <Select
                                        {...field}
                                        options={acRoomOptions}
                                        isClearable
                                        placeholder=""
                                        value={acRoomOptions.find(option => option.value === field.value)}
                                        onChange={(selectedOption) => field.onChange(selectedOption?.value)}
                                        styles={selectStyles}
                                    />
                                </div>
                            )}
                        />

                        <div className="form-group">
                            <input
                                {...register("monthlyRent")}
                                placeholder=" "
                                type="number"
                                className="form-input"
                            />
                            <label className="form-label">Monthly Rent</label>
                        </div>

                        <div className="form-group">
                            <input
                                {...register("securityDepositMultiplicationFactor")}
                                placeholder=" "
                                type="number"
                                className="form-input"
                            />
                            <label className="form-label">Security Deposit (Multiplier)</label>
                        </div>

                        <Controller
                            name="upcomingRentHikeDate"
                            control={control}
                            render={({ field }) => (
                                <div className={`datepicker-group ${field.value ? "has-value" : ""}`}>
                                    <label className="datepicker-label">Upcoming Rent Hike Date</label>
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
                                <div className={`datepicker-group ${field.value ? "has-value" : ""}`}>
                                    <label className="datepicker-label">Previous Rent Hike Date</label>
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
                                {...register("comment")}
                                placeholder=" "
                                className="form-input"
                            />
                            <label className="form-label">Comment</label>
                        </div>

                        <Controller
                            name="status"
                            control={control}
                            defaultValue={null}
                            render={({ field }) => (
                                <div className={`select-group ${field.value ? "has-value" : ""}`}>
                                    <label className="select-label">Status</label>
                                    <Select
                                        {...field}
                                        options={statusOptions}
                                        isClearable
                                        placeholder=""
                                        value={statusOptions.find(option => option.value === field.value)}
                                        onChange={(selectedOption) => field.onChange(selectedOption?.value)}
                                        styles={selectStyles}
                                    />
                                </div>
                            )}
                        />
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
                        ) : (
                            id ? "Update Bed" : "Create Bed"
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default BedCreateEdit;
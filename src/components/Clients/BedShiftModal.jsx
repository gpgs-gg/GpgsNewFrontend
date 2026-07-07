
import React, { useEffect } from "react";
import Select from "react-select";
import { useForm, Controller } from "react-hook-form";
import { X } from "lucide-react";
import { selectStyles } from "../../utils/selectStyles";
import { useAvailableBedsData } from "../newBooking/services";
import { usePropertiesDropdown } from "../beds/services";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useTransferBed } from "./services";
import { toast } from "react-toastify";
import DatePicker from "react-datepicker";
const schema = yup.object({
    propertyId: yup
        .string()
        .required("Property is required"),

    bedId: yup
        .string()
        .required("Bed is required"),
    startDate: yup
        .string()
        .required("New property start date is required"),
    endDate: yup
        .string()
        .required("Old property end date is required"),
});
const BedShiftModal = ({
    isOpen,
    onClose,
    client,
    getAvailableBeds,
}) => {

    const {
        control,
        handleSubmit,
        watch,
        reset,
        setValue,
        formState: { errors },
    } = useForm({
        resolver: yupResolver(schema),
        defaultValues: {
            propertyId: null,
            bedId: null,
        },
    });

    const { data: propertiesDropdown, isPending: ispropertiesDropdown } = usePropertiesDropdown()
    const { data: bedAvailableData, isPending: isBedAvailableData } = useAvailableBedsData()
    const { mutate: transferBed, isPending: isTransferBed } = useTransferBed()


    const selectedPropertyId =
        watch("propertyId");

    const propertiesOptions =
        propertiesDropdown?.data?.map((property) => ({
            value: `${property._id},${property.propertyCode}`,
            label: property.propertyCode,
        })) || [];
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
        if (!isOpen) {
            reset();
        }
    }, [isOpen, reset]);

    if (!isOpen) return null;

    const onSubmit = (data) => {
        const propertyId =
            data.propertyId?.split(",")[0];

        const bedId =
            data.bedId?.split(",")[0];

        transferBed(
            {
                clientId: client._id,
                newPropertyId: propertyId,
                newBedId: bedId,
                endDate: data?.endDate,
                startDate : data.startDate
            },
            {
                onSuccess: (response) => {
                    toast.success(
                        response?.message ||
                        response?.data?.message ||
                        "Bed transferred successfully"
                    );

                    onClose();
                    reset();
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
    };
    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black/30"
                onClick={onClose}
            />

            <div className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl border border-gray-200">
                {/* Header */}
                <div className="flex items-center  justify-between px-6 py-2 border-b border-gray-300">
                    <div>
                        <h2 className="text-xl  font-semibold">
                            Bed Shift
                        </h2>
                        <p className="text-sm text-gray-500">
                            {client?.fullName} | Current Bed: {client?.bedId?.bedNo}
                        </p>
                    </div>

                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg hover:bg-gray-100"
                    >
                        <X size={20} />
                    </button>
                </div>

                <form
                    onSubmit={handleSubmit(
                        onSubmit
                    )}
                >
                    <div className="grid grid-cols-1 p-6 gap-4">
                        <Controller
                            name="propertyId"
                            control={control}
                            defaultValue={null}
                            render={({ field }) => (
                                <div className={`select-group ${field.value ? "has-value" : ""}`}>
                                    <label className="select-label required-label">Property Code</label>
                                    <Select
                                        {...field}
                                        options={propertiesOptions}
                                        isClearable
                                        placeholder=""
                                        value={propertiesOptions.find(option => option.value === field.value)}
                                        onChange={(selectedOption) => field.onChange(selectedOption?.value)}
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
                                    <label className="select-label required-label">Bed</label>
                                    <Select
                                        {...field}
                                        options={bedOptions}
                                        isClearable
                                        placeholder=""
                                        value={bedOptions.find(option => option.value === field.value)}
                                        onChange={(selectedOption) => field.onChange(selectedOption?.value)}
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
                        <Controller
                            name="endDate"
                            control={control}
                            render={({ field }) => (
                                <div className={`datepicker-group ${field.value ? "has-value" : ""}`}>
                                    <label className="datepicker-label">
                                        End Date
                                    </label>

                                    <DatePicker
                                        isClearable
                                        selected={field.value}
                                        onChange={(date) => {
                                            field.onChange(date);

                                            if (date) {
                                                const nextDay = new Date(date);
                                                nextDay.setDate(nextDay.getDate() + 1);

                                                setValue("startDate", nextDay, {
                                                    shouldDirty: true,
                                                    shouldValidate: true,
                                                });
                                            } else {
                                                setValue("startDate", null);
                                            }
                                        }}
                                        dateFormat="dd MMM yyyy"
                                        className="custom-datepicker"
                                    />
                                </div>
                            )}
                        />
                           {errors.endDate && (
                                        <p className="text-red-500 text-xs">
                                            {errors.endDate.message}
                                        </p>
                                    )}
                        <Controller
                            name="startDate"
                            control={control}
                            render={({ field }) => (
                                <div
                                    className={`datepicker-group ${field.value ? "has-value" : ""
                                        }`}
                                >
                                    <label className="datepicker-label">
                                        Start Date
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
                           {errors.startDate && (
                                        <p className="text-red-500 text-xs">
                                            {errors.startDate.message}
                                        </p>
                                    )}
                    </div>

                    {/* Footer */}
                    <div className="flex justify-end gap-3 border-t border-gray-300 px-6 py-2 bg-gray-50 rounded-b-2xl">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-5 py-2.5 rounded-xl border border-gray-300 hover:bg-gray-100"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className="px-5 py-2.5 rounded-xl theme-btn"
                        >
                            Shift Bed
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default BedShiftModal;

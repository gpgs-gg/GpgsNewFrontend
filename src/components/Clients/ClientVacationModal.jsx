import React, { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { X } from "lucide-react";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useUpdateVacationDates, useVacationDates } from "./services";
import { toast } from "react-toastify";

const schema = yup.object({
    vacationStartDate1: yup
        .date()
        .nullable()
        .required("Vacation Start Date 1 is required"),

    vacationLastDate1: yup
        .date()
        .nullable()
        .required("Vacation Last Date 1 is required"),

    vacationStartDate2: yup
        .date()
        .nullable(),

    vacationLastDate2: yup
        .date()
        .nullable(),
});

const ClientVacationModal = ({
    isOpen,
    onClose,
    client,
    vacation,
}) => {
    const {
        control,
        handleSubmit,
        reset,
        setValue,
        formState: { errors },
    } = useForm({
        resolver: yupResolver(schema),
        defaultValues: {
            vacationStartDate1: null,
            vacationLastDate1: null,
            vacationStartDate2: null,
            vacationLastDate2: null,
        },
    });

    useEffect(() => {
        if (!isOpen) return;

        if (vacation) {
            reset({
                vacationStartDate1: vacation.vacationStartDate1
                    ? new Date(vacation.vacationStartDate1)
                    : null,

                vacationLastDate1: vacation.vacationLastDate1
                    ? new Date(vacation.vacationLastDate1)
                    : null,

                vacationStartDate2: vacation.vacationStartDate2
                    ? new Date(vacation.vacationStartDate2)
                    : null,

                vacationLastDate2: vacation.vacationLastDate2
                    ? new Date(vacation.vacationLastDate2)
                    : null,
            });
        } else {
            reset({
                vacationStartDate1: null,
                vacationLastDate1: null,
                vacationStartDate2: null,
                vacationLastDate2: null,
            });
        }
    }, [isOpen, vacation, reset]);


    const {
        mutate: createVacation,
        isPending: isCreateVacationLoading,
    } = useVacationDates();
    const {
        mutate: updateVacation,
        isPending: isUpdateVacationLoading,
    } = useUpdateVacationDates();
    // Current month & current year
    const today = new Date();

    const currentMonthStart = new Date(
        today.getFullYear(),
        today.getMonth(),
        1
    );

    const currentMonthEnd = new Date(
        today.getFullYear(),
        today.getMonth() + 1,
        0
    );

    const handleClose = () => {
        reset();
        onClose?.();
    };
    const formatDateToString = (date) => {
        if (!date) return null;

        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");

        return `${year}-${month}-${day}`;
    };

    const submitForm = (data) => {
        const today = new Date();

        const payload = {
            clientId: client?._id,

            // Current month & year
            month: today.getMonth() + 1,
            year: today.getFullYear(),

            vacationStartDate1: formatDateToString(
                data.vacationStartDate1
            ),

            vacationLastDate1: formatDateToString(
                data.vacationLastDate1
            ),

            vacationStartDate2: formatDateToString(
                data.vacationStartDate2
            ),

            vacationLastDate2: formatDateToString(
                data.vacationLastDate2
            ),
        };


        // =====================================
        // UPDATE
        // =====================================

        if (vacation?._id) {
            updateVacation(
                {
                    id: vacation._id,
                    data: payload,
                },
                {
                    onSuccess: (response) => {
                        toast.dismiss();

                        toast.success(
                            response?.message ||
                            "Vacation record updated successfully"
                        );

                        reset();
                        onClose?.();
                    },

                    onError: (error) => {
                        const errorMessage =
                            error?.response?.data?.message ||
                            error?.message ||
                            "Failed to update vacation record";

                        toast.dismiss();
                        toast.error(errorMessage);

                        console.error(
                            "Vacation Update Error:",
                            error?.response?.data || error
                        );
                    },
                }
            );

            return;
        }


        // =====================================
        // CREATE
        // =====================================

        createVacation(
            payload,
            {
                onSuccess: (response) => {
                    toast.dismiss();

                    toast.success(
                        response?.message ||
                        "Vacation record created successfully"
                    );

                    reset();
                    onClose?.();
                },

                onError: (error) => {
                    const errorMessage =
                        error?.response?.data?.message ||
                        error?.message ||
                        "Failed to create vacation record";

                    toast.dismiss();
                    toast.error(errorMessage);

                    console.error(
                        "Vacation Create Error:",
                        error?.response?.data || error
                    );
                },
            }
        );
    };


    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-9999 flex items-center justify-center p-4">

            {/* Overlay */}
            <div
                className="absolute inset-0 bg-black/30"
                onClick={handleClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-2xl rounded-2xl bg-white shadow-2xl border border-gray-200">

                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-300">

                    <div>
                        <h2 className="text-xl text-gray-800 font-semibold">
                            {vacation?._id
                                ? "Update Vacation Dates"
                                : "Add Vacation Dates"}
                        </h2>


                        {client?.fullName && (
                            <p className="text-sm text-gray-600 mt-1">
                                Client:{" "}
                                <span className="font-semibold">
                                    {client.fullName} / {client.propertyId?.propertyCode} / {client.bedId?.bedNo}
                                </span>
                            </p>
                        )}
                    </div>

                    <button
                        type="button"
                        onClick={handleClose}
                        className="p-1.5 rounded-lg hover:bg-gray-100"
                    >
                        <X size={20} />
                    </button>

                </div>

                {/* Form */}
                <form onSubmit={handleSubmit(submitForm)}>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-5">

                        {/* Vacation 1 Start */}
                        <Controller
                            name="vacationStartDate1"
                            control={control}
                            render={({ field }) => (
                                <div
                                    className={`datepicker-group ${field.value ? "has-value" : ""
                                        }`}
                                >
                                    <label className="datepicker-label required-label">
                                        Vacation Start Date 1
                                    </label>

                                    <DatePicker
                                        isClearable
                                        selected={field.value}
                                        onChange={(date) => field.onChange(date)}
                                        dateFormat="dd MMM yyyy"
                                        className="custom-datepicker"
                                        placeholderText="Select end date"
                                    />

                                    {errors.vacationStartDate1 && (
                                        <p className="text-red-500 text-xs mt-1">
                                            {errors.vacationStartDate1.message}
                                        </p>
                                    )}
                                </div>
                            )}
                        />

                        {/* Vacation 1 Last */}
                        <Controller
                            name="vacationLastDate1"
                            control={control}
                            render={({ field }) => (
                                <div
                                    className={`datepicker-group ${field.value ? "has-value" : ""
                                        }`}
                                >
                                    <label className="datepicker-label required-label">
                                        Vacation Last Date  1
                                    </label>

                                    <DatePicker
                                        isClearable
                                        selected={field.value}
                                        onChange={(date) => field.onChange(date)}
                                        dateFormat="dd MMM yyyy"
                                        className="custom-datepicker"
                                        placeholderText="Select end date"
                                    />

                                    {errors.vacationLastDate1 && (
                                        <p className="text-red-500 text-xs mt-1">
                                            {errors.vacationLastDate1.message}
                                        </p>
                                    )}
                                </div>
                            )}
                        />

                        {/* Vacation 2 Start */}
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
                                        placeholderText="Select end date"
                                    />

                                    {errors.vacationStartDate2 && (
                                        <p className="text-red-500 text-xs mt-1">
                                            {errors.vacationStartDate2.message}
                                        </p>
                                    )}
                                </div>
                            )}
                        />

                        {/* Vacation 2 Last */}
                        <Controller
                            name="vacationLastDate2"
                            control={control}
                            render={({ field }) => (
                                <div
                                    className={`datepicker-group ${field.value ? "has-value" : ""
                                        }`}
                                >
                                    <label className="datepicker-label required-label">
                                        Vacation Last Date  2
                                    </label>

                                    <DatePicker
                                        isClearable
                                        selected={field.value}
                                        onChange={(date) => field.onChange(date)}
                                        dateFormat="dd MMM yyyy"
                                        className="custom-datepicker"
                                        placeholderText="Select end date"
                                    />

                                    {errors.vacationLastDate2 && (
                                        <p className="text-red-500 text-xs mt-1">
                                            {errors.vacationLastDate2.message}
                                        </p>
                                    )}
                                </div>
                            )}
                        />

                    </div>

                    {/* Footer */}
                    <div className="flex justify-end gap-3 border-t border-gray-300 px-5 py-3 bg-gray-50 rounded-b-2xl">

                        <button
                            type="button"
                            onClick={handleClose}
                            className="px-5 py-2.5 rounded-xl border border-gray-300 hover:bg-gray-100"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={
                                isCreateVacationLoading ||
                                isUpdateVacationLoading
                            }
                            className="px-5 py-2.5 rounded-xl theme-btn disabled:opacity-60"
                        >
                            {isCreateVacationLoading || isUpdateVacationLoading
                                ? "Saving..."
                                : vacation?._id
                                    ? "Update Vacation"
                                    : "Save Vacation"}
                        </button>

                    </div>

                </form>
            </div>
        </div>
    );
};

export default ClientVacationModal;
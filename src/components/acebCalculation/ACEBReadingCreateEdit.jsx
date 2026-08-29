import React, { useEffect, useMemo } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { ArrowLeft } from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Controller } from "react-hook-form";
import Loader from "../common/Loader";
import {
    useSinglePropertyData,
    useSingleACEBReadingData,
    useCreateACEBReadingData,
    useUpdateACEBReadingData,
    usePreviousACEBReadingData,
} from "./services";
import { convertStringFormatDate } from "../../utils/dateFormatter";

const ACEBReadingCreateEdit = () => {
    const navigate = useNavigate();
    const { propertyId, id } = useParams();
    const isEdit = !!id;

    const {
        register,
        control,
        handleSubmit,
        reset,
        watch,
        formState: { errors, isDirty },
    } = useForm({
        defaultValues: {
            propertyId: propertyId || "",
            month: "", 
            date: "",
            flatTotalEB: "",
            flatTotalUnits: "",
            roomReadings: [],
        },
    });

    const {
        fields: roomFields,
        replace: replaceRooms,
    } = useFieldArray({
        control,
        name: "roomReadings",
    });

    const {
        data: propertyResponse,
        isLoading: propertyLoading,
    } = useSinglePropertyData(propertyId);

    const property = propertyResponse?.data;

    const {
        data: readingResponse,
        isLoading: readingLoading,
    } = useSingleACEBReadingData(id, isEdit);

    const existingReading = readingResponse?.data;
    const {
        mutate: createReading,
        isPending: createLoading,
    } = useCreateACEBReadingData();
    const {
        mutate: updateReading,
        isPending: updateLoading,
    } = useUpdateACEBReadingData();
    const {
        data: previousReadingResponse,
        isLoading: previousReadingLoading,
    } = usePreviousACEBReadingData({
        propertyId,
        month: watch("month"),
        enabled: !isEdit,
    });

    const previousReading =
        previousReadingResponse?.data;
    const loading =
        propertyLoading ||
        readingLoading ||
        previousReadingLoading ||
        createLoading ||
        updateLoading;
    const propertyRooms = useMemo(() => {
        if (!property?.areas) return [];

        return property.areas.filter(
            (area) =>
                area.isActive !== false
        );
    }, [property]);

    useEffect(() => {
        if (!property || isEdit) return;
        const rooms = propertyRooms.map((area) => {
            const previousArea =
                previousReading?.roomReadings?.find(
                    (room) =>
                        room.areaId === area.areaId
                );
            return {
                areaId: area.areaId,
                name: area.name,
                previousReading:
                    previousArea?.currentReading ?? "",
                // Backend value आली आहे का?
                isPreviousReadingFromBackend:
                    previousArea?.currentReading !== undefined &&
                    previousArea?.currentReading !== null,
                currentReading: "",
            };
        });
        replaceRooms(rooms);
    }, [
        property,
        propertyRooms,
        previousReading,
        isEdit,
        replaceRooms,
    ]);

    // =====================================================
    // LOAD EXISTING READING FOR EDIT
    // =====================================================

    useEffect(() => {
        if (!isEdit || !existingReading || !property) return;

        const existingRooms =
            existingReading.roomReadings || [];

        const mergedRooms = propertyRooms.map((propertyRoom) => {
            const existingRoom = existingRooms.find(
                (room) =>
                    room.areaId === propertyRoom.areaId
            );

            if (existingRoom) {
                return {
                    areaId: propertyRoom.areaId,
                    name: propertyRoom.name,
                    previousReading:
                        existingRoom.previousReading ?? "",
                    currentReading:
                        existingRoom.currentReading ?? "",
                    consumedUnits:
                        existingRoom.consumedUnits ?? 0,
                    aceb:
                        existingRoom.aceb ?? 0,
                };
            }
            return {
                areaId: propertyRoom.areaId,
                name: propertyRoom.name,
                previousReading: "",
                currentReading: "",
                consumedUnits: 0,
                aceb: 0,
            };
        });

        reset({
            propertyId:
                existingReading.propertyId?._id ||
                existingReading.propertyId ||
                propertyId,

            month: existingReading.month || "",
            date: existingReading.date
                ? existingReading.date.substring(0, 10)
                : "",
            flatTotalEB:
                existingReading.flatTotalEB ?? "",
            flatTotalUnits:
                existingReading.flatTotalUnits ?? "",
            roomReadings: mergedRooms,
        });
    }, [
        isEdit,
        existingReading,
        property,
        propertyRooms,
        propertyId,
        reset,
    ]);

    const roomReadings =
        watch("roomReadings") || [];

    const onSubmit = (data) => {
            if (!isDirty) {
              toast.dismiss();
              toast.info("No changes detected.");
              return;
            }
        const payload = {
            propertyId: propertyId,
            month: data.month,
            lastMonth: data.month,
            date: convertStringFormatDate(data.date),
            flatTotalEB:
                Number(data.flatTotalEB || 0),
            flatTotalUnits:
                Number(data.flatTotalUnits || 0),
            roomReadings:
                (data.roomReadings || []).map((room) => ({
                    areaId: room.areaId,
                    name: room.name,
                    previousReading:
                        room.previousReading === ""
                            ? undefined
                            : Number(room.previousReading),
                    currentReading:
                        room.currentReading === ""
                            ? undefined
                            : Number(room.currentReading),
                })),
        };
        if (isEdit) {
            updateReading(
                {
                    id,
                    data: payload,
                },
                {
                    onSuccess: (res) => {
                        toast.dismiss();
                        toast.success(
                            res?.message ||
                            "Reading updated successfully"
                        );
                        navigate(
                            `/aceb-area/reading/${propertyId}`
                        );
                    },
                    onError: (err) => {
                        toast.dismiss();
                        toast.error(
                            err?.response?.data?.message ||
                            "Reading update failed"
                        );
                    },
                }
            );

            return;
        }
        createReading(
            payload,
            {
                onSuccess: (res) => {
                    toast.dismiss();
                    toast.success(
                        res?.message ||
                        "Reading created successfully"
                    );
                    navigate(
                        `/aceb-area/reading/${propertyId}`
                    );
                },
                onError: (err) => {
                    toast.dismiss();
                    toast.error(
                        err?.response?.data?.message ||
                        "Reading creation failed"
                    );
                },
            }
        );
    };
    if (
        loading &&
        (propertyLoading || readingLoading)
    ) {
        return (
            <div className="flex justify-center items-center py-10">
                <Loader />
            </div>
        );
    }

    return (
        <div className="space-y-5">
            <form
                onSubmit={handleSubmit(onSubmit)}
                className="space-y-5"
            >
                <div className="bg-white rounded-xl shadow-sm border border-gray-400 px-3 py-2">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <Link
                                to={`/aceb-area/reading/${propertyId}`}
                                className="p-2 border rounded-lg hover:bg-gray-100"
                            >
                                <ArrowLeft size={20} />
                            </Link>
                            <div>
                                <h1 className="text-2xl font-bold">
                                    {isEdit
                                        ? "Update Electricity Reading"
                                        : "Add Electricity Reading"}
                                </h1>
                                <p className="text-sm text-gray-500">
                                    {property?.propertyCode}{" "}
                                    -{" "}
                                    {property?.propertyName}
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <Link
                                to={`/aceb-area/reading/${propertyId}`}
                            >
                                <button
                                    type="button"
                                    className="border rounded-lg px-5 py-2 hover:bg-gray-100"
                                >
                                    Cancel
                                </button>
                            </Link>
                            <button
                                type="submit"
                                disabled={
                                    createLoading ||
                                    updateLoading
                                }
                                className="theme-btn text-white px-6 py-2 rounded-lg"
                            >
                                {createLoading ||
                                    updateLoading
                                    ? <div className='flex justify-center items-center gap-2'><Loader /> Processing...</div>
                                    : isEdit
                                        ? "Update Reading"
                                        : "Save Reading"}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm">
                    <div className="px-6 py-4 ">
                        <h2 className="text-lg font-semibold">
                            Reading Details
                        </h2>
                    </div>
                    <div className="p-6 grid md:grid-cols-4 gap-5">
                        {/* PROPERTY */}
                        <div className="form-group">
                            <input
                                value={
                                    property?.propertyCode ||
                                    ""
                                }
                                disabled
                                className="form-input bg-gray-100"
                                placeholder=" "
                            />
                            <label className="form-label">
                                Property Code
                            </label>
                        </div>
                        {/* MONTH */}
                        <Controller
                            name="month"
                            control={control}
                            rules={{ required: "Month is required" }}
                            render={({ field }) => (
                                <div className={`datepicker-group ${field.value ? "has-value" : ""}`}>
                                    <label className="datepicker-label required-label">
                                        Month
                                    </label>
                                    <DatePicker
                                        selected={
                                            field.value
                                                ? new Date(
                                                    Number(field.value.slice(-4)),
                                                    new Date(
                                                        `${field.value.slice(0, -4)} 1`
                                                    ).getMonth(),
                                                    1
                                                )
                                                : null
                                        }
                                        onChange={(date) => {
                                            if (!date) {
                                                field.onChange("");
                                                return;
                                            }
                                            const months = [
                                                "Jan", "Feb", "Mar", "Apr",
                                                "May", "Jun", "Jul", "Aug",
                                                "Sep", "Oct", "Nov", "Dec",
                                            ];
                                            field.onChange(
                                                `${months[date.getMonth()]}${date.getFullYear()}`
                                            );
                                        }}
                                        dateFormat="MMM yyyy"
                                        showMonthYearPicker
                                        className="custom-datepicker"
                                    />
                                </div>
                            )}
                        />
                        {/* DATE */}
                        <Controller
                            name="date"
                            control={control}
                            rules={{ required: "Reading date is required" }}
                            render={({ field }) => (
                                <div className={`datepicker-group ${field.value ? "has-value" : ""}`}>
                                    <label className="datepicker-label required-label">
                                        Reading Date
                                    </label>
                                    <DatePicker
                                        selected={field.value ? new Date(field.value) : null}
                                        onChange={(date) => field.onChange(date)}
                                        dateFormat="dd MMM yyyy"
                                        placeholderText="Select Date"
                                        className="custom-datepicker"
                                    />
                                </div>
                            )}
                        />
                        {/* ROOM COUNT */}
                        <div className="form-group">
                            <input
                                value={
                                    propertyRooms.length
                                }
                                disabled
                                className="form-input bg-gray-100"
                                placeholder=" "
                            />
                            <label className="form-label">
                                Total Rooms
                            </label>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm">
                    <div className="px-6 py-4 ">
                        <h2 className="text-lg font-semibold">
                            Flat Electricity Details
                        </h2>
                    </div>
                    <div className="p-6 grid md:grid-cols-4 gap-5">
                        {/* TOTAL EB */}
                        <div className="form-group">
                            <input
                                type="number"
                                step="0.01"
                                {...register(
                                    "flatTotalEB",
                                    {
                                        required:
                                            "Flat total EB is required",

                                        min: {
                                            value: 0,
                                            message:
                                                "Value cannot be negative",
                                        },
                                    }
                                )}
                                className="form-input"
                                placeholder=" "
                            />
                            <label className="form-label required-label">
                                Flat Total EB
                            </label>
                            {errors.flatTotalEB && (
                                <p className="text-red-500 text-sm mt-1">
                                    {
                                        errors
                                            .flatTotalEB
                                            .message
                                    }
                                </p>
                            )}
                        </div>
                        {/* TOTAL UNITS */}
                        <div className="form-group">
                            <input
                                type="number"
                                step="0.01"
                                {...register(
                                    "flatTotalUnits",
                                    {
                                        required:
                                            "Flat total units is required",

                                        min: {
                                            value: 0,
                                            message:
                                                "Value cannot be negative",
                                        },
                                    }
                                )}
                                className="form-input"
                                placeholder=" "
                            />

                            <label className="form-label required-label">
                                Flat Total Units
                            </label>
                            {errors.flatTotalUnits && (
                                <p className="text-red-500 text-sm mt-1">
                                    {
                                        errors
                                            .flatTotalUnits
                                            .message
                                    }
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm">
                    <div className="px-6 py-4 ">
                        <h2 className="text-lg font-semibold">
                            Room Readings
                        </h2>
                        <p className="text-sm text-gray-500">
                            Enter current meter reading for
                            each room
                        </p>
                    </div>
                    <div className="p-6 overflow-x-auto">
                        <table className="w-full border ">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="p-3 text-left border">
                                        Room
                                    </th>
                                    <th className="p-3 text-left border">
                                        Previous Reading
                                    </th>
                                    <th className="p-3 text-left border">
                                        Current Reading
                                    </th>
                                    {isEdit && (
                                        <>
                                            <th className="p-3 text-left border">
                                                Units
                                            </th>
                                            <th className="p-3 text-left border">
                                                ACEB
                                            </th>
                                        </>
                                    )}
                                </tr>
                            </thead>
                            <tbody>
                                {roomFields.length > 0 ? (
                                    roomFields.map(
                                        (field, index) => (
                                            <tr
                                                key={field.id}
                                                className="border-t"
                                            >
                                                {/* ROOM */}
                                                <td className="p-3 border font-semibold">
                                                    {field.name}
                                                    <input
                                                        type="hidden"
                                                        {...register(
                                                            `roomReadings.${index}.areaId`
                                                        )}
                                                    />
                                                    <input
                                                        type="hidden"
                                                        {...register(
                                                            `roomReadings.${index}.name`
                                                        )}
                                                    />
                                                </td>
                                                {/* PREVIOUS */}
                                                <td className="p-3 border">
                                                    <input
                                                        type="number"
                                                        step="0.01"
                                                        {...register(
                                                            `roomReadings.${index}.previousReading`,
                                                            {
                                                                min: {

                                                                    message: "Invalid reading",
                                                                },
                                                            }
                                                        )}
                                                        disabled={
                                                            roomReadings[index]
                                                                ?.isPreviousReadingFromBackend === true
                                                        }
                                                        className={`border rounded-lg px-3 py-2 w-full ${roomReadings[index]
                                                            ?.isPreviousReadingFromBackend === true
                                                            ? "bg-gray-100 cursor-not-allowed"
                                                            : ""
                                                            }`}
                                                    />
                                                    {errors.roomReadings?.[index]?.previousReading && (
                                                        <p className="text-red-500 text-xs mt-1">
                                                            {
                                                                errors.roomReadings[index]
                                                                    .previousReading.message
                                                            }
                                                        </p>
                                                    )}
                                                </td>
                                                {/* CURRENT */}
                                                <td className="p-3 border">
                                                    <input
                                                        type="number"
                                                        step="0.01"
                                                        {...register(
                                                            `roomReadings.${index}.currentReading`,
                                                            {
                                                                // required:
                                                                //     "Current reading is required",

                                                                min: {
                                                                    value: 0,
                                                                    message:
                                                                        "Invalid reading",
                                                                },
                                                            }
                                                        )}
                                                        className="border rounded-lg px-3 py-2 w-full"
                                                    />
                                                    {errors
                                                        .roomReadings?.[
                                                        index
                                                    ]
                                                        ?.currentReading && (
                                                            <p className="text-red-500 text-xs mt-1">
                                                                {
                                                                    errors
                                                                        .roomReadings[
                                                                        index
                                                                    ]
                                                                        .currentReading
                                                                        .message
                                                                }
                                                            </p>
                                                        )}
                                                </td>
                                                {/* BACKEND CALCULATED UNITS */}
                                                {isEdit && (
                                                    <td className="p-3 border">
                                                        <input
                                                            value={
                                                                roomReadings[
                                                                    index
                                                                ]
                                                                    ?.consumedUnits ??
                                                                0
                                                            }
                                                            disabled
                                                            className="bg-gray-100 border rounded-lg px-3 py-2 w-full"
                                                        />
                                                    </td>
                                                )}
                                                {/* BACKEND CALCULATED ACEB */}
                                                {isEdit && (
                                                    <td className="p-3 border">
                                                        <input
                                                            value={
                                                                roomReadings[
                                                                    index
                                                                ]?.aceb ??
                                                                0
                                                            }
                                                            disabled
                                                            className="bg-gray-100 border rounded-lg px-3 py-2 w-full"
                                                        />
                                                    </td>
                                                )}
                                            </tr>
                                        )
                                    )
                                ) : (
                                    <tr>
                                        <td
                                            colSpan={
                                                isEdit
                                                    ? 5
                                                    : 3
                                            }
                                            className="p-6 text-center text-gray-500"
                                        >
                                            No rooms found for
                                            this property.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {isEdit && existingReading && (
                    <div className="bg-white rounded-xl shadow-sm">
                        <div className="px-6 py-4 ">
                            <h2 className="text-lg font-semibold">
                                Calculation Summary
                            </h2>
                        </div>
                        <div className="p-6 grid md:grid-cols-4 gap-5">
                            {/* PER UNIT COST */}
                            <div className="form-group">
                                <input
                                    value={
                                        existingReading
                                            .perUnitCost ??
                                        0
                                    }
                                    disabled
                                    className="form-input bg-gray-100"
                                    placeholder=" "
                                />
                                <label className="form-label">
                                    Per Unit Cost
                                </label>
                            </div>
                            {/* ACTUAL UNITS */}
                            <div className="form-group">
                                <input
                                    value={
                                        existingReading
                                            .actualTotalUnits ??
                                        0
                                    }
                                    disabled
                                    className="form-input bg-gray-100"
                                    placeholder=" "
                                />
                                <label className="form-label">
                                    Actual Total Units
                                </label>
                            </div>
                            {/* ACTUAL EB */}
                            <div className="form-group">
                                <input
                                    value={
                                        existingReading
                                            .actualTotalEB ??
                                        0
                                    }
                                    disabled
                                    className="form-input bg-gray-100"
                                    placeholder=" "
                                />
                                <label className="form-label">
                                    Actual Total EB
                                </label>
                            </div>
                            {/* COMMON EB */}
                            <div className="form-group">
                                <input
                                    value={
                                        existingReading
                                            .commonTotalEB ??
                                        0
                                    }
                                    disabled
                                    className="form-input bg-gray-100"
                                    placeholder=" "
                                />
                                <label className="form-label">
                                    Common Total EB
                                </label>
                            </div>
                        </div>
                    </div>
                )}
                <div className="rounded-xl px-6 py-4 flex justify-end gap-3">
                    <Link
                        to={`/aceb-area/reading/${propertyId}`}
                    >
                        <button
                            type="button"
                            className="border rounded-lg px-5 py-2 hover:bg-gray-100"
                        >
                            Cancel
                        </button>
                    </Link>
                    <button
                        type="submit"
                        disabled={
                            createLoading ||
                            updateLoading
                        }
                        className="theme-btn text-white px-6 py-2 rounded-lg"
                    >
                        {createLoading ||
                            updateLoading
                            ? <div className='flex justify-center items-center gap-2'><Loader /> Processing...</div>
                            : isEdit
                                ? "Update Reading"
                                : "Save Reading"}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ACEBReadingCreateEdit;
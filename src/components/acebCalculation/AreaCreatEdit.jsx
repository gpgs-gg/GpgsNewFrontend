import React, { useEffect } from "react";
import { useFieldArray, useForm, Controller } from "react-hook-form";
import { Link, useNavigate, useParams } from "react-router-dom";
import Select from "react-select";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "react-toastify";

import Loader from "../common/Loader";
import { selectStyles } from "../../utils/selectStyles";

import {
    useCreatePropertyData,
    useSinglePropertyData,
    useUpdatePropertyData,
} from "./services";
import { getPropertyDropdown } from "../properties/services";
import { AsyncPaginate } from "react-select-async-paginate";

const AreaCreateEdit = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEdit = !!id;

    const {
        register,
        control,
        handleSubmit,
        reset,
        setValue,
        formState: { errors },
    } = useForm({
        defaultValues: {
            propertyCode: "",
            
            location: "",
            areas: [],
        },
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: "areas",
    });
    const { data: propertyData, isLoading: propertyLoading } =
        useSinglePropertyData(id);
    const {
        mutate: createProperty,
        isPending: createLoading,
    } = useCreatePropertyData();
    const {
        mutate: updateProperty,
        isPending: updateLoading,
    } = useUpdatePropertyData();
    const loading = createLoading || updateLoading;

    const TypeOptions = [
        { value: "ROOM", label: "Room" },
        { value: "KITCHEN", label: "Kitchen" },
        { value: "HALL", label: "Hall" },
    ];
    const StatusOptions = [
        { value: true, label: "Active" },
        { value: false, label: "Inactive" },
    ];
    const loadPropertyOptions = async (
        search,
        loadedOptions,
        { page }
    ) => {
        const res = await getPropertyDropdown({
            page,
            limit: 10,
            search,
        });
        const options = [
            ...new Map(
                res.data.map((item) => [
                    item.propertyCode,
                    {
                        value: item.propertyCode,
                        label: item.propertyCode,
                        propLocation: item.propertyLocation, // <-- Add this
                    },
                ])
            ).values(),
        ];

        return {
            options,
            hasMore: res.hasMore,
            additional: {
                page: page + 1,
            },
        };
    };

    useEffect(() => {
        if (isEdit && propertyData?.data) {
            const property = propertyData.data;
            reset({
                propertyCode: property.propertyCode || "",
                propertyName: property.propertyName || "",
                location: property.location || "",
                areas: (property.areas || []).map((area) => ({
                    // areaId: area.areaId || "",
                    name: area.name || "",
                    type: area.type || "",
                    isActive:
                        area.isActive !== undefined ? area.isActive : true,
                })),
            });
        }
    }, [propertyData, isEdit, reset]);

    const addArea = () => {
        append({
            name: "",
            type: "",
            isActive: true,
        });
    };

    const onSubmit = (data) => {
        const payload = {
            propertyCode: data.propertyCode,
             location: data.location,
            areas: data.areas.map((area) => ({
                areaId: area.areaId,
                name: area.name,
                type: area.type,
                isActive: area.isActive,
            })),
        };

        if (isEdit) {
            updateProperty(
                {
                    id,
                    data: payload,
                },
                {
                    onSuccess: (res) => {
                        toast.dismiss();
                        toast.success(res.message || "Property updated successfully");
                        navigate("/aceb-area");
                    },
                    onError: (err) => {
                        toast.dismiss();
                        toast.error(
                            err?.response?.data?.message || "Property update failed"
                        );
                    },
                }
            );
        } else {
            createProperty(payload, {
                onSuccess: (res) => {
                    toast.dismiss();
                    toast.success(res.message || "Property created successfully");
                    navigate("/aceb-area");
                },
                onError: (err) => {
                    toast.dismiss();
                    toast.error(
                        err?.response?.data?.message || "Property creation failed"
                    );
                },
            });
        }
    };
    if (isEdit && propertyLoading) {
        return (
            <div className="flex justify-center items-center py-10">
                <Loader />
            </div>
        );
    }
    return (
        <div className="space-y-5">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                {/* Header */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-400 px-3 py-2">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-bold">
                                {isEdit ? "Update Property" : "Create Property"}
                            </h1>
                            <p className="text-sm text-gray-500">
                                Manage property details and areas
                            </p>
                        </div>

                        <div className="flex gap-3">
                            <Link to="/aceb-area">
                                <button
                                    type="button"
                                    className="border rounded-lg px-5 py-2 hover:bg-gray-100"
                                >
                                    Cancel
                                </button>
                            </Link>
                            <button
                                type="submit"
                                disabled={loading}
                                className="theme-btn text-white px-6 py-2 rounded-lg flex items-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <Loader />
                                        Processing...
                                    </>
                                ) : isEdit ? (
                                    "Update Property"
                                ) : (
                                    "Create Property"
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Property Details */}
                <div className="bg-white rounded-xl shadow-sm">
                    <div className="px-6 py-4 ">
                        <h2 className="text-lg font-semibold">
                            Property Details
                        </h2>
                    </div>
                    <div className="p-6 grid md:grid-cols-4 gap-5">
                        {/* Property Code */}
                        <div className="form-group">
                            {/* Property */}
                            <Controller
                                name="propertyCode"
                                control={control}
                                rules={{
                                    required: "Property is required",
                                }}
                                render={({ field }) => (
                                    <div className={`select-group ${field.value ? "has-value" : ""}`}>
                                        <label className="select-label form-label required-label">
                                            Property Code
                                        </label>

                                        <AsyncPaginate
                                            additional={{ page: 1 }}
                                            debounceTimeout={500}
                                            isClearable
                                            isDisabled={id ? true : false}
                                            placeholder=""
                                            loadOptions={loadPropertyOptions}
                                            styles={selectStyles}
                                            value={
                                                field.value
                                                    ? {
                                                        value: field.value,
                                                        label: field.value,
                                                    }
                                                    : null
                                            }
                                            onChange={(selected) => {
                                                field.onChange(selected?.value || ""); // Sirf value save hogi

                                                setValue(
                                                    "location",
                                                    selected?.propLocation || ""
                                                );
                                            }}
                                        />
                                        {errors.propertyCode && (
                                            <p className="text-red-500 text-sm mt-1">
                                                {errors.propertyCode.message}
                                            </p>
                                        )}
                                    </div>
                                )}
                            />
                        </div>
                    </div>
                </div>

                {/* Areas */}
                <div className="bg-white rounded-xl shadow-sm">
                    <div className="px-6 py-4  flex justify-between items-center">
                        <div>
                            <h2 className="text-lg font-semibold">
                                Property Areas
                            </h2>
                            <p className="text-sm text-gray-500">
                                Add rooms and other property areas
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={addArea}
                            className="theme-btn text-white px-4 py-2 rounded-lg flex items-center gap-2"
                        >
                            <Plus size={18} />
                            Add Area
                        </button>
                    </div>
                    <div className="p-6 space-y-4">

                        {fields.length === 0 && (
                            <div className="text-center py-8 text-gray-500 border border-dashed rounded-lg">
                                No areas added. Click "Add Area" to add one.
                            </div>
                        )}
                        {fields.map((field, index) => (

                            <div
                                key={field.id}
                                className="border rounded-xl p-4"
                            >
                                <div className="flex justify-between items-center mb-4">

                                    <h3 className="font-semibold">
                                        Area {index + 1}
                                    </h3>

                                    <button
                                        type="button"
                                        onClick={() => remove(index)}
                                        className="text-red-500 hover:text-red-700"
                                    >
                                        <Trash2 size={18} />
                                    </button>

                                </div>
                                <div className="grid md:grid-cols-4 gap-5">
                                    {/* Area Name */}
                                    <div className="form-group">
                                        <input
                                            {...register(`areas.${index}.name`, {
                                                required: "Area name is required",
                                            })}
                                            className="form-input"
                                            placeholder=" "
                                        />
                                        <label className="form-label required-label">
                                            Area Name
                                        </label>
                                        {errors.areas?.[index]?.name && (
                                            <p className="text-red-500 text-sm mt-1">
                                                {errors.areas[index].name.message}
                                            </p>
                                        )}
                                    </div>
                                    {/* Type */}
                                    <Controller
                                        name={`areas.${index}.type`}
                                        control={control}
                                        rules={{
                                            required: "Area type is required",
                                        }}
                                        render={({ field }) => (
                                            <div
                                                className={`select-group ${field.value ? "has-value" : ""
                                                    }`}
                                            >
                                                <label className="select-label form-label required-label">
                                                    Type
                                                </label>

                                                <Select
                                                    options={TypeOptions}
                                                    placeholder=""
                                                    isClearable
                                                    value={TypeOptions.find(
                                                        (x) => x.value === field.value
                                                    )}
                                                    onChange={(selected) =>
                                                        field.onChange(selected?.value || "")
                                                    }
                                                    styles={selectStyles}
                                                />

                                                {errors.areas?.[index]?.type && (
                                                    <p className="text-red-500 text-sm mt-1">
                                                        {errors.areas[index].type.message}
                                                    </p>
                                                )}
                                            </div>
                                        )}
                                    />

                                    {/* Status */}
                                    <Controller
                                        name={`areas.${index}.isActive`}
                                        control={control}
                                        render={({ field }) => (
                                            <div
                                                className={`select-group ${field.value !== undefined &&
                                                    field.value !== null
                                                    ? "has-value"
                                                    : ""
                                                    }`}
                                            >
                                                <label className="select-label form-label">
                                                    Status
                                                </label>
                                                <Select
                                                    options={StatusOptions}
                                                    placeholder=""
                                                    value={StatusOptions.find(
                                                        (x) => x.value === field.value
                                                    )}
                                                    onChange={(selected) =>
                                                        field.onChange(
                                                            selected?.value ?? true
                                                        )
                                                    }
                                                    styles={selectStyles}
                                                />
                                            </div>
                                        )}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <div className="rounded-xl px-6 py-4 flex justify-end gap-3">

                    <Link to="/aceb-area">
                        <button
                            type="button"
                            className="border rounded-lg px-5 py-2 hover:bg-gray-100"
                        >
                            Cancel
                        </button>
                    </Link>

                    <button
                        type="submit"
                        disabled={loading}
                        className="theme-btn text-white px-6 py-2 rounded-lg flex items-center gap-2"
                    >
                        {loading ? (
                            <>
                                <Loader />
                                Processing...
                            </>
                        ) : isEdit ? (
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

export default AreaCreateEdit;
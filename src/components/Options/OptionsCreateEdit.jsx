import React, { useEffect } from "react";
import { Trash2 } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm, useFieldArray } from "react-hook-form";
import {
    useCreateMasterData,
    useUpdateMasterData,
    useSingleMasterData,
} from "./services/index";
import { toast } from "react-toastify";

const defaultValues = {
    categoryKey: "",
    categoryName: "",

    items: [
        {
            label: "",
            value: "",
            code: "",
            displayOrder: 1,
            isDefault: false,
            isActive: true,
        },
    ],

    description: "",
};

const OptionsCreateEdit = () => {
    const navigate = useNavigate();
    const { id } = useParams();

    const editId = id;
    const isEdit = Boolean(id);

    // ================================
    // React Hook Form
    // ================================
    const {
        register,
        handleSubmit,
        reset,
        watch,
        setValue,
        control,
        formState: { errors },
    } = useForm({
        defaultValues,
    });
    const { fields, append, remove } = useFieldArray({
        control,
        name: "items",
    });
    // ================================
    // Queries
    // ================================
    const { data: singleMaster, isLoading: singleLoading } =
        useSingleMasterData(id);

    const createMutation = useCreateMasterData();

    const updateMutation = useUpdateMasterData();

    // ================================
    // Auto Generate Category Key
    // Example:
    // Sharing Type -> sharingType
    // Payment Mode -> paymentMode
    // ================================
    const categoryName = watch("categoryName");

    useEffect(() => {
        if (!isEdit && categoryName) {
            const key = categoryName
                .trim()
                .split(" ")
                .map((word, index) =>
                    index === 0
                        ? word.toLowerCase()
                        : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
                )
                .join("");

            setValue("categoryKey", key);
        }
    }, [categoryName, isEdit, setValue]);

    // ================================
    // Populate Form in Edit Mode
    // ================================
    useEffect(() => {
        if (isEdit && singleMaster?.data) {
            reset({
                categoryKey: singleMaster.data.categoryKey,
                categoryName: singleMaster.data.categoryName,
                description: singleMaster.data.description,

                items: singleMaster.data.items.map((item) => ({
                    _id: item._id,
                    label: item.label,
                    value: item.value,
                    code: item.code,
                    displayOrder: item.displayOrder,
                    isDefault: item.isDefault,
                    isActive: item.isActive,
                })),
            });
        }

        if (!isEdit) {
            reset(defaultValues);
        }
    }, [singleMaster, isEdit, reset]);

    // ================================
    // Submit
    // ================================
  const onSubmit = async (formData) => {
  try {
    if (isEdit) {
      const response = await updateMutation.mutateAsync({
        id,
        data: {
          categoryName: formData.categoryName,
          description: formData.description,
          items: formData.items,
        },
      });

      toast.success(
        response?.message || "updated successfully."
      );
    } else {
      const response = await createMutation.mutateAsync({
        categoryKey: formData.categoryKey,
        categoryName: formData.categoryName,
        description: formData.description,
        items: formData.items,
      });

      toast.success(
        response?.message || "created successfully."
      );
    }

    reset(defaultValues);
    navigate("/options");
  } catch (error) {
    toast.error(
      error?.response?.data?.message ||
      error?.message ||
      "Something went wrong."
    );
  }
};

    return (
        <div className="max-w-12xl mx-auto px-6">
            {/* ================= Form ================= */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* ================= Header ================= */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-bold">
                                {isEdit ? "Update Master Data" : "Create Master Data"}
                            </h1>

                            <p className="text-sm text-gray-500">
                                {isEdit
                                    ? "Update existing master values"
                                    : "Create application master values"}
                            </p>
                        </div>

                        <div className="flex justify-end gap-5">
                            <button
                                type="button"
                                onClick={() => navigate("/options")}
                                className="border border-gray-600 hover:bg-gray-700 hover:text-white px-6 py-2 rounded-lg font-medium"
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                disabled={createMutation.isPending || updateMutation.isPending}
                                className="theme-btn text-white px-4 py-2 rounded-lg hover:bg-gray-700"
                            >
                                {isEdit ? "Update" : "Create"}
                            </button>
                        </div>
                    </div>
                </div>
                {/* details */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h2 className="text-xl font-semibold mb-4">Category Details</h2>
                    {/* input fields */}
                    <div className="grid grid-cols-1 gap-6 px-4 md:grid-cols-2 bg-white">
                        {/* Category Name */}
                        <div className="form-group">
                            <input
                                {...register("categoryName", {
                                    required: "Category Name is required",
                                })}
                                placeholder=" "
                                className="form-input"
                            />

                            <label className="form-label">
                                Category Name <span className="text-red-500">*</span>
                            </label>

                            {errors.categoryName && (
                                <p className="mt-1 text-xs text-red-500">
                                    {errors.categoryName.message}
                                </p>
                            )}
                        </div>

                        {/* Category Key */}
                        <div className="form-group">
                            <input
                                {...register("categoryKey")}
                                placeholder=" "
                                readOnly={isEdit}
                                className="form-input bg-gray-100"
                            />

                            <label className="form-label">Category Key</label>
                        </div>

                        <div className="md:col-span-2">
                            <h3 className="font-semibold text-lg">Options</h3>

                            <div className="space-y-5 ">
                                {fields.map((field, index) => (
                                    <div
                                        key={field.id}
                                        className="rounded-xl border  border-gray-200 bg-gray-50 p-5"
                                    >
                                        <div className="flex items-center justify-center gap-4">
                                            <div className="form-group max-w-[350px]">
                                                <input
                                                    {...register(`items.${index}.label`, {
                                                        required: true,
                                                        onChange: (e) =>
                                                            setValue(`items.${index}.value`, e.target.value),
                                                    })}
                                                    placeholder=" "
                                                    className="form-input"
                                                />

                                                <label className="form-label">Label</label>
                                            </div>

                                            <div className="form-group  max-w-[350px]">
                                                <input
                                                    {...register(`items.${index}.value`, {
                                                        required: true,
                                                    })}
                                                    placeholder=" "
                                                    className="form-input"
                                                />

                                                <label className="form-label">Value</label>
                                            </div>
                                            {/* delete */}
                                            <div>
                                                {fields.length > 1 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => remove(index)}
                                                        className=" inline-flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-600 transition-all duration-200 hover:border-red-300 hover:bg-red-100 hover:text-red-700"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        {/* <div className="flex justify-between items-center ">
                     
                      {fields.length > 1 && (
                        <button
                          type="button"
                          onClick={() => remove(index)}
                          className="mt-4 inline-flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-600 transition-all duration-200 hover:border-red-300 hover:bg-red-100 hover:text-red-700"
                        >
                          <Trash2 size={16} />
                          Delete Option
                        </button>
                      )}
                    </div> */}
                                    </div>
                                ))}
                            </div>
                            <div className="flex items-center justify-between mb-2">

                                <h3 className="font-semibold text-lg"></h3>
                                <button
                                    type="button"
                                    onClick={() =>
                                        append({
                                            label: "",
                                            value: "",
                                            code: "",
                                            displayOrder: fields.length + 1,
                                            isDefault: false,
                                            isActive: true,
                                        })
                                    }
                                    className=" px-2 mt-2 rounded-lg font-bold cursor-pointer"
                                >
                                    + Add Option
                                </button>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="md:col-span-2">
                            <div className="form-group md:col-span-2">
                                <textarea
                                    rows={3}
                                    {...register("description")}
                                    placeholder=" "
                                    className="form-input resize-none"
                                />

                                <label className="form-label">Description</label>
                            </div>
                        </div>

                        {/* Default */}
                        {/* <div>
              <label className="flex cursor-pointer items-center gap-3">
                <input type="checkbox" {...register("isDefault")} />

                <span className="text-sm font-medium">Default Value</span>
              </label>
            </div> */}

                        {/* Status */}
                        {/* <div>
              <label className="flex cursor-pointer items-center gap-3">
                <input type="checkbox" {...register("isActive")} />

                <span className="text-sm font-medium">Active</span>
              </label>
            </div> */}
                    </div>
                </div>

                {/* ================= Footer ================= */}

                <div className="flex justify-end gap-3  px-6 py-4">
                    <button
                        type="button"
                        onClick={() => {
                            reset(defaultValues);
                            navigate("/options");
                        }}
                        className="rounded-lg border border-gray-300 px-6 py-2 hover:bg-gray-100"
                    >
                        Cancel
                    </button>

                    <button
                        type="submit"
                        disabled={
                            createMutation.isPending ||
                            updateMutation.isPending ||
                            singleLoading
                        }
                        className="theme-btn rounded-lg px-6 py-2 text-white disabled:opacity-50"
                    >
                        {createMutation.isPending || updateMutation.isPending
                            ? "Saving..."
                            : isEdit
                                ? "Update"
                                : "Create"}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default OptionsCreateEdit;
import React, { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import Select from "react-select";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";

import {
  useCreateModuleData,
  useSingleModuleData,
  useUpdateModuleData,
} from "./services";

import { selectStyles } from "../../utils/selectStyles";
import Loader from "../common/Loader";

const ModuleCreateEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      key: "",
      name: "",
      path: "",
      moduleType: "MENU",

      actions: {
        view: true,
        add: false,
        edit: false,
        delete: false,
        singleView: false,
      },

      isActive: true,
      sortOrder: 0,
    },

    mode: "onSubmit",
  });

  // =========================
  // API
  // =========================

  const { mutate: createModule, isPending: isCreating } = useCreateModuleData();

  const { mutate: updateModule, isPending: isUpdating } = useUpdateModuleData();

  const { data: singleModuleResponse, isLoading: isSingleLoading } =
    useSingleModuleData(id);

  // =========================
  // Load Existing Data
  // =========================

  useEffect(() => {
    const moduleData = singleModuleResponse?.data;

    if (!moduleData) return;

    reset({
      key: moduleData.key || "",
      name: moduleData.name || "",
      path: moduleData.path || "",
      moduleType: moduleData.moduleType || "MENU",

      actions: {
        view: moduleData.actions?.view ?? true,
        add: moduleData.actions?.add ?? false,
        edit: moduleData.actions?.edit ?? false,
        delete: moduleData.actions?.delete ?? false,
        singleView: moduleData.actions?.singleView ?? false,
      },

      isActive: moduleData.isActive ?? true,
      sortOrder: moduleData.sortOrder ?? 0,
    });
  }, [singleModuleResponse, reset]);

  // =========================
  // Options
  // =========================

  const moduleTypeOptions = [
    {
      value: "MENU",
      label: "Menu",
    },
    {
      value: "ACTION",
      label: "Action",
    },
  ];

  const statusOptions = [
    {
      value: true,
      label: "Active",
    },
    {
      value: false,
      label: "Inactive",
    },
  ];

  // =========================
  // Submit
  // =========================

  const onSubmit = (data) => {
    if (!id) {
      data.isActive = true;
    }

    if (id) {
      updateModule(
        {
          id,
          data,
        },
        {
          onSuccess: (response) => {
            toast.dismiss();

            toast.success(response?.message || "Module updated successfully");

            navigate("/modules");
          },

          onError: (error) => {
            toast.dismiss();

            toast.error(
              error?.response?.data?.message ||
                error?.message ||
                "Something went wrong",
            );
          },
        },
      );

      return;
    }

    createModule(data, {
      onSuccess: (response) => {
        toast.dismiss();

        toast.success(response?.message || "Module created successfully");

        navigate("/modules");
      },

      onError: (error) => {
        toast.dismiss();

        toast.error(
          error?.response?.data?.message ||
            error?.message ||
            "Something went wrong",
        );
      },
    });
  };

  const isProcessing = isCreating || isUpdating;

  // =========================
  // Loading
  // =========================

  if (id && isSingleLoading) {
    return <Loader />;
  }

  return (
    <div className="max-w-12xl mx-auto px-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* ================= HEADER ================= */}

        <div className="bg-white rounded-xl shadow-sm border border-gray-400 px-4 py-2">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">
                {id ? "Update Module" : "Create Module"}
              </h1>

              <p className="text-sm text-gray-500">
                {id
                  ? "Update existing module details"
                  : "Create and manage system modules"}
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
                disabled={isProcessing}
                className="theme-btn text-white px-4 py-2 rounded-lg hover:bg-gray-700"
              >
                {isProcessing ? (
                  <>
                    <Loader />
                    Processing...
                  </>
                ) : id ? (
                  "Update Module"
                ) : (
                  "Create Module"
                )}
              </button>
            </div>
          </div>
        </div>

        {/* ================= MODULE DETAILS ================= */}

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold mb-4">Module Details</h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Key */}

            <div className="form-group">
              <input
                {...register("key", {
                  required: "Module key is required",

                  validate: (value) =>
                    value?.trim() !== "" || "Module key is required",
                })}
                placeholder=" "
                disabled={!!id}
                className={`form-input ${errors.key ? "border-red-500" : ""} ${
                  id ? "bg-gray-100 text-gray-500 cursor-not-allowed" : ""
                }`}
              />

              <label className="form-label required-label">Module Key</label>

              {errors.key && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.key.message}
                </p>
              )}
            </div>

            {/* Name */}

            <div className="form-group">
              <input
                {...register("name", {
                  required: "Module name is required",

                  validate: (value) =>
                    value?.trim() !== "" || "Module name is required",
                })}
                placeholder=" "
                className={`form-input ${errors.name ? "border-red-500" : ""}`}
              />

              <label className="form-label required-label">Module Name</label>

              {errors.name && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* Path */}
            {/* 
            <div className="form-group">
              <input
                {...register("path", {
                  required: "Path is required",

                  validate: (value) =>
                    value?.trim() !== "" || "Path is required",
                })}
                placeholder=" "
                className={`form-input ${errors.path ? "border-red-500" : ""}`}
              />

              <label className="form-label required-label">Path</label>

              {errors.path && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.path.message}
                </p>
              )}
            </div> */}
            <div className="form-group">
              <input
                {...register("path", {
                  required: "Path is required",
                  validate: (value) =>
                    value?.trim() !== "" || "Path is required",
                })}
                placeholder=" "
                disabled={!!id}
                className={`form-input ${errors.path ? "border-red-500" : ""} ${
                  id ? "bg-gray-100 text-gray-500 cursor-not-allowed" : ""
                }`}
              />

              <label className="form-label required-label">Path</label>

              {errors.path && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.path.message}
                </p>
              )}
            </div>
            {/* Module Type */}

            <Controller
              name="moduleType"
              control={control}
              rules={{
                required: "Please select module type",
              }}
              render={({ field }) => (
                <div>
                  <div
                    className={`select-group ${field.value ? "has-value" : ""}`}
                  >
                    <label className="select-label required-label">
                      Module Type
                    </label>

                    <Select
                      value={
                        moduleTypeOptions.find(
                          (option) => option.value === field.value,
                        ) || null
                      }
                      onChange={(option) => field.onChange(option?.value || "")}
                      options={moduleTypeOptions}
                      isClearable
                      isSearchable={false}
                      placeholder=""
                      styles={selectStyles}
                    />
                  </div>

                  {errors.moduleType && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.moduleType.message}
                    </p>
                  )}
                </div>
              )}
            />

            {/* Sort Order */}

            <div className="form-group">
              <input
                {...register("sortOrder", {
                  valueAsNumber: true,
                  min: {
                    value: 0,
                    message: "Sort order cannot be negative",
                  },
                })}
                type="number"
                min="0"
                placeholder=" "
                className="form-input"
              />

              <label className="form-label">Sort Order</label>

              {errors.sortOrder && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.sortOrder.message}
                </p>
              )}
            </div>

            {/* Status */}

            {id && (
              <Controller
                name="isActive"
                control={control}
                render={({ field }) => (
                  <div
                    className={`select-group ${
                      field.value !== undefined ? "has-value" : ""
                    }`}
                  >
                    <label className="select-label">Status</label>

                    <Select
                      value={
                        statusOptions.find(
                          (option) => option.value === field.value,
                        ) || null
                      }
                      onChange={(option) =>
                        field.onChange(option?.value ?? true)
                      }
                      options={statusOptions}
                      isClearable={false}
                      isSearchable={false}
                      placeholder=""
                      styles={selectStyles}
                    />
                  </div>
                )}
              />
            )}
          </div>
        </div>

        {/* ================= PERMISSIONS ================= */}

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold mb-4">Module Actions</h2>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {/* View */}

            <PermissionCheckbox
              name="actions.view"
              label="View"
              control={control}
              defaultChecked
            />

            {/* Add */}

            <PermissionCheckbox
              name="actions.add"
              label="Add"
              control={control}
            />

            {/* Edit */}

            <PermissionCheckbox
              name="actions.edit"
              label="Edit"
              control={control}
            />

            {/* Delete */}

            <PermissionCheckbox
              name="actions.delete"
              label="Delete"
              control={control}
            />

            {/* Single View */}

            <PermissionCheckbox
              name="actions.singleView"
              label="Single View"
              control={control}
            />
          </div>
        </div>

        {/* ================= BOTTOM BUTTONS ================= */}

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
            disabled={isProcessing}
            className="theme-btn text-white px-4 py-2 rounded-lg hover:bg-gray-700"
          >
            {isProcessing ? (
              <>
                <Loader />
                Processing...
              </>
            ) : id ? (
              "Update Module"
            ) : (
              "Create Module"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

// =====================================================
// Permission Checkbox
// =====================================================

const PermissionCheckbox = ({ name, label, control }) => {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <label className="flex items-center gap-3 border border-gray-200 rounded-lg p-4 cursor-pointer hover:bg-gray-50">
          <input
            type="checkbox"
            checked={!!field.value}
            onChange={(e) => field.onChange(e.target.checked)}
            className="h-5 w-5 cursor-pointer accent-blue-600"
          />

          <span className="font-medium text-gray-700">{label}</span>
        </label>
      )}
    />
  );
};

export default ModuleCreateEdit;

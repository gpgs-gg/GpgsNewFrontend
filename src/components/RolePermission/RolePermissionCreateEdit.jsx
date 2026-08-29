import React, { useEffect, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import Select from "react-select";
import { toast } from "react-toastify";
import {
  ShieldCheck,
  ListChecks,
  Pencil,
  Trash2,
  Eye,
  Plus,
} from "lucide-react";

import {
  useEmployeePermissionsData,
  useUpdateEmployeePermissionsData,
} from "./services";

import { useModulesData } from "../moduleSidebar/services/index";
import { useEmployeeDetailsData } from "../EmployeeDetails/Services/index";

import { selectStyles } from "../../utils/selectStyles";
import Loader from "../common/Loader";

const PermissionCreateEdit = () => {
  const navigate = useNavigate();
  const { id: employeeId } = useParams();

  // =====================================================
  // FORM
  // =====================================================

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      employeeId: "",
      permissions: [],
    },

    mode: "onSubmit",
  });

  const selectedEmployeeId = watch("employeeId");

  // =====================================================
  // EMPLOYEES
  // =====================================================

  const { data: employeeResponse, isLoading: isEmployeesLoading } =
    useEmployeeDetailsData({
      page: 1,
      limit: 1000,
      search: "",
      status: "Active",
    });

  // =====================================================
  // MODULES
  // =====================================================

  const { data: moduleResponse, isLoading: isModulesLoading } = useModulesData({
    page: 1,
    limit: 1000,
    search: "",
    moduleType: "MENU",
    isActive: "true",
  });

  // =====================================================
  // EXISTING EMPLOYEE PERMISSION
  // =====================================================

  const { data: permissionResponse, isLoading: isPermissionLoading } =
    useEmployeePermissionsData(employeeId);

  // =====================================================
  // UPDATE PERMISSIONS
  // =====================================================

  const { mutate: updatePermissions, isPending: isUpdating } =
    useUpdateEmployeePermissionsData();

  // =====================================================
  // DATA
  // =====================================================

  const employees = employeeResponse?.data || [];
  const modules = moduleResponse?.data || [];

  // =====================================================
  // EMPLOYEE OPTIONS
  // =====================================================

  const employeeOptions = useMemo(() => {
    return employees.map((employee) => ({
      value: employee._id,

      label: `${employee.employeeId || ""} - ${employee.employeeName || ""}`,
    }));
  }, [employees]);

  // =====================================================
  // LOAD EMPLOYEE + EXISTING PERMISSIONS
  // =====================================================

  useEffect(() => {
    if (!employeeId) return;

    // Permission API has not returned yet
    if (isPermissionLoading) return;

    const permissionData = permissionResponse?.data;

    // -----------------------------------------------------
    // Employee permission document exists
    // -----------------------------------------------------

    if (permissionData) {
      const normalizedPermissions = (permissionData.permissions || [])
        .map((permission) => {
          // moduleId is populated object from backend
          const moduleId =
            typeof permission.moduleId === "object"
              ? permission.moduleId?._id
              : permission.moduleId;

          if (!moduleId) {
            return null;
          }

          return {
            moduleId: moduleId.toString(),

            actions: {
              view: permission.actions?.view === true,
              add: permission.actions?.add === true,
              edit: permission.actions?.edit === true,
              delete: permission.actions?.delete === true,
              singleView: permission.actions?.singleView === true,
            },
          };
        })
        .filter(Boolean);

      reset({
        employeeId:
          permissionData.employeeId?._id?.toString() || employeeId.toString(),

        permissions: normalizedPermissions,
      });

      return;
    }

    // -----------------------------------------------------
    // Employee exists but has no permission document
    // -----------------------------------------------------

    reset({
      employeeId: employeeId.toString(),
      permissions: [],
    });
  }, [employeeId, permissionResponse, isPermissionLoading, reset]);

  // =====================================================
  // SUBMIT
  // =====================================================

  const onSubmit = (data) => {
    if (!data.employeeId) {
      toast.error("Please select an employee");
      return;
    }

    const cleanedPermissions = data.permissions
      .map((permission) => {
        const module = modules.find(
          (item) => item._id?.toString() === permission.moduleId?.toString(),
        );

        if (!module) {
          return null;
        }

        const actions = {
          view:
            module.actions?.view === true && permission.actions?.view === true,

          add: module.actions?.add === true && permission.actions?.add === true,

          edit:
            module.actions?.edit === true && permission.actions?.edit === true,

          delete:
            module.actions?.delete === true &&
            permission.actions?.delete === true,

          singleView:
            module.actions?.singleView === true &&
            permission.actions?.singleView === true,
        };

        if (!Object.values(actions).some(Boolean)) {
          return null;
        }

        return {
          moduleId: module._id,
          actions,
        };
      })
      .filter(Boolean);

    updatePermissions(
      {
        employeeId: data.employeeId,
        permissions: cleanedPermissions,
      },
      {
        onSuccess: (response) => {
          toast.dismiss();

          toast.success(
            response?.message || "Employee permissions updated successfully",
          );

          navigate("/permissions");
        },

        onError: (error) => {
          toast.dismiss();

          toast.error(
            error?.response?.data?.message ||
              error?.message ||
              "Failed to update employee permissions",
          );
        },
      },
    );
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (
    isEmployeesLoading ||
    isModulesLoading ||
    (employeeId && isPermissionLoading)
  ) {
    return <Loader />;
  }

  const isProcessing = isUpdating;

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* =================================================
            HEADER
        ================================================= */}

        <div className="bg-white rounded-xl shadow-sm border border-gray-400 px-4 py-2 md:py-6">
          <div className="grid grid-cols-1 md:grid-cols-3">
            <div>
              <div className="flex items-center gap-2">
                <ShieldCheck size={24} className="text-accent-slate-800" />

                <h1 className="text-2xl font-bold">
                  {employeeId
                    ? "Update Employee Permissions"
                    : "Create Employee Permissions"}
                </h1>
              </div>

              {/* <p className="text-sm text-gray-500">
                Manage employee module access and actions
              </p> */}
            </div>
            {/* employee */}
            <div className="px-2">
              <div className="form-group">
                <input
                  type="text"
                  value={
                    employeeOptions.find(
                      (option) => option.value === selectedEmployeeId,
                    )?.label || "Loading employee..."
                  }
                  readOnly
                  placeholder=" "
                  className="form-input bg-gray-100 text-gray-600 cursor-not-allowed"
                />

                <label className="form-label required-label">Employee</label>
              </div>
            </div>
            {/* <div className="">
              <Controller
                name="employeeId"
                control={control}
                rules={{
                  required: "Please select employee",
                }}
                render={({ field }) => (
                  <div>
                    <div
                      className={`select-group ${field.value ? "has-value" : ""}`}
                    >
                      <label className="select-label required-label">
                        Employee
                      </label>

                      <Select
                        value={
                          employeeOptions.find(
                            (option) => option.value === field.value,
                          ) || null
                        }
                        onChange={(option) =>
                          field.onChange(option?.value || "")
                        }
                        options={employeeOptions}
                        isClearable
                        isSearchable
                        isDisabled={!!employeeId}
                        placeholder=""
                        styles={selectStyles}
                      />
                    </div>

                    {errors.employeeId && (
                      <p className="mt-1 text-xs text-red-500">
                        {errors.employeeId.message}
                      </p>
                    )}
                  </div>
                )}
              />
            </div> */}
            {/* save permission */}
            <div className="flex justify-end gap-5">
              <button
                type="button"
                onClick={() => navigate("/permissions")}
                className="border border-gray-600 hover:bg-gray-700 hover:text-white px-6 py-2 rounded-lg font-medium"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isProcessing}
                className="theme-btn text-white px-5 py-2 rounded-lg hover:bg-gray-700"
              >
                {isProcessing ? (
                  <>
                    <Loader />
                    Saving...
                  </>
                ) : (
                  "Save Permissions"
                )}
              </button>
            </div>
          </div>
        </div>

        {/* =================================================
            EMPLOYEE
        ================================================= */}

        {/* =================================================
            PERMISSIONS
        ================================================= */}

        <div className="bg-white rounded-xl shadow-sm border  border-gray-200 overflow-hidden">
          {/* <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold">Module Permissions</h2>

            <p className="text-sm text-gray-500 mt-1">
              Select the actions this employee is allowed to perform for each
              module.
            </p>
          </div> */}

          <Controller
            name="permissions"
            control={control}
            render={({ field }) => {
              const permissions = field.value || [];

              // =================================================
              // GET MODULE PERMISSION
              // =================================================

              const getModulePermission = (moduleId) => {
                return (
                  permissions.find(
                    (permission) =>
                      permission.moduleId?.toString() === moduleId?.toString(),
                  ) || {
                    moduleId,
                    actions: {
                      view: false,
                      add: false,
                      edit: false,
                      delete: false,
                      singleView: false,
                    },
                  }
                );
              };

              // =================================================
              // UPDATE SINGLE ACTION
              // =================================================

              const updateAction = (module, action, checked) => {
                const existingPermission = getModulePermission(module._id);

                let updatedPermissions = [...permissions];

                const permissionIndex = updatedPermissions.findIndex(
                  (permission) =>
                    permission.moduleId?.toString() === module._id?.toString(),
                );

                const updatedPermission = {
                  moduleId: module._id,

                  actions: {
                    ...existingPermission.actions,
                    [action]: checked,
                  },
                };

                if (permissionIndex === -1) {
                  // Add new module permission
                  updatedPermissions.push(updatedPermission);
                } else {
                  // Update existing module permission
                  updatedPermissions[permissionIndex] = updatedPermission;
                }

                // -----------------------------------------------------
                // Remove module if no actions selected
                // -----------------------------------------------------

                const hasAnyPermission = Object.values(
                  updatedPermission.actions,
                ).some(Boolean);

                if (!hasAnyPermission) {
                  updatedPermissions = updatedPermissions.filter(
                    (permission) =>
                      permission.moduleId?.toString() !==
                      module._id?.toString(),
                  );
                }

                field.onChange(updatedPermissions);
              };

              // =================================================
              // SELECT ALL
              // =================================================
              const toggleAllActions = (module, checked) => {
                let updatedPermissions = permissions.filter(
                  (permission) =>
                    permission.moduleId?.toString() !== module._id?.toString(),
                );

                if (checked) {
                  const actions = {
                    view: module.actions?.view === true,
                    add: module.actions?.add === true,
                    edit: module.actions?.edit === true,
                    delete: module.actions?.delete === true,
                    singleView: module.actions?.singleView === true,
                  };

                  const hasAnyPermission = Object.values(actions).some(Boolean);

                  if (hasAnyPermission) {
                    updatedPermissions.push({
                      moduleId: module._id,
                      actions,
                    });
                  }
                }

                field.onChange(updatedPermissions);
              };
              // =================================================
              // GLOBAL SELECT ALL MODULES
              // =================================================

              const toggleGlobalAllActions = (modules, checked) => {
                if (!checked) {
                  // Deselect everything
                  field.onChange([]);
                  return;
                }

                // Select all supported actions for all modules
                const allPermissions = modules
                  .map((module) => {
                    const actions = {
                      view: module.actions?.view === true,
                      add: module.actions?.add === true,
                      edit: module.actions?.edit === true,
                      delete: module.actions?.delete === true,
                      singleView: module.actions?.singleView === true,
                    };

                    const hasAnyPermission =
                      Object.values(actions).some(Boolean);

                    if (!hasAnyPermission) {
                      return null;
                    }

                    return {
                      moduleId: module._id,
                      actions,
                    };
                  })
                  .filter(Boolean);

                field.onChange(allPermissions);
              };
              const isGlobalAllSelected = (modules, permissions) => {
                const modulesWithActions = modules.filter((module) =>
                  hasSupportedActions(module),
                );

                if (modulesWithActions.length === 0) {
                  return false;
                }

                return modulesWithActions.every((module) => {
                  const permission = permissions.find(
                    (permission) =>
                      permission.moduleId?.toString() ===
                      module._id?.toString(),
                  );

                  return isAllSelected(module, permission?.actions || {});
                });
              };
              // =================================================
              // COLUMN-WISE SELECT ALL
              // =================================================

              const toggleColumnAction = (modules, action, checked) => {
                if (!checked) {
                  // Remove this action from every module
                  const updatedPermissions = permissions
                    .map((permission) => {
                      const module = modules.find(
                        (module) =>
                          module._id?.toString() ===
                          permission.moduleId?.toString(),
                      );

                      if (!module) {
                        return permission;
                      }

                      return {
                        ...permission,
                        actions: {
                          ...permission.actions,
                          [action]: false,
                        },
                      };
                    })
                    .filter((permission) =>
                      Object.values(permission.actions || {}).some(Boolean),
                    );

                  field.onChange(updatedPermissions);
                  return;
                }

                // Select this action for every module that supports it
                const updatedPermissions = [...permissions];

                modules.forEach((module) => {
                  // Module doesn't support this action
                  if (module.actions?.[action] !== true) {
                    return;
                  }

                  const permissionIndex = updatedPermissions.findIndex(
                    (permission) =>
                      permission.moduleId?.toString() ===
                      module._id?.toString(),
                  );

                  if (permissionIndex === -1) {
                    updatedPermissions.push({
                      moduleId: module._id,
                      actions: {
                        view: false,
                        add: false,
                        edit: false,
                        delete: false,
                        singleView: false,
                        [action]: true,
                      },
                    });
                  } else {
                    updatedPermissions[permissionIndex] = {
                      ...updatedPermissions[permissionIndex],
                      actions: {
                        ...updatedPermissions[permissionIndex].actions,
                        [action]: true,
                      },
                    };
                  }
                });

                field.onChange(updatedPermissions);
              };
// =================================================
// CHECK COLUMN SELECTED
// =================================================

const isColumnAllSelected = (modules, permissions, action) => {
  const supportedModules = modules.filter(
    (module) => module.actions?.[action] === true,
  );

  if (supportedModules.length === 0) {
    return false;
  }

  return supportedModules.every((module) => {
    const permission = permissions.find(
      (permission) =>
        permission.moduleId?.toString() === module._id?.toString(),
    );

    return permission?.actions?.[action] === true;
  });
};

// =================================================
// CHECK COLUMN HAS SUPPORTED ACTION
// =================================================

const hasColumnSupportedAction = (modules, action) => {
  return modules.some(
    (module) => module.actions?.[action] === true,
  );
};

              return (
                <div className="h-[60vh] overflow-auto">
                  <table className="w-full">
                    {/* =================================================
                        HEADER
                    ================================================= */}
                    <thead className="sticky top-0 z-20 bg-gray-100 ">
                      <tr>
                        <th className="p-3 text-left  whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <PermissionCheckbox
                              checked={isGlobalAllSelected(
                                modules,
                                permissions,
                              )}
                              disabled={!hasAnySupportedActions(modules)}
                              onChange={(checked) =>
                                toggleGlobalAllActions(modules, checked)
                              }
                            />

                            <span>Module</span>
                          </div>
                        </th>

                        <th className="p-3 text-center whitespace-nowrap">
                          <div
                            className="flex items-center justify-center gap-2"
                            title="Select all permissions"
                          >
                            <ListChecks size={18} />
                            <span>Select All</span>
                          </div>
                        </th>

                     <th className="p-3 text-center">
  <div
    className="flex items-center justify-center gap-2"
    title="Select all View permissions"
  >
    <PermissionCheckbox
      checked={isColumnAllSelected(modules, permissions, "view")}
      disabled={!hasColumnSupportedAction(modules, "view")}
      onChange={(checked) =>
        toggleColumnAction(modules, "view", checked)
      }
    />

    <Eye size={17} />
  </div>
</th>


                    <th className="p-3 text-center">
  <div
    className="flex items-center justify-center gap-2"
    title="Select all Add permissions"
  >
    <PermissionCheckbox
      checked={isColumnAllSelected(modules, permissions, "add")}
      disabled={!hasColumnSupportedAction(modules, "add")}
      onChange={(checked) =>
        toggleColumnAction(modules, "add", checked)
      }
    />

    <Plus size={18} />
  </div>
</th>


                      <th className="p-3 text-center">
  <div
    className="flex items-center justify-center gap-2"
    title="Select all Edit permissions"
  >
    <PermissionCheckbox
      checked={isColumnAllSelected(modules, permissions, "edit")}
      disabled={!hasColumnSupportedAction(modules, "edit")}
      onChange={(checked) =>
        toggleColumnAction(modules, "edit", checked)
      }
    />

    <Pencil size={17} />
  </div>
</th>


                       <th className="p-3 text-center">
  <div
    className="flex items-center justify-center gap-2"
    title="Select all Delete permissions"
  >
    <PermissionCheckbox
      checked={isColumnAllSelected(modules, permissions, "delete")}
      disabled={!hasColumnSupportedAction(modules, "delete")}
      onChange={(checked) =>
        toggleColumnAction(modules, "delete", checked)
      }
    />

    <Trash2 size={17} />
  </div>
</th>

<th className="p-3 text-center whitespace-nowrap">
  <div
    className="flex items-center justify-center gap-2"
    title="Select all Single View permissions"
  >
    <PermissionCheckbox
      checked={isColumnAllSelected(
        modules,
        permissions,
        "singleView",
      )}
      disabled={!hasColumnSupportedAction(modules, "singleView")}
      onChange={(checked) =>
        toggleColumnAction(modules, "singleView", checked)
      }
    />

    <Eye size={17} />

    <span>Single View</span>
  </div>
</th>

                      </tr>
                    </thead>

                    {/* =================================================
                        BODY
                    ================================================= */}

                    <tbody>
                      {modules.length > 0 ? (
                        modules.map((module) => {
                          const permission = getModulePermission(module._id);

                          const actions = permission.actions || {};

                          return (
                            <tr
                              key={module._id}
                              className="border-t border-gray-200 hover:bg-gray-50"
                            >
                              {/* MODULE */}

                              <td className="p-3">
                                <div>
                                  <p className="font-semibold text-gray-800">
                                    {module.name}
                                  </p>

                                  {/* <p className="text-xs text-gray-500">
                                    {module.key}
                                  </p> */}

                                  {/* {module.path && (
                                    <p className="text-xs text-gray-400">
                                      {module.path}
                                    </p>
                                  )} */}
                                </div>
                              </td>

                              {/* ALL */}

                              <td className="p-3 text-center">
                                <PermissionCheckbox
                                  checked={isAllSelected(module, actions)}
                                  disabled={!hasSupportedActions(module)}
                                  onChange={(checked) =>
                                    toggleAllActions(module, checked)
                                  }
                                />
                              </td>

                              {/* VIEW */}

                              <td className="p-3 text-center">
                                <ActionCheckbox
                                  module={module}
                                  action="view"
                                  actions={actions}
                                  onChange={updateAction}
                                />
                              </td>

                              {/* ADD */}

                              <td className="p-3 text-center">
                                <ActionCheckbox
                                  module={module}
                                  action="add"
                                  actions={actions}
                                  onChange={updateAction}
                                />
                              </td>

                              {/* EDIT */}

                              <td className="p-3 text-center">
                                <ActionCheckbox
                                  module={module}
                                  action="edit"
                                  actions={actions}
                                  onChange={updateAction}
                                />
                              </td>

                              {/* DELETE */}

                              <td className="p-3 text-center">
                                <ActionCheckbox
                                  module={module}
                                  action="delete"
                                  actions={actions}
                                  onChange={updateAction}
                                />
                              </td>

                              {/* SINGLE VIEW */}

                              <td className="p-3 text-center">
                                <ActionCheckbox
                                  module={module}
                                  action="singleView"
                                  actions={actions}
                                  onChange={updateAction}
                                />
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td
                            colSpan={7}
                            className="p-8 text-center text-gray-500"
                          >
                            No active modules found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              );
            }}
          />
        </div>

        {/* =================================================
            BOTTOM BUTTONS
        ================================================= */}

        <div className="flex justify-end gap-5">
          <button
            type="button"
            onClick={() => navigate("/permissions")}
            className="border border-gray-600 hover:bg-gray-700 hover:text-white px-6 py-2 rounded-lg font-medium"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={isProcessing}
            className="theme-btn text-white px-6 py-2 rounded-lg hover:bg-gray-700"
          >
            {isProcessing ? (
              <>
                <Loader />
                Saving...
              </>
            ) : (
              "Save Permissions"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

// =====================================================
// ACTION CHECKBOX
// =====================================================

const ActionCheckbox = ({ module, action, actions, onChange }) => {
  const supported = module.actions?.[action] === true;

  return (
    <PermissionCheckbox
      checked={actions?.[action] === true}
      disabled={!supported}
      onChange={(checked) => onChange(module, action, checked)}
    />
  );
};

// =====================================================
// CHECKBOX
// =====================================================

const PermissionCheckbox = ({ checked, disabled = false, onChange }) => {
  return (
    <input
      type="checkbox"
      checked={!!checked}
      disabled={disabled}
      onChange={(e) => onChange(e.target.checked)}
      className={`h-4 w-4 rounded ${
        disabled ? "cursor-not-allowed opacity-30" : "cursor-pointer"
      } accent-slate-800`}
    />
  );
};

// =====================================================
// CHECK ALL
// =====================================================

const isAllSelected = (module, actions) => {
  const supportedActions = [
    "view",
    "add",
    "edit",
    "delete",
    "singleView",
  ].filter((action) => module.actions?.[action] === true);

  if (supportedActions.length === 0) {
    return false;
  }

  return supportedActions.every((action) => actions?.[action] === true);
};

// =====================================================
// CHECK WHETHER MODULE HAS ACTIONS
// =====================================================

const hasSupportedActions = (module) => {
  return ["view", "add", "edit", "delete", "singleView"].some(
    (action) => module.actions?.[action] === true,
  );
};
const hasAnySupportedActions = (modules) => {
  return modules.some((module) => hasSupportedActions(module));
};
export default PermissionCreateEdit;

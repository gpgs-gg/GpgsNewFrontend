import React, { useEffect, useMemo } from "react";
import { X } from "lucide-react";
import Select from "react-select";
import { useForm, Controller, useWatch } from "react-hook-form";
import { selectStyles } from "../../utils/selectStyles";
import { getTicketDropdown, useTicketDropdown } from "./services";
import { AsyncPaginate } from "react-select-async-paginate";
import { getPropertyDropdown } from "../properties/services";
import { useBatchOptions } from "../Options/services";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  useManagerEmployees,
  useEmployeeDetailsData,
} from "../EmployeeDetails/Services/index";
const TicketsFilter = ({
  isOpen,
  onClose,
  onApply,
  handleReset,
  resetTrigger,
  initialFilters = {},
}) => {
  const { control, handleSubmit, reset } = useForm({
    defaultValues: {
      propertyCode: null,
      propertyLocation: null,
      status: [],
      priority: null,
      department: null,
      category: null,
      assignee: null,
      manager: null,
      customerImpacted: null,
      escalated: null,
      lateStatus: null,
      createdBy: null,
      dateFrom: null,
      dateTo: null,
    },
  });

  const dateFrom = useWatch({ control, name: "dateFrom" });
  const dateTo = useWatch({ control, name: "dateTo" });

  const { data: options = {} } = useBatchOptions([
    "department",
    "categories",
    "priority",
    "ticketstatus",
    "yesno",
    "locations",
  ]);
  const { data: managerData } = useManagerEmployees();

  const { data: employeeData } = useEmployeeDetailsData({
    page: 1,
    limit: 1000,
  });
  const loadPropertyOptions = async (search, loadedOptions, { page }) => {
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
          },
        ]),
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

  const locationOptions = options.locations || [];
  const categoryOptions = options.categories || [];
  const priorityOptions = options.priority || [];
  const statusOptions = options.ticketstatus || [];
  const YesNoOptions = options.yesno || [];
  const departmentOptions = options.department || [];
  // const assigneeOptions  = options.department || [];
  // const managerOptions   = options.department || [];

  const managerOptions =
    managerData?.data
      ?.filter((employee) => employee.loginEnabled === true)
      ?.map((employee) => ({
        value: employee.employeeName,
        label: employee.employeeName,
      })) || [];

  const assigneeOptions =
    employeeData?.data
      ?.filter((employee) => employee.loginEnabled === true)
      ?.map((employee) => ({
        value: employee.employeeName,
        label: employee.employeeName,
      })) || [];
  const createdByOptions =
    employeeData?.data
      ?.filter((employee) => employee.loginEnabled === true)
      ?.map((employee) => ({
        value: employee.employeeName,
        label: employee.employeeName,
      })) || [];
  const lateStatusOptions = [
    { value: "LateAcknowledged", label: "Late Acknowledged" },
    { value: "LateResolved", label: "Late Resolved" },
  ];

  const formatDateForFilter = (date) => {
    if (!date) return "";

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  const onSubmit = (data) => {
    const filters = {};

    // Object.entries(data).forEach(([key, value]) => {
    //   const filterValue =
    //     value && typeof value === "object" ? value.value : value;

    //   if (filterValue) {
    //     filters[key] = filterValue;
    //   }
    // });

    Object.entries(data).forEach(([key, value]) => {
      let filterValue = value;

      if (value instanceof Date) {
        filterValue = formatDateForFilter(value);
      } else if (Array.isArray(value)) {
        filterValue = value;
      } else if (value && typeof value === "object") {
        filterValue = value.value;
      }

      if (Array.isArray(filterValue) ? filterValue.length > 0 : filterValue) {
        filters[key] = filterValue;
      }
    });

    onApply(filters);
    onClose();
  };
  useEffect(() => {
    if (!isOpen) return;

    const selectedProperty = initialFilters.propertyCode
      ? {
        value: initialFilters.propertyCode,
        label: initialFilters.propertyCode,
      }
      : null;

    reset({
      // AsyncPaginate expects an object
      propertyCode: selectedProperty,

      // Normal Select fields should store primitive values
      propertyLocation: initialFilters.propertyLocation || "",
      status: Array.isArray(initialFilters.status)
        ? initialFilters.status
        : initialFilters.status
          ? [initialFilters.status]
          : [],
      dateFrom: initialFilters.dateFrom
        ? new Date(`${initialFilters.dateFrom}T00:00:00`)
        : null,

      dateTo: initialFilters.dateTo
        ? new Date(`${initialFilters.dateTo}T00:00:00`)
        : null,
      priority: initialFilters.priority || "",
      department: initialFilters.department || "",
      category: initialFilters.category || "",
      assignee: initialFilters.assignee || "",
      manager: initialFilters.manager || "",
      customerImpacted: initialFilters.customerImpacted || "",
      escalated: initialFilters.escalated || "",
      createdBy: initialFilters.createdBy || "",
      lateStatus: initialFilters.lateStatus || "",
    });
  }, [
    isOpen,
    initialFilters.propertyCode,
    initialFilters.propertyLocation,
    initialFilters.status,
    initialFilters.priority,
    initialFilters.department,
    initialFilters.category,
    initialFilters.assignee,
    initialFilters.manager,
    initialFilters.createdBy,
    initialFilters.customerImpacted,
    initialFilters.escalated,
    initialFilters.lateStatus,
    resetTrigger,
    initialFilters.dateFrom,
    initialFilters.dateTo,
    reset,
  ]);

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />
      )}

      <div
        className={`fixed top-0 right-0 h-full w-96 bg-white z-50 shadow-xl transition-transform duration-300 flex flex-col ${isOpen ? "translate-x-0" : "translate-x-full"
          }`}
      >
        <div className="flex justify-between items-center p-5 text-white bg-linear-to-r from-slate-800 via-slate-700 to-slate-900 border-b border-slate-600">
          <h2 className="font-bold text-lg">Filters</h2>

          <button onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* <div className="flex-1 overflow-y-auto"> */}

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 min-h-0 overflow-hidden">
          <div className="flex-1 min-h-0 overflow-y-auto p-5 space-y-5">


            {/* Property Code */}
            <Controller
              name="propertyCode"
              control={control}
              render={({ field }) => (
                <div
                  className={`select-group ${field.value ? "has-value" : ""}`}
                >
                  <label className="select-label">Property Code</label>

                  <AsyncPaginate
                    additional={{ page: 1 }}
                    debounceTimeout={500}
                    isClearable
                    placeholder=""
                    loadOptions={loadPropertyOptions}
                    styles={selectStyles}
                    value={field.value}
                    onChange={(option) => field.onChange(option)}
                  />
                </div>
              )}
            />
            {/* Location */}
            <Controller
              name="propertyLocation"
              control={control}
              render={({ field }) => (
                <div
                  className={`select-group ${field.value ? "has-value" : ""}`}
                >
                  <label className="select-label">Location</label>

                  <Select
                    {...field}
                    options={locationOptions}
                    isClearable
                    placeholder=""
                    value={
                      locationOptions.find(
                        (option) => option.value === field.value,
                      ) || null
                    }
                    onChange={(selectedOption) =>
                      field.onChange(selectedOption?.value || "")
                    }
                    styles={selectStyles}
                  />
                </div>
              )}
            />
            {/* Status */}



            {/* Status - Multiple Selection */}
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <div
                  className={`select-group ${field.value?.length ? "has-value" : ""
                    }`}
                >
                  <label className="select-label">Status</label>

                  <Select
                    name={field.name}
                    ref={field.ref}
                    options={statusOptions}
                    isMulti
                    isClearable
                    closeMenuOnSelect={false}
                    placeholder=""
                    value={statusOptions.filter((option) =>
                      (Array.isArray(field.value) ? field.value : []).includes(
                        option.value,
                      ),
                    )}
                    onChange={(selectedOptions) =>
                      field.onChange(
                        (selectedOptions || []).map((option) => option.value),
                      )
                    }
                    styles={selectStyles}
                  />
                </div>
              )}
            />



            {/* Priority */}
            <Controller
              name="priority"
              control={control}
              render={({ field }) => (
                <div
                  className={`select-group ${field.value ? "has-value" : ""}`}
                >
                  <label className="select-label">Priority</label>

                  <Select
                    {...field}
                    options={priorityOptions}
                    isClearable
                    placeholder=""
                    value={
                      priorityOptions.find(
                        (option) => option.value === field.value,
                      ) || null
                    }
                    onChange={(option) => field.onChange(option?.value || "")}
                    styles={selectStyles}
                  />
                </div>
              )}
            />
            {/* Department */}
            <Controller
              name="department"
              control={control}
              render={({ field }) => (
                <div
                  className={`select-group ${field.value ? "has-value" : ""}`}
                >
                  <label className="select-label">Department</label>

                  <Select
                    {...field}
                    options={departmentOptions}
                    isClearable
                    value={
                      departmentOptions.find(
                        (option) => option.value === field.value,
                      ) || null
                    }
                    onChange={(option) => field.onChange(option?.value || "")}
                    styles={selectStyles}
                  />
                </div>
              )}
            />
            {/* Category */}
            <Controller
              name="category"
              control={control}
              render={({ field }) => (
                <div
                  className={`select-group ${field.value ? "has-value" : ""}`}
                >
                  <label className="select-label">Category</label>

                  <Select
                    {...field}
                    options={categoryOptions}
                    isClearable
                    value={
                      categoryOptions.find(
                        (option) => option.value === field.value,
                      ) || null
                    }
                    onChange={(option) => field.onChange(option?.value || "")}
                    styles={selectStyles}
                  />
                </div>
              )}
            />
            {/* Assignee */}
            <Controller
              name="assignee"
              control={control}
              render={({ field }) => (
                <div
                  className={`select-group ${field.value ? "has-value" : ""}`}
                >
                  <label className="select-label">Assignee</label>

                  <Select
                    {...field}
                    options={assigneeOptions}
                    isClearable
                    value={
                      assigneeOptions.find(
                        (option) => option.value === field.value,
                      ) || null
                    }
                    onChange={(option) => field.onChange(option?.value || "")}
                    styles={selectStyles}
                  />
                </div>
              )}
            />
            {/* Manager */}
            <Controller
              name="manager"
              control={control}
              render={({ field }) => (
                <div
                  className={`select-group ${field.value ? "has-value" : ""}`}
                >
                  <label className="select-label">Manager</label>

                  <Select
                    {...field}
                    options={managerOptions}
                    isClearable
                    value={
                      managerOptions.find(
                        (option) => option.value === field.value,
                      ) || null
                    }
                    onChange={(option) => field.onChange(option?.value || "")}
                    styles={selectStyles}
                  />
                </div>
              )}
            />
            {/* Customer Impacted */}
            <Controller
              name="customerImpacted"
              control={control}
              render={({ field }) => (
                <div
                  className={`select-group ${field.value ? "has-value" : ""}`}
                >
                  <label className="select-label">Customer Impacted</label>

                  <Select
                    {...field}
                    options={YesNoOptions}
                    isClearable
                    value={
                      YesNoOptions.find(
                        (option) => option.value === field.value,
                      ) || null
                    }
                    onChange={(option) => field.onChange(option?.value || "")}
                    styles={selectStyles}
                  />
                </div>
              )}
            />
            {/* Escalated */}
            <Controller
              name="escalated"
              control={control}
              render={({ field }) => (
                <div
                  className={`select-group ${field.value ? "has-value" : ""}`}
                >
                  <label className="select-label">Escalated</label>

                  <Select
                    {...field}
                    options={YesNoOptions}
                    isClearable
                    value={
                      YesNoOptions.find(
                        (option) => option.value === field.value,
                      ) || null
                    }
                    onChange={(option) => field.onChange(option?.value || "")}
                    styles={selectStyles}
                  />
                </div>
              )}
            />

            {/* Created By */}
            <Controller
              name="createdBy"
              control={control}
              render={({ field }) => (
                <div
                  className={`select-group ${field.value ? "has-value" : ""}`}
                >
                  <label className="select-label">Created By</label>

                  <Select
                    options={createdByOptions}
                    isClearable
                    placeholder=""
                    value={
                      createdByOptions.find(
                        (option) => option.value === field.value,
                      ) || null
                    }
                    onChange={(option) => field.onChange(option?.value || "")}
                    styles={selectStyles}
                  />
                </div>
              )}
            />

            {/* Created Date Range */}
            <div className="space-y-3">
              <Controller
                name="dateFrom"
                control={control}
                render={({ field }) => (
                  <div
                    className={`datepicker-group ${field.value ? "has-value" : ""
                      }`}
                  >
                    <label className="datepicker-label">Created From</label>

                    <DatePicker
                      selected={field.value}
                      onChange={(date) => field.onChange(date)}
                      selectsStart
                      startDate={dateFrom}
                      endDate={dateTo}
                      isClearable
                      placeholderText="From Date"
                      dateFormat="dd MMM yyyy"
                      className="custom-datepicker"
                      maxDate={dateTo || undefined}
                    />
                  </div>
                )}
              />

              <Controller
                name="dateTo"
                control={control}
                render={({ field }) => (
                  <div
                    className={`datepicker-group ${field.value ? "has-value" : ""
                      }`}
                  >
                    <label className="datepicker-label">Created To</label>

                    <DatePicker
                      selected={field.value}
                      onChange={(date) => field.onChange(date)}
                      selectsEnd
                      startDate={dateFrom}
                      endDate={dateTo}
                      isClearable
                      placeholderText="To Date"
                      dateFormat="dd MMM yyyy"
                      className="custom-datepicker"
                      minDate={dateFrom || undefined}
                    />
                  </div>
                )}
              />
            </div>

            {/* Late Status */}
            <Controller
              name="lateStatus"
              control={control}
              render={({ field }) => (
                <div
                  className={`select-group ${field.value ? "has-value" : ""}`}
                >
                  <label className="select-label">Late Status</label>

                  <Select
                    {...field}
                    options={lateStatusOptions}
                    isClearable
                    placeholder=""
                    value={
                      lateStatusOptions.find(
                        (option) => option.value === field.value,
                      ) || null
                    }
                    onChange={(selectedOption) =>
                      field.onChange(selectedOption?.value || "")
                    }
                    styles={selectStyles}
                  />
                </div>
              )}
            />
          </div>
          <div className="sticky bottom-0 bg-white border-t border-gray-200 p-5 shadow-[0_-4px_12px_rgba(0,0,0,0.06)]">
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={handleReset}
                className="w-full border border-gray-300 py-2 rounded-lg"
              >
                Reset
              </button>

              <button
                type="submit"
                className="w-full bg-linear-to-r from-slate-800 via-slate-700 to-slate-900 border-b border-slate-600 text-white py-2 rounded-lg"
              >
                Apply Filters
              </button>
            </div>

          </div>
        </form>

        {/* </div> */}
      </div>
    </>
  );
};

export default TicketsFilter;

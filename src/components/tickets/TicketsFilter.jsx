import React, { useEffect, useMemo } from "react";
import { X } from "lucide-react";
import Select from "react-select";
import { useForm, Controller } from "react-hook-form";
import { selectStyles } from "../../utils/selectStyles";

const TicketsFilter = ({
    isOpen,
    onClose,
    apiData = [],
    onApply,
    handleReset,
    resetTrigger,
}) => {
    const {
        control,
        handleSubmit,
        reset,
    } = useForm({
        defaultValues: {
            propertyCode: "",
            Location: "",
            status: "",
            priority: "",
            department: "",
            category: "",
            assignee: "",
            manager: "",
            customerImpacted: "",
            escalated: "",
            lateStatus: "",
        },
    });

    const propertyCodeOptions = useMemo(() => {
        return [
            ...new Set(
                apiData?.map((item) => item.propertyCode).filter(Boolean)
            ),
        ].map((item) => ({
            value: item,
            label: item,
        }));
    }, [apiData]);

    const locationOptions = useMemo(() => {
        return [
            ...new Set(
                apiData?.map((item) => item.propertyLocation).filter(Boolean)
            ),
        ].map((item) => ({
            value: item,
            label: item,
        }));
    }, [apiData]);

    const priorityOptions = [
        ...new Set(apiData.map(x => x.priority).filter(Boolean))
    ].map(item => ({
        value: item,
        label: item
    }));

    const departmentOptions = [
        ...new Set(apiData.map(x => x.department).filter(Boolean))
    ].map(item => ({
        value: item,
        label: item
    }));

    const categoryOptions = [
        ...new Set(apiData.map(x => x.category).filter(Boolean))
    ].map(item => ({
        value: item,
        label: item
    }));

    const assigneeOptions = [
        ...new Set(apiData.map(x => x.assignee).filter(Boolean))
    ].map(item => ({
        value: item,
        label: item
    }));

    const managerOptions = [
        ...new Set(apiData.map(x => x.manager).filter(Boolean))
    ].map(item => ({
        value: item,
        label: item
    }));

    const statusOptions = [
        ...new Set(apiData.map(x => x.status).filter(Boolean))
    ].map(item => ({
        value: item,
        label: item,
    }));

    const customerImpactedOptions = [
        { value: "Yes", label: "Yes" },
        { value: "No", label: "No" },
    ];

    const escalatedOptions = [
        { value: "Yes", label: "Yes" },
        { value: "No", label: "No" },
    ];
    const lateStatusOptions = [
        { value: "LateAcknowledged", label: "Late Acknowledged", },
        { value: "LateResolved", label: "Late Resolved", },
    ];
    const onSubmit = (data) => {
        onApply(data);
        onClose();
    };
    useEffect(() => {
        reset({
            propertyCode: null,
            Location: null,
            bedCount: null,
            status: null,
            priority: null,
            department: null,
            category: null,
            assignee: null,
            manager: null,
            customerImpacted: null,
            escalated: null,
            lateStatus: null,
        });
    }, [resetTrigger, reset]);
    return (
        <>
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/40 z-40"
                    onClick={onClose}
                />
            )}

            <div
                className={`fixed top-0 right-0 h-full w-96 bg-white z-50 shadow-xl transition-transform duration-300 flex flex-col ${isOpen
                    ? "translate-x-0"
                    : "translate-x-full"
                    }`}
            >
                <div className="flex justify-between items-center p-5 text-white bg-linear-to-r from-slate-800 via-slate-700 to-slate-900 border-b border-slate-600 shrink-0">
                    <h2 className="font-bold text-lg">
                        Filters
                    </h2>

                    <button onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto">
                    <form
                        onSubmit={handleSubmit(onSubmit)}
                        className="p-5 space-y-5"
                    >
                        {/* Property Code */}
                        <Controller
                            name="propertyCode"
                            control={control}
                            render={({ field }) => (
                                <div
                                    className={`select-group ${field.value ? "has-value" : ""
                                        }`}
                                >
                                    <label className="select-label">
                                        Property Code
                                    </label>

                                    <Select
                                        {...field}
                                        options={propertyCodeOptions}
                                        isClearable
                                        placeholder=""
                                        value={
                                            propertyCodeOptions.find(
                                                (option) => option.value === field.value
                                            ) || null
                                        }
                                        onChange={(selectedOption) =>
                                            field.onChange(
                                                selectedOption?.value || ""
                                            )
                                        }
                                        styles={selectStyles}
                                    />
                                </div>
                            )}
                        />

                        {/* Location */}
                        <Controller
                            name="Location"
                            control={control}
                            render={({ field }) => (
                                <div
                                    className={`select-group ${field.value ? "has-value" : ""
                                        }`}
                                >
                                    <label className="select-label">
                                        Location
                                    </label>

                                    <Select
                                        {...field}
                                        options={locationOptions}
                                        isClearable
                                        placeholder=""
                                        value={
                                            locationOptions.find(
                                                (option) => option.value === field.value
                                            ) || null
                                        }
                                        onChange={(selectedOption) =>
                                            field.onChange(
                                                selectedOption?.value || ""
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
                                <div className={`select-group ${field.value ? "has-value" : ""}`}>
                                    <label className="select-label">Priority</label>

                                    <Select
                                        {...field}
                                        options={priorityOptions}
                                        isClearable
                                        placeholder=""
                                        value={
                                            priorityOptions.find(
                                                (option) => option.value === field.value
                                            ) || null
                                        }
                                        onChange={(option) =>
                                            field.onChange(option?.value || "")
                                        }
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
                                <div className={`select-group ${field.value ? "has-value" : ""}`}>
                                    <label className="select-label">Department</label>

                                    <Select
                                        {...field}
                                        options={departmentOptions}
                                        isClearable
                                        value={
                                            departmentOptions.find(
                                                (option) => option.value === field.value
                                            ) || null
                                        }
                                        onChange={(option) =>
                                            field.onChange(option?.value || "")
                                        }
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
                                <div className={`select-group ${field.value ? "has-value" : ""}`}>
                                    <label className="select-label">Category</label>

                                    <Select
                                        {...field}
                                        options={categoryOptions}
                                        isClearable
                                        value={
                                            categoryOptions.find(
                                                (option) => option.value === field.value
                                            ) || null
                                        }
                                        onChange={(option) =>
                                            field.onChange(option?.value || "")
                                        }
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
                                <div className={`select-group ${field.value ? "has-value" : ""}`}>
                                    <label className="select-label">Assignee</label>

                                    <Select
                                        {...field}
                                        options={assigneeOptions}
                                        isClearable
                                        value={
                                            assigneeOptions.find(
                                                (option) => option.value === field.value
                                            ) || null
                                        }
                                        onChange={(option) =>
                                            field.onChange(option?.value || "")
                                        }
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
                                <div className={`select-group ${field.value ? "has-value" : ""}`}>
                                    <label className="select-label">Manager</label>

                                    <Select
                                        {...field}
                                        options={managerOptions}
                                        isClearable
                                        value={
                                            managerOptions.find(
                                                (option) => option.value === field.value
                                            ) || null
                                        }
                                        onChange={(option) =>
                                            field.onChange(option?.value || "")
                                        }
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
                                <div className={`select-group ${field.value ? "has-value" : ""}`}>
                                    <label className="select-label">Customer Impacted</label>

                                    <Select
                                        {...field}
                                        options={customerImpactedOptions}
                                        isClearable
                                        value={
                                            customerImpactedOptions.find(
                                                (option) => option.value === field.value
                                            ) || null
                                        }
                                        onChange={(option) =>
                                            field.onChange(option?.value || "")
                                        }
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
                                <div className={`select-group ${field.value ? "has-value" : ""}`}>
                                    <label className="select-label">Escalated</label>

                                    <Select
                                        {...field}
                                        options={escalatedOptions}
                                        isClearable
                                        value={
                                            escalatedOptions.find(
                                                (option) => option.value === field.value
                                            ) || null
                                        }
                                        onChange={(option) =>
                                            field.onChange(option?.value || "")
                                        }
                                        styles={selectStyles}
                                    />
                                </div>
                            )}
                        />

                        {/* Status */}
                        <Controller
                            name="status"
                            control={control}
                            render={({ field }) => (
                                <div
                                    className={`select-group ${field.value ? "has-value" : ""
                                        }`}
                                >
                                    <label className="select-label">
                                        Status
                                    </label>

                                    <Select
                                        {...field}
                                        options={statusOptions}
                                        isClearable
                                        placeholder=""
                                        value={
                                            statusOptions.find(
                                                (option) => option.value === field.value
                                            ) || null
                                        }
                                        onChange={(selectedOption) =>
                                            field.onChange(
                                                selectedOption?.value || ""
                                            )
                                        }
                                        styles={selectStyles}
                                    />
                                </div>
                            )}
                        />
                        {/* Late Status */}
                        <Controller
                            name="lateStatus"
                            control={control}
                            render={({ field }) => (
                                <div
                                    className={`select-group ${field.value ? "has-value" : ""
                                        }`}
                                >
                                    <label className="select-label">
                                        Late Status
                                    </label>

                                    <Select
                                        {...field}
                                        options={lateStatusOptions}
                                        isClearable
                                        placeholder=""
                                        value={
                                            lateStatusOptions.find(
                                                (option) => option.value === field.value
                                            ) || null
                                        }
                                        onChange={(selectedOption) =>
                                            field.onChange(
                                                selectedOption?.value || ""
                                            )
                                        }
                                        styles={selectStyles}
                                    />
                                </div>
                            )}
                        />

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
                    </form>
                </div>
            </div>
        </>
    );
};

export default TicketsFilter;
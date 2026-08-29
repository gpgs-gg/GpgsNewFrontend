import React, { useEffect, useMemo } from "react";
import { X } from "lucide-react";
import Select from "react-select";
import { useForm, Controller } from "react-hook-form";
import { selectStyles } from "../../utils/selectStyles";
import { AsyncPaginate } from "react-select-async-paginate";
import { getPropertyDropdown } from "../properties/services";
import { useBatchOptions } from "../Options/services";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { convertStringFormatDate } from "../../utils/dateFormatter";
const EBInfoFilter = ({
    isOpen,
    onClose,
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
            status: "",
            ebPaidStatus: "",
            EBCycle: "",
            assignee: "",
            reviewer: "",
        },
    });

    const { data: options = {} } = useBatchOptions([
        "paidornotpaid"
    ]);

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
                res.data.map(item => [
                    item.propertyCode,
                    {
                        value: item.propertyCode,
                        label: item.propertyCode,
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

    const paidornotpaidOptions = options.paidornotpaid || [];

    const assigneeOptions = [
        { value: "Akash", label: "Akash" },
        { value: "Rahul", label: "Rahul" },
        { value: "Priya", label: "Priya" }
    ];

        const statusOptions = [
        {
            value: "Pending",
            label: "Pending",
        },
        {
            value: "Submitted",
            label: "Submitted",
        },
    ];

    const onSubmit = (data) => {
        const filters = {};

        if (data.propertyCode)
            filters.propertyCode = data.propertyCode.value;

        if (data.status)
            filters.status = data.status;

        if (data.ebPaidStatus)
            filters.ebPaidStatus = data.ebPaidStatus;

        if (data.EBCycle)
            filters.EBCycle = data.EBCycle;

        if (data.assignee)
            filters.assignee = data.assignee;

        if (data.reviewer)
            filters.reviewer = data.reviewer;

        onApply(filters);
        onClose();
    };
    useEffect(() => {
        reset({
            propertyCode: null,
            ebPaidStatus: null,
            status: null,
            EBCycle: null,
            assignee: null,
            reviewer: null,

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

                        {/* Priority */}
                        <Controller
                            name="ebPaidStatus"
                            control={control}
                            render={({ field }) => (
                                <div className={`select-group ${field.value ? "has-value" : ""}`}>
                                    <label className="select-label">EB Paid Status</label>

                                    <Select
                                        {...field}
                                        options={paidornotpaidOptions}
                                        isClearable
                                        placeholder=""
                                        value={
                                            paidornotpaidOptions.find(
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
                            name="EBCycle"
                            control={control}
                            render={({ field }) => (
                                <div className={`select-group ${field.value ? "has-value" : ""}`}>
                                    <label className="select-label">EB Cycle</label>

                                    <Select
                                        {...field}
                                        options={statusOptions}
                                        isClearable
                                        value={
                                            statusOptions.find(
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
                            name="reviewer"
                            control={control}
                            render={({ field }) => (
                                <div className={`select-group ${field.value ? "has-value" : ""}`}>
                                    <label className="select-label">Reviewer</label>

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

export default EBInfoFilter;
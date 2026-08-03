import React, { useEffect, useMemo } from "react";
import { X } from "lucide-react";
import Select from "react-select";
import { useForm, Controller } from "react-hook-form";
import { selectStyles } from "../../utils/selectStyles";
import { useLeadDropdown } from "./services";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { convertStringFormatDate, formatDate } from "../../utils/dateFormatter";
import { useBatchOptions } from "../Options/services";
const LeadsFilter = ({
    isOpen,
    onClose,
    onApply,
    handleReset,
    resetTrigger,
    defaultFilterData,
}) => {

    const { control, handleSubmit, reset } = useForm({
        defaultValues: {
            TeamCode: "",
            LeadSource: "",
            LeadStatus: "",
            Assignee: "",
            FieldMember: "",
            Reason: "",
            Gender: "",
            DateFrom: null,
            DateTo: null,
            FollowupDate: null,
        }
    });

 const { data: options = {} } = useBatchOptions([
        "gender",
        "leadsource",
        "leadstatus",
        "leadsreason",
        "locations",
        "teamcode",
        "yesno",
    ]);


    useEffect(() => {
        if (!defaultFilterData) return;

        reset({
            ...defaultFilterData,
            DateFrom: defaultFilterData.DateFrom
                ? new Date(defaultFilterData.DateFrom)
                : null,
            DateTo: defaultFilterData.DateTo
                ? new Date(defaultFilterData.DateTo)
                : null,
            FollowupDate: defaultFilterData.FollowupDate
                ? new Date(defaultFilterData.FollowupDate)
                : null,
        });
    }, [defaultFilterData, reset]);


const genderOptions = options.gender || [];
    const leadSourceOptions = options.leadsource || [];
    const leadStatusOptions = options.leadstatus || [];
    const reasonOptions = options.leadsreason || [];
    const locationOptions = options.locations || [];
    const teamCodeOptions = options.teamcode || [];
    
    const assigneeOptions = [
        { value: "Akash", label: "Akash" },
        { value: "Rahul", label: "Rahul" },
        { value: "Priya", label: "Priya" },
    ];
    const fieldMemberOptions = [
        { value: "Akash", label: "Akash" },
        { value: "Rahul", label: "Rahul" },
        { value: "Priya", label: "Priya" },
    ];



    const renderSelect = (name, label, options) => (
        <Controller
            name={name}
            control={control}
            render={({ field }) => (
                <div className={`select-group ${field.value ? "has-value" : ""}`}>
                    <label className="select-label">
                        {label}
                    </label>

                    <Select
                        {...field}
                        options={options}
                        isClearable
                        placeholder=""
                        value={
                            options.find(
                                x => x.value === field.value
                            ) || null
                        }
                        onChange={(option) =>
                            field.onChange(
                                option?.value ?? ""
                            )
                        }
                        styles={selectStyles}
                    />
                </div>
            )}
        />
    );


    const onSubmit = (data) => {
        const filters = {};

        Object.keys(data).forEach((key) => {
            if (
                data[key] !== "" &&
                data[key] !== null &&
                data[key] !== undefined
            ) {
                filters[key] =
                    data[key] instanceof Date
                        ? convertStringFormatDate(data[key])
                        : data[key];
            }
        });

        onApply(filters);
        onClose();

    };


    useEffect(() => {

        reset({
            TeamCode: "",
            LeadSource: "",
            LeadStatus: "",
            Assignee: "",
            FieldMember: "",
            Reason: "",
            Gender: "",
            DateFrom: null,
            DateTo: null,
            FollowupDate: null,
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
                className={`fixed top-0 right-0 h-full w-96 bg-white z-50 shadow-xl transition-transform flex flex-col ${isOpen ? "translate-x-0" : "translate-x-full"
                    }`}
            >

                <div className="flex justify-between items-center p-5 text-white bg-linear-to-r from-slate-800 via-slate-700 to-slate-900">
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
                        {/* Created Date From */}
                        <Controller
                            name="DateFrom"
                            control={control}
                            render={({ field }) => (
                                <div className={`datepicker-group ${field.value ? "has-value" : ""}`}>
                                    <label className="datepicker-label">Date From</label>
                                    <DatePicker
                                        selected={field.value}
                                        onChange={(date) => field.onChange(date)}
                                        isClearable
                                        dateFormat="dd MMM yyyy"
                                        className="custom-datepicker"
                                    />
                                </div>
                            )}
                        />

                        {/* Created Date To */}
                        <Controller
                            name="DateTo"
                            control={control}
                            render={({ field }) => (
                                <div className={`datepicker-group ${field.value ? "has-value" : ""}`}>
                                    <label className="datepicker-label">Date To</label>
                                    <DatePicker
                                        selected={field.value}
                                        onChange={(date) => field.onChange(date)}
                                        isClearable
                                        dateFormat="dd MMM yyyy"
                                        className="custom-datepicker"
                                    />
                                </div>
                            )}
                        />

                        {/* Followup Date */}
                        <Controller
                            name="FollowupDate"
                            control={control}
                            render={({ field }) => (
                                <div className={`datepicker-group ${field.value ? "has-value" : ""}`}>
                                    <label className="datepicker-label">Followup Date</label>
                                    <DatePicker
                                        selected={field.value}
                                        onChange={(date) => field.onChange(date)}
                                        isClearable
                                        dateFormat="dd MMM yyyy"
                                        className="custom-datepicker"
                                    />
                                </div>
                            )}
                        />
                        {renderSelect(
                            "TeamCode",
                            "Team Code",
                            teamCodeOptions
                        )}

                        {renderSelect(
                            "LeadSource",
                            "Lead Source",
                            leadSourceOptions
                        )}

                        {renderSelect(
                            "LeadStatus",
                            "Lead Status",
                            leadStatusOptions
                        )}

                        {renderSelect(
                            "Assignee",
                            "Assignee",
                            assigneeOptions
                        )}

                        {renderSelect(
                            "FieldMember",
                            "Field Member",
                            fieldMemberOptions
                        )}

                        {renderSelect(
                            "Gender",
                            "Gender",
                            genderOptions
                        )}

                        {renderSelect(
                            "Reason",
                            "Reason",
                            reasonOptions
                        )}


                        <div className="flex gap-3 pt-4">

                            <button
                                type="button"
                                onClick={handleReset}
                                className="w-full border py-2 rounded-lg"
                            >
                                Reset
                            </button>


                            <button
                                type="submit"
                                className="w-full bg-linear-to-r from-slate-800 via-slate-700 to-slate-900 text-white py-2 rounded-lg"
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


export default LeadsFilter;
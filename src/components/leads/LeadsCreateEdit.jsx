import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useEffect, useMemo, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import Select from "react-select";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { toast } from "react-toastify";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
    useCreateLeadData,
    useBulkCreateLead,
    useSingleLeadData,
    getLeadNavigation,
    useUpdateLeadData
} from "./services";

import { useCurrentUser } from "../../auth/services";
import { selectStyles } from "../../utils/selectStyles";
import { convertStringFormatDate, formatDateAndTime } from "../../utils/dateFormatter";
import { Link } from "react-router-dom";
import Loader from "../common/Loader";
import { useBatchOptions } from "../Options/services";


// Validation

const schema = yup.object().shape({

    mode: yup.string()
        .required(),

    CallingNo: yup.string()
        .when("mode", {
            is: "single",
            then: (schema) =>
                schema.required("Calling No is required"),
            otherwise: (schema) =>
                schema.notRequired()
        }),

    WhatsAppNo: yup.string()
        .when("mode", {
            is: "single",
            then: (schema) =>
                schema.required("WhatsApp No is required"),
            otherwise: (schema) =>
                schema.notRequired()
        }),

    // TeamCode: yup.string()
    //     .when("mode", {
    //         is: "single",
    //         then: (schema) =>
    //             schema.required("Team Code is required"),
    //         otherwise: (schema) =>
    //             schema.notRequired()
    //     }),

    BulkCallingNo: yup.string()
        .when("mode", {
            is: "bulk",
            then: (schema) =>
                schema.required("Calling No is required"),
            otherwise: (schema) =>
                schema.notRequired()
        }),

    BulkLeadSource: yup.string()
        .when("mode", {
            is: "bulk",
            then: (schema) =>
                schema.required("Lead Source is required"),
            otherwise: (schema) =>
                schema.notRequired()
        }),
    ClientName: yup.string().when("mode", {
        is: "single",
        then: (schema) =>
            schema.required("Client Name is required"),
        otherwise: (schema) =>
            schema.notRequired()
    })

});



function LeadsCreateEdit() {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { data: currentUser } = useCurrentUser();
    const { data: singleLead } = useSingleLeadData(id);
    const { mutateAsync: createLead } = useCreateLeadData();
    const { mutateAsync: updateLead } = useUpdateLeadData();
    const { mutateAsync: bulkCreateLead } = useBulkCreateLead();
    const [mode, setMode] = useState(id ? "single" : "bulk");
    const [navigation, setNavigation] = useState({
        previousId: null,
        nextId: null
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

    // const filters = useMemo(
    //     () => location.state?.filters || {},
    //     [location.state]
    // );
    const filters = location.state?.filters || {};
    const search = location.state?.search || "";



    const {
        control,
        register,
        handleSubmit,
        reset,
        watch,
        setValue,
        formState: {
            errors,
            isSubmitting
        }
    } = useForm({
        resolver: yupResolver(schema),
        defaultValues: {
            mode: id ? "single" : "bulk",
            ClientName: "",
            CallingNo: "",
            WhatsAppNo: "",
            Gender: null,
            LeadSource: null,
            Location: null,
            Assignee: null,
            FieldMember: null,
            FollowupDate: null,
            LeadStatus: null,
            Reason: null,
            TeamCode: null,
            BulkCallingNo: "",
            BulkLeadSource: null,
            BulkFollowupDate: null,
            Comments: "",
            WorkLogs: ""
        }
    });
    const GenderOptions = options.gender || [];
    const LeadSourceOptions = options.leadsource || [];
    const LeadStatusOptions = options.leadstatus || [];
    const ReasonOptions = options.leadsreason || [];
    const LocationOptions = options.locations || [];
    const TeamCodeOptions = options.teamcode || [];
    const ManagerOptions = [
        { value: "Akash", label: "Akash" },
        { value: "Rahul", label: "Rahul" },
        { value: "Priya", label: "Priya" }
    ];

    // Edit Data Load
    useEffect(() => {

        if (id && singleLead?.data) {
            const lead = singleLead.data;
            reset({
                mode: "single",
                ...lead,
                FollowupDate: lead.FollowupDate
                    ? new Date(lead.FollowupDate)
                    : null,
                Comments: "",
            });
        }
    }, [id, singleLead, reset]);

    // Previous Next Navigation
    useEffect(() => {
        if (!id) return;
        const loadNavigation = async () => {
            try {
                const res = await getLeadNavigation({
                    id,
                    search,
                    ...filters
                });
                setNavigation({
                    previousId: res.previousId,
                    nextId: res.nextId
                });
            } catch (err) {
                console.log(err);
            }
        };
        loadNavigation();
    }, [id, search, filters]);

    useEffect(() => {
        console.log("Location State:", location.state);
    }, [location.state]);

    const onSubmit = async (data) => {
        try {
            // UPDATE
            if (id) {
                const oldData = singleLead?.data;
                const updatedData = {
                    ClientName: data.ClientName || "",
                    CallingNo: data.CallingNo || "",
                    WhatsAppNo: data.WhatsAppNo || "",
                    Gender: data.Gender || "",
                    LeadSource: data.LeadSource || "",
                    Location: data.Location || "",
                    Assignee: data.Assignee || "",
                    FieldMember: data.FieldMember || "",
                    FollowupDate: convertStringFormatDate(data.FollowupDate),
                    LeadStatus: data.LeadStatus || "",
                    Reason: data.Reason || "",
                    TeamCode: data.TeamCode || "",
                    Comments: data.Comments || "",
                    LeadNo: oldData.LeadNo,
                    UpdatedBy: currentUser?.user?.name
                };
                await updateLead({
                    id: oldData._id,
                    data: updatedData
                });
                toast.success("Lead updated successfully");
                return;
            }
            // BULK CREATE
            if (mode === "bulk") {
                const numbers = data.BulkCallingNo
                    .split("\n")
                    .map(x => x.trim())
                    .filter(Boolean);
                if (!numbers.length) {
                    toast.error("Enter Calling Numbers");
                    return;
                }
                const payload = {
                    leads: numbers.map(number => ({
                        CallingNo: number,
                        WhatsAppNo: number,
                        FollowupDate: convertStringFormatDate(data.BulkFollowupDate),
                        LeadSource: data.BulkLeadSource || "",
                        workLogs: [
                            {
                                message: "Bulk Lead Created",
                                createdBy: currentUser?.user?.name || "User",
                                createdAt: new Date()
                            }
                        ]
                    }))
                };
                await bulkCreateLead(payload);
                toast.success(
                    `${numbers.length} Leads Created Successfully`
                );
                reset();
                navigate("/leads");
                return;
            }
            // SINGLE CREATE
            const createdData = {
                ClientName: data.ClientName || "",
                CallingNo: data.CallingNo || "",
                WhatsAppNo: data.WhatsAppNo || "",
                Gender: data.Gender || "",
                LeadSource: data.LeadSource || "",
                Location: data.Location || "",
                Assignee: data.Assignee || "",
                FieldMember: data.FieldMember || "",
                FollowupDate: convertStringFormatDate(data.FollowupDate),
                LeadStatus: data.LeadStatus || "New",
                Reason: data.Reason || "",
                TeamCode: data.TeamCode || "",
                Comments: data.Comments || "",
                CreatedBy: currentUser?.user?.name || "User",
            };
            await createLead(createdData);
            toast.success("Lead created successfully");
            reset();
            navigate("/leads");
        } catch (err) {
            toast.error(
                err?.response?.data?.message || "Something went wrong"
            );
        }
    };
    return (
        <div className="max-w-12xl h-[80vh] mx-auto my-5 bg-white shadow border border-gray-300 p-4 rounded-xl">
            <form onSubmit={handleSubmit(onSubmit)}>
                <div className="flex gap-4 mb-10 justify-center">
                    {!id && (
                        <button
                            type="button"
                            onClick={() => {
                                setMode("bulk");
                                setValue("mode", "bulk");
                            }}
                            className={`px-10 py-2 whitespace-nowrap rounded text-xl ${mode === "bulk"
                                ? "bg-black text-white"
                                : "bg-gray-300"
                                }`}
                        >
                            Bulk Upload Leads
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={() => {
                            setMode("single");
                            setValue("mode", "single");
                        }}
                        className={`px-10 py-2 whitespace-nowrap rounded text-xl ${mode === "single"
                            ? "bg-black text-white"
                            : "bg-gray-300"
                            }`}
                    >
                        {id ? "Update Lead" : "Add Single Lead"}
                    </button>
                </div>

                {id && (
                    <div className="flex justify-end gap-3 mb-4">
                        <button
                            type="button"
                            disabled={!navigation.previousId}
                            onClick={() => navigate(`/leads/edit/${navigation.previousId}`, { state: location.state })}
                            className="border px-4 py-2 flex items-center gap-1 rounded  theme-btn"
                        >
                           <ChevronLeft size={20} /> Previous   
                        </button>
                        <button
                            type="button"
                            disabled={!navigation.nextId}
                            onClick={() => navigate(`/leads/edit/${navigation.nextId}`, { state: location.state })}
                            className="border px-4 py-2 rounded flex items-center gap-1  theme-btn"
                        >
                            Next   <ChevronRight size={20} />

                        </button>
                    </div>
                )}

                {mode === "bulk" && !id && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                     <div className="flex flex-col gap-2">
                             <Controller
                            name="BulkLeadSource"
                            control={control}
                            render={({ field }) => (
                                <div className={`select-group ${field.value ? "has-value" : ""}`}>
                                    <label className="select-label required-label">LeadSource</label>

                                    <Select
                                        {...field}
                                        options={LeadSourceOptions}
                                        placeholder=""
                                        isClearable
                                        value={LeadSourceOptions.find(x => x.value === field.value)}
                                        onChange={(e) => field.onChange(e?.value)}
                                        styles={selectStyles}
                                    />
                                </div>
                            )}
                        />
                        <Controller
                            name="BulkFollowupDate"
                            control={control}
                            render={({ field }) => (
                                <div className={`datepicker-group ${field.value ? "has-value" : ""}`}>
                                    <label className="datepicker-label">
                                        Followup Date
                                    </label>
                                    <DatePicker
                                        selected={field.value}
                                        isClearable
                                        onChange={(date) => field.onChange(date)}
                                        dateFormat="dd MMM yyyy"
                                        className="custom-datepicker"
                                    />
                                </div>
                            )}
                        />
                     </div>
                        <div className="form-group md:col-span-2">
                            <textarea
                                disabled={id ? true : false}
                                rows={5}
                                placeholder="Enter mobile numbers separated by spaces or commas (e.g. 1234567890 9876543210 or 1234567890,9876543210)"
                                {...register("BulkCallingNo", {
                                    required: "BulkCallingNo is required",
                                })}
                                className="form-input"
                            />
                            {errors.BulkCallingNo && (
                                <p className="text-red-500 text-sm mt-1">
                                    {errors.BulkCallingNo.message}
                                </p>
                            )}
                            <label className="form-label form-label required-label">
                                Calling No
                            </label>
                        </div>
                    </div>
                )}

                {mode === "single" && (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="form-group md:col-span-1">
                            <input
                                {...register("ClientName",)}
                                className="form-input"
                                placeholder=" "
                            />
                            {errors.ClientName && (
                                <p className="text-red-500 text-sm mt-1">
                                    {errors.ClientName.message}
                                </p>
                            )}
                            <label className="form-label form-label required-label">Client Name</label>
                        </div>
                        <div className="form-group md:col-span-1">
                            <input
                                {...register("CallingNo", {
                                    required: "Title is required",
                                })}
                                className="form-input"
                                placeholder=" "
                            />
                            {errors.CallingNo && (
                                <p className="text-red-500 text-sm mt-1">
                                    {errors.CallingNo.message}
                                </p>
                            )}
                            <label className="form-label form-label required-label">CallingNo</label>
                        </div>
                        <div className="form-group md:col-span-1">
                            <input
                                {...register("WhatsAppNo", {
                                    required: "Title is required",
                                })}
                                className="form-input"
                                placeholder=" "
                            />
                            {errors.WhatsAppNo && (
                                <p className="text-red-500 text-sm mt-1">
                                    {errors.WhatsAppNo.message}
                                </p>
                            )}
                            <label className="form-label form-label required-label">WhatsAppNo</label>
                        </div>
                        <Controller
                            name="Gender"
                            control={control}
                            render={({ field }) => (
                                <div className={`select-group ${field.value ? "has-value" : ""}`}>
                                    <label className="select-label">Gender</label>
                                    <Select
                                        {...field}
                                        options={GenderOptions}
                                        placeholder=""
                                        isClearable
                                        value={GenderOptions.find(x => x.value === field.value)}
                                        onChange={(e) => field.onChange(e?.value)}
                                        styles={selectStyles}
                                    />
                                </div>
                            )}
                        />
                        <Controller
                            name="LeadSource"
                            control={control}
                            render={({ field }) => (
                                <div className={`select-group ${field.value ? "has-value" : ""}`}>
                                    <label className="select-label">LeadSource</label>
                                    <Select
                                        {...field}
                                        options={LeadSourceOptions}
                                        placeholder=""
                                        isClearable
                                        value={LeadSourceOptions.find(x => x.value === field.value)}
                                        onChange={(e) => field.onChange(e?.value)}
                                        styles={selectStyles}
                                    />
                                </div>
                            )}
                        />
                        <Controller
                            name="Location"
                            control={control}
                            render={({ field }) => (
                                <div className={`select-group ${field.value ? "has-value" : ""}`}>
                                    <label className="select-label">Location</label>
                                    <Select
                                        {...field}
                                        options={LocationOptions}
                                        placeholder=""
                                        isClearable
                                        value={LocationOptions.find(x => x.value === field.value)}
                                        onChange={(e) => field.onChange(e?.value)}
                                        styles={selectStyles}
                                    />
                                </div>
                            )}
                        />
                        <Controller
                            name="Assignee"
                            control={control}
                            render={({ field }) => (
                                <div className={`select-group ${field.value ? "has-value" : ""}`}>
                                    <label className="select-label">Assignee</label>
                                    <Select
                                        {...field}
                                        options={ManagerOptions}
                                        placeholder=""
                                        isClearable
                                        value={ManagerOptions.find(x => x.value === field.value)}
                                        onChange={(e) => field.onChange(e?.value)}
                                        styles={selectStyles}
                                    />
                                </div>
                            )}
                        />
                        <Controller
                            name="FieldMember"
                            control={control}
                            render={({ field }) => (
                                <div className={`select-group ${field.value ? "has-value" : ""}`}>
                                    <label className="select-label">FieldMember</label>
                                    <Select
                                        {...field}
                                        options={ManagerOptions}
                                        placeholder=""
                                        isClearable
                                        value={ManagerOptions.find(x => x.value === field.value)}
                                        onChange={(e) => field.onChange(e?.value)}
                                        styles={selectStyles}
                                    />
                                </div>
                            )}
                        />
                        <Controller
                            name="FollowupDate"
                            control={control}
                            render={({ field }) => (
                                <div className={`datepicker-group ${field.value ? "has-value" : ""}`}>
                                    <label className="datepicker-label">
                                        Followup Date
                                    </label>
                                    <DatePicker
                                        selected={field.value}
                                        isClearable
                                        onChange={(date) => field.onChange(date)}
                                        dateFormat="dd MMM yyyy"
                                        className="custom-datepicker"
                                    />
                                </div>
                            )}
                        />
                        <Controller
                            name="LeadStatus"
                            control={control}
                            render={({ field }) => (
                                <div className={`select-group ${field.value ? "has-value" : ""}`}>
                                    <label className="select-label">LeadStatus</label>
                                    <Select
                                        {...field}
                                        options={LeadStatusOptions}
                                        placeholder=""
                                        isClearable
                                        value={LeadStatusOptions.find(x => x.value === field.value)}
                                        onChange={(e) => field.onChange(e?.value)}
                                        styles={selectStyles}
                                    />
                                </div>
                            )}
                        />
                        <Controller
                            name="Reason"
                            control={control}
                            render={({ field }) => (
                                <div className={`select-group ${field.value ? "has-value" : ""}`}>
                                    <label className="select-label">Reason</label>
                                    <Select
                                        {...field}
                                        options={ReasonOptions}
                                        placeholder=""
                                        isClearable
                                        value={ReasonOptions.find(x => x.value === field.value)}
                                        onChange={(e) => field.onChange(e?.value)}
                                        styles={selectStyles}
                                    />
                                </div>
                            )}
                        />

                        
                            <Controller
                                name="TeamCode"
                                control={control}
                                render={({ field }) => (
                                    <div className={`select-group ${field.value ? "has-value" : ""}`}>
                                        <label className="select-label">TeamCode</label>
                                        <Select
                                            {...field}
                                            options={TeamCodeOptions}
                                            placeholder=""
                                            isClearable
                                            value={TeamCodeOptions.find(x => x.value === field.value)}
                                            onChange={(e) => field.onChange(e?.value)}
                                            styles={selectStyles}
                                        />
                                    </div>
                                )}
                            />
                        

                        <div className="form-group md:col-span-1">
                            <textarea
                                rows={5}
                                {...register("Comments", {
                                    required: "Comments is required",
                                })}
                                className="form-input"
                            />
                            {errors.Comments && (
                                <p className="text-red-500 text-sm mt-1">
                                    {errors.Comments.message}
                                </p>
                            )}
                            <label className="form-label form-label required-label">
                                Comments
                            </label>
                        </div>

                        {id && (
                            <div className="border border-gray-400 rounded-lg  py-2 px-4 h-44 flex flex-col md:col-span-3 relative">
                                <h3 className="text-md mb-1 bg-white absolute -mt-5">
                                    Work Log History
                                </h3>
                                <div className="flex-1 overflow-y-auto">
                                    {singleLead?.data?.workLogs?.length > 0 ? (
                                        singleLead.data.workLogs
                                            .slice()
                                            .reverse()
                                            .map((log) => (
                                                <div
                                                    key={log._id}
                                                    className="border-b border-gray-300 py-3 last:border-b-0"
                                                >
                                                    <small className="text-gray-500">
                                                        {log.createdBy || "System"} •{" "}
                                                        {formatDateAndTime(log.createdAt)}
                                                    </small>
                                                    <p className="whitespace-pre-line text-md font-bold ">
                                                        {log.message}
                                                    </p>
                                                </div>
                                            ))
                                    ) : (
                                        <p className="text-gray-400 text-center mt-10">
                                            No Work Logs Available
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                <div className="flex justify-end gap-3 mt-5">
                    <Link to="/leads">
                        <button
                            type="button"
                            className="border border-gray-600 hover:bg-gray-700 hover:text-white px-6 py-2 rounded-lg font-medium"
                        >
                            Cancel
                        </button>
                    </Link>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="theme-btn text-white px-6 py-2 rounded"
                    >
                        {isSubmitting ? <div className='flex justify-center items-center gap-2'><Loader /> Processing...</div> : id ? "Update Lead" : "Create Lead"}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default LeadsCreateEdit;
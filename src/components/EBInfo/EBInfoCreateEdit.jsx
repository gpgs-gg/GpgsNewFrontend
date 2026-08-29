import React, { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import Select from "react-select";
import { Eye, EyeOff, Save, X } from "lucide-react";
import { toast } from "react-toastify";

import {
    useSingleElectricityBillData,
    useCreateElectricityBillData,
    useUpdateElectricityBillData,
} from "./services";
import FilePreview from "../common/FilePreview";
import { selectStyles } from "../../utils/selectStyles";
import Loader from "../common/Loader";
import { useCurrentUser } from "../../auth/services";
import { formatDateAndTime } from "../../utils/dateFormatter";
import { useBatchOptions } from "../Options/services";

const EBInfoCreateEdit = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const location = useLocation();

    const { data: options = {} } = useBatchOptions([
        "paidornotpaid"
    ]);
    // =========================
    // CREATE / EDIT
    // =========================

    const isEdit = !!id;

    // Create page वर table मधून आलेला data
    const createData = location.state;
    const [attachmentFiles, setAttachmentFiles] = useState([]);
    const [existingAttachments, setExistingAttachments] = useState([]);
    const { data: currentUser, isLoading } = useCurrentUser();
    // =========================
    // FORM
    // =========================

    const {
        register,
        control,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm({
        defaultValues: {
            propertyCode: "",
            billingMonth: "",
            EBCycle: "",
            flatUnits: "",
            flatEB: "",
            assignee: "",
            status: "",
            reviewer: "",
            ebPaidStatus: "",
            newWorkLog: ""
        },
    });

    // =========================
    // GET SINGLE DATA
    // =========================

    const {
        data: singleResponse,
        isLoading: singleLoading,
    } = useSingleElectricityBillData(id);

    // =========================
    // CREATE
    // =========================

    const {
        mutate: createEB,
        isPending: createLoading,
    } = useCreateElectricityBillData();

    // =========================
    // UPDATE
    // =========================

    const {
        mutate: updateEB,
        isPending: updateLoading,
    } = useUpdateElectricityBillData();

    // =========================
    // LOADING
    // =========================

    const submitLoading =
        createLoading || updateLoading;

    const PaidornotpaidOptions = options.paidornotpaid || [];
    const ManagerOptions = [
        { value: "Akash", label: "Akash" },
        { value: "Rahul", label: "Rahul" },
        { value: "Priya", label: "Priya" }
    ];
    // =========================
    // EDIT DATA RESET
    // =========================

    useEffect(() => {
        if (isEdit && singleResponse?.data) {
            const data = singleResponse.data;

            reset({
                propertyCode: data.propertyCode || "",
                billingMonth: data.billingMonth || "",
                EBCycle: data.EBCycle || "",
                flatUnits: data.flatUnits ?? "",
                flatEB: data.flatEB ?? "",
                assignee: data.assignee || "",
                status: data.status || "",
                reviewer: data.reviewer || "",
                ebPaidStatus: data.ebPaidStatus || "",

            });
            setExistingAttachments(data.attachment || []);
            setAttachmentFiles([]);
        }
    }, [isEdit, singleResponse, reset]);

    // =========================
    // CREATE DATA RESET
    // =========================

    useEffect(() => {
        if (!isEdit && createData) {
            reset({
                propertyCode: createData.propertyCode || "",
                billingMonth: createData.billingMonth || "",
                EBCycle: createData.EBCycle || "",
                flatUnits: "",
                flatEB: "",
                assignee: "",
                status: "",
                reviewer: "",
                ebPaidStatus: ""
            });
        }
    }, [isEdit, createData, reset]);

    // =========================
    // STATUS OPTIONS
    // =========================

    const StatusOptions = [
        {
            value: "Pending",
            label: "Pending",
        },
        {
            value: "Submitted",
            label: "Submitted",
        },
    ];

    // =========================
    // SUBMIT
    // =========================

    const onSubmit = (data) => {
        const formData = new FormData();

        formData.append(
            "propertyCode",
            data.propertyCode
        );

        formData.append(
            "billingMonth",
            data.billingMonth
        );

        formData.append(
            "EBCycle",
            data.EBCycle
        );

        if (data.flatUnits !== "") {
            formData.append(
                "flatUnits",
                data.flatUnits
            );
        }

        if (data.flatEB !== "") {
            formData.append(
                "flatEB",
                data.flatEB
            );
        }

        formData.append(
            "assignee",
            data.assignee || ""
        );

        formData.append(
            "reviewer",
            data.reviewer || ""
        );

        formData.append(
            "ebPaidStatus",
            data.ebPaidStatus || ""
        );
        formData.append(
            "status",
            data.status || ""
        );

        formData.append(
            "newWorkLog",
            data.newWorkLog || ""
        );
        formData.append("updatedByName", currentUser?.user?.name || "");


        // Existing attachments
        formData.append(
            "existingAttachments",
            JSON.stringify(existingAttachments)
        );

        // New attachments
        attachmentFiles.forEach((file) => {
            formData.append("attachment", file);
        });

        // =========================
        // CREATE
        // =========================

        if (!isEdit) {
            createEB(formData, {
                onSuccess: (res) => {
                    toast.dismiss();
                    toast.success(res.message);

                    navigate("/eb-info");
                },

                onError: (err) => {
                    toast.dismiss();

                    toast.error(
                        err?.response?.data?.message ||
                        "Create Failed"
                    );
                },
            });

            return;
        }

        // =========================
        // UPDATE
        // =========================

        updateEB(
            {
                id,
                formData,
            },
            {
                onSuccess: (res) => {
                    toast.dismiss();
                    toast.success(res.message);

                    navigate("/eb-info");
                },

                onError: (err) => {
                    toast.dismiss();

                    toast.error(
                        err?.response?.data?.message ||
                        "Update Failed"
                    );
                },
            }
        );
    };

    // =========================
    // SINGLE DATA LOADING
    // =========================

    if (isEdit && singleLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader />
            </div>
        );
    }
    return (
        <div className="space-y-5">

            {/* ================= HEADER ================= */}

            <form
                onSubmit={handleSubmit(onSubmit)}
                className="space-y-5"
            >

                <div className="bg-white rounded-xl shadow-sm border border-gray-400 px-3 py-2">

                    <div className="flex justify-between items-center">

                        <div>

                            <h1 className="text-2xl font-bold">
                                {isEdit
                                    ? "Update Electricity Bill Info"
                                    : "Create Electricity Bill Info"}
                            </h1>

                            <p className="text-sm text-gray-500">
                                Manage monthly electricity bill data
                            </p>

                        </div>

                        <div className="flex gap-3">

                            <Link to="/eb-info">
                                <button
                                    type="button"
                                    className="border rounded-lg px-5 py-2 hover:bg-gray-100 flex items-center gap-2"
                                >

                                    Cancel
                                </button>
                            </Link>

                            <button
                                type="submit"
                                disabled={submitLoading}
                                className="theme-btn text-white px-6 py-2 rounded-lg flex items-center gap-2"
                            >
                                {submitLoading ? (
                                    <>
                                        <Loader />
                                        Processing...
                                    </>
                                ) : (
                                    <>

                                        {isEdit
                                            ? "Update EB"
                                            : "Save EB"}
                                    </>
                                )}
                            </button>

                        </div>

                    </div>

                </div>

                {/* ================= EB DETAILS ================= */}

                <div className="bg-white rounded-xl shadow-sm">

                    <div className="px-6 py-4">
                        <h2 className="text-lg font-semibold">
                            Electricity Bill Details
                        </h2>
                    </div>

                    <div className="p-6 grid md:grid-cols-4 gap-5">

                        {/* Property Code */}

                        <div className="form-group">

                            <input
                                {...register("propertyCode")}
                                className="form-input"
                                placeholder=" "
                                readOnly
                            />

                            <label className="form-label">
                                Property Code
                            </label>

                        </div>

                        {/* Billing Month */}

                        <div className="form-group">

                            <input
                                {...register("billingMonth")}
                                className="form-input"
                                placeholder=" "
                                readOnly
                            />

                            <label className="form-label">
                                Billing Month
                            </label>

                        </div>

                        <div className="form-group">

                            <input
                                {...register("EBCycle")}
                                className="form-input"
                                placeholder=" "
                                readOnly
                            />

                            <label className="form-label">
                                EB Cycle Date
                            </label>

                        </div>

                        {/* Assignee */}

                        <Controller
                            name="assignee"
                            control={control}
                            // rules={{
                            //     required: "assignee is required",
                            // }}
                            render={({ field }) => (
                                <div className={`select-group ${field.value ? "has-value" : ""}`}>
                                    <label className="select-label form-label required-label">Assignee</label>
                                    <Select
                                        {...field}
                                        options={ManagerOptions}
                                        placeholder=""
                                        isClearable
                                        value={ManagerOptions.find(
                                            (x) => x.value === field.value
                                        )}
                                        onChange={(e) => field.onChange(e?.value)}
                                        styles={selectStyles}
                                    />
                                    {errors.assignee && (
                                        <p className="text-red-500 text-sm mt-1">
                                            {errors.assignee.message}
                                        </p>
                                    )}
                                </div>
                            )}
                        />
                        <Controller
                            name="reviewer"
                            control={control}
                            // rules={{
                            //     required: "reviewer is required",
                            // }}
                            render={({ field }) => (
                                <div className={`select-group ${field.value ? "has-value" : ""}`}>
                                    <label className="select-label form-label ">Reviewer</label>
                                    <Select
                                        {...field}
                                        options={ManagerOptions}
                                        placeholder=""
                                        isClearable
                                        value={ManagerOptions.find(
                                            (x) => x.value === field.value
                                        )}
                                        onChange={(e) => field.onChange(e?.value)}
                                        styles={selectStyles}
                                    />
                                    {errors.reviewer && (
                                        <p className="text-red-500 text-sm mt-1">
                                            {errors.reviewer.message}
                                        </p>
                                    )}
                                </div>
                            )}
                        />

                        {/* Flat EB */}

                        <div className="form-group">

                            <input
                                type="number"
                                {...register("flatEB", {
                                    // required: "Flat EB is required",
                                })}
                                className="form-input"
                                placeholder=" "
                            />

                            <label className="form-label form-label required-label">
                                Flat EB
                            </label>

                            {errors.flatEB && (
                                <p className="text-red-500 text-sm mt-1">
                                    {errors.flatEB.message}
                                </p>
                            )}

                        </div>
                        {/* Flat Units */}

                        <div className="form-group">

                            <input
                                type="number"
                                {...register("flatUnits", {
                                    // required: "Flat Units is required",
                                })}
                                className="form-input"
                                placeholder=" "
                            />

                            <label className="form-label form-label required-label">
                                Flat Units
                            </label>

                            {errors.flatUnits && (
                                <p className="text-red-500 text-sm mt-1">
                                    {errors.flatUnits.message}
                                </p>
                            )}

                        </div>

                        {/* Status */}

                        <Controller
                            name="ebPaidStatus"
                            control={control}
                            // rules={{
                            //     required: "ebPaidStatus is required",
                            // }}
                            render={({ field }) => (
                                <div
                                    className={`select-group ${field.value
                                        ? "has-value"
                                        : ""
                                        }`}
                                >

                                    <label className="select-label form-label required-label">
                                        Flat EB Paid
                                    </label>

                                    <Select
                                        options={PaidornotpaidOptions}
                                        placeholder=""
                                        isClearable
                                        value={
                                            PaidornotpaidOptions.find(
                                                (x) =>
                                                    x.value === field.value
                                            ) || null
                                        }
                                        onChange={(selected) =>
                                            field.onChange(
                                                selected?.value || ""
                                            )
                                        }
                                        styles={selectStyles}
                                    />

                                    {errors.ebPaidStatus && (
                                        <p className="text-red-500 text-sm mt-1">
                                            {errors.ebPaidStatus.message}
                                        </p>
                                    )}

                                </div>
                            )}
                        />
                        <Controller
                            name="status"
                            control={control}
                            // rules={{
                            //     required: "Status is required",
                            // }}
                            render={({ field }) => (
                                <div
                                    className={`select-group ${field.value
                                        ? "has-value"
                                        : ""
                                        }`}
                                >

                                    <label className="select-label form-label ">
                                        Status
                                    </label>

                                    <Select
                                        options={StatusOptions}
                                        placeholder=""
                                        isClearable
                                        value={
                                            StatusOptions.find(
                                                (x) =>
                                                    x.value === field.value
                                            ) || null
                                        }
                                        onChange={(selected) =>
                                            field.onChange(
                                                selected?.value || ""
                                            )
                                        }
                                        styles={selectStyles}
                                    />

                                    {errors.status && (
                                        <p className="text-red-500 text-sm mt-1">
                                            {errors.status.message}
                                        </p>
                                    )}

                                </div>
                            )}
                        />

                        {/* Attachment */}

                        <div className="form-group md:col-span-2">
                            <input
                                type="file"
                                multiple
                                className="form-input"
                                onChange={(e) => {
                                    const files = Array.from(e.target.files);

                                    setAttachmentFiles((prev) => {
                                        const updated = [...prev, ...files];
                                        return updated;
                                    });

                                    // Same file पुन्हा select करता यावा म्हणून
                                    e.target.value = "";
                                }}
                            />
                            <label className="form-label">
                                Attachment
                            </label>

                            <FilePreview
                                files={attachmentFiles}
                                existingFiles={existingAttachments}

                                onRemoveExisting={(index) => {
                                    setExistingAttachments((prev) =>
                                        prev.filter((_, i) => i !== index)
                                    );
                                }}

                                onRemoveNew={(index) => {
                                    setAttachmentFiles((prev) =>
                                        prev.filter((_, i) => i !== index)
                                    );
                                }}
                            />
                        </div>

                    </div>


                </div>

                {id && (
                    <div className="bg-white rounded-xl shadow-sm px-5">

                        <div className="px-6 py-4">
                            <h2 className="text-lg font-semibold">
                                WorkLog
                            </h2>
                        </div>
                        <div className="grid md:grid-cols-2  gap-4">
                            {id && (
                                <div className="form-group">
                                    <textarea

                                        rows={5}
                                        {...register("newWorkLog", {

                                        })}
                                        className="form-input"
                                    />
                                    <label className="form-label form-label ">
                                        Add WorkLog
                                    </label>

                                </div>
                            )}

                            {id && singleResponse?.data?.workLogs?.length > 0 && (
                                <div className="border rounded-lg bg-gray-50 py-2 px-4 h-44 flex flex-col md:col-span-1">
                                    <h3 className="font-semibold text-lg mb-1">
                                        Work Log History
                                    </h3>

                                    <div className="flex-1 overflow-y-auto">
                                        {singleResponse?.data?.workLogs?.length > 0 ? (
                                            singleResponse.data.workLogs
                                                .slice()
                                                .reverse()
                                                .map((log) => (
                                                    <div
                                                        key={log._id}
                                                        className="border-b py-3 last:border-b-0"
                                                    >
                                                        <small className="text-gray-500">
                                                            {log.createdBy || "System"} •{" "}
                                                            {formatDateAndTime(log.createdAt)}
                                                        </small>
                                                        <p className="whitespace-pre-line text-sm">
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
                    </div>
                )}

                {/* ================= FOOTER ================= */}

                <div className="rounded-xl px-6 py-4 flex justify-end gap-3">

                    <Link to="/eb-info">
                        <button
                            type="button"
                            className="border rounded-lg px-5 py-2 hover:bg-gray-100"
                        >
                            Cancel
                        </button>
                    </Link>

                    <button
                        type="submit"
                        disabled={submitLoading}
                        className="theme-btn text-white px-6 py-2 rounded-lg flex items-center gap-2"
                    >
                        {submitLoading
                            ? "Processing..."
                            : isEdit
                                ? "Update EB"
                                : "Save EB"}
                    </button>

                </div>

            </form>

        </div>
    );
};

export default EBInfoCreateEdit;
import React, { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
    useBankTransactionById,
    useUpdateBankTransaction,
} from "./services";
import { toast } from "react-toastify";
import Loader from "../common/Loader";
import { formatDate } from "../../utils/dateFormatter";
import { getPropertyDropdown } from "../properties/services";
import { AsyncPaginate } from "react-select-async-paginate";
import { selectStyles } from "../../utils/selectStyles";
import Select from "react-select";
import { useBatchOptions } from "../Options/services";
import { useCurrentUser } from "../../auth/services";
const BankTransactionEdit = () => {
    const navigate = useNavigate();
    const { account, id } = useParams();
    const { data: options = {} } = useBatchOptions([
        "bankstatus", "expensecode", "expensecategory"
    ]);
    const {
        control,
        register,
        handleSubmit,
        reset,
        watch,
        formState: { errors }
    } = useForm();


    const propertyId = watch("propertyId");
    const expensecode = watch("expensecode");
    const {
        data: transactionData,
        isLoading,
        isError,
    } = useBankTransactionById({
        account,
        id,
        enabled: !!account && !!id,
    });
    const { data: currentUser } = useCurrentUser();
    const { mutate: updateTransaction, isPending: updateLoading } =
        useUpdateBankTransaction();
    const [selectedProperty, setSelectedProperty] = useState(null);
    useEffect(() => {
        if (transactionData?.data) {
            const data = transactionData.data;

            reset({
                chqNo: data.chqNo || "",
                source: data.source || "",
            });
        }
    }, [transactionData, reset]);



    const transaction = transactionData?.data;
    useEffect(() => {
        if (transactionData?.data) {
            const data = transactionData.data;

            reset({
                propertyId: data.propertyId || "",
                expensecode: data.expenseCode?.id || "",
                expenseCategory: data.expenseCategory || "",
                status: data.status || "",
                comment: data.comment || "",
            });

            if (data.propertyId) {
                setSelectedProperty({
                    value: data.propertyId,
                    label: data.propertyCode || data.propertyId,
                });
            }
        }
    }, [transactionData, reset]);

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
                        value: item._id,
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


    const statusOptions = options.bankstatus || [];
    const expensecategoryOptions = options.expensecategory || [];
    const expensecodeOptions = options.expensecode || [];

    const onSubmit = (data) => {
        const payload = {
            propertyId: data.propertyId || "",
            expenseCategory: data.expenseCategory || "",
            status: data.status || "",
            updatedByName: currentUser?.user?.name,
            comment: data.comment || "",
            expenseCode: data.expensecode
        };

        updateTransaction(
            {
                account,
                id,
                data: payload,
            },
            {
                onSuccess: (res) => {
                    toast.dismiss();
                    toast.success(
                        res?.message || "Transaction updated successfully"
                    );
                    navigate("/bank-transactions");
                },
                onError: (err) => {
                    toast.dismiss();
                    toast.error(
                        err?.response?.data?.message || "Update Failed"
                    );
                },
            }
        );
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center ">
                <Loader />
            </div>
        );
    }

    if (isError || !transaction) {
        return (
            <div className="bg-white rounded-xl border  text-center">
                <p className="text-red-500 font-medium">
                    Failed to load transaction details.
                </p>

                <Link to="/bank-transactions">
                    <button
                        type="button"
                        className="mt-4 border rounded-lg px-5 py-2 hover:bg-gray-100"
                    >
                        Back
                    </button>
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-5">
            <form
                onSubmit={handleSubmit(onSubmit)}
                className="space-y-5  h-[85vh]"
            >
                {/* ================= HEADER ================= */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 px-5 py-4">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800">
                                Edit Bank Transaction
                            </h1>

                            <p className="text-sm text-gray-500 mt-1">
                                Review transaction details and update required information
                            </p>
                        </div>

                        <div className="flex items-center gap-3">
                            <Link to="/bank-transactions">
                                <button
                                    type="button"
                                    className="border border-gray-300 rounded-lg px-5 py-2 hover:bg-gray-100"
                                >
                                    Cancel
                                </button>
                            </Link>

                            <button
                                type="submit"
                                disabled={updateLoading}
                                className="theme-btn text-white px-6 py-2 rounded-lg flex items-center gap-2 disabled:opacity-60"
                            >
                                {updateLoading ? (
                                    <>
                                        <Loader />
                                        Processing...
                                    </>
                                ) : (
                                    "Update Transaction"
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* ================= TRANSACTION DETAILS ================= */}
                <div className="bg-white  rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="px-5 py-3  border-gray-200 flex items-center justify-between">
                        <div>
                            <h2 className="text-base font-semibold text-gray-800">
                                Transaction Details
                            </h2>
                        </div>

                        <span className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 border border-gray-200">
                            Read Only
                        </span>
                    </div>

                    <div className="px-5 py-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-x-6 gap-y-4">

                            {/* Account */}
                            <div>
                                <p className="text-[11px] text-gray-600 uppercase tracking-wide mb-1">
                                    Account
                                </p>
                                <p className="text-sm font-semibold text-gray-800">
                                    {account || "-"}
                                </p>
                            </div>

                            {/* Date */}
                            <div>
                                <p className="text-[11px] text-gray-600 uppercase tracking-wide mb-1">
                                    Date
                                </p>
                                <p className="text-sm font-medium text-gray-800">
                                    {transaction.date ? formatDate(transaction.date) : "-"}
                                </p>
                            </div>

                            {/* Value Date */}
                            <div>
                                <p className="text-[11px] text-gray-600 uppercase tracking-wide mb-1">
                                    Value Date
                                </p>
                                <p className="text-sm font-medium text-gray-800">
                                    {transaction.valueDate
                                        ? formatDate(transaction.valueDate)
                                        : "-"}
                                </p>
                            </div>

                            {/* Narration */}
                            <div className="col-span-2 md:col-span-4 lg:col-span-1">
                                <p className="text-[11px] text-gray-600 uppercase tracking-wide mb-1">
                                    Narration
                                </p>
                                <div
                                    className="text-sm font-medium text-gray-700 truncate"
                                    title={transaction.narration || "-"}
                                >
                                    {transaction.narration || "-"}
                                </div>
                            </div>

                            {/* Withdrawal */}
                            <div>
                                <p className="text-[11px] text-gray-600 uppercase tracking-wide mb-1">
                                    Withdrawal
                                </p>
                                <p className="text-sm font-semibold text-red-600">
                                    ₹ {Number(transaction.withdrawal || 0).toLocaleString("en-IN")}
                                </p>
                            </div>

                            {/* Deposit */}
                            <div>
                                <p className="text-[11px] text-gray-600 uppercase tracking-wide mb-1">
                                    Deposit
                                </p>
                                <p className="text-sm font-semibold text-green-600">
                                    ₹ {Number(transaction.deposit || 0).toLocaleString("en-IN")}
                                </p>
                            </div>
                            {transaction?.assignee && (
                                <div>
                                    <p className="text-[11px] text-gray-600 uppercase tracking-wide mb-1">
                                        Assignee
                                    </p>
                                    <p className="text-sm font-semibold text-gray-800">
                                        {transaction.assignee}
                                    </p>
                                </div>
                            )}

                            {transaction?.reviewer && (
                                <div>
                                    <p className="text-[11px] text-gray-600 uppercase tracking-wide mb-1">
                                        Reviewer
                                    </p>
                                    <p className="text-sm font-semibold text-gray-800">
                                        {transaction.reviewer}
                                    </p>
                                </div>
                            )}

                            {transaction?.auditor && (
                                <div>
                                    <p className="text-[11px] text-gray-600 uppercase tracking-wide mb-1">
                                        Auditor
                                    </p>
                                    <p className="text-sm font-semibold text-gray-800">
                                        {transaction.auditor}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* ================= EDIT SECTION ================= */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-800">
                            Update Information
                        </h2>

                        <p className="text-sm text-gray-500 mt-1">
                            Only the fields below can be modified.
                        </p>
                    </div>

                    <div className="p-6">
                        <div className="grid md:grid-cols-4 gap-5">
                            {/* Chq / Ref No */}
                            <Controller
                                name="propertyId"
                                control={control}
                                // rules={{
                                //     required: "Property is required",
                                // }}
                                render={({ field }) => (
                                    <div className={`select-group ${field.value ? "has-value" : ""}`}>
                                        <label
                                            className={`select-label form-label ${!expensecode ? "required-label" : ""
                                                }`}
                                        >
                                            Property Code
                                        </label>

                                        <AsyncPaginate
                                            additional={{ page: 1 }}
                                            debounceTimeout={500}
                                            isDisabled={!!expensecode}
                                            className={expensecode ? "cursor-not-allowed" : ""}
                                            isClearable
                                            placeholder=""
                                            loadOptions={loadPropertyOptions}
                                            styles={selectStyles}
                                            value={selectedProperty}
                                            onChange={(selected) => {
                                                setSelectedProperty(selected);
                                                field.onChange(selected?.value || "");
                                            }}
                                        />

                                        {errors.propertyId && (
                                            <p className="text-red-500 text-sm mt-1">
                                                {errors.propertyId.message}
                                            </p>
                                        )}
                                    </div>
                                )}
                            />

                            {/* Source */}
                            <Controller
                                name="expensecode"
                                control={control}
                                render={({ field }) => (
                                    <div
                                        className={`select-group ${field.value ? "has-value" : ""
                                            }`}
                                    >
                                        <label
                                            className={`select-label form-label ${!propertyId ? "required-label" : ""
                                                }`}
                                        >
                                            Expense Code
                                        </label>

                                        <Select
                                            options={expensecodeOptions}
                                            placeholder=""
                                            isDisabled={!!propertyId}
                                            className={propertyId ? "cursor-not-allowed" : ""}
                                            isClearable
                                            value={
                                                expensecodeOptions.find(
                                                    (x) => x.id === field.value
                                                ) || null
                                            }
                                            onChange={(selected) => {
                                                field.onChange(selected?.id || "");
                                            }}
                                            styles={selectStyles}
                                        />

                                        {errors.expensecode && (
                                            <p className="text-red-500 text-sm mt-1">
                                                {errors.expensecode.message}
                                            </p>
                                        )}
                                    </div>
                                )}
                            />

                            <Controller
                                name="expenseCategory"
                                control={control}
                                rules={{
                                    required: "Expense Category is required",
                                }}
                                render={({ field }) => (
                                    <div className={`select-group ${field.value ? "has-value" : ""}`}>
                                        <label className="select-label form-label required-label">Expense Category</label>
                                        <Select
                                            {...field}
                                            options={expensecategoryOptions}
                                            placeholder=""
                                            isClearable
                                            value={expensecategoryOptions.find(
                                                (x) => x.value === field.value
                                            )}
                                            onChange={(e) => field.onChange(e?.value)}
                                            styles={selectStyles}
                                        />
                                        {errors.expenseCategory && (
                                            <p className="text-red-500 text-sm mt-1">
                                                {errors.expenseCategory.message}
                                            </p>
                                        )}
                                    </div>
                                )}
                            />

                            <Controller
                                name="status"
                                control={control}
                                rules={{
                                    required: "Status is required",
                                }}
                                render={({ field }) => (
                                    <div className={`select-group ${field.value ? "has-value" : ""}`}>
                                        <label className="select-label form-label required-label">Status</label>
                                        <Select
                                            {...field}
                                            options={statusOptions}
                                            placeholder=""
                                            isClearable
                                            value={statusOptions.find(
                                                (x) => x.value === field.value
                                            )}
                                            onChange={(e) => field.onChange(e?.value)}
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

                            <div className="form-group ">
                                <input
                                    {...register("comment")}
                                    placeholder=" "
                                    className="form-input"
                                />
                                <label className="form-label">
                                    Commnet
                                </label>
                            </div>
                        </div>
                        {/* ================= WORK LOG ================= */}
                        {transaction?.workLogs?.length > 0 && (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 mt-2">
                                <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                                    <div>
                                        <h2 className="text-lg font-semibold text-gray-800">
                                            Activity & Work Log
                                        </h2>

                                        <p className="text-sm text-gray-500 mt-1">
                                            Transaction update history
                                        </p>
                                    </div>

                                    <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 border border-gray-200">
                                        {transaction.workLogs.length} Logs
                                    </span>
                                </div>

                                <div className="p-6 mt">
                                    <div className="space-y-4 max-h-50 overflow-y-auto">
                                        {[...transaction.workLogs]
                                            .reverse()
                                            .map((log, index) => (
                                                <div
                                                    key={index}
                                                    className="relative pl-6 pb-4 border-b border-gray-100 last:border-0 last:pb-0"
                                                >
                                                    {/* Timeline Dot */}
                                                    <span className="absolute left-0 top-1.5 w-2.5 h-2.5 rounded-full bg-gray-400" />
                                                                                                        <div className="flex flex-wrap items-center gap-2 mt-2 text-xs text-gray-500">
                                                        <span className="font-medium text-gray-700">
                                                            {log.createdBy || "System"}
                                                        </span>

                                                        <span>•</span>

                                                        <span>
                                                            {log.createdAt
                                                                ? new Date(log.createdAt).toLocaleString(
                                                                    "en-IN",
                                                                    {
                                                                        day: "2-digit",
                                                                        month: "short",
                                                                        year: "numeric",
                                                                        hour: "2-digit",
                                                                        minute: "2-digit",
                                                                        hour12: true,
                                                                    }
                                                                )
                                                                : "-"}
                                                        </span>
                                                    </div>
                                                    {/* Log Message */}
                                                    <div className="text-sm  whitespace-pre-line">
                                                        {log.message}
                                                    </div>

                                                    {/* User + Date */}

                                                </div>
                                            ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* ================= FOOTER ================= */}
                <div className="flex justify-end gap-3 pb-5">
                    <Link to="/bank-transactions">
                        <button
                            type="button"
                            className="border border-gray-300 rounded-lg px-5 py-2 hover:bg-gray-100"
                        >
                            Cancel
                        </button>
                    </Link>

                    <button
                        type="submit"
                        disabled={updateLoading}
                        className="theme-btn text-white px-6 py-2 rounded-lg flex items-center gap-2 disabled:opacity-60"
                    >
                        {updateLoading ? (
                            <>
                                <Loader />
                                Processing...
                            </>
                        ) : (
                            "Update Transaction"
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default BankTransactionEdit;
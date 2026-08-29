import React, { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { Upload, FileSpreadsheet, X, Save } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Loader from "../common/Loader";
import { useUploadBankStatement } from "./services";

const accountOptions = [
    { value: "AC1", label: "50200044250311 ( 134361925 )", shortLabel: "ACCOUNT 1" },
    { value: "AC2", label: "50100075531712 ( 59015151 )", shortLabel: "ACCOUNT 2" },
    { value: "AC3", label: "50100257405641 ( 59015151 )", shortLabel: "ACCOUNT 3" },
    { value: "AC4", label: "50200057898920 ( 134361925 )", shortLabel: "ACCOUNT 4" },
    { value: "AC5", label: "50200072487017 ( 210610628 )", shortLabel: "ACCOUNT 5" },
];

const BankStatementUpload = () => {
    const navigate = useNavigate();
    const fileInputRef = useRef(null);
    const [selectedAccount, setSelectedAccount] = useState("AC1");
    const [selectedFile, setSelectedFile] = useState(null);
    const [uploadResult, setUploadResult] = useState(null);
    const { mutate: uploadBankStatement, isPending: uploadLoading } =
        useUploadBankStatement();

    const {
        handleSubmit,
        setValue,
        formState: { errors },
    } = useForm({
        defaultValues: {
            account: "AC1",
        },
    });

    const handleAccountChange = (account) => {
        setSelectedAccount(account);
        setValue("account", account);
        setSelectedFile(null);

        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];

        if (!file) return;

        const allowedExtensions = [".csv", ".xls", ".xlsx"];
        const extension = file.name
            .substring(file.name.lastIndexOf("."))
            .toLowerCase();

        if (!allowedExtensions.includes(extension)) {
            toast.error("Only CSV and Excel files are allowed");
            e.target.value = "";
            return;
        }

        setSelectedFile(file);
    };

    const removeFile = () => {
        setSelectedFile(null);

        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const onSubmit = () => {
        if (!selectedAccount) {
            toast.error("Please select an account");
            return;
        }

        if (!selectedFile) {
            toast.error("Please select a CSV or Excel file");
            return;
        }

        uploadBankStatement(
            {
                file: selectedFile,
                account: selectedAccount,
            },
            {
                onSuccess: (res) => {
                    toast.dismiss();

                    const summary = res?.summary || {};
                    const details = res?.details || {};

                    // Upload result save करा
                    setUploadResult({
                        summary,
                        details,
                    });

                    if (summary.duplicates > 0) {
                        toast.warning(
                            `Upload completed: ${summary.imported} imported, ${summary.duplicates} duplicate, ${summary.failed} failed`
                        );
                    } else if (summary.failed > 0) {
                        toast.warning(
                            `Upload completed: ${summary.imported} imported, ${summary.failed} failed`
                        );
                    } else {
                        toast.success(
                            `Bank statement uploaded successfully. ${summary.imported || 0} transactions imported.`
                        );
                    }

                    setSelectedFile(null);

                    if (fileInputRef.current) {
                        fileInputRef.current.value = "";
                    }
                },

                onError: (err) => {
                    toast.dismiss();

                    toast.error(
                        err?.response?.data?.message ||
                        "Bank statement upload failed"
                    );
                },
            }
        );
    };

    // const onSubmit = () => {
    //     if (!selectedAccount) {
    //         toast.error("Please select an account");
    //         return;
    //     }

    //     if (!selectedFile) {
    //         toast.error("Please select a CSV or Excel file");
    //         return;
    //     }

    //     uploadBankStatement(
    //         {
    //             file: selectedFile,
    //             account: selectedAccount,
    //         },
    //         {
    //             onSuccess: (res) => {
    //                 toast.dismiss();
    //                 toast.success(
    //                     res?.message || "Bank statement uploaded successfully"
    //                 );

    //                 setSelectedFile(null);

    //                 if (fileInputRef.current) {
    //                     fileInputRef.current.value = "";
    //                 }

    //                 // navigate("/bank");
    //             },
    //             onError: (err) => {
    //                 toast.dismiss();
    //                 toast.error(
    //                     err?.response?.data?.message ||
    //                     "Bank statement upload failed"
    //                 );
    //             },
    //         }
    //     );
    // };
    const activeAccount = accountOptions.find(
        (item) => item.value === selectedAccount
    );

    return (
        <div className="space-y-5">
            <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
                {/* Header */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-400 px-3 py-2">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-bold">
                                Upload Bank Statement
                            </h1>

                            <p className="text-sm text-gray-500">
                                Upload CSV or Excel bank statement
                            </p>
                        </div>

                        <div className="flex gap-3">
                            <Link to="/bank-transactions">
                                <button
                                    type="button"
                                    className="border rounded-lg px-5 py-2 hover:bg-gray-100 flex items-center gap-2"
                                >

                                    Cancel
                                </button>
                            </Link>

                            <button
                                type="submit"
                                disabled={uploadLoading || !selectedFile}
                                className="theme-btn text-white px-6 py-2 rounded-lg flex items-center gap-2 disabled:opacity-50"
                            >
                                {uploadLoading ? (
                                    <div className="flex justify-center items-center gap-2">
                                        <Loader />
                                        Uploading...
                                    </div>
                                ) : (
                                    <>
                                        <Upload size={18} />
                                        Upload Statement
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Account Tabs */}
                <div className="bg-white rounded-xl shadow-sm border">
                    <div className="border-b px-6 py-4">
                        <h2 className="text-lg font-semibold">
                            Select Bank Account
                        </h2>

                        <p className="text-sm text-gray-500 mt-1">
                            Select the account for which you want to upload the statement
                        </p>
                    </div>

                    <div className="p-4">
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                            {accountOptions.map((account) => {
                                const active = selectedAccount === account.value;

                                return (
                                    <button
                                        key={account.value}
                                        type="button"
                                        onClick={() => handleAccountChange(account.value)}
                                        className={`rounded-lg border px-4 py-3 text-center transition ${active
                                            ? "theme-btn text-white border-transparent"
                                            : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                                            }`}
                                    >
                                        <div className="font-semibold">
                                            {account.shortLabel}
                                        </div>

                                        <div
                                            className={`text-xs mt-1 ${active ? "text-white/80" : "text-gray-500"
                                                }`}
                                        >
                                            {account.label}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>

                        {errors.account && (
                            <p className="text-red-500 text-sm mt-2">
                                {errors.account.message}
                            </p>
                        )}
                    </div>
                </div>

                {/* Upload Section */}
                <div className="bg-white rounded-xl shadow-sm">
                    <div className="border-b px-6 py-4">
                        <h2 className="text-lg font-semibold">
                            {activeAccount?.shortLabel} Statement
                        </h2>

                        <p className="text-sm text-gray-500 mt-1">
                            Upload the bank statement for {activeAccount?.label}
                        </p>
                    </div>

                    <div className="p-6">
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".csv,.xls,.xlsx"
                            onChange={handleFileChange}
                            className="hidden"
                            id="bankStatementFile"
                        />

                        {!selectedFile ? (
                            <label
                                htmlFor="bankStatementFile"
                                className="border-2 border-dashed border-gray-300 rounded-xl p-10 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition"
                            >
                                <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                                    <FileSpreadsheet size={28} />
                                </div>

                                <h3 className="font-semibold text-gray-700">
                                    Upload Bank Statement
                                </h3>

                                <p className="text-sm text-gray-500 mt-2">
                                    Click to choose CSV or Excel file
                                </p>

                                <p className="text-xs text-gray-400 mt-1">
                                    Supported formats: .csv, .xls, .xlsx
                                </p>
                            </label>
                        ) : (
                            <div className="border rounded-xl p-4 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-11 h-11 rounded-lg bg-gray-100 flex items-center justify-center">
                                        <FileSpreadsheet size={22} />
                                    </div>

                                    <div>
                                        <p className="font-medium text-gray-700">
                                            {selectedFile.name}
                                        </p>

                                        <p className="text-xs text-gray-500">
                                            {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                                        </p>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={removeFile}
                                    className="p-2 rounded-lg hover:bg-gray-100 text-gray-500"
                                >
                                    <X size={18} />
                                </button>
                            </div>
                        )}
                    </div>
                    {uploadResult && (
                        <div className="mt-5 border rounded-xl bg-white p-5">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">
                                Upload Result
                            </h3>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                <div className="border rounded-lg p-3">
                                    <p className="text-xs text-gray-500">Total Rows</p>
                                    <p className="text-xl font-bold">
                                        {uploadResult.summary?.totalRows || 0}
                                    </p>
                                </div>

                                <div className="border rounded-lg p-3">
                                    <p className="text-xs text-gray-500">Imported</p>
                                    <p className="text-xl font-bold text-green-600">
                                        {uploadResult.summary?.imported || 0}
                                    </p>
                                </div>

                                <div className="border rounded-lg p-3">
                                    <p className="text-xs text-gray-500">Duplicates</p>
                                    <p className="text-xl font-bold text-orange-600">
                                        {uploadResult.summary?.duplicates || 0}
                                    </p>
                                </div>

                                <div className="border rounded-lg p-3">
                                    <p className="text-xs text-gray-500">Failed</p>
                                    <p className="text-xl font-bold text-red-600">
                                        {uploadResult.summary?.failed || 0}
                                    </p>
                                </div>
                            </div>

                            {uploadResult.details?.duplicateRows?.length > 0 && (
                                <div className="mt-4">
                                    <p className="font-semibold text-orange-600">
                                        Duplicate Rows
                                    </p>

                                    {uploadResult?.details?.duplicateRows?.length > 0 && (
                                        <div className="mt-5 border border-orange-200 rounded-xl overflow-hidden bg-white">
                                            {/* Header */}
                                            <div className="px-4 py-3 bg-orange-50 border-b border-orange-200">
                                                <div className="flex justify-between items-center">
                                                    <div>
                                                        <h3 className="font-semibold text-orange-700">
                                                            Duplicate Transactions
                                                        </h3>

                                                        <p className="text-sm text-gray-600 mt-1">
                                                            These transactions already exist in the selected
                                                            account and were skipped.
                                                        </p>
                                                    </div>

                                                    <span className="px-3 py-1 rounded-full bg-orange-100 text-orange-700 text-sm font-semibold">
                                                        {uploadResult.details.duplicateRows.length} Duplicates
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Table */}
                                            <div className="overflow-x-auto">
                                                <table className="w-full text-sm">
                                                    <thead className="bg-gray-50 border-b">
                                                        <tr>
                                                            <th className="px-4 py-3 text-left font-semibold text-gray-600">
                                                                Row
                                                            </th>

                                                            <th className="px-4 py-3 text-left font-semibold text-gray-600">
                                                                Date
                                                            </th>

                                                            <th className="px-4 py-3 text-left font-semibold text-gray-600">
                                                                Value Date
                                                            </th>

                                                            <th className="px-4 py-3 text-left font-semibold text-gray-600">
                                                                Narration
                                                            </th>

                                                            <th className="px-4 py-3 text-left font-semibold text-gray-600">
                                                                Reason
                                                            </th>

                                                            <th className="px-4 py-3 text-left font-semibold text-gray-600">
                                                                Transaction ID
                                                            </th>
                                                        </tr>
                                                    </thead>

                                                    <tbody className="divide-y">
                                                        {uploadResult.details.duplicateRows.map(
                                                            (item, index) => (
                                                                <tr
                                                                    key={`${item.row}-${item.matchedTransactionId || index}`}
                                                                    className="hover:bg-gray-50"
                                                                >
                                                                    {/* Row */}
                                                                    <td className="px-4 py-3 font-medium text-gray-700">
                                                                        {item.row}
                                                                    </td>

                                                                    {/* Date */}
                                                                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                                                                        {item.date
                                                                            ? new Date(
                                                                                item.date
                                                                            ).toLocaleDateString("en-GB", {
                                                                                day: "2-digit",
                                                                                month: "short",
                                                                                year: "numeric",
                                                                            })
                                                                            : "-"}
                                                                    </td>

                                                                    {/* Value Date */}
                                                                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                                                                        {item.valueDate
                                                                            ? new Date(
                                                                                item.valueDate
                                                                            ).toLocaleDateString("en-GB", {
                                                                                day: "2-digit",
                                                                                month: "short",
                                                                                year: "numeric",
                                                                            })
                                                                            : "-"}
                                                                    </td>

                                                                    {/* Narration */}
                                                                    <td
                                                                        className="px-4 py-3 text-gray-700 max-w-[400px]"
                                                                        title={item.narration}
                                                                    >
                                                                        <div className="truncate">
                                                                            {item.narration || "-"}
                                                                        </div>
                                                                    </td>

                                                                    {/* Reason */}
                                                                    <td className="px-4 py-3">
                                                                        <span className="inline-flex px-2.5 py-1 rounded-full bg-orange-100 text-orange-700 text-xs font-medium">
                                                                            {item.reason || "Duplicate"}
                                                                        </span>
                                                                    </td>

                                                                    {/* Transaction ID */}
                                                                    <td className="px-4 py-3 text-xs text-gray-500 font-mono whitespace-nowrap">
                                                                        {item.matchedTransactionId || "-"}
                                                                    </td>
                                                                </tr>
                                                            )
                                                        )}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {uploadResult.details?.failedRows?.length > 0 && (
                                <div className="mt-3">
                                    <p className="font-semibold text-red-600">
                                        Failed Rows
                                    </p>

                                    <p className="text-sm text-gray-600 mt-1">
                                        Row numbers:{" "}
                                        {uploadResult.details.failedRows.join(", ")}
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="rounded-xl px-6 py-4 flex justify-end gap-3">
                    <Link to="/bank-transactions">
                        <button
                            type="button"
                            className="border rounded-lg px-5 py-2 hover:bg-gray-100"
                        >
                            Cancel
                        </button>
                    </Link>

                    <button
                        type="submit"
                        disabled={uploadLoading || !selectedFile}
                        className="theme-btn text-white px-6 py-2 rounded-lg flex items-center gap-2 disabled:opacity-50"
                    >
                        {uploadLoading ? (
                            <div className="flex justify-center items-center gap-2">
                                <Loader />
                                Uploading...
                            </div>
                        ) : (
                            <>
                                <Upload size={18} />
                                Upload Statement
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default BankStatementUpload;
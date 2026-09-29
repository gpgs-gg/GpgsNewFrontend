
import React from "react";
import {
    X,
    CheckCircle2,
    AlertTriangle,
    Clock3,
    RefreshCw,
    Eye,
} from "lucide-react";

const RentGenerationLogPopup = ({
    logs = [],
    isLoading = false,
    isError = false,
    onClose,
}) => {
    const [selectedFailedLog, setSelectedFailedLog] = React.useState(null);
   console.log(111111111, selectedFailedLog)

    const formatDateTime = (date) => {
        if (!date) return "N/A";

        return new Date(date).toLocaleString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
        });
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case "Completed":
                return {
                    bg: "bg-green-50",
                    text: "text-green-700",
                    border: "border-green-200",
                    icon: <CheckCircle2 size={14} />,
                };

            case "Completed With Errors":
                return {
                    bg: "bg-yellow-50",
                    text: "text-yellow-700",
                    border: "border-yellow-200",
                    icon: <AlertTriangle size={14} />,
                };

            case "Running":
                return {
                    bg: "bg-blue-50",
                    text: "text-blue-700",
                    border: "border-blue-200",
                    icon: <Clock3 size={14} />,
                };

            default:
                return {
                    bg: "bg-red-50",
                    text: "text-red-700",
                    border: "border-red-200",
                    icon: <AlertTriangle size={14} />,
                };
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onMouseDown={(e) => {
                if (e.target === e.currentTarget) {
                    onClose();
                }
            }}
        >
            <div className="flex max-h-[90vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
                {/* ================= HEADER ================= */}
                <div className="flex items-center justify-between border-b bg-white px-6 py-4">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900">
                            Rent Generation Logs
                        </h2>

                        <p className="mt-1 text-sm text-gray-500">
                            Monthly rent generation history
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-800"
                        aria-label="Close"
                    >
                        <X size={21} />
                    </button>
                </div>

                {/* ================= BODY ================= */}
                <div className="flex-1 overflow-y-auto p-6">
                    {/* Loading */}
                    {isLoading && (
                        <div className="flex min-h-60 items-center justify-center">
                            <div className="flex flex-col items-center gap-3">
                                <RefreshCw
                                    size={28}
                                    className="animate-spin text-gray-500"
                                />

                                <p className="text-sm text-gray-500">
                                    Loading rent generation logs...
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Error */}
                    {!isLoading && isError && (
                        <div className="flex min-h-60 items-center justify-center">
                            <div className="rounded-xl border border-red-200 bg-red-50 px-6 py-5 text-center">
                                <AlertTriangle
                                    size={28}
                                    className="mx-auto text-red-600"
                                />

                                <p className="mt-2 text-sm font-semibold text-red-700">
                                    Failed to load rent generation logs
                                </p>

                                <p className="mt-1 text-xs text-red-600">
                                    Please try again later.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Empty */}
                    {!isLoading && !isError && logs.length === 0 && (
                        <div className="flex min-h-60 items-center justify-center">
                            <div className="text-center">
                                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                                    <Clock3 size={22} className="text-gray-500" />
                                </div>

                                <p className="mt-3 text-sm font-semibold text-gray-800">
                                    No Rent Generation Logs
                                </p>

                                <p className="mt-1 text-xs text-gray-500">
                                    No rent generation history is available.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* ================= TABLE ================= */}
                    {!isLoading && !isError && logs.length > 0 && (
                        <div className="overflow-hidden rounded-xl border border-gray-200">
                            <div className="flex items-center justify-between border-b bg-gray-50 px-5 py-3">
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-800">
                                        Generation History
                                    </h3>
                                </div>

                                <span className="rounded-full bg-gray-200 px-3 py-1 text-xs font-medium text-gray-700">
                                    Total record
                                    {logs.length !== 1 ? "s" : ""}{"  "}
                                    {logs.length}
                                </span>
                            </div>

                            <div className="max-h-[60vh] overflow-auto">
                                <table className="w-full min-w-[950px] text-sm">
                                    <thead className="sticky top-0 z-10 bg-white">
                                        <tr className="border-b border-gray-200">
                                            <th className="whitespace-nowrap px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                #
                                            </th>

                                            <th className="whitespace-nowrap px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                Month
                                            </th>

                                            <th className="whitespace-nowrap px-5 py-3 text-center text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                Eligible
                                            </th>

                                            <th className="whitespace-nowrap px-5 py-3 text-center text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                Already Generated
                                            </th>

                                            <th className="whitespace-nowrap px-5 py-3 text-center text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                Generated
                                            </th>

                                            <th className="whitespace-nowrap px-5 py-3 text-center text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                Failed
                                            </th>

                                            <th className="whitespace-nowrap px-5 py-3 text-center text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                Status
                                            </th>

                                            <th className="whitespace-nowrap px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                Started At
                                            </th>

                                            <th className="whitespace-nowrap px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                Completed At
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {logs.map((log, index) => {
                                            const statusStyle = getStatusStyle(log.status);

                                            return (
                                                <tr
                                                    key={log._id || index}
                                                    className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50"
                                                >
                                                    {/* # */}
                                                    <td className="px-5 py-4 text-gray-500">
                                                        {index + 1}
                                                    </td>

                                                    {/* Month */}
                                                    <td className="px-5 py-4 whitespace-nowrap">
                                                        <div className="font-medium text-gray-900">
                                                            {log.monthName || "N/A"}{" "}
                                                            {log.year || ""}
                                                        </div>

                                                        {/* <div className="mt-0.5 text-xs text-gray-400">
                              Month {log.month || "N/A"}
                            </div> */}
                                                    </td>

                                                    {/* Eligible */}
                                                    <td className="px-5 py-4 text-center">
                                                        <span className="font-semibold text-gray-800">
                                                            {log.eligibleClientCount || 0}
                                                        </span>
                                                    </td>

                                                    {/* Already Generated */}
                                                    <td className="px-5 py-4 text-center">
                                                        <span className="font-semibold text-gray-700">
                                                            {log.alreadyGeneratedCount || 0}
                                                        </span>
                                                    </td>

                                                    {/* Generated */}
                                                    <td className="px-5 py-4 text-center">
                                                        <span className="inline-flex min-w-10 items-center justify-center rounded-full bg-green-50 px-2.5 py-1 font-semibold text-green-700">
                                                            {log.generatedCount || 0}
                                                        </span>
                                                    </td>

                                                    {/* Failed */}
                                                    <td className="px-5 py-4 text-center">
                                                        {Number(log.failedCount || 0) > 0 ? (
                                                            <button
                                                                type="button"
                                                                onClick={() => setSelectedFailedLog(log)}
                                                                className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1.5 font-semibold text-red-700 transition hover:bg-red-100"
                                                            >
                                                                <AlertTriangle size={14} />
                                                                {log.failedCount}
                                                                <Eye size={14} />
                                                            </button>
                                                        ) : (
                                                            <span className="inline-flex min-w-10 items-center justify-center rounded-full bg-gray-100 px-2.5 py-1 font-semibold text-gray-600">
                                                                0
                                                            </span>
                                                        )}
                                                    </td>

                                                    {/* Status */}
                                                    <td className="px-5 py-4 text-center">
                                                        <span
                                                            className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-medium ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}
                                                        >
                                                            {statusStyle.icon}
                                                            {log.status || "N/A"}
                                                        </span>
                                                    </td>

                                                    {/* Started */}
                                                    <td className="whitespace-nowrap px-5 py-4 text-gray-600">
                                                        {formatDateTime(log.startedAt)}
                                                    </td>

                                                    {/* Completed */}
                                                    <td className="whitespace-nowrap px-5 py-4 text-gray-600">
                                                        {formatDateTime(log.completedAt)}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* ================= FAILED CLIENT DETAILS ================= */}
                    {!isLoading &&
                        !isError &&
                        logs.some(
                            (log) =>
                                Array.isArray(log.failedClients) &&
                                log.failedClients.length > 0
                        ) && (
                            <div className="mt-6 overflow-hidden rounded-xl border border-red-200">
                                <div className="border-b border-red-100 bg-red-50 px-5 py-3">
                                    <h3 className="text-sm font-semibold text-red-800">
                                        Failed Client Details
                                    </h3>

                                    <p className="mt-0.5 text-xs text-red-600">
                                        Clients for which rent generation failed
                                    </p>
                                </div>

                                <div className="max-h-72 overflow-auto">
                                    <table className="w-full min-w-[700px] text-sm">
                                        <thead className="sticky top-0 z-10 bg-white">
                                            <tr className="border-b border-gray-200">
                                                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                    #
                                                </th>

                                                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                    Month
                                                </th>

                                                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                    Client Name
                                                </th>

                                                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                    Client ID
                                                </th>

                                                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                    Reason
                                                </th>
                                            </tr>
                                        </thead>

                                        <tbody>
                                            {logs.flatMap((log) =>
                                                (log.failedClients || []).map(
                                                    (client, index) => (
                                                        <tr
                                                            key={`${log._id}-${client.clientId}-${index}`}
                                                            className="border-b border-gray-100 last:border-b-0 hover:bg-red-50/30"
                                                        >
                                                            <td className="px-5 py-3 text-gray-500">
                                                                {index + 1}
                                                            </td>

                                                            <td className="whitespace-nowrap px-5 py-3 font-medium text-gray-700">
                                                                {log.monthName} {log.year}
                                                            </td>

                                                            <td className="px-5 py-3 font-medium text-gray-800">
                                                                {client.fullName || "N/A"}
                                                            </td>

                                                            <td className="max-w-48 px-5 py-3">
                                                                <div className="truncate font-mono text-xs text-gray-600">
                                                                    {client.clientId || "N/A"}
                                                                </div>
                                                            </td>

                                                            <td className="max-w-100 px-5 py-3 text-red-600">
                                                                <div className="break-words">
                                                                    {client.reason || "Unknown error"}
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    )
                                                )
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                </div>

                {/* ================= FOOTER ================= */}
                <div className="flex items-center justify-between border-t bg-gray-50 px-6 py-4">
                    <p className="text-xs text-gray-500">
                        Rent generation logs are maintained month-wise.
                    </p>

                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg bg-gray-800 px-5 py-2 text-sm font-medium text-white transition hover:bg-gray-900 hover:bg-gray-900"
                    >
                        Close
                    </button>
                </div>
            </div>

            {selectedFailedLog && (
                <div
                    className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4"
                    onMouseDown={(e) => {
                        if (e.target === e.currentTarget) {
                            setSelectedFailedLog(null);
                        }
                    }}
                >
                    <div className="flex max-h-[80vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">

                        {/* Header */}
                        <div className="flex items-center justify-between border-b px-6 py-4">
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900">
                                    Failed Rent Generation
                                </h2>

                                <p className="mt-1 text-sm text-gray-500">
                                    {selectedFailedLog.monthName}{" "}
                                    {selectedFailedLog.year}
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() => setSelectedFailedLog(null)}
                                className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-800"
                            >
                                <X size={21} />
                            </button>
                        </div>

                        {/* Summary */}
                        <div className="border-b bg-gray-50 px-6 py-4">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
                                    <AlertTriangle
                                        size={20}
                                        className="text-red-600"
                                    />
                                </div>

                                <div>
                                    <p className="text-sm font-semibold text-gray-800">
                                        {selectedFailedLog.failedCount || 0} Failed Client
                                        {Number(selectedFailedLog.failedCount || 0) !== 1
                                            ? "s"
                                            : ""}
                                    </p>

                                    <p className="text-xs text-gray-500">
                                        Rent generation failed for the following clients
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Failed Clients Table */}
                        <div className="flex-1 overflow-auto p-6">
                            {selectedFailedLog.failedClients?.length > 0 ? (
                                <div className="overflow-hidden rounded-xl border border-gray-200">
                                    <table className="w-full min-w-[750px] text-sm">
                                        <thead className="bg-gray-50">
                                            <tr className="border-b border-gray-200">
                                                <th className="whitespace-nowrap px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                    #
                                                </th>

                                                <th className="whitespace-nowrap px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                    Client Name
                                                </th>

                                                <th className="whitespace-nowrap px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                    Client ID
                                                </th>

                                                <th className="whitespace-nowrap px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                    Reason
                                                </th>
                                            </tr>
                                        </thead>

                                        <tbody>
                                            {selectedFailedLog.failedClients.map(
                                                (client, index) => (
                                                    <tr
                                                        key={
                                                            client.clientId ||
                                                            index
                                                        }
                                                        className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50"
                                                    >
                                                        {/* # */}
                                                        <td className="px-5 py-4 text-gray-500">
                                                            {index + 1}
                                                        </td>

                                                        {/* Client Name */}
                                                        <td className="whitespace-nowrap px-5 py-4">
                                                            <span className="font-medium text-gray-900">
                                                                {client.fullName ||
                                                                    "N/A"}
                                                            </span>
                                                        </td>

                                                        {/* Client ID */}
                                                        <td className="px-5 py-4">
                                                            <span className="font-mono text-xs text-gray-600">
                                                                {client.clientId ||
                                                                    "N/A"}
                                                            </span>
                                                        </td>

                                                        {/* Reason */}
                                                        <td className="px-5 py-4">
                                                            <div className="max-w-xl break-words text-sm text-red-600">
                                                                {client.reason ||
                                                                    "Unknown error"}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="flex min-h-40 items-center justify-center">
                                    <div className="text-center">
                                        <p className="text-sm font-medium text-gray-700">
                                            No failed client details available
                                        </p>

                                        <p className="mt-1 text-xs text-gray-500">
                                            Failed count exists, but client details were
                                            not saved.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="flex justify-end border-t bg-gray-50 px-6 py-4">
                            <button
                                type="button"
                                onClick={() => setSelectedFailedLog(null)}
                                className="rounded-lg bg-gray-800 px-5 py-2 text-sm font-medium text-white transition hover:bg-gray-900"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}


        </div>
    );
};

export default RentGenerationLogPopup;


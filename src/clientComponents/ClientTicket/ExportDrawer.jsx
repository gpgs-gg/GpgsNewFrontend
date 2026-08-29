import React from "react";
import { X } from "lucide-react";

const ExportDrawer = ({
    isOpen,
    onClose,
    fullHeaders,
    selectedColumns,
    setSelectedColumns,
    selectedTickets,
    totalTickets,
    onExport,
}) => {

    const handleColumnSelect = (columnKey) => {
        setSelectedColumns((prev) => {
            const newSet = new Set(prev);

            if (newSet.has(columnKey)) {
                newSet.delete(columnKey);
            } else {
                newSet.add(columnKey);
            }

            return newSet;
        });
    };

    const handleSelectAllColumns = () => {
        if (selectedColumns.size === fullHeaders.length) {
            setSelectedColumns(new Set());
        } else {
            setSelectedColumns(
                new Set(fullHeaders.map((item) => item.key))
            );
        }
    };

    return (
        <>
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/40 z-40"
                    onClick={onClose}
                />
            )}

            <div
                className={`fixed top-0 right-0 h-full w-[420px] bg-white z-50 shadow-xl transition-transform duration-300 flex flex-col ${isOpen ? "translate-x-0" : "translate-x-full"
                    }`}
            >
                {/* Header */}
                <div className="flex justify-between items-center px-5 py-4 bg-gradient-to-r from-slate-800 via-slate-700 to-slate-900 text-white">
                    <div>
                        <h2 className="text-lg font-bold">
                            Export Tickets
                        </h2>

                        <p className="text-xs text-gray-200 mt-1">
                            Select the columns you want in the export.
                        </p>
                    </div>

                    <button
                        onClick={onClose}
                        className="hover:bg-white/10 rounded-md p-1"
                    >
                        <X size={22} />
                    </button>
                </div>

                {/* Summary */}
                <div className="border-b p-4 bg-gray-50">

                    <div className="grid grid-cols-2 gap-3">

                        <div className="rounded-lg border bg-white p-3">
                            <p className="text-xs text-gray-500">
                                Tickets
                            </p>

                            <h3 className="text-xl font-bold">
                                {selectedTickets.size || totalTickets}
                            </h3>

                            <p className="text-xs text-gray-500">
                                {selectedTickets.size
                                    ? "Selected"
                                    : "All Tickets"}
                            </p>
                        </div>

                        <div className="rounded-lg border bg-white p-3">
                            <p className="text-xs text-gray-500">
                                Columns
                            </p>

                            <h3 className="text-xl font-bold">
                                {selectedColumns.size || fullHeaders.length}
                            </h3>

                            <p className="text-xs text-gray-500">
                                Selected
                            </p>
                        </div>

                    </div>

                </div>

                {/* Select All */}
                <div className="border-b p-4 ">

                    <label className="flex items-center gap-3 cursor-pointer font-medium">

                        <input
                            type="checkbox"
                            checked={
                                selectedColumns.size ===
                                fullHeaders.length
                            }
                            onChange={handleSelectAllColumns}
                            className="h-4 w-4 rounded-full accent-gray-500 "
                        />

                        Select All Columns

                    </label>

                </div>

                {/* Column List */}
              <div className="flex-1 overflow-auto p-4">

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1 min-w-max">

        {fullHeaders.map((header) => (

            <label
                key={header.key}
                className="flex items-center gap-1 rounded-lg px-1 py-2 hover:bg-orange-50 cursor-pointer transition min-w-max"
            >
                <input
                    type="checkbox"
                    checked={selectedColumns.has(header.key)}
                    onChange={() => handleColumnSelect(header.key)}
                    className="h-3 w-3 rounded-full accent-gray-500 shrink-0"
                />

                <span className="text-sm font-medium whitespace-nowrap">
                    {header.label}
                </span>
            </label>

        ))}

    </div>

</div>

                {/* Footer */}
                <div className="border-t p-4 bg-gray-50 flex gap-3">

                    <button
                        onClick={onClose}
                        className="flex-1 border border-gray-300 py-3 rounded-lg font-medium hover:bg-gray-100"
                    >
                        Cancel
                    </button>

                    <button
                        onClick={onExport}
                        className="flex-1 bg-gradient-to-r theme-btn text-white py-3 rounded-lg font-semibold hover:opacity-90"
                    >
                        Export CSV
                    </button>

                </div>
            </div>
        </>
    );
};

export default ExportDrawer;
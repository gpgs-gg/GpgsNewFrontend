import { useMemo, useState } from "react";
import { X, Search } from "lucide-react";
import { toast } from "react-toastify";
import {
    useCreatePropertySequenceData,
    usePropertySequencesData,
} from "./services";

const PropertySequenceModal = ({ isOpen, onClose }) => {
    const [propertyCodes, setPropertyCodes] = useState("");
    const [search, setSearch] = useState("");

    const { data: sequenceResponse, isLoading } =
        usePropertySequencesData(isOpen);

    const { mutate: createPropertySequence, isPending: sequenceLoading } =
        useCreatePropertySequenceData();

    const propertySequences = sequenceResponse?.data || [];

    // Filter property sequences based on property code
    const filteredSequences = useMemo(() => {
        if (!search.trim()) {
            return propertySequences;
        }

        return propertySequences.filter((item) =>
            item.propertyCode?.toLowerCase().includes(search.toLowerCase()),
        );
    }, [propertySequences, search]);

    const handleClose = () => {
        setPropertyCodes("");
        setSearch("");
        onClose();
    };

    const handleCreatePropertySequence = () => {
        if (!propertyCodes.trim()) {
             toast.dismiss()
            toast.error("Please enter property codes");
            return;
        }
        createPropertySequence(
            {
                propertyCodes: propertyCodes.trim(),
            },
            {
                onSuccess: (data) => {
                    toast.dismiss()
                    toast.success(
                        data?.message || "Property sequence created successfully",
                    );
                    setPropertyCodes("");
                    setSearch("");
                    onClose();
                    setPropertyCodes("");
                },

                onError: (error) => {
                    toast.dismiss()
                    toast.error(
                        error?.response?.data?.message ||
                        "Failed to create property sequence",
                    );
                },
            },
        );
    };

    if (!isOpen) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/50 p-3 sm:p-4">
            <div className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-xl bg-white shadow-xl">
                {/* Header */}
                <div className="flex shrink-0 items-center justify-between border-b px-4 py-3 sm:px-5 sm:py-4">
                    <div>
                        <h2 className="text-lg font-semibold">Property Sequence</h2>

                        <p className="mt-1 text-sm text-gray-500">
                            Manage property display sequence.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={handleClose}
                        className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-red-500"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Scrollable Body */}
                <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-5">
                    {/* Add Sequence */}
                    <div className="rounded-lg border border-gray-200 p-4">
                        <h3 className="text-sm font-semibold text-gray-700">
                            Add Property Sequence
                        </h3>

                        <p className="mt-1 text-xs text-gray-500">
                            Enter property codes in the order you want.
                        </p>

                        <textarea
                            value={propertyCodes}
                            onChange={(e) => setPropertyCodes(e.target.value)}
                            placeholder="Example: P1 P2 P3 P4 P5"
                            rows={3}
                            className="mt-3 w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-gray-500"
                        />

                        {/* {propertyCodes.trim() && (
              <div className="mt-3 flex max-h-32 flex-wrap gap-2 overflow-y-auto rounded-lg bg-gray-50 p-3">
                {[...new Set(propertyCodes.trim().split(/\s+/))].map(
                  (code, index) => (
                    <span
                      key={`${code}-${index}`}
                      className="rounded-full border bg-white px-3 py-1 text-sm"
                    >
                      {index + 1}. {code}
                    </span>
                  ),
                )}
              </div>
            )} */}

                        <div className="mt-3 flex justify-end">
                            <button
                                type="button"
                                onClick={handleCreatePropertySequence}
                                disabled={sequenceLoading || !propertyCodes.trim()}
                                className="theme-btn rounded-lg px-4 py-2 text-white disabled:opacity-50"
                            >
                                {sequenceLoading ? "Saving..." : "Save Sequence"}
                            </button>
                        </div>
                    </div>

                    {/* Existing Sequences */}
                    <div className="mt-5">
                        <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <h3 className="text-sm font-semibold text-gray-700">
                                    Existing Property Sequences
                                </h3>

                                <p className="text-xs text-gray-500">
                                    {propertySequences.length} property sequences
                                </p>
                            </div>

                            {/* Sequence Filter */}
                            <div className="relative w-full sm:w-64">
                                <Search
                                    size={16}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                                />

                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Search property code..."
                                    className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-3 text-sm outline-none focus:border-gray-500"
                                />
                            </div>
                        </div>

                        <div className="max-h-[350px] overflow-y-auto rounded-lg border">
                            {isLoading ? (
                                <div className="p-6 text-center text-sm text-gray-500">
                                    Loading property sequences...
                                </div>
                            ) : filteredSequences.length > 0 ? (
                                <div className="divide-y">
                                    {filteredSequences.map((item) => (
                                        <div
                                            key={item._id}
                                            className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-gray-50"
                                        >
                                            <div className="flex min-w-0 items-center gap-3">
                                                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-100 text-sm font-semibold">
                                                    {item.sequence}
                                                </span>

                                                <span className="truncate text-sm font-medium text-gray-700">
                                                    {item.propertyCode}
                                                </span>
                                            </div>

                                            <span className="shrink-0 text-xs text-gray-400">
                                                Sequence {item.sequence}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-6 text-center text-sm text-gray-500">
                                    No property sequences found.
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex shrink-0 justify-end border-t px-4 py-3 sm:px-5 sm:py-4">
                    <button
                        type="button"
                        onClick={handleClose}
                        className="rounded-lg border border-gray-300 px-4 py-2 hover:bg-gray-50"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PropertySequenceModal;
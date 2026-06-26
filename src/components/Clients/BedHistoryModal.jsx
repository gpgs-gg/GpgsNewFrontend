import React from "react";
import { X } from "lucide-react";
import { formatDate } from "../../utils/dateFormatter";

const BedHistoryModal = ({
  isOpen,
  onClose,
  client,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />

      <div className="relative bg-white rounded-xl w-full max-w-6xl shadow-2xl">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-2 border-b">
          <div>
            <h2 className="text-xl font-semibold">
              Bed History
            </h2>

            <p className="text-sm text-gray-500">
              {client?.fullName}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <X size={20} />
          </button>
        </div>

        {/* Table */}
        <div className="p-2 overflow-auto max-h-[50vh] scrollbar-none">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-3 text-left">
                  #
                </th>
                <th className="p-3 text-left">
                  Property
                </th>
                <th className="p-3 text-left">
                  Bed
                </th>
                <th className="p-3 text-left">
                  Stay Type
                </th>
                <th className="p-3 text-left">
                  From
                </th>
                <th className="p-3 text-left">
                  To
                </th>
                <th className="p-3 text-left">
                  Status
                </th>
              </tr>
            </thead>

            <tbody>
              {client?.bedHistory?.map(
                (history, index) => (
                  <tr
                    key={index}
                    className="border-b"
                  >
                    <td className="p-3">
                      {index + 1}
                    </td>

                    <td className="p-3">
                      {history.propertyId?.propertyCode ||
                        history.propertyId}
                    </td>

                    <td className="p-3">
                      {history.bedId?.bedNo ||
                        history.bedId}
                    </td>

                    <td className="p-3">
                      {history.stayType}
                    </td>
                    <td className="p-3">
                      {formatDate(history.fromDate)}
                    </td>
                    <td className="p-3">
                      {formatDate(history.toDate)}
                    </td>

                    <td className="p-3">
                      {history.toDate ? (
                        <span className="px-2 py-1 rounded bg-gray-100 text-gray-700 text-xs">
                          Previous
                        </span>
                      ) : (
                        <span className="px-2 py-1 rounded bg-green-100 text-green-700 text-xs">
                          Current Bed
                        </span>
                      )}
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default BedHistoryModal;
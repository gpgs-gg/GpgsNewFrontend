import React from "react";

const TableSkeleton = ({
  rows = 8,
  columns = 5,
  showActions = false,
  showStatus = false,
}) => {
  return (
    <tbody>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <tr key={rowIndex} className="border-t border-gray-200 animate-pulse">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <td key={colIndex} className="p-3">
              <div
                className={`h-4 rounded bg-gray-200 ${
                  colIndex % 3 === 0
                    ? "w-32"
                    : colIndex % 3 === 1
                      ? "w-20"
                      : "w-24"
                }`}
              />
            </td>
          ))}

          {showStatus && (
            <td className="p-3 text-center">
              <div className="mx-auto h-7 w-20 rounded-full bg-gray-200" />
            </td>
          )}

          {showActions && (
            <td className="p-3">
              <div className="flex justify-center gap-2">
                <div className="h-9 w-9 rounded-lg bg-gray-200" />
                <div className="h-9 w-9 rounded-lg bg-gray-200" />
              </div>
            </td>
          )}
        </tr>
      ))}
    </tbody>
  );
};

export default TableSkeleton;
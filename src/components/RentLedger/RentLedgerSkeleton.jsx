const RentLedgerSkeleton = ({ rows = 10, showActions = true }) => {
  const columns = [
    { width: "w-24" }, // Property
    { width: "w-20" }, // Pay Status
    { width: "w-20" }, // Month
    { width: "w-12" }, // Year
    { width: "w-20" }, // Current Due
    { width: "w-24" }, // Total Received
    { width: "w-28" }, // Total Receivable
    { width: "w-20" }, // Rent Amount
    { width: "w-16" }, // Days Count
    { width: "w-20" }, // EB Amount
    { width: "w-16" }, // Adj. EB
    { width: "w-24" }, // Previous Due
    { width: "w-28" }, // Parking Charges
    { width: "w-20" }, // Deposit
    { width: "w-28" }, // Processing Fee
    { width: "w-20" }, // Adj. Amount
    { width: "w-16" }, // Flat EB
    { width: "w-24" }, // Monthly Rent
    { width: "w-28" }, // Rent Start Date
    { width: "w-28" }, // Rent Last Date
    { width: "w-40" }, // Payment Comments
    { width: "w-28" }, // Remarks
  ];

  return (
    <table className="w-full">
      {/* HEADER */}
      <thead className="sticky top-0 bg-gray-100 whitespace-nowrap">
        <tr>
          {[
            "Property",
            "Pay Status",
            "Month",
            "Year",
            "Current Due",
            "Total Received",
            "Total Receivable",
            "Rent Amount",
            "Days Count",
            "EB Amount",
            "Adj. EB",
            "Previous Due",
            "Parking Charges",
            "Deposit",
            "Processing Fee",
            "Adj. Amount",
            "Flat EB",
            "Monthly Rent",
            "Rent Start Date",
            "Rent Last Date",
            "Payment Comments",
            "Remarks",
          ].map((header) => (
            <th key={header} className="p-3 text-center">
              <div className="h-4 w-full max-w-28 mx-auto rounded bg-gray-200 animate-pulse" />
            </th>
          ))}

          {showActions && (
            <th className="p-3 text-center sticky right-0 bg-gray-100 z-30 min-w-37.5 shadow-[-4px_0_6px_rgba(0,0,0,0.1)]">
              <div className="h-4 w-16 mx-auto rounded bg-gray-200 animate-pulse" />
            </th>
          )}
        </tr>
      </thead>

      {/* BODY */}
      <tbody>
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <tr
            key={rowIndex}
            className="border-t border-gray-200 whitespace-nowrap text-center"
          >
            {columns.map((column, colIndex) => (
              <td key={colIndex} className="p-3">
                <div
                  className={`h-4 ${column.width} mx-auto rounded bg-gray-200 animate-pulse`}
                />
              </td>
            ))}

            {showActions && (
              <td className="p-3 sticky right-0 bg-white z-10 shadow-[-4px_0_6px_rgba(0,0,0,0.05)]">
                <div className="flex justify-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gray-200 animate-pulse" />
                  <div className="w-8 h-8 rounded-lg bg-gray-200 animate-pulse" />
                </div>
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default RentLedgerSkeleton
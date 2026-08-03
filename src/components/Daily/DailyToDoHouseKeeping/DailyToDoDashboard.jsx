import { Outlet, useNavigate, useLocation } from "react-router-dom";

export default function DailyToDoDashboard() {
  const navigate = useNavigate();
  const location = useLocation();

  const current = location.pathname.includes("maintenance")
    ? "maintenance"
    : "housekeeping";

  const handleChange = (e) => {
    navigate(`/${e.target.value}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 mt-20">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-bold">Daily Todo Dashboard</h1>

        {/* Dropdown */}
        <select
          value={current}
          onChange={handleChange}
          className="border px-3 py-2 rounded text-sm"
        >
          <option value="housekeeping">Housekeeping</option>
          <option value="maintenance">Maintenance</option>
        </select>
      </div>

      {/* RENDER PAGE HERE */}
      <Outlet />
    </div>
  );
}

// import { useEffect, useState } from "react";
// import {
//   useHouseKeepingData,
//   useUpdateHouseKeepingCell,
// } from "./services/index";
// import { toast } from "react-toastify";
// import { useApp } from "../../TicketSystem/AppProvider";

// /* ================= CONFIG ================= */

// const MONTHS = [{ label: "IT_DoNotDelete", sheet: "IT_DoNotDelete" }];
// const SR_NO_WIDTH = 70;
// const FREQUENCY_WIDTH = 70;
// const ACTIVITIES_WIDTH = 200;
// const FIXED_COL_WIDTH = 126; // Fixed width for remaining columns
// const HIDDEN_COLUMNS = ["Upl"];

// /* ================= COLOR CONFIG ================= */
// const COLORS = {
//   DONE: "bg-green-200", // Soft green (completed / on time)
//   UPCOMING: "bg-yellow-200 ", // Soft amber (upcoming)
//   DUE: "bg-white ", // Calm blue (due today)
//   OVERDUE: "bg-red-400 ", // Soft red (overdue)
//   SAMEDAY: "bg-blue-300 animate-pulse ",
// };

// // const COLORS = {
// //   DONE: "bg-[#5CFF5C] border-gray-50",
// //   UPCOMING: "bg-[#fefa04]",
// //   DUE: " border-gray-50",
// //   OVERDUE: "bg-[#FF5C5C] border-gray-50",
// //   SAMEDAY: "bg-[#ABB6D1]",
// // };

// // #14532D

// /* ================= COMPONENT ================= */

// export default function DailyTodoTable() {
//   const [rows, setRows] = useState([]);
//   const [editedRows, setEditedRows] = useState([]);
//   const [headers, setHeaders] = useState([]);
//   const [month, setMonth] = useState(MONTHS[0]);
//   const [editingCell, setEditingCell] = useState(null);
//   const [saving, setSaving] = useState(false);
//   const [hasChanges, setHasChanges] = useState(false);
//   const { decryptedUser } = useApp();
//   //  const [setDiffDaysForAll, setDiffDaysForAll] = useState();
//   /* ================= TANSTACK QUERY ================= */
//   const { data, isLoading } = useHouseKeepingData(month.sheet);
//   const updateMutation = useUpdateHouseKeepingCell();

//   /* ================= SYNC API → LOCAL STATE ================= */

//   useEffect(() => {
//     if (!data?.success) return;

//     const apiHeaders = data.headers.map((h) => (h === "" ? "S.No" : h));

//     //setHeaders(apiHeaders);
//     setHeaders(apiHeaders.filter((h) => !HIDDEN_COLUMNS.includes(h)));

//     setRows(data.data);
//     setEditedRows(JSON.parse(JSON.stringify(data.data)));
//     setHasChanges(false);
//   }, [data]);

//   /* ================= DATE UTILITIES ================= */

//   // parse date
//   const parseCellDate = (cellValue) => {
//     if (!cellValue || cellValue === "NA") return null;

//     const rawDate = cellValue.split("$")[0]?.split("_")[0]?.trim();
//     if (!isValidDateFormat(rawDate)) return null;

//     const [day, mon, year] = rawDate.split(" ");
//     const map = {
//       Jan: 0,
//       Feb: 1,
//       Mar: 2,
//       Apr: 3,
//       May: 4,
//       Jun: 5,
//       Jul: 6,
//       Aug: 7,
//       Sep: 8,
//       Oct: 9,
//       Nov: 10,
//       Dec: 11,
//     };

//     return new Date(year, map[mon], day);
//   };
//   let diffDays;

//   /* ================= formatDateInput  ================= */
//   const getStatusForCell = (frequency, cellValue, uplValue) => {
//     const freq = Number(frequency);
//     const upl = Number(uplValue) || 0;

//     if (!freq) return "";

//     const completedDate = parseCellDate(cellValue);

//     const today = new Date();
//     today.setHours(0, 0, 0, 0);

//     // ❌ Not completed yet
//     if (!completedDate) {
//       return COLORS.DUE;
//     }

//     completedDate.setHours(0, 0, 0, 0);

//     diffDays = Math.floor((today - completedDate) / (1000 * 60 * 60 * 24));

//     /* ================= DAILY ================= */
//     // if (freq === 1) {
//     //   if (diffDays === 0) return COLORS.DONE;
//     //   if (diffDays < 0) return COLORS.DUE;
//     //   return COLORS.OVERDUE;
//     // }

//     /* ================= GENERIC ================= */

//     if (diffDays < 0) return COLORS.DUE;

//     const daysLeft = freq - diffDays;
//     if (diffDays === freq) {
//       return COLORS.SAMEDAY;
//     }
//     // ⚠️ Upcoming → use Upl from sheet
//     if (daysLeft >= 0 && daysLeft <= upl) {
//       return COLORS.UPCOMING;
//     }

//     // ✅ Done
//     if (diffDays >= 0 && diffDays <= freq) {
//       return COLORS.DONE;
//     }
//     console.log(4444444444, diffDays === freq);
//     // 1️⃣ SAME DAY (exact due date)
//     if (diffDays === freq) {
//       return COLORS.SAMEDAY;
//     }

//     // 2️⃣ OVERDUE
//     if (diffDays > freq) {
//       return COLORS.OVERDUE;
//     }

//     return COLORS.DUE;
//   };

//   // const getStatusForCell = (frequency, cellValue) => {
//   //   const freq = Number(frequency);
//   //   if (!freq) return "";

//   //   const completedDate = parseCellDate(cellValue);

//   //   const today = new Date();
//   //   today.setHours(0, 0, 0, 0);

//   //   // ❌ Not completed yet
//   //   if (!completedDate) {
//   //     return COLORS.DUE;
//   //   }

//   //   completedDate.setHours(0, 0, 0, 0);

//   //   diffDays = Math.floor((today - completedDate) / (1000 * 60 * 60 * 24));
//   //   // setDiffDaysForAll(diffDays)
//   //   /* ================= DAILY (SPECIAL CASE) ================= */
//   //   // 🚫 NO UPCOMING for daily
//   //   if (freq === 1) {
//   //     if (diffDays === 0) return COLORS.DONE;
//   //     if (diffDays < 0) return COLORS.DUE;
//   //     return COLORS.OVERDUE;
//   //   }

//   //   /* ================= GENERIC (freq > 1) ================= */

//   //   const daysLeft = freq - diffDays;
//   //   console.log(88888, diffDays);
//   //   if (diffDays < 0) return COLORS.DUE;

//   //   // ⚠️ Upcoming (last 2 days only)
//   //   if (daysLeft >= 0 && daysLeft <= 2) {
//   //     return COLORS.UPCOMING;
//   //   }
//   //   // ✅ Done (safe window)
//   //   if (diffDays >= 0 && diffDays <= freq) {
//   //     return COLORS.DONE;
//   //   }

//   //   // ❌ Overdue
//   //   if (diffDays > freq) {
//   //     return COLORS.OVERDUE;
//   //   }

//   //   return COLORS.DUE;
//   // };

//   const formatDateInput = (value) => {
//     if (!value) return value;

//     const parts = value.trim().split(/\s+/);
//     if (parts.length !== 3) return value;

//     let [day, month, year] = parts;

//     // Capitalize month (Dec, Jan, etc.)
//     month = month.charAt(0).toUpperCase() + month.slice(1).toLowerCase();

//     return `${day} ${month} ${year}`;
//   };

//   /* ================= SAVE ALL CHANGES ================= */

//   const saveAllChanges = async () => {
//     try {
//       setSaving(true);
//       const requests = [];
//       const changes = [];

//       // Find all changed cells
//       for (let r = 0; r < editedRows.length; r++) {
//         for (let h of headers) {
//           if (h === "S.No") continue;

//           if (editedRows[r][h] !== rows[r][h]) {
//             changes.push({
//               name: decryptedUser?.name,
//               row: r,
//               column: h,
//               value: editedRows[r][h],
//             });
//             requests.push(
//               updateMutation.mutateAsync({
//                 name: decryptedUser?.name,
//                 sheetName: month.sheet,
//                 rowIndex: r,
//                 columnName: h,
//                 value: `${editedRows[r][h]} `,
//               })
//             );
//           }
//         }
//       }

//       if (changes.length === 0) {
//         toast("No changes to save!");
//         setSaving(false);
//         return;
//       }

//       await Promise.all(requests);

//       // Update local state
//       setRows(JSON.parse(JSON.stringify(editedRows)));
//       setHasChanges(false);
//       toast.success(" updated successfully");
//       // alert(`✅ ${changes.length} cell(s) updated successfully`);
//     } catch (err) {
//       console.error(err);
//       toast.error(" Failed to save changes");
//       // alert("❌ Failed to save changes");
//     } finally {
//       setSaving(false);
//     }
//   };

//   /* ================= HANDLE CELL EDIT ================= */

//   const handleCellEdit = (rowIndex, columnName, value) => {
//     const trimmedValue = value.trim();

//     // Update editedRows
//     const updatedEditedRows = [...editedRows];
//     updatedEditedRows[rowIndex][columnName] = trimmedValue || "NA";
//     setEditedRows(updatedEditedRows);

//     // Check if value changed from original
//     const originalValue = rows[rowIndex][columnName];
//     if (trimmedValue !== originalValue) {
//       setHasChanges(true);
//     } else {
//       // If user reverts to original value, check if all changes are reverted
//       const hasAnyChanges = updatedEditedRows.some((row, rIdx) =>
//         headers.some(
//           (h, hIdx) =>
//             h !== "S.No" && updatedEditedRows[rIdx][h] !== rows[rIdx][h]
//         )
//       );
//       setHasChanges(hasAnyChanges);
//     }

//     // End editing
//     setEditingCell(null);
//   };

//   /* ================= GET COLUMN WIDTH ================= */

//   const getColumnWidth = (index, header) => {
//     if (index === 0) return SR_NO_WIDTH; // S.No column
//     if (header === "Freq") return FREQUENCY_WIDTH;
//     if (header === "Activities") return ACTIVITIES_WIDTH;
//     return FIXED_COL_WIDTH; // Fixed width for all other columns
//   };

//   /* ================= GET STICKY LEFT POSITION ================= */

//   const getStickyLeft = (index) => {
//     let left = 0;
//     for (let i = 0; i < index; i++) {
//       left += getColumnWidth(i, headers[i]);
//     }
//     return left;
//   };

//   /* ================= VALIDATION ================= */

//   const isValidDateFormat = (value) => {
//     // Format: 20 Dec 2025
//     // const regex =
//     //   /^(0?[1-9]|[12][0-9]|3[01])\s(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s\d{4}$/;
//     const regex =
//       /^(0?[1-9]|[12][0-9]|3[01])\s(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s\d{4}$/;

//     if (!regex.test(value)) return false;

//     // Extra safety: check if it's a real date
//     const [day, monthStr, year] = value.split(" ");
//     const monthMap = {
//       Jan: 0,
//       Feb: 1,
//       Mar: 2,
//       Apr: 3,
//       May: 4,
//       Jun: 5,
//       Jul: 6,
//       Aug: 7,
//       Sep: 8,
//       Oct: 9,
//       Nov: 10,
//       Dec: 11,
//     };

//     const date = new Date(year, monthMap[monthStr], day);
//     return (
//       date.getFullYear() === Number(year) &&
//       date.getMonth() === monthMap[monthStr] &&
//       date.getDate() === Number(day)
//     );
//   };

//   /* ================= PARSE HISTORY VALUE ================= */

//   const parseHistoryValue = (value = "") => {
//     if (!value || value === "NA") return [];

//     return value
//       .split("$")
//       .filter(Boolean)
//       .map((item, index) => {
//         const [text, meta] = item.split("_");
//         return {
//           sr: index + 1,
//           text: text?.trim() || "NA",
//           meta: meta?.replace(/[[\]]/g, "") || "",
//         };
//       });
//   };

//   /* ================= LOADING ================= */

//   if (isLoading) {
//     return (
//       <div className="p-10 text-center text-lg font-semibold">
//         Loading housekeeping data...
//       </div>
//     );
//   }

//   /* ================= UI ================= */

//   return (
//     <div className="min-h-screen bg-gray-50 md:pt-8 lg:pt-24 my-2 ">
//       <div className="flex flex-wrap items-center justify-between  gap-16 mx-2 mb-0">
//         <h1 className="text-lg font-bold px-5">
//           DailyTodo – Housekeeping
//           {/* DailyTodo – Housekeeping ({month.label}) */}
//         </h1>

//         {/* title color code  */}
//         <div className="flex flex-wrap items-center text-lg  gap-8 mx-2 font-bold bg-white px-4 rounded-xl">
//           <p className="text-red-400">Remaining</p>
//           <p className="text-green-400">Done</p>
//           <p className="text-yellow-400">Upcoming</p>
//           <p className="text-blue-400 animate-pulse">Todays work</p>
//         </div>

//         <div className="flex gap-2 my-1 items-center text-[14px] px-8">
//           {hasChanges && (
//             <button
//               onClick={saveAllChanges}
//               disabled={saving}
//               className="bg-orange-300 hover:bg-orange-400 px-8 py-1
//                font-bold text-black rounded disabled:opacity-50 transition-colors flex items-center gap-2"
//             >
//               {saving ? (
//                 <>
//                   <svg
//                     className="animate-spin h-4 w-4 text-white px-4"
//                     xmlns="http://www.w3.org/2000/svg"
//                     fill="none"
//                     viewBox="0 0 24 24"
//                   >
//                     <circle
//                       className="opacity-25"
//                       cx="12"
//                       cy="12"
//                       r="10"
//                       stroke="currentColor"
//                       strokeWidth="4"
//                     ></circle>
//                     <path
//                       className="opacity-75"
//                       fill="currentColor"
//                       d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
//                     ></path>
//                   </svg>
//                   Saving...
//                 </>
//               ) : (
//                 <>
//                   {" "}
//                   Save
//                   <svg
//                     className="w-4 h-4"
//                     fill="none"
//                     stroke="currentColor"
//                     viewBox="0 0 24 24"
//                   >
//                     <path
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                       strokeWidth="2"
//                       d="M5 13l4 4L19 7"
//                     ></path>
//                   </svg>
//                 </>
//               )}
//             </button>
//           )}
//         </div>
//       </div>

//       <div className="relative lg:h-[79vh] h-auto  overflow-auto bg-white shadow-lg rounded-lg ">
//         <table className="border-collapse min-w-full text-sm ">
//           <thead className="sticky top-0  z-40">
//             <tr>
//               {headers.map((head, i) => (
//                 <th
//                   key={i}
//                   className={`border bg-orange-300 w-[200px]  px-4 py-3 text-start font-semibold border border-gray-100
//                   ${i < 3 ? "sticky z-50 bg-orange-300" : "bg-gray-50"}`}
//                   style={
//                     i < 3
//                       ? {
//                           left: getStickyLeft(i),
//                           minWidth: getColumnWidth(i, head),
//                           width: getColumnWidth(i, head),
//                           maxWidth: getColumnWidth(i, head),
//                         }
//                       : {
//                           minWidth: getColumnWidth(i, head),
//                           width: getColumnWidth(i, head),
//                           maxWidth: getColumnWidth(i, head),
//                         }
//                   }
//                 >
//                   <div className="truncate">{head}</div>
//                 </th>
//               ))}
//             </tr>
//           </thead>

//           <tbody>
//             {rows.map((row, rIdx) => {
//               const frequency = row["Freq"];
//               const upl = row["Upl"];

//               return (
//                 <tr key={rIdx} className="">
//                   {headers.map((head, cIdx) => {
//                     const sticky = cIdx < 3;
//                     const isEditing =
//                       editingCell?.row === rIdx && editingCell?.col === head;
//                     const currentValue = editedRows[rIdx]?.[head] || row[head];
//                     const originalValue = rows[rIdx][head];
//                     const isChanged =
//                       editedRows[rIdx]?.[head] !== originalValue;
//                     const width = getColumnWidth(cIdx, head);
//                     const cellStatus =
//                       cIdx >= 3
//                         ? getStatusForCell(frequency, currentValue, upl)
//                         : "";

//                     return (
//                       <td
//                         onClick={() => {
//                           // console.log(
//                           //   rIdx,
//                           //   row[head].split("_")[0],
//                           //   "pooja",
//                           //   head
//                           // );
//                           // console.log({
//                           //   row: rIdx,
//                           //   col: head,
//                           //   freq: frequency,
//                           //   value: currentValue,
//                           //   status: cellStatus,
//                           // });
//                         }}
//                         key={cIdx}
//                         onDoubleClick={() => {
//                           if (cIdx < 3) return; // Don't edit first 3 columns
//                           setEditingCell({ row: rIdx, col: head });
//                         }}
//                         className={`border px-4 py-3 border-gray-50 relative
//   ${sticky ? "sticky z-30 bg-orange-300 font-bold" : ""}
//   ${cIdx >= 3 ? cellStatus : ""}
//   ${cIdx === 0 || head === "Freq" ? "text-center" : ""}
// `}
//                         style={{
//                           minWidth: width,
//                           width: width,
//                           maxWidth: width,
//                           ...(sticky && { left: getStickyLeft(cIdx) }),
//                         }}
//                       >
//                         {head === "SrNo" ? (
//                           <span className="font-bold">{rIdx + 1}</span>
//                         ) : isEditing ? (
//                           <div className="absolute inset-0 flex items-center justify-center z-40">
//                             <input
//                               defaultValue={
//                                 currentValue?.split("$")[0]?.split("_")[0] || ""
//                               }
//                               onBlur={(e) => {
//                                 const trimmedValue = formatDateInput(
//                                   e.target.value.trim()
//                                 );
//                                 if (trimmedValue && trimmedValue !== "NA") {
//                                   if (!isValidDateFormat(trimmedValue)) {
//                                     toast.error(
//                                       " Invalid date format! Use: 25 Dec 2025"
//                                     );
//                                     setEditingCell(null);
//                                     return;
//                                   }
//                                 }
//                                 handleCellEdit(rIdx, head, trimmedValue);
//                               }}
//                               onKeyDown={(e) => {
//                                 if (e.key === "Enter") {
//                                   const trimmedValue = formatDateInput(
//                                     e.target.value.trim()
//                                   );

//                                   if (trimmedValue && trimmedValue !== "NA") {
//                                     if (!isValidDateFormat(trimmedValue)) {
//                                       toast.error(
//                                         " Invalid date format! Use: 25 Dec 2025"
//                                       );
//                                       return;
//                                     }
//                                   }

//                                   handleCellEdit(rIdx, head, trimmedValue);
//                                 }
//                                 if (e.key === "Escape") {
//                                   setEditingCell(null);
//                                 }
//                               }}
//                               className="
//   h-full w-full bg-transparent border-none
//   outline-none focus:outline-none
//   focus:ring-0 focus:ring-offset-0
//   px-4 text-sm text-black caret-black font-medium
// "
//                               style={{
//                                 boxShadow: "none",
//                                 WebkitTextFillColor: "black",
//                                 WebkitAppearance: "none",
//                                 MozAppearance: "none",
//                               }}
//                             />
//                           </div>
//                         ) : (
//                           <div className="relative group cursor-pointer">
//                             {(() => {
//                               const historyArr =
//                                 parseHistoryValue(currentValue);
//                               const displayValue = historyArr[0]?.text || "NA";

//                               return (
//                                 <>
//                                   <span
//                                     className={`truncate block ${
//                                       !currentValue || currentValue === "NA"
//                                         ? "text-gray-400"
//                                         : "text-black"
//                                     } ${isChanged ? " " : ""}`}
//                                     style={{
//                                       maxWidth: width - 32, // Account for padding
//                                     }}
//                                   >
//                                     {displayValue}
//                                     {isChanged && (
//                                       <span className="ml-1 text-xs ">*</span>
//                                     )}
//                                   </span>

//                                   {cIdx >= 3 && historyArr.length > 0 && (
//                                     <div
//                                       className="absolute mt-20 left-full top-1/2 ml-3 -translate-y-1/2
//     opacity-0 group-hover:opacity-100 transition
//     bg-white border rounded shadow-lg z-[9999]
//     min-w-[320px]
//     max-h-[240px]
//     pointer-events-none"
//                                     >
//                                       <div className="p-3 space-y-2">
//                                         <div className="text-xs font-semibold text-gray-500 uppercase">
//                                           Previous History - ( {diffDays} )
//                                         </div>

//                                         {historyArr
//                                           .slice(0, 4)
//                                           .map((item, idx) => (
//                                             <div
//                                               key={idx}
//                                               className={`p-2 rounded  text-xs ${
//                                                 idx === 0
//                                                   ? "bg-gray-50"
//                                                   : "bg-gray-50"
//                                               }`}
//                                             >
//                                               <div className="whitespace-nowrap">
//                                                 <span className="font-semibold">
//                                                   {" "}
//                                                   {item.text}
//                                                 </span>{" "}
//                                                 {item.meta && (
//                                                   <span className="text-[10px] text-gray-500">
//                                                     {item.meta}
//                                                   </span>
//                                                 )}
//                                               </div>
//                                             </div>
//                                           ))}
//                                       </div>
//                                     </div>
//                                   )}
//                                 </>
//                               );
//                             })()}
//                           </div>
//                         )}
//                       </td>
//                     );
//                   })}
//                 </tr>
//               );
//             })}
//           </tbody>
//         </table>
//       </div>

//       {/* {hasChanges && (
//         <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex justify-between items-center">
//           <div className="text-sm text-blue-700">
//             <span className="font-semibold">⚠️ Unsaved changes detected!</span>
//             <span className="ml-2">
//               Click "Save Changes" to update the database.
//             </span>
//           </div>
//           <button
//             onClick={saveAllChanges}
//             disabled={saving}
//             className="bg-orange-300 hover:bg-orange-100 px-4 py-2 text-white rounded disabled:opacity-50 transition-colors text-sm"
//           >
//             {saving ? "Saving..." : "Save Now"}
//           </button>
//         </div>
//       )} */}
//     </div>
//   );
// }

import DailyTodoTable from "../components/DailyToDoTable";
import {
  useMaintenanceData,
  useUpdateMaintenanceRow,
} from "../DailyToDoMaintenace/services/index";

export default function Maintenance() {
  return (
    <DailyTodoTable
      title="DailyTodo – Maintenance"
      useFetchHook={useMaintenanceData}
      useUpdateHook={useUpdateMaintenanceRow}
    />
  );
}

// import DailyTodoTable from "../components/DailyToDoTable";
// import {
//   useMaintenanceData,
//   useUpdateMaintenanceCell,
// } from "../DailyToDoMaintenace/services/index";

// export default function Maintenance() {
//   return (
//     <DailyTodoTable
//       title="DailyTodo – Maintenance"
//       sheetName="DailyToDo"
//       useFetchHook={useMaintenanceData}
//       useUpdateHook={useUpdateMaintenanceCell}
//     />
//   );
// }

// import { useEffect, useState } from "react";
// import { useMaintenanceData, useUpdateMaintenanceCell } from "./services/index";
// import { toast } from "react-toastify";
// import { useApp } from "../../TicketSystem/AppProvider";
// import LoaderPage from "../../NewBooking/LoaderPage";

// /* ================= CONFIG ================= */

// const MONTHS = [{ label: "DailyTodo", sheet: "DailyTodo" }];
// const SR_NO_WIDTH = 70;
// const FREQUENCY_WIDTH = 70;
// const ACTIVITIES_WIDTH = 200;
// const FIXED_COL_WIDTH = 126;
// const HIDDEN_COLUMNS = ["Notify"];

// /* ================= COLOR CONFIG ================= */

// const COLORS = {
//   DONE: "bg-green-200",
//   UPCOMING: "bg-yellow-200 ",
//   DUE: "bg-white ",
//   OVERDUE: "bg-red-400 ",
//   SAMEDAY: "bg-blue-300 animate-pulse ",
// };

// /* ================= COMPONENT ================= */

// // Maintenance

// export default function Maintenance() {
//   const [rows, setRows] = useState([]);
//   const [editedRows, setEditedRows] = useState([]);
//   const [headers, setHeaders] = useState([]);
//   const month = MONTHS[0];
//   const [editingCell, setEditingCell] = useState(null);
//   const [saving, setSaving] = useState(false);
//   const [hasChanges, setHasChanges] = useState(false);
//   const { decryptedUser } = useApp();

//   /* ================= API ================= */

//   const { data, isPending } = useMaintenanceData(month.sheet);
//   const updateMutation = useUpdateMaintenanceCell();

//   /* ================= SYNC DATA ================= */

//   useEffect(() => {
//     if (!data?.success) return;

//     const apiHeaders = data.headers.map((h) => (h === "" ? "S.No" : h));
//     setHeaders(apiHeaders.filter((h) => !HIDDEN_COLUMNS.includes(h)));
//     setRows(data.data);
//     setEditedRows(JSON.parse(JSON.stringify(data.data)));
//     setHasChanges(false);
//   }, [data]);

//   /* ================= DATE UTILS ================= */

//   const isValidDateFormat = (value) =>
//     /^(0?[1-9]|[12][0-9]|3[01])\s(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s\d{4}$/.test(
//       value
//     );

//   const isFutureDate = (value) => {
//     if (!isValidDateFormat(value)) return false;
//     const [d, m, y] = value.split(" ");
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
//     return new Date(y, map[m], d) > new Date();
//   };

//   const parseCellDate = (value) => {
//     if (!value || value === "NA") return null;
//     const raw = value.split("$")[0]?.split("_")[0]?.trim();
//     if (!isValidDateFormat(raw)) return null;
//     const [d, m, y] = raw.split(" ");
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
//     return new Date(y, map[m], d);
//   };

//   let diffDays;

//   const getStatusForCell = (freq, value, upl) => {
//     freq = Number(freq);
//     upl = Number(upl) || 0;
//     if (!freq) return "";

//     const completed = parseCellDate(value);
//     const today = new Date();
//     today.setHours(0, 0, 0, 0);

//     if (!completed) return COLORS.DUE;

//     completed.setHours(0, 0, 0, 0);
//     diffDays = Math.floor((today - completed) / 86400000);

//     if (freq === 1) {
//       if (diffDays === 0) return COLORS.DONE;
//       return diffDays > 0 ? COLORS.OVERDUE : COLORS.DUE;
//     }

//     if (diffDays > freq) return COLORS.OVERDUE;
//     if (diffDays === freq) return COLORS.SAMEDAY;
//     if (freq - diffDays <= upl) return COLORS.UPCOMING;
//     return COLORS.DONE;
//   };

//   /* ================= HISTORY ================= */

//   const parseHistoryValue = (value = "") =>
//     value
//       .split("$")
//       .filter(Boolean)
//       .map((item) => {
//         const [text, meta] = item.split("_");
//         return { text, meta };
//       });

//   /* ================= SAVE ================= */

//   const saveAllChanges = async () => {
//     try {
//       setSaving(true);
//       const calls = [];

//       editedRows.forEach((row, r) => {
//         headers.forEach((h) => {
//           if (h === "S.No") return;
//           if (row[h] !== rows[r][h]) {
//             calls.push(
//               updateMutation.mutateAsync({
//                 name: decryptedUser?.name,
//                 sheetName: month.sheet,
//                 rowIndex: r,
//                 columnName: h,
//                 value: row[h],
//               })
//             );
//           }
//         });
//       });

//       if (!calls.length) return toast("No changes");

//       await Promise.all(calls);
//       setRows(JSON.parse(JSON.stringify(editedRows)));
//       setHasChanges(false);
//       toast.success("Maintenance updated");
//     } catch {
//       toast.error("Update failed");
//     } finally {
//       setSaving(false);
//     }
//   };

//   /* ================= LOADING ================= */

//   if (isPending) {
//     return (
//       <div className="flex justify-center items-center h-screen">
//         <LoaderPage />
//       </div>
//     );
//   }

//   /* ================= JSX ================= */

//   return (
//     <div className="min-h-screen bg-gray-50 pt-24">
//       <div className="flex justify-between px-6 mb-4">
//         <h1 className="font-bold text-lg">DailyTodo – Maintenance</h1>
//         {hasChanges && (
//           <button
//             onClick={saveAllChanges}
//             className="bg-orange-400 px-6 py-1 font-bold rounded"
//           >
//             {saving ? "Saving..." : "Save"}
//           </button>
//         )}
//       </div>

//       <div className="overflow-auto bg-white shadow rounded-lg">
//         <table className="min-w-full text-sm border-collapse">
//           <thead className="sticky top-0 bg-orange-300 z-40">
//             <tr>
//               {headers.map((h, i) => (
//                 <th key={i} className="border px-4 py-2 text-left">
//                   {h}
//                 </th>
//               ))}
//             </tr>
//           </thead>

//           <tbody>
//             {rows.map((row, r) => (
//               <tr key={r}>
//                 {headers.map((h, c) => {
//                   const val = editedRows[r]?.[h] || row[h];
//                   const status =
//                     c >= 3
//                       ? getStatusForCell(row["Freq"], val, row["Notify"])
//                       : "";

//                   return (
//                     <td
//                       key={c}
//                       className={`border px-4 py-2 ${status}`}
//                       onDoubleClick={() => c >= 3 && setEditingCell({ r, h })}
//                     >
//                       {editingCell?.r === r && editingCell?.h === h ? (
//                         <input
//                           autoFocus
//                           defaultValue={val?.split("$")[0]}
//                           onBlur={(e) => {
//                             const v = e.target.value.trim();
//                             if (v && !isValidDateFormat(v))
//                               return toast.error("Invalid date");
//                             if (isFutureDate(v))
//                               return toast.error("Future date");
//                             editedRows[r][h] = v || "NA";
//                             setEditedRows([...editedRows]);
//                             setHasChanges(true);
//                             setEditingCell(null);
//                           }}
//                           className="w-full outline-none"
//                         />
//                       ) : (
//                         <span>{val?.split("$")[0] || "NA"}</span>
//                       )}
//                     </td>
//                   );
//                 })}
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// }

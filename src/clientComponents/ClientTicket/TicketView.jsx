import { useParams, useNavigate } from "react-router-dom";
import {
    ArrowLeft,
    MapPin,
    Building2,
    User,
    Calendar,
    Flag,
    AlertTriangle,
} from "lucide-react";
import { useSingleTicketData } from "./services";
import { TableFilePreview } from "../common/FilePreview";


function TimelineItem ({ title, date, color }) {
  return (
    <div className="relative pl-8">

      <div
        className={`absolute -left-[11px] top-1 w-5 h-5 rounded-full ${color}`}
      />

      <h3 className="font-semibold">
        {title}
      </h3>

      <p className="text-sm text-gray-500">
        {date || "-"}
      </p>

    </div>
  );
}
function TicketView() {
    const { id } = useParams();
    const navigate = useNavigate();

    const { data: singleTicket, isLoading } = useSingleTicketData(id);

    if (isLoading) {
        return (
            <div className="h-screen flex items-center justify-center">
                Loading...
            </div>
        );
    }

    const ticket = singleTicket?.data;

    if (!ticket) {
        return (
            <div className="h-screen flex items-center justify-center">
                Ticket Not Found
            </div>
        );
    }

    const getStatusColor = (status) => {
        switch (status) {
            case "Open":
                return "bg-green-100 text-green-700";
            case "Acknowledged":
                return "bg-blue-100 text-blue-700";
            case "In Progress":
                return "bg-yellow-100 text-yellow-700";
            case "Resolved":
                return "bg-emerald-100 text-emerald-700";
            case "Closed":
                return "bg-gray-200 text-gray-700";
            default:
                return "bg-red-100 text-red-700";
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case "Critical":
                return "bg-red-600 text-white";
            case "High":
                return "bg-orange-500 text-white";
            case "Medium":
                return "bg-yellow-400 text-black";
            default:
                return "bg-green-500 text-white";
        }
    };

    return (
        <div className="max-w-12xl mx-auto p-6 space-y-6">

            {/* Header */}

            <div className="bg-white rounded-xl shadow border p-6">

                <div className="flex justify-between items-center">

                    <div className="flex items-center gap-4">

                        <button
                            onClick={() => navigate(-1)}
                            className="border rounded-lg p-2 hover:bg-gray-100"
                        >
                            <ArrowLeft size={20} />
                        </button>

                        <div>

                            <h1 className="text-3xl font-bold">
                                {ticket.ticketId}
                            </h1>

                            <p className="text-gray-500 mt-1">
                                {ticket.title}
                            </p>

                        </div>

                    </div>

                    <div className="flex gap-3">

                        <span
                            className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(
                                ticket.status
                            )}`}
                        >
                            {ticket.status}
                        </span>

                        <span
                            className={`px-4 py-2 rounded-full text-sm font-semibold ${getPriorityColor(
                                ticket.priority
                            )}`}
                        >
                            {ticket.priority}
                        </span>

                    </div>

                </div>

            </div>

            {/* Info Cards */}

            <div className="grid lg:grid-cols-2 gap-6">

                {/* Ticket Details */}

                <div className="bg-white rounded-xl shadow border">

                    <div className="border-b px-5 py-4">

                        <h2 className="text-lg font-semibold">
                            Ticket Information
                        </h2>

                    </div>

                    <div className="p-5 grid grid-cols-2 gap-6">

                        <Info
                            icon={<Building2 size={18} />}
                            title="Property"
                            value={ticket.propertyCode}
                        />

                        <Info
                            icon={<MapPin size={18} />}
                            title="Location"
                            value={ticket.propertyLocation}
                        />

                        <Info
                            icon={<Flag size={18} />}
                            title="Department"
                            value={ticket.department}
                        />

                        <Info
                            icon={<AlertTriangle size={18} />}
                            title="Category"
                            value={ticket.category}
                        />

                        <Info
                            icon={<Calendar size={18} />}
                            title="Created"
                            value={ticket.dateCreated}
                        />

                        <Info
                            icon={<Calendar size={18} />}
                            title="Target Date"
                            value={ticket.targetDate}
                        />

                    </div>

                </div>

                {/* Assignment */}

                <div className="bg-white rounded-xl shadow border">

                    <div className="border-b px-5 py-4">

                        <h2 className="text-lg font-semibold">
                            Assignment
                        </h2>

                    </div>

                    <div className="p-5 grid grid-cols-2 gap-6">

                        <Info
                            icon={<User size={18} />}
                            title="Manager"
                            value={ticket.manager}
                        />

                        <Info
                            icon={<User size={18} />}
                            title="Assignee"
                            value={ticket.assignee}
                        />

                        <Info
                            icon={<User size={18} />}
                            title="Customer Impacted"
                            value={ticket.customerImpacted}
                        />

                        <Info
                            icon={<User size={18} />}
                            title="Escalated"
                            value={ticket.escalated}
                        />

                        <Info
                            icon={<Calendar size={18} />}
                            title="Actual Time"
                            value={ticket.actualTimeSpent}
                        />

                        <Info
                            icon={<Calendar size={18} />}
                            title="Status"
                            value={ticket.status}
                        />

                    </div>

                </div>

            </div>

            {/* ---------- PART 2 येथे सुरू होईल ---------- */}
            {/* Description + Attachments */}

            <div className="grid lg:grid-cols-3 gap-6">

                {/* Description */}

                <div className="lg:col-span-2 bg-white rounded-xl shadow border">

                    <div className="border-b px-5 py-4">
                        <h2 className="text-lg font-semibold">
                            Description
                        </h2>
                    </div>

                    <div className="p-5">

                        <p className="text-gray-700 leading-7 whitespace-pre-wrap">
                            {ticket.description || "-"}
                        </p>

                    </div>

                </div>

                {/* Attachments */}

                <div className="bg-white rounded-xl shadow border">

                    <div className="border-b px-5 py-4">
                        <h2 className="text-lg font-semibold">
                            Attachments
                        </h2>
                    </div>

                    <div className="p-5">

                        {ticket.attachment?.length ? (
                            <TableFilePreview files={ticket.attachment} />
                        ) : (
                            <div className="text-center text-gray-400 py-8">
                                No Attachments
                            </div>
                        )}

                    </div>

                </div>

            </div>

            {/* Timeline */}

            <div className="bg-white rounded-xl shadow border">

                <div className="border-b px-5 py-4">
                    <h2 className="text-lg font-semibold">
                        Timeline
                    </h2>
                </div>

                <div className="p-6">

                    <div className="space-y-8 border-l-2 border-blue-300 ml-3">

                        <TimelineItem
                            title="Ticket Created"
                            date={ticket.dateCreated}
                            color="bg-green-500"
                        />

                        <TimelineItem
                            title="Acknowledged"
                            date={ticket.acknowledgedDate}
                            color="bg-blue-500"
                        />

                        <TimelineItem
                            title="Target Date"
                            date={ticket.targetDate}
                            color="bg-yellow-500"
                        />

                        <TimelineItem
                            title="Resolved"
                            date={ticket.resolvedDate}
                            color="bg-emerald-500"
                        />

                        <TimelineItem
                            title="Closed"
                            date={ticket.closedDate}
                            color="bg-gray-500"
                        />

                    </div>

                </div>

            </div>

            {/* Auditor Logs */}

            <div className="bg-white rounded-xl shadow border">

                <div className="border-b px-5 py-4">
                    <h2 className="text-lg font-semibold">
                        Auditor Activity
                    </h2>
                </div>

                <div className="p-5">

                    {ticket.auditorLogs?.length ? (

                        <div className="space-y-5">

                            {ticket.auditorLogs
                                .slice()
                                .reverse()
                                .map((log) => (

                                    <div
                                        key={log._id}
                                        className="flex gap-4 border rounded-xl p-4 hover:bg-gray-50 transition"
                                    >

                                        <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-lg">
                                            {(log.createdBy || "S")[0]}
                                        </div>

                                        <div className="flex-1">

                                            <div className="flex justify-between items-center">

                                                <h3 className="font-semibold">
                                                    {log.createdBy || "System"}
                                                </h3>

                                                <span className="text-xs text-gray-500">
                                                    {new Date(log.createdAt).toLocaleString()}
                                                </span>

                                            </div>

                                            <p className="mt-2 text-gray-700 whitespace-pre-wrap">
                                                {log.message}
                                            </p>

                                        </div>

                                    </div>

                                ))}

                        </div>

                    ) : (

                        <div className="text-center py-10 text-gray-400">
                            No Auditor Logs Available
                        </div>

                    )}

                </div>

            </div>
        </div>
    );
}

function Info({ icon, title, value }) {
    return (
        <div className="flex gap-3">

            <div className="text-blue-600 mt-1">
                {icon}
            </div>

            <div>

                <p className="text-xs text-gray-500">
                    {title}
                </p>

                <p className="font-semibold break-words">
                    {value || "-"}
                </p>

            </div>

        </div>
    );
}

export default TicketView;


// import { useNavigate, useParams } from "react-router-dom";
// import {
//   ArrowLeft,
//   Building2,
//   MapPin,
//   Flag,
//   AlertTriangle,
//   User,
//   Calendar,
//   Pencil,
// } from "lucide-react";
// import { useSingleTicketData } from "./services";
// import { TableFilePreview } from "../common/FilePreview";
// function Timeline({ title, date, color }) {
//   const completed = !!date;

//   return (
//     <div className="relative flex gap-4 pb-8 last:pb-0">

//       {/* Line */}
//       <div className="absolute left-[15px] top-8 bottom-0 w-0.5 bg-gray-200 last:hidden"></div>

//       {/* Dot */}
//       <div
//         className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
//           completed ? color : "bg-gray-300"
//         }`}
//       >
//         <div className="w-3 h-3 rounded-full bg-white"></div>
//       </div>

//       {/* Content */}
//       <div className="flex-1 pb-2">

//         <h4 className="font-semibold text-gray-800">
//           {title}
//         </h4>

//         <p className="text-sm text-gray-500 mt-1">
//           {date
//             ? new Date(date).toLocaleString("en-IN", {
//                 day: "2-digit",
//                 month: "short",
//                 year: "numeric",
//                 hour: "2-digit",
//                 minute: "2-digit",
//               })
//             : "Pending"}
//         </p>

//       </div>

//     </div>
//   );
// }
// function StatCard({ title, value, color }) {
//   return (
//     <div
//       className={`bg-white rounded-xl shadow border-l-4 ${color} p-5 hover:shadow-xl transition`}
//     >
//       <p className="text-sm text-gray-500">
//         {title}
//       </p>

//       <h3 className="text-xl font-bold mt-3 break-words">
//         {value}
//       </h3>
//     </div>
//   );
// }
// function TicketView() {
//   const navigate = useNavigate();
//   const { id } = useParams();

//   const { data: singleTicket, isLoading } = useSingleTicketData(id);

//   if (isLoading) {
//     return (
//       <div className="h-screen flex justify-center items-center">
//         Loading...
//       </div>
//     );
//   }

//   const ticket = singleTicket?.data;

//   if (!ticket) return null;

//   const statusColor = {
//     Open: "bg-green-100 text-green-700",
//     Acknowledged: "bg-blue-100 text-blue-700",
//     "In Progress": "bg-yellow-100 text-yellow-700",
//     Resolved: "bg-emerald-100 text-emerald-700",
//     Closed: "bg-gray-200 text-gray-700",
//     Cancelled: "bg-red-100 text-red-700",
//   };

//   const priorityColor = {
//     Critical: "bg-red-600 text-white",
//     High: "bg-orange-500 text-white",
//     Medium: "bg-yellow-400 text-black",
//     Low: "bg-green-500 text-white",
//   };

//   return (
//     <div className="bg-slate-100 min-h-screen">

//       {/* Header */}

//       <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 text-white shadow-lg">

//         <div className="max-w-7xl mx-auto px-6 py-6">

//           <div className="flex justify-between items-start">

//             <div>

//               <button
//                 onClick={() => navigate(-1)}
//                 className="flex items-center gap-2 text-sm mb-5 hover:underline"
//               >
//                 <ArrowLeft size={18} />
//                 Back to Ticket List
//               </button>

//               <h1 className="text-4xl font-bold">
//                 {ticket.ticketId}
//               </h1>

//               <p className="mt-2 text-blue-100 text-lg">
//                 {ticket.title}
//               </p>

//             </div>

//             <div className="flex gap-3">

//               <span
//                 className={`px-5 py-2 rounded-full text-sm font-semibold ${
//                   statusColor[ticket.status] ||
//                   "bg-white text-black"
//                 }`}
//               >
//                 {ticket.status}
//               </span>

//               <span
//                 className={`px-5 py-2 rounded-full text-sm font-semibold ${
//                   priorityColor[ticket.priority] ||
//                   "bg-white text-black"
//                 }`}
//               >
//                 {ticket.priority}
//               </span>

//               <button
//                 onClick={() => navigate(`/tickets/edit/${ticket._id}`)}
//                 className="bg-white text-blue-700 flex items-center gap-2 px-5 py-2 rounded-lg font-semibold hover:bg-gray-100"
//               >
//                 <Pencil size={18} />
//                 Edit
//               </button>

//             </div>

//           </div>

//         </div>

//       </div>

//       {/* Dashboard Cards */}

//       <div className="max-w-7xl mx-auto p-6">

//         <div className="grid md:grid-cols-4 gap-5 mb-6">

//           <SummaryCard
//             title="Status"
//             value={ticket.status}
//             color="bg-green-500"
//           />

//           <SummaryCard
//             title="Priority"
//             value={ticket.priority}
//             color="bg-red-500"
//           />

//           <SummaryCard
//             title="Department"
//             value={ticket.department}
//             color="bg-blue-500"
//           />

//           <SummaryCard
//             title="Category"
//             value={ticket.category}
//             color="bg-purple-500"
//           />

//         </div>

//         {/* Main Cards */}

//         <div className="grid lg:grid-cols-3 gap-6">

//           {/* Ticket Information */}

//           <div className="lg:col-span-2 bg-white rounded-2xl shadow">

//             <div className="border-b px-6 py-4">

//               <h2 className="text-xl font-bold">
//                 Ticket Information
//               </h2>

//             </div>

//             <div className="grid md:grid-cols-2 gap-8 p-6">

//               <Info icon={<Building2 />} title="Property" value={ticket.propertyCode} />
//               <Info icon={<MapPin />} title="Location" value={ticket.propertyLocation} />
//               <Info icon={<Flag />} title="Department" value={ticket.department} />
//               <Info icon={<AlertTriangle />} title="Category" value={ticket.category} />
//               <Info icon={<Calendar />} title="Created Date" value={ticket.dateCreated} />
//               <Info icon={<Calendar />} title="Target Date" value={ticket.targetDate} />

//             </div>

//           </div>

//           {/* Assignment */}

//           <div className="bg-white rounded-2xl shadow">

//             <div className="border-b px-6 py-4">

//               <h2 className="text-xl font-bold">
//                 Assignment
//               </h2>

//             </div>

//             <div className="space-y-6 p-6">

//               <Info icon={<User />} title="Manager" value={ticket.manager} />

//               <Info icon={<User />} title="Assignee" value={ticket.assignee} />

//               <Info
//                 icon={<User />}
//                 title="Customer Impacted"
//                 value={ticket.customerImpacted}
//               />

//               <Info
//                 icon={<User />}
//                 title="Escalated"
//                 value={ticket.escalated}
//               />

//             </div>

//           </div>

//         </div>

//         {/* ======= PART 2 HERE ======= */}
//         {/* Description + Attachments */}

//         <div className="grid lg:grid-cols-3 gap-6 mt-6">

//           {/* Description */}

//           <div className="lg:col-span-2 bg-white rounded-2xl shadow">

//             <div className="flex justify-between items-center border-b px-6 py-4">

//               <h2 className="text-xl font-bold">
//                 Description
//               </h2>

//               <span className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
//                 Ticket Details
//               </span>

//             </div>

//             <div className="p-6">

//               <p className="text-gray-700 leading-8 whitespace-pre-wrap">
//                 {ticket.description || "-"}
//               </p>

//             </div>

//           </div>

//           {/* SLA Card */}

//           <div className="bg-white rounded-2xl shadow">

//             <div className="border-b px-6 py-4">

//               <h2 className="text-xl font-bold">
//                 SLA
//               </h2>

//             </div>

//             <div className="p-6 space-y-5">

//               <div className="flex justify-between">
//                 <span className="text-gray-500">
//                   Created
//                 </span>

//                 <span className="font-semibold">
//                   {ticket.dateCreated || "-"}
//                 </span>
//               </div>

//               <div className="flex justify-between">
//                 <span className="text-gray-500">
//                   Acknowledged
//                 </span>

//                 <span className="font-semibold">
//                   {ticket.acknowledgedDate || "-"}
//                 </span>
//               </div>

//               <div className="flex justify-between">
//                 <span className="text-gray-500">
//                   Target
//                 </span>

//                 <span className="font-semibold">
//                   {ticket.targetDate || "-"}
//                 </span>
//               </div>

//               <div className="flex justify-between">
//                 <span className="text-gray-500">
//                   Actual Time
//                 </span>

//                 <span className="font-semibold">
//                   {ticket.actualTimeSpent || "-"}
//                 </span>
//               </div>

//             </div>

//           </div>

//         </div>

//         {/* Attachments + Timeline */}

//         <div className="grid lg:grid-cols-3 gap-6 mt-6">

//           {/* Attachments */}

//           <div className="lg:col-span-2 bg-white rounded-2xl shadow">

//             <div className="border-b px-6 py-4 flex justify-between">

//               <h2 className="text-xl font-bold">
//                 Attachments
//               </h2>

//               <span className="text-sm text-gray-500">
//                 {ticket.attachment?.length || 0} Files
//               </span>

//             </div>

//             <div className="p-6">

//               {ticket.attachment?.length ? (

//                 <TableFilePreview files={ticket.attachment} />

//               ) : (

//                 <div className="text-center py-12 text-gray-400">

//                   <img
//                     src="https://cdn-icons-png.flaticon.com/512/7486/7486740.png"
//                     className="w-20 mx-auto mb-3 opacity-50"
//                   />

//                   No Attachments

//                 </div>

//               )}

//             </div>

//           </div>

//           {/* Timeline */}

//           <div className="bg-white rounded-2xl shadow">

//             <div className="border-b px-6 py-4">

//               <h2 className="text-xl font-bold">
//                 Timeline
//               </h2>

//             </div>

//             <div className="p-6">

//               <div className="relative border-l-2 border-blue-200 ml-4">

//                 <Timeline
//                   title="Ticket Created"
//                   date={ticket.dateCreated}
//                   color="bg-green-500"
//                 />

//                 <Timeline
//                   title="Acknowledged"
//                   date={ticket.acknowledgedDate}
//                   color="bg-blue-500"
//                 />

//                 <Timeline
//                   title="In Progress"
//                   date={ticket.inProgressDate}
//                   color="bg-yellow-500"
//                 />

//                 <Timeline
//                   title="Resolved"
//                   date={ticket.resolvedDate}
//                   color="bg-emerald-500"
//                 />

//                 <Timeline
//                   title="Closed"
//                   date={ticket.closedDate}
//                   color="bg-gray-500"
//                 />

//               </div>

//             </div>

//           </div>

//         </div>

//         {/* ======= PART 3 HERE ======= */}
//                 {/* Activity + Resolution */}

//         <div className="grid lg:grid-cols-3 gap-6 mt-6">

//           {/* Activity Feed */}

//           <div className="lg:col-span-2 bg-white rounded-2xl shadow">

//             <div className="border-b px-6 py-4 flex justify-between items-center">

//               <h2 className="text-xl font-bold">
//                 Activity Feed
//               </h2>

//               <span className="text-xs bg-gray-100 px-3 py-1 rounded-full">
//                 {ticket.auditorLogs?.length || 0} Updates
//               </span>

//             </div>

//             <div className="p-6 max-h-[550px] overflow-y-auto">

//               {ticket.auditorLogs?.length ? (

//                 <div className="space-y-6">

//                   {ticket.auditorLogs
//                     .slice()
//                     .reverse()
//                     .map((log, index) => (

//                       <div
//                         key={log._id || index}
//                         className="flex gap-4"
//                       >

//                         {/* Avatar */}

//                         <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-lg shrink-0">

//                           {(log.createdBy || "S").charAt(0).toUpperCase()}

//                         </div>

//                         {/* Content */}

//                         <div className="flex-1">

//                           <div className="bg-gray-50 rounded-xl border p-4">

//                             <div className="flex justify-between">

//                               <h4 className="font-semibold">
//                                 {log.createdBy || "System"}
//                               </h4>

//                               <span className="text-xs text-gray-500">
//                                 {new Date(log.createdAt).toLocaleString()}
//                               </span>

//                             </div>

//                             <p className="mt-3 whitespace-pre-wrap leading-7 text-gray-700">

//                               {log.message}

//                             </p>

//                           </div>

//                         </div>

//                       </div>

//                     ))}

//                 </div>

//               ) : (

//                 <div className="text-center py-20 text-gray-400">

//                   <div className="text-6xl mb-3">
//                     💬
//                   </div>

//                   No Activity Yet

//                 </div>

//               )}

//             </div>

//           </div>

//           {/* Resolution */}

//           <div className="space-y-6">

//             {/* Resolution */}

//             <div className="bg-white rounded-2xl shadow">

//               <div className="border-b px-6 py-4">

//                 <h2 className="text-lg font-bold">

//                   Resolution

//                 </h2>

//               </div>

//               <div className="p-6">

//                 <p className="text-gray-700 leading-7 whitespace-pre-wrap">

//                   {ticket.resolution || "-"}

//                 </p>

//               </div>

//             </div>

//             {/* Internal Comments */}

//             <div className="bg-white rounded-2xl shadow">

//               <div className="border-b px-6 py-4">

//                 <h2 className="text-lg font-bold">

//                   Internal Comments

//                 </h2>

//               </div>

//               <div className="p-6">

//                 <p className="text-gray-700 leading-7 whitespace-pre-wrap">

//                   {ticket.internalComments || "-"}

//                 </p>

//               </div>

//             </div>

//             {/* Ticket Info */}

//             <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl text-white p-6">

//               <h3 className="text-xl font-bold mb-5">

//                 Ticket Summary

//               </h3>

//               <div className="space-y-4">

//                 <div className="flex justify-between">

//                   <span>Created By</span>

//                   <strong>{ticket.createdByName || "-"}</strong>

//                 </div>

//                 <div className="flex justify-between">

//                   <span>Manager</span>

//                   <strong>{ticket.manager || "-"}</strong>

//                 </div>

//                 <div className="flex justify-between">

//                   <span>Assignee</span>

//                   <strong>{ticket.assignee || "-"}</strong>

//                 </div>

//                 <div className="flex justify-between">

//                   <span>Priority</span>

//                   <strong>{ticket.priority || "-"}</strong>

//                 </div>

//                 <div className="flex justify-between">

//                   <span>Status</span>

//                   <strong>{ticket.status || "-"}</strong>

//                 </div>

//               </div>

//             </div>

//           </div>

//         </div>
//         {/* Bottom Action Panel */}

//         <div className="mt-8 bg-white rounded-2xl shadow-lg border">

//           <div className="p-6 flex flex-wrap justify-between items-center gap-4">

//             <div>

//               <h2 className="text-xl font-bold">
//                 Ticket Actions
//               </h2>

//               <p className="text-sm text-gray-500 mt-1">
//                 Manage or export this ticket.
//               </p>

//             </div>

//             <div className="flex flex-wrap gap-3">

//               <button
//                 onClick={() => navigate(-1)}
//                 className="px-5 py-2 rounded-lg border hover:bg-gray-100 transition"
//               >
//                 Back
//               </button>

//               <button
//                 onClick={() => window.print()}
//                 className="px-5 py-2 rounded-lg bg-gray-700 text-white hover:bg-gray-800 transition"
//               >
//                 Print
//               </button>

//               <button
//                 onClick={() => navigate(`/tickets/edit/${ticket._id}`)}
//                 className="px-5 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
//               >
//                 Edit Ticket
//               </button>

//             </div>

//           </div>

//         </div>

//         {/* Statistics */}

//         <div className="grid md:grid-cols-4 gap-5 mt-8">

//           <StatCard
//             title="Created By"
//             value={ticket.createdByName || "-"}
//             color="border-blue-500"
//           />

//           <StatCard
//             title="Assigned To"
//             value={ticket.assignee || "-"}
//             color="border-green-500"
//           />

//           <StatCard
//             title="Current Status"
//             value={ticket.status || "-"}
//             color="border-yellow-500"
//           />

//           <StatCard
//             title="Priority"
//             value={ticket.priority || "-"}
//             color="border-red-500"
//           />

//         </div>

    
//       </div>

//     </div>
//   );
// }

// function SummaryCard({ title, value, color }) {
//   return (
//     <div className="bg-white rounded-xl shadow p-5 border-l-4 border-blue-600">

//       <div className="flex justify-between items-center">

//         <div>

//           <p className="text-gray-500 text-sm">
//             {title}
//           </p>

//           <h3 className="text-2xl font-bold mt-2">
//             {value || "-"}
//           </h3>

//         </div>

//         <div className={`${color} w-12 h-12 rounded-xl`} />

//       </div>

//     </div>
//   );
// }
// export default TicketView;

// function Info({ icon, title, value }) {
//   return (
//     <div className="flex gap-4">

//       <div className="bg-blue-100 text-blue-600 p-3 rounded-xl">
//         {icon}
//       </div>

//       <div>

//         <p className="text-sm text-gray-500">
//           {title}
//         </p>

//         <h3 className="font-semibold text-lg break-all">
//           {value || "-"}
//         </h3>

//       </div>

//     </div>
//   );
// }
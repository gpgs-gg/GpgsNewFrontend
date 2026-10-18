import Main from "../components/Dashboard/Main";

const Dashboard = () => {
  return (
    <div>
     <Main/>
    </div>
  );
};

export default Dashboard;






// import React, { useCallback, useEffect, useMemo, useState } from "react";
// import {
//   Activity,
//   ArrowDownRight,
//   ArrowRight,
//   ArrowUpRight,
//   BedDouble,
//   Building2,
//   CalendarDays,
//   CalendarClock,
//   CheckCircle2,
//   ChevronDown,
//   Clock3,
//   IndianRupee,
//   Lightbulb,
//   LoaderCircle,
//   MapPin,
//   RefreshCw,
//   Search,
//   TrendingUp,
//   Users,
//   Wifi,
//   AlertCircle,
// } from "lucide-react";
// import {
//   Bar,
//   BarChart,
//   CartesianGrid,
//   Cell,
//   Legend,
//   Pie,
//   PieChart,
//   ResponsiveContainer,
//   Tooltip,
//   XAxis,
//   YAxis,
// } from "recharts";

// // Change this URL according to your project API configuration.
// const API_URL = "/api/beds/upcoming-rent-hike";

// const COLORS = ["#3B82F6", "#8B5CF6", "#10B981", "#F59E0B"];

// const formatCurrency = (amount) =>
//   new Intl.NumberFormat("en-IN", {
//     style: "currency",
//     currency: "INR",
//     maximumFractionDigits: 0,
//   }).format(Number(amount) || 0);

// const formatDate = (date) => {
//   if (!date) return "—";

//   return new Date(date).toLocaleDateString("en-IN", {
//     day: "2-digit",
//     month: "short",
//     year: "numeric",
//   });
// };

// const getDaysLeft = (date) => {
//   if (!date) return null;

//   const today = new Date();
//   today.setHours(0, 0, 0, 0);

//   const target = new Date(date);
//   target.setHours(0, 0, 0, 0);

//   return Math.ceil((target - today) / (1000 * 60 * 60 * 24));
// };

// const getPropertyName = (bed) =>
//   bed?.propertyId?.propertyCode || "Unknown Property";

// const getLocation = (bed) =>
//   bed?.propertyId?.propertyLocation || "Unknown Location";

// function SectionCard({ title, subtitle, action, children, className = "" }) {
//   return (
//     <section
//       className={`min-w-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm ${className}`}
//     >
//       <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
//         <div>
//           <h2 className="text-base font-bold text-slate-800">{title}</h2>
//           {subtitle && (
//             <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
//           )}
//         </div>
//         {action}
//       </div>
//       {children}
//     </section>
//   );
// }

// function StatCard({
//   title,
//   value,
//   subtitle,
//   icon: Icon,
//   color,
//   trend,
// }) {
//   return (
//     <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md">
//       <div className="flex items-start justify-between gap-3">
//         <div className={`rounded-xl p-3 ${color}`}>
//           <Icon size={22} />
//         </div>
//         {trend && (
//           <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600">
//             <TrendingUp size={14} />
//             {trend}
//           </span>
//         )}
//       </div>

//       <p className="mt-4 text-sm font-medium text-slate-500">{title}</p>
//       <h3 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
//         {value}
//       </h3>
//       <p className="mt-2 text-xs text-slate-500">{subtitle}</p>
//     </div>
//   );
// }

// function Dashboard() {
//   const [beds, setBeds] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");
//   const [search, setSearch] = useState("");
//   const [locationFilter, setLocationFilter] = useState("All");
//   const [page, setPage] = useState(1);
//   const [apiTotal, setApiTotal] = useState(0);
//   const [totalPages, setTotalPages] = useState(1);

//   const limit = 10;

//   const fetchUpcomingRentHikes = useCallback(async () => {
//     setLoading(true);
//     setError("");

//     try {
//       const params = new URLSearchParams({
//         page: String(page),
//         limit: String(limit),
//         status: "Active",
//       });

//       if (search.trim()) {
//         params.set("search", search.trim());
//       }

//       if (locationFilter !== "All") {
//         params.set("propertyLocation", locationFilter);
//       }

//       const response = await fetch(`${API_URL}?${params.toString()}`, {
//         credentials: "include",
//         headers: {
//           Accept: "application/json",
//         },
//       });

//       if (!response.ok) {
//         throw new Error(`Unable to load rent hike data (${response.status})`);
//       }

//       const result = await response.json();

//       if (!result.success) {
//         throw new Error(result.message || "Failed to load rent hike data");
//       }

//       setBeds(Array.isArray(result.data) ? result.data : []);
//       setApiTotal(Number(result.totalRecords) || 0);
//       setTotalPages(Math.max(Number(result.totalPages) || 1, 1));
//     } catch (err) {
//       setError(err.message || "Something went wrong");
//       setBeds([]);
//       setApiTotal(0);
//     } finally {
//       setLoading(false);
//     }
//   }, [page, search, locationFilter]);

//   useEffect(() => {
//     fetchUpcomingRentHikes();
//   }, [fetchUpcomingRentHikes]);

//   useEffect(() => {
//     setPage(1);
//   }, [search, locationFilter]);

//   // The current page of upcoming hike records.
//   const upcomingBeds = useMemo(
//     () =>
//       [...beds].sort(
//         (a, b) =>
//           new Date(a.upcomingRentHikeDate || 0) -
//           new Date(b.upcomingRentHikeDate || 0),
//       ),
//     [beds],
//   );

//   const locations = useMemo(
//     () =>
//       [...new Set(beds.map(getLocation).filter((name) => name !== "Unknown Location"))],
//     [beds],
//   );

//   const locationChart = useMemo(() => {
//     const counts = {};

//     beds.forEach((bed) => {
//       const location = getLocation(bed);
//       counts[location] = (counts[location] || 0) + 1;
//     });

//     return Object.entries(counts).map(([name, count]) => ({
//       name,
//       beds: count,
//     }));
//   }, [beds]);

//   const sharingChart = useMemo(() => {
//     const counts = {};

//     beds.forEach((bed) => {
//       const type = bed.sharingType || "Other";
//       counts[type] = (counts[type] || 0) + 1;
//     });

//     return Object.entries(counts).map(([name, value]) => ({
//       name,
//       value,
//     }));
//   }, [beds]);

//   const totalRent = beds.reduce(
//     (sum, bed) => sum + (Number(bed.monthlyRent) || 0),
//     0,
//   );

//   const totalHikeAmount = beds.reduce(
//     (sum, bed) => sum + (Number(bed.upcomingRentHikeAmount) || 0),
//     0,
//   );

//   const dueSoonCount = beds.filter((bed) => {
//     const days = getDaysLeft(bed.upcomingRentHikeDate);
//     return days !== null && days >= 0 && days <= 30;
//   }).length;

//   const propertyCount = new Set(
//     beds.map((bed) => bed.propertyId?._id).filter(Boolean),
//   ).size;

//   const averageRent = beds.length ? totalRent / beds.length : 0;

//   const insights = [
//     {
//       icon: CalendarClock,
//       text: `${apiTotal} beds have an upcoming rent hike in the next 3 months.`,
//     },
//     {
//       icon: Clock3,
//       text: `${dueSoonCount} beds are due for a hike within the next 30 days on this page.`,
//     },
//     {
//       icon: IndianRupee,
//       text: `Average monthly rent in these records: ${formatCurrency(averageRent)}.`,
//     },
//     {
//       icon: Building2,
//       text: `${propertyCount} distinct properties appear on this page.`,
//     },
//   ];

//   const viewAll = () => {
//     // Update this route to your application's actual rent hike listing page.
//     window.location.href = "/beds/upcoming-rent-hike";
//   };

//   return (
//     <main className="min-h-scree">
//       <div className="mx-auto ">
//         {/* Header */}
//         <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
//           <div>
//             <div className="flex items-center gap-3">
//               <div className="rounded-xl bg-blue-600 p-3 text-white shadow-sm">
//                 <Building2 size={26} />
//               </div>
//               <div>
//                 <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
//                   Dashboard
//                 </h1>
//                 <p className="mt-1 text-sm text-slate-500">
//                   Welcome back! Here&apos;s your property overview.
//                 </p>
//               </div>
//             </div>
//           </div>

//           <div className="flex flex-wrap items-center gap-3">
//             <span className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-600 shadow-sm">
//               <CalendarDays className="mr-2 inline" size={16} />
//               {formatDate(new Date())}
//             </span>
//             <button
//               onClick={fetchUpcomingRentHikes}
//               disabled={loading}
//               className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-60"
//             >
//               <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
//               Refresh
//             </button>
//           </div>
//         </header>

//         {/* Main grid */}
//         <div className="grid grid-cols-1 items-start gap-5 xl:grid-cols-12">
//           <div className="min-w-0 space-y-5 xl:col-span-9">
//             {/* KPI cards */}
//             <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 2xl:grid-cols-4">
//               <StatCard
//                 title="Upcoming Hike Beds"
//                 value={loading ? "…" : apiTotal}
//                 subtitle="Within the next 3 months"
//                 icon={BedDouble}
//                 color="bg-blue-50 text-blue-600"
//               />
//               <StatCard
//                 title="Hikes Within 30 Days"
//                 value={loading ? "…" : dueSoonCount}
//                 subtitle="On the current page"
//                 icon={CalendarClock}
//                 color="bg-orange-50 text-orange-600"
//               />
//               <StatCard
//                 title="Current Monthly Rent"
//                 value={loading ? "…" : formatCurrency(totalRent)}
//                 subtitle="Loaded hike records only"
//                 icon={IndianRupee}
//                 color="bg-emerald-50 text-emerald-600"
//               />
//               <StatCard
//                 title="Expected Rent Increase"
//                 value={loading ? "…" : formatCurrency(totalHikeAmount)}
//                 subtitle="Loaded hike records only"
//                 icon={TrendingUp}
//                 color="bg-violet-50 text-violet-600"
//               />
//             </div>

//             {/* Charts */}
//             <div className="grid grid-cols-1 gap-5 lg:grid-cols-5">
//               <SectionCard
//                 title="Beds by Location"
//                 subtitle="Upcoming hike records by property location"
//                 className="lg:col-span-3"
//               >
//                 <div className="h-72 w-full">
//                   {locationChart.length ? (
//                     <ResponsiveContainer width="100%" height="100%">
//                       <BarChart
//                         data={locationChart}
//                         margin={{ top: 10, right: 8, left: -18, bottom: 8 }}
//                       >
//                         <CartesianGrid
//                           strokeDasharray="3 3"
//                           vertical={false}
//                           stroke="#E2E8F0"
//                         />
//                         <XAxis
//                           dataKey="name"
//                           tick={{ fontSize: 11, fill: "#64748B" }}
//                           axisLine={false}
//                           tickLine={false}
//                         />
//                         <YAxis
//                           allowDecimals={false}
//                           tick={{ fontSize: 11, fill: "#64748B" }}
//                           axisLine={false}
//                           tickLine={false}
//                         />
//                         <Tooltip />
//                         <Bar dataKey="beds" name="Beds" radius={[6, 6, 0, 0]}>
//                           {locationChart.map((entry, index) => (
//                             <Cell
//                               key={entry.name}
//                               fill={COLORS[index % COLORS.length]}
//                             />
//                           ))}
//                         </Bar>
//                       </BarChart>
//                     </ResponsiveContainer>
//                   ) : (
//                     <EmptyChart loading={loading} />
//                   )}
//                 </div>
//               </SectionCard>

//               <SectionCard
//                 title="Sharing Type"
//                 subtitle="Distribution on current page"
//                 className="lg:col-span-2"
//               >
//                 <div className="h-72 w-full">
//                   {sharingChart.length ? (
//                     <ResponsiveContainer width="100%" height="100%">
//                       <PieChart>
//                         <Pie
//                           data={sharingChart}
//                           dataKey="value"
//                           nameKey="name"
//                           innerRadius={65}
//                           outerRadius={95}
//                           paddingAngle={4}
//                         >
//                           {sharingChart.map((entry, index) => (
//                             <Cell
//                               key={entry.name}
//                               fill={COLORS[index % COLORS.length]}
//                             />
//                           ))}
//                         </Pie>
//                         <Tooltip />
//                         <Legend
//                           verticalAlign="bottom"
//                           iconType="circle"
//                           wrapperStyle={{ fontSize: 12 }}
//                         />
//                       </PieChart>
//                     </ResponsiveContainer>
//                   ) : (
//                     <EmptyChart loading={loading} />
//                   )}
//                 </div>
//               </SectionCard>
//             </div>

//             {/* Upcoming hike details table */}
//             <SectionCard
//               title="Upcoming Rent Hike Details"
//               subtitle={`${apiTotal} matching beds`}
//               action={
//                 <button
//                   onClick={viewAll}
//                   className="inline-flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-800"
//                 >
//                   View All <ArrowRight size={16} />
//                 </button>
//               }
//             >
//               <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-2">
//                 <div className="relative">
//                   <Search
//                     size={17}
//                     className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
//                   />
//                   <input
//                     value={search}
//                     onChange={(event) => setSearch(event.target.value)}
//                     placeholder="Search property, room or bed..."
//                     className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
//                   />
//                 </div>

//                 <div className="relative">
//                   <MapPin
//                     size={17}
//                     className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
//                   />
//                   <select
//                     value={locationFilter}
//                     onChange={(event) => setLocationFilter(event.target.value)}
//                     className="w-full appearance-none rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-10 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
//                   >
//                     <option value="All">All Locations</option>
//                     {locations.map((location) => (
//                       <option key={location} value={location}>
//                         {location}
//                       </option>
//                     ))}
//                   </select>
//                   <ChevronDown
//                     size={16}
//                     className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
//                   />
//                 </div>
//               </div>

//               {error ? (
//                 <ErrorState message={error} onRetry={fetchUpcomingRentHikes} />
//               ) : (
//                 <>
//                   <div className="overflow-x-auto rounded-xl border border-slate-100">
//                     <table className="w-full min-w-[850px] text-left text-sm">
//                       <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
//                         <tr>
//                           <th className="px-4 py-3 font-semibold">Property</th>
//                           <th className="px-4 py-3 font-semibold">Room</th>
//                           <th className="px-4 py-3 font-semibold">Bed</th>
//                           <th className="px-4 py-3 font-semibold">Rent</th>
//                           <th className="px-4 py-3 font-semibold">Hike Amount</th>
//                           <th className="px-4 py-3 font-semibold">Hike Date</th>
//                           <th className="px-4 py-3 font-semibold">Days Left</th>
//                         </tr>
//                       </thead>
//                       <tbody className="divide-y divide-slate-100">
//                         {loading ? (
//                           <tr>
//                             <td colSpan={7} className="px-4 py-12 text-center">
//                               <LoaderCircle className="mx-auto animate-spin text-blue-600" size={24} />
//                               <p className="mt-2 text-sm text-slate-500">Loading rent hike records...</p>
//                             </td>
//                           </tr>
//                         ) : upcomingBeds.length ? (
//                           upcomingBeds.map((bed) => {
//                             const days = getDaysLeft(bed.upcomingRentHikeDate);

//                             return (
//                               <tr
//                                 key={bed._id}
//                                 className="transition hover:bg-slate-50"
//                               >
//                                 <td className="px-4 py-4">
//                                   <p className="font-semibold text-slate-800">
//                                     {getPropertyName(bed)}
//                                   </p>
//                                   <p className="mt-1 text-xs text-slate-500">
//                                     {getLocation(bed)}
//                                   </p>
//                                 </td>
//                                 <td className="px-4 py-4 text-slate-600">
//                                   {bed.roomNo || "—"}
//                                 </td>
//                                 <td className="px-4 py-4 text-slate-600">
//                                   {bed.bedNo || "—"}
//                                 </td>
//                                 <td className="whitespace-nowrap px-4 py-4 font-medium text-slate-800">
//                                   {formatCurrency(bed.monthlyRent)}
//                                 </td>
//                                 <td className="whitespace-nowrap px-4 py-4 font-semibold text-emerald-600">
//                                   {bed.upcomingRentHikeAmount == null
//                                     ? "—"
//                                     : `+${formatCurrency(bed.upcomingRentHikeAmount)}`}
//                                 </td>
//                                 <td className="whitespace-nowrap px-4 py-4 text-slate-600">
//                                   {formatDate(bed.upcomingRentHikeDate)}
//                                 </td>
//                                 <td className="px-4 py-4">
//                                   {days !== null && (
//                                     <span
//                                       className={`whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${
//                                         days <= 7
//                                           ? "bg-red-50 text-red-700"
//                                           : days <= 30
//                                             ? "bg-orange-50 text-orange-700"
//                                             : "bg-blue-50 text-blue-700"
//                                       }`}
//                                     >
//                                       {days === 0
//                                         ? "Today"
//                                         : `${days} days`}
//                                     </span>
//                                   )}
//                                 </td>
//                               </tr>
//                             );
//                           })
//                         ) : (
//                           <tr>
//                             <td
//                               colSpan={7}
//                               className="px-4 py-12 text-center text-slate-500"
//                             >
//                               <CalendarClock className="mx-auto mb-3 text-slate-300" size={34} />
//                               No upcoming rent hikes found.
//                             </td>
//                           </tr>
//                         )}
//                       </tbody>
//                     </table>
//                   </div>

//                   <div className="mt-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
//                     <p className="text-sm text-slate-500">
//                       Page {page} of {totalPages} · {apiTotal} records
//                     </p>
//                     <div className="flex gap-2">
//                       <button
//                         disabled={page <= 1 || loading}
//                         onClick={() => setPage((p) => p - 1)}
//                         className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
//                       >
//                         Previous
//                       </button>
//                       <button
//                         disabled={page >= totalPages || loading}
//                         onClick={() => setPage((p) => p + 1)}
//                         className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
//                       >
//                         Next
//                       </button>
//                     </div>
//                   </div>
//                 </>
//               )}
//             </SectionCard>
//           </div>

//           {/* Right column */}
//           <aside className="min-w-0 space-y-5 xl:col-span-3">
//             {/* Highlighted rent hike widget */}
//             <section className="overflow-hidden rounded-2xl border border-rose-200 bg-gradient-to-br from-rose-50 via-white to-orange-50 p-5 shadow-sm">
//               <div className="flex items-start justify-between gap-2">
//                 <div className="flex items-start gap-3">
//                   <div className="rounded-xl bg-rose-100 p-2.5 text-rose-600">
//                     <CalendarDays size={23} />
//                   </div>
//                   <div>
//                     <h2 className="font-bold text-slate-900">
//                       Upcoming Rent Hike
//                     </h2>
//                     <p className="mt-1 text-xs leading-5 text-slate-500">
//                       Rent revisions in the next 3 months
//                     </p>
//                   </div>
//                 </div>
//                 <span className="shrink-0 rounded-full bg-rose-100 px-2 py-1 text-[10px] font-semibold text-rose-700">
//                   3 Months
//                 </span>
//               </div>

//               <div className="mt-6 flex items-center justify-between gap-2">
//                 <div>
//                   <p className="text-4xl font-bold tracking-tight text-rose-800">
//                     {loading ? "…" : apiTotal}
//                   </p>
//                   <p className="mt-1 text-sm text-rose-900">Beds to review</p>
//                 </div>
//                 <button
//                   onClick={viewAll}
//                   className="inline-flex items-center gap-1 rounded-xl border border-rose-200 bg-white px-3 py-2 text-xs font-semibold text-rose-700 shadow-sm hover:bg-rose-50"
//                 >
//                   View All <ArrowUpRight size={15} />
//                 </button>
//               </div>

//               <div className="mt-5 border-t border-rose-200 pt-4">
//                 <div className="flex items-center gap-2 text-sm text-slate-600">
//                   <CalendarClock size={16} className="text-rose-600" />
//                   <span>
//                     {formatDate(new Date())} –{" "}
//                     {formatDate(
//                       new Date(
//                         new Date().setMonth(new Date().getMonth() + 3),
//                       ),
//                     )}
//                   </span>
//                 </div>
//                 <p className="mt-3 text-xs leading-5 text-slate-500">
//                   Review rent hike amounts and dates before updating client
//                   rents.
//                 </p>
//               </div>
//             </section>

//             {/* Quick insights */}
//             <SectionCard title="Quick Insights" subtitle="Based on loaded data">
//               <div className="space-y-4">
//                 {insights.map(({ icon: Icon, text }, index) => (
//                   <div key={index} className="flex items-start gap-3">
//                     <div className="mt-0.5 rounded-full bg-blue-50 p-1.5 text-blue-600">
//                       <Icon size={15} />
//                     </div>
//                     <p className="text-sm leading-5 text-slate-600">{text}</p>
//                   </div>
//                 ))}
//               </div>
//             </SectionCard>

//             {/* Recent activity placeholder */}
//             <SectionCard
//               title="Recent Activity"
//               subtitle="Activity feed integration pending"
//               action={
//                 <Activity size={18} className="text-slate-400" />
//               }
//             >
//               <div className="space-y-5">
//                 <ActivityItem
//                   icon={BedDouble}
//                   color="bg-emerald-50 text-emerald-600"
//                   title="Bed management"
//                   description="Recent bed creation and edits"
//                 />
//                 <ActivityItem
//                   icon={IndianRupee}
//                   color="bg-blue-50 text-blue-600"
//                   title="Rent updates"
//                   description="Monthly rent and deposit changes"
//                 />
//                 <ActivityItem
//                   icon={CalendarClock}
//                   color="bg-violet-50 text-violet-600"
//                   title="Rent hike planning"
//                   description="Upcoming rent hike dates and amounts"
//                 />
//               </div>
//               <p className="mt-4 rounded-lg bg-slate-50 p-3 text-xs leading-5 text-slate-500">
//                 Connect your Bed worklogs API here to show real user activity.
//               </p>
//             </SectionCard>

//             {/* Useful links */}
//             <SectionCard title="Quick Access">
//               <div className="space-y-2">
//                 <QuickLink
//                   icon={BedDouble}
//                   label="Manage Beds"
//                   href="/beds"
//                 />
//                 <QuickLink
//                   icon={Building2}
//                   label="Manage Properties"
//                   href="/properties"
//                 />
//                 <QuickLink
//                   icon={Users}
//                   label="Manage Clients"
//                   href="/clients"
//                 />
//                 <QuickLink
//                   icon={Wifi}
//                   label="Electricity / EB"
//                   href="/EBCalculationData"
//                 />
//               </div>
//             </SectionCard>
//           </aside>
//         </div>

//         <footer className="border-t border-slate-200 pt-4 text-center text-xs text-slate-400">
//           GPGS Property Management · Dashboard
//         </footer>
//       </div>
//     </main>
//   );
// }

// function ActivityItem({ icon: Icon, color, title, description }) {
//   return (
//     <div className="flex items-start gap-3">
//       <div className={`rounded-xl p-2.5 ${color}`}>
//         <Icon size={18} />
//       </div>
//       <div className="min-w-0">
//         <p className="text-sm font-semibold text-slate-800">{title}</p>
//         <p className="mt-1 text-xs leading-5 text-slate-500">{description}</p>
//       </div>
//     </div>
//   );
// }

// function QuickLink({ icon: Icon, label, href }) {
//   return (
//     <a
//       href={href}
//       className="flex items-center justify-between rounded-xl border border-slate-100 p-3 transition hover:border-blue-200 hover:bg-blue-50/50"
//     >
//       <span className="flex items-center gap-3 text-sm font-medium text-slate-700">
//         <Icon size={17} className="text-slate-500" />
//         {label}
//       </span>
//       <ArrowUpRight size={16} className="text-slate-400" />
//     </a>
//   );
// }

// function EmptyChart({ loading }) {
//   return (
//     <div className="flex h-full flex-col items-center justify-center text-center text-sm text-slate-400">
//       {loading ? (
//         <LoaderCircle size={28} className="animate-spin text-blue-500" />
//       ) : (
//         <CalendarClock size={30} className="mb-2 text-slate-300" />
//       )}
//       <p className="mt-2">
//         {loading ? "Loading chart..." : "No data available"}
//       </p>
//     </div>
//   );
// }

// function ErrorState({ message, onRetry }) {
//   return (
//     <div className="rounded-xl border border-red-100 bg-red-50 p-5 text-center">
//       <AlertCircle className="mx-auto text-red-500" size={28} />
//       <p className="mt-2 text-sm font-semibold text-red-700">
//         Could not load rent hike details
//       </p>
//       <p className="mt-1 break-words text-xs text-red-600">{message}</p>
//       <button
//         onClick={onRetry}
//         className="mt-3 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
//       >
//         Try Again
//       </button>
//     </div>
//   );
// }

// export default Dashboard;

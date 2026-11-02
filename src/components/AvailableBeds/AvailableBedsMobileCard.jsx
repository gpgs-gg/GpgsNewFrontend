import React from "react";
import {
    MapPin,
    BedDouble,
    DoorOpen,
    UserRound,
    CalendarDays,
} from "lucide-react";
import { formatDate } from "../../utils/dateFormatter";

const AvailableBedsMobileCard = ({ item }) => {
    const getRedFlagStatus = () => {
        const nld = item?.client?.noticeLastDate;

        if (!nld) return "Red Flag";

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const nldDate = new Date(nld);
        nldDate.setHours(0, 0, 0, 0);

        const diffDays = (nldDate - today) / (1000 * 60 * 60 * 24);

        return diffDays <= 15 ? "Red Flag" : "Clear";
    };

    const getAvailability = () => {
        const cvd = item?.client?.clientVacatingDate;

        if (!cvd) return "Immediate Available";

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const cvdDate = new Date(cvd);
        cvdDate.setHours(0, 0, 0, 0);

        return cvdDate <= today ? "Immediate Available" : "CVD";
    };

    const formatAmount = (amount) =>
        `₹${(Number(amount) || 0).toLocaleString("en-IN")}`;

    const redFlag = getRedFlagStatus();
    const availability = getAvailability();

    const Detail = ({ label, value }) => (
        <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                {label}
            </p>
            <p className="mt-1 break-words text-sm font-medium text-gray-800">
                {value || "-"}
            </p>
        </div>
    );

    return (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            {/* HEADER */}
            <div className="flex items-start justify-between gap-3 border-b border-gray-100 bg-gray-50/70 p-3">
                <div className="min-w-0">
                    <h3 className="text-base font-bold text-gray-900">
                        {item?.propertyId?.propertyCode || "Unknown Property"}
                    </h3>

                    <p className="mt-1 flex items-center gap-1 text-xs text-gray-500">
                        <MapPin size={13} className="shrink-0" />
                        <span className="truncate">
                            {item?.propertyId?.propertyLocation || "-"}
                        </span>
                    </p>
                </div>

                <span className="shrink-0 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
                    {item?.gender || "-"}
                </span>
            </div>

            <div className="space-y-3 p-3">
                {/* STATUS */}
                <div className="flex flex-wrap items-center gap-2">
                    <span
                        className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${availability === "Immediate Available"
                                ? "bg-green-100 text-green-700"
                                : "bg-orange-100 text-orange-700"
                            }`}
                    >
                        {availability}
                    </span>

                    <span
                        className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${redFlag === "Red Flag"
                                ? "bg-red-100 text-red-700"
                                : "bg-emerald-100 text-emerald-700"
                            }`}
                    >
                        {redFlag}
                    </span>

                    {item?.sharingType && (
                        <span className="rounded-full bg-purple-50 px-2.5 py-1 text-[11px] font-semibold text-purple-700">
                            {item.sharingType}
                        </span>
                    )}
                </div>

                {/* RENT AND DEPOSIT */}
                <div className="grid grid-cols-2 gap-3 rounded-lg border border-gray-100 bg-gray-50 p-3">
                    <div>
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                            Monthly Rent
                        </p>
                        <p className="mt-1 text-lg font-bold text-gray-900">
                            {formatAmount(item?.monthlyRent)}
                        </p>
                    </div>

                    <div className="border-l border-gray-200 pl-3">
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                            Deposit Amount
                        </p>
                        <p className="mt-1 text-lg font-bold text-gray-900">
                            {formatAmount(item?.depositAmount)}
                        </p>
                    </div>
                </div>

                {/* BED DETAILS */}
                <div>
                    <p className="mb-2 text-xs font-bold uppercase tracking-wider text-gray-500">
                        Bed Details
                    </p>

                    <div className="grid grid-cols-3 gap-x-3 gap-y-3">
                        <Detail
                            label="Room No"
                            value={
                                <span className="inline-flex items-center gap-1">
                                    <DoorOpen size={14} />
                                    {item?.roomNo || "-"}
                                </span>
                            }
                        />

                        <Detail
                            label="Bed No"
                            value={
                                <span className="inline-flex items-center gap-1">
                                    <BedDouble size={14} />
                                    {item?.bedNo || "-"}
                                </span>
                            }
                        />

                        <Detail label="Sharing" value={item?.sharingType} />
                        <Detail label="AC Room" value={item?.acRoom} />
                        <Detail label="Bath Attached" value={item?.bathAttached} />
                        <Detail label="Available From" value={availability} />
                        <Detail
                            label="CVD"
                            value={
                                item?.client?.clientVacatingDate
                                    ? formatDate(item.client.clientVacatingDate)
                                    : "-"
                            }
                        />
                        <Detail
                            label="NLD"
                            value={
                                item?.client?.noticeLastDate
                                    ? formatDate(item.client.noticeLastDate)
                                    : "-"
                            }
                        />
                        <Detail
                            label="NSD"
                            value={
                                item?.client?.noticeStartDate
                                    ? formatDate(item.client.noticeStartDate)
                                    : "-"
                            }
                        />
                    </div>
                </div>

                {/* CLIENT DETAILS */}
                <div className="border-t border-gray-100 pt-3">
          <p className="mb-2 flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-gray-500">
            <UserRound size={14} />
            Existing Client Details
          </p>

          <div className="grid grid-cols-2 gap-x-3 gap-y-3">
            <Detail label="Client Name" value={item?.client?.fullName} />
            <Detail
              label="Rent DOJ"
              value={
                item?.client?.clientDoj
                  ? formatDate(item.client.clientDoj)
                  : "-"
              }
            />
        
          </div>
        </div>

                {/* UPCOMING RENT HIKE */}
                {(item?.upcomingRentHikeDate || item?.upcomingRentHikeAmount) && (
                    <div className="flex items-center justify-between gap-3 border-t border-gray-100 pt-3">
                        <div>
                            <p className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                                <CalendarDays size={12} />
                                Upcoming Rent Hike Date
                            </p>
                            <p className="mt-1 text-sm font-medium text-gray-800">
                                {item?.upcomingRentHikeDate
                                    ? formatDate(item.upcomingRentHikeDate)
                                    : "-"}
                            </p>
                        </div>

                        <div className="text-right">
                            <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                                Hike Amount
                            </p>
                            <p className="mt-1 text-sm font-bold text-gray-800">
                                {formatAmount(item?.upcomingRentHikeAmount)}
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AvailableBedsMobileCard;
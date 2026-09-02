import React, { useEffect, useState } from 'react'
import { Controller } from 'react-hook-form';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { toast } from 'react-toastify';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { AsyncPaginate } from 'react-select-async-paginate';
import { selectStyles } from '../../utils/selectStyles';
import { getPropertyDropdown } from '../properties/services';
import Loader from '../common/Loader';
import { useACConsumptionData, useClientThrowPropertyData } from '../EbCalculator/services';
import { Eye, EyeOff } from "lucide-react";
const EbAttendance = ({ property, onFreeEBChange }) => {
    const normalizeDate = (d) => {
        if (!d) return null;
        const nd = new Date(d);
        nd.setHours(0, 0, 0, 0);
        return nd;
    };

    const [flatTotalUnits, setFlatTotalUnits] = useState("");
    const [showAttendance, setShowAttendance] = useState(false);
    const [edCalSheetName, setEdCalSheetName] = useState("");
    const [error, setError] = useState("");
    const [dates, setDates] = useState({});
    const [headerDays, setHeaderDays] = useState([]);
    const [adjustedFreeEB, setAdjustedFreeEB] = useState({});
    const [adjustedEB, setAdjustedEB] = useState({});
    const [electricityAmt, setElectricityAmt] = useState(0);
    const [ebToBeRecovered, setEbToBeRecovered] = useState(0);
    const [totalUnits, setTotalUnits] = useState(0);
    const [comments1, setComments1] = useState({});
    const [comments2, setComments2] = useState({});
    const [clients, setClients] = useState([]);
    const [selectedProperty, setSelectedProperty] = useState(null);
    const [sheetData, setSheetData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isACProperty, setIsACProperty] = useState(false);

    const {
        control,
        watch,
        setValue
    } = useForm({
        resolver: yupResolver(),
    });

    useEffect(() => {
        if (!property?._id) return;
        setValue("propertyId", {
            value: property?.propertyId?._id,
            label: property.propertyCode,
            location: property.propertyLocation,
        });
    }, [property, setValue]);

    const propertyId = watch("propertyId");

    // API hook to fetch clients by property
    const { data: clientData, isLoading: isLoadinClientThrowProperty, refetch: refetchClients } =
        useClientThrowPropertyData(propertyId?.value);

    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    // API hook to fetch AC consumption data - only when AC clients exist
    const {
        data: acConsumptionData,
        isLoading: isLoadinACData,
        refetch: refetchACData
    } = useACConsumptionData(
        propertyId?.value,
        startDate,
        endDate,
        isACProperty // Only fetch if AC property
    );

    const formatLocalDate = (date) => {
        if (!date) return "";
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    };

    const formatDateForInput = (date) => {
        if (!date) return "";
        const d = new Date(date);
        const year = d.getFullYear();
        const month = (d.getMonth() + 1).toString().padStart(2, "0");
        const day = d.getDate().toString().padStart(2, "0");
        return `${year}-${month}-${day}`;
    };

    // Set clients when API data arrives
    useEffect(() => {
        if (clientData?.data?.clients) {
            setClients(clientData.data.clients);

            // Set property data
            if (clientData.data.property) {
                setSelectedProperty(clientData.data.property);
            }

            // Check if there are AC clients
            const acClients = clientData.data.clients.filter(ele =>
                ele.bedId?.acRoom?.toLowerCase().trim() === "ac"
            );

            setIsACProperty(acClients.length > 0);

            // If AC clients exist and we have dates, fetch AC data
            if (acClients.length > 0 && startDate && endDate) {
                refetchACData();
            }
        }
    }, [clientData]);


    // Set bill dates from property utility
    useEffect(() => {
        if (!selectedProperty?.utility?.ebStartCycle || !selectedProperty?.utility?.ebEndCycle) return;

        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth();

        const lastDayOfMonth = (y, m) => new Date(y, m + 1, 0).getDate();

        const startDay = Math.min(
            selectedProperty.utility.ebStartCycle,
            lastDayOfMonth(year, month - 1)
        );

        const endDay = Math.min(
            selectedProperty.utility.ebEndCycle,
            lastDayOfMonth(year, month)
        );

        const start = new Date(year, month - 1, startDay);
        const end = new Date(year, month, endDay);

        setStartDate(formatLocalDate(start));
        setEndDate(formatLocalDate(end));
    }, [selectedProperty]);

    // Refetch AC data when dates change
    useEffect(() => {
        if (isACProperty && propertyId?.value && startDate && endDate && clients.length > 0) {
            refetchACData();
        }
    }, [startDate, endDate, propertyId?.value, isACProperty]);

    // Set ED Calculation Sheet Name
    useEffect(() => {
        if (endDate) {
            const date = new Date(endDate);
            date.setMonth(date.getMonth() + 1);
            const month = date.toLocaleString("en-US", { month: "short" });
            const year = date.getFullYear();
            setEdCalSheetName(`${month}${year}`);
        } else {
            setEdCalSheetName("");
        }
    }, [endDate]);

    // Validate date range
    useEffect(() => {
        if (startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            const diffDays = (end - start) / (1000 * 60 * 60 * 24);
            if (diffDays < 15) {
                setError("Date difference must be at least 15 days");
            } else {
                setError("");
            }
        }
    }, [startDate, endDate]);

    // Generate header days
    useEffect(() => {
        if (startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);

            let totalDays = Math.floor((end - start) / (1000 * 60 * 60 * 24)) + 1;
            totalDays = Math.min(totalDays, 31);

            if (totalDays > 31) {
                toast.error(`Invalid date range. Days count = ${totalDays}. Must be between 28-31 days.`);
                setHeaderDays([]);
                return;
            }

            const days = [];
            let current = new Date(start);
            while (current <= end && days.length < totalDays) {
                days.push({ date: new Date(current) });
                current.setDate(current.getDate() + 1);
            }

            setHeaderDays(days);
        } else {
            setHeaderDays([]);
        }
    }, [startDate, endDate]);




    // Set vacation dates from clients data
    useEffect(() => {
        if (clients && clients.length) {
            const newDates = {};
            clients
                .filter(ele => ele.fullName && ele.fullName.trim() !== "")
                .forEach(client => {
                    if (client.vacations && client.vacations.length > 0) {
                        client.vacations.forEach((vacation, index) => {
                            if (vacation.vacationStartDate1 || vacation.vacationLastDate1) {
                                newDates[`${client._id}_${client.ebDoj}_VSD1_${index}`] = {
                                    startDate: formatDateForInput(vacation.vacationStartDate1 || ""),
                                    endDate: formatDateForInput(vacation.vacationLastDate1 || ""),
                                };
                            }
                            if (vacation.vacationStartDate2 || vacation.vacationLastDate2) {
                                newDates[`${client._id}_${client.ebDoj}_VSD2_${index}`] = {
                                    startDate: formatDateForInput(vacation.vacationStartDate2 || ""),
                                    endDate: formatDateForInput(vacation.vacationLastDate2 || ""),
                                };
                            }
                        });
                    }
                });
            setDates(newDates);
        }
    }, [clients]);

    // Check if client is on vacation
    const isClientOnVacation = (client, date) => {
        if (!client.vacations) return false;
        const currentDate = normalizeDate(date);

        for (const vacation of client.vacations) {
            // Check VSD1
            if (vacation.vacationStartDate1 && vacation.vacationLastDate1) {
                const vStart = normalizeDate(new Date(vacation.vacationStartDate1));
                const vEnd = normalizeDate(new Date(vacation.vacationLastDate1));
                const vacationDays = Math.floor((vEnd - vStart) / (1000 * 60 * 60 * 24)) + 1;

                if (vacationDays >= 15 && currentDate >= vStart && currentDate <= vEnd) {
                    return true;
                }
            }

            // Check VSD2
            if (vacation.vacationStartDate2 && vacation.vacationLastDate2) {
                const vStart = normalizeDate(new Date(vacation.vacationStartDate2));
                const vEnd = normalizeDate(new Date(vacation.vacationLastDate2));
                const vacationDays = Math.floor((vEnd - vStart) / (1000 * 60 * 60 * 24)) + 1;

                if (vacationDays >= 15 && currentDate >= vStart && currentDate <= vEnd) {
                    return true;
                }
            }
        }
        return false;
    };

    // Get present count for date
    const getPresentCountForDate = (date) => {
        if (!clients?.length) return 0;

        const currentDate = normalizeDate(date);

        return clients
            .filter(ele => ele.fullName && ele.fullName.trim() !== "")
            .reduce((count, ele) => {
                const doj = ele.ebDoj ? normalizeDate(new Date(ele.ebDoj)) : null;
                if (doj && currentDate < doj) return count;
                if (isClientOnVacation(ele, currentDate)) return count;
                return count + 1;
            }, 0);
    };

    // Get client EB for date
    const getClientEBForDate = (client, date) => {
        const currentDate = normalizeDate(date);
        const billEnd = endDate ? normalizeDate(endDate) : null;

        // Check DOJ
        const doj = client.ebDoj ? normalizeDate(new Date(client.ebDoj)) : null;
        if (doj && billEnd && doj > billEnd) return 0;
        if (doj && currentDate < doj) return 0;

        // Check vacation
        if (isClientOnVacation(client, currentDate)) return 0;

        // Get present count
        const presentCount = getPresentCountForDate(date);
        if (!presentCount) return 0;

        // Calculate per day EB
        const totalDaysCount = headerDays.length;

        // For AC property: use CommonTotalEB from sheetData
        // For non-AC: use the entered electricity amount
        let ebToRecover = 0;
        if (isACProperty && sheetData) {
            ebToRecover = Number(sheetData.CommonTotalEB) || 0;
        } else {
            ebToRecover = Number(ebToBeRecovered) || 0;
        }

        const perDayEB = totalDaysCount > 0
            ? ebToRecover / totalDaysCount
            : 0;

        return perDayEB / presentCount;
    };

    // =====================================================
    // FREE EB CALCULATION
    // =====================================================

    // Non-AC ke liye existing calculation
    const totalNormalFreeEB = clients
        ?.filter(ele => ele.fullName && ele.fullName.trim() !== "")
        .reduce((sum, ele) => {
            const billEnd = endDate ? normalizeDate(endDate) : null;
            const doj = ele.ebDoj ? normalizeDate(new Date(ele.ebDoj)) : null;
            const cvd = ele.clientVacatingDate ? normalizeDate(new Date(ele.clientVacatingDate)) : null;  // ✅ ADD

            if (doj && billEnd && doj > billEnd) return sum;

            const freeEBPerDay = Number(ele.bedId?.freeEbAsPerBed) || 0;

            const totalDays = headerDays.reduce((total, d) => {
                const currentDate = normalizeDate(d.date);

                // ✅ DOJ Check
                if (doj && currentDate < doj) return total;

                // ✅ CVD Check (ADD THIS)
                if (cvd && currentDate > cvd) return total;

                // ✅ Vacation Check
                if (isClientOnVacation(ele, currentDate)) return total;

                return total + 1;
            }, 0);

            return sum + totalDays * freeEBPerDay;
        }, 0) || 0;

    // Adjusted Free EB - Non AC
    const totalAdjustedFreeEB = clients
        ?.filter(ele => ele.fullName && ele.fullName.trim() !== "")
        .reduce((sum, ele) => {
            const key = `${ele._id}_${ele.ebDoj}`;

            return sum + (
                Number(adjustedFreeEB[key]) || 0
            );
        }, 0) || 0;
    const totalFreeEB =
        totalNormalFreeEB + totalAdjustedFreeEB;
    useEffect(() => {
        onFreeEBChange?.(Number(totalFreeEB) || 0);
    }, [totalFreeEB, onFreeEBChange]);
    // Get per-head free EB
    const getPerHeadFreeEB = (client) => {
        const billEnd = endDate ? normalizeDate(endDate) : null;
        const doj = client.ebDoj ? normalizeDate(new Date(client.ebDoj)) : null;
        const cvd = client.clientVacatingDate ? normalizeDate(new Date(client.clientVacatingDate)) : null;  // ✅ ADD

        if (doj && billEnd && doj > billEnd) return 0;

        const freeEBPerDay = client.bedId?.freeEbAsPerBed || 0;

        const totalDays = headerDays.reduce((total, d) => {
            const currentDate = normalizeDate(d.date);

            // ✅ DOJ Check
            if (doj && currentDate < doj) return total;

            // ✅ CVD Check (ADD THIS)
            if (cvd && currentDate > cvd) return total;

            // ✅ Vacation Check
            if (isClientOnVacation(client, currentDate)) return total;

            return total + 1;
        }, 0);

        return totalDays * freeEBPerDay;
    };

    // Calculate total days for client
    const calculateTotalDays = ({ ele }) => {
        const doj = ele.ebDoj ? normalizeDate(new Date(ele.ebDoj)) : null;
        const cvd = ele.clientVacatingDate ? normalizeDate(new Date(ele.clientVacatingDate)) : null;
        console.log(cvd)
        return headerDays.reduce((total, d) => {
            const currentDate = normalizeDate(d.date);

            if (doj && currentDate < doj) return total;
            if (cvd && currentDate > cvd) return total; // ✅ CVD
            if (isClientOnVacation(ele, currentDate)) return total;

            return total + 1;
        }, 0);
    };

    // Calculate EB to be recovered
    useEffect(() => {

        // =====================================================
        // AC PROPERTY
        // API/Dummy se direct EBToBeRecovered
        // =====================================================
        if (isACProperty && sheetData) {
            setEbToBeRecovered(
                Number(sheetData.EBToBeRecovered) || 0
            );

            return;
        }


        // =====================================================
        // NON-AC PROPERTY
        // Existing calculation same rahega
        // =====================================================
        const flatTotalEB = Number(electricityAmt) || 0;
        const freeEB = Number(totalFreeEB) || 0;

        const calculatedEBToBeRecovered = Math.max(
            flatTotalEB - freeEB,
            0
        ).toFixed(2);

        setEbToBeRecovered(calculatedEBToBeRecovered);

    }, [
        totalFreeEB,
        electricityAmt,
        sheetData,
        isACProperty
    ]);



    const inputClass = 'w-full px-3 py-2 mt-1 border border-gray-400 rounded-md shadow focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-gray-400';

    return (
        <>
            <div className='h-fit w-full'>

                {/* Filters */}
                <div className=" grid grid-cols-5 gap-4 p-3 top-0 z-30 bg-white  border-b border-gray-200 overflow-visible rounded-2xl flex-wrap ">
                    {/* <div className="shrink-0 min-w-55">
                        <Controller
                            name="propertyId"
                            control={control}
                            render={({ field }) => {
                                return (
                                    <div>
                                        <div className={`select-group ${field.value ? "has-value" : ""}`}>
                                            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1">
                                                Property Code <span className="text-red-500">*</span>
                                            </label>
                                            <AsyncPaginate
                                                additional={{ page: 1 }}
                                                debounceTimeout={500}
                                                loadOptions={loadPropertyOptions}
                                                placeholder="Search / Select"
                                                value={field.value}
                                                onChange={(option) => {
                                                    field.onChange(option);
                                                    setClients([]);
                                                    setSelectedProperty(null);
                                                    setSheetData(null);
                                                    setIsACProperty(false);
                                                    setElectricityAmt(0);
                                                    setFlatTotalUnits("");
                                                }}
                                                isClearable
                                                styles={selectStyles}
                                            />
                                        </div>
                                    </div>
                                );
                            }}
                        />
                    </div> */}

                    <div className="shrink-0 min-w-45">
                        <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1">
                            Bill Start Date <span className="text-red-500">*</span>
                        </label>
                        <DatePicker
                            selected={startDate}
                            onChange={(date) => setStartDate(date)}
                            dateFormat="dd MMM yyyy"
                            className={inputClass}
                            placeholderText="Select Start date"
                            isClearable
                            popperPlacement="bottom-start"
                            withPortal
                            popperClassName="custom-datepicker-popper z-[9999]"
                        />
                    </div>

                    <div className="shrink-0 min-w-45">
                        <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1">
                            Bill End Date <span className="text-red-500">*</span>
                        </label>
                        <DatePicker
                            selected={endDate}
                            onChange={(date) => setEndDate(date)}
                            dateFormat="dd MMM yyyy"
                            placeholderText="Select end date"
                            className={inputClass}
                            isClearable
                            popperPlacement="bottom-start"
                            withPortal
                            popperClassName="custom-datepicker-popper z-[9999]"
                        />
                    </div>

                    <div className="shrink-0 min-w-50">
                        <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1">
                            ED Calculation Sheet Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={edCalSheetName ?? ""}
                            disabled
                            className={`${inputClass} bg-gray-50 cursor-not-allowed`}
                        />
                    </div>
                    <div className="shrink-0 min-w-37.5">
                        <label className="flex justify-between items-center text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1">
                            <span>Total Free EB</span>

                            <button
                                type="button"
                                onClick={() => setShowAttendance(!showAttendance)}
                                className="text-red-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
            
                            >
                                {showAttendance ? (
                                    <>
                                      <div className='flex gap-3'>
                                          <EyeOff size={16} strokeWidth={2} />
                                        Attendance Details
                                      </div>
                                    </>
                                ) : (
                                    <>
                                    <div className='flex gap-3'>
                                        <Eye size={16} strokeWidth={2} />
                                        Attendance Details
                                    </div>
                                    </>
                                )}
                            </button>
                        </label>

                        <input
                            type="number"
                            value={totalFreeEB || 0}
                            className={`${inputClass} bg-gray-50 cursor-not-allowed`}
                            disabled
                        />
                      
                    </div>
                    <div className="shrink-0 min-w-37.5">
                        <label className="flex justify-between items-center text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1">
                            <span>Adjusted Free EB</span>
                        </label>
                        <input
                            type="number"
                            value={totalFreeEB || 0}
                            className={`${inputClass}`}
                        />
                    </div>


                </div>

                {showAttendance && (
                    <>
                        {(isLoadinClientThrowProperty || (isACProperty && isLoadinACData)) ? (
                            <div className="flex justify-center items-center h-64">
                                <Loader />
                                <span className="ml-4 text-gray-600">
                                    {isLoadinClientThrowProperty ? 'Loading clients data...' : 'Loading AC consumption data...'}
                                </span>
                            </div>
                        ) : (
                            <>
                                {/* Second Table - Free EB Calculation */}
                                <div className='overflow-auto max-h-[600px] border-t-2 border-gray-200 mt-4'>
                                    <table className="min-w-full border text-sm border-gray-200 text-center">
                                        <thead className="bg-gradient-to-r from-gray-800 to-gray-900 sticky z-20 top-0 font-bold text-white">
                                            <tr>
                                                <th className="border border-gray-700 whitespace-nowrap font-bold px-3 py-2.5 sticky left-0 z-20 bg-gradient-to-r from-gray-800 to-gray-900 text-left min-w-[180px]">
                                                    Client Name &#8595; Date &#8594;
                                                </th>
                                                {headerDays.map((d, i) => (
                                                    <th key={i} className="border border-gray-700 px-2 py-2.5 min-w-[60px]">
                                                        {d.date.getDate()}
                                                    </th>
                                                ))}
                                                <th className="border border-gray-700 whitespace-nowrap font-bold px-3 py-2.5 min-w-[100px]">
                                                    Total Days
                                                </th>
                                                {/* <th className="border border-gray-700 whitespace-nowrap font-bold px-3 py-2.5 min-w-[100px]">
                                            Adj Free EB
                                        </th> */}
                                                <th className="border border-gray-700 whitespace-nowrap font-bold px-3 py-2.5 min-w-[100px]">
                                                    Free EB
                                                </th>
                                                <th className="border border-gray-700 whitespace-nowrap font-bold px-3 py-2.5 min-w-[150px]">
                                                    Comments1
                                                </th>
                                            </tr>
                                        </thead>

                                        <tbody>
                                            {clients?.filter(ele => ele.fullName && ele.fullName.trim() !== "")?.map((ele, idx) => {
                                                const allVacations = ele.vacations || [];

                                                return (
                                                    <tr key={`${ele._id}_${ele.ebDoj}`} className={`${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-orange-50 transition-colors`}>
                                                        <td className="border border-gray-200 px-3 py-2 sticky left-0 whitespace-nowrap bg-inherit font-semibold text-left z-10">
                                                            {ele.fullName}
                                                        </td>

                                                        {headerDays.map((d, i) => {
                                                            const currentDate = normalizeDate(d.date);
                                                            const doj = ele.ebDoj ? normalizeDate(new Date(ele.ebDoj)) : null;
                                                            const cvd = ele.clientVacatingDate ? normalizeDate(new Date(ele.clientVacatingDate)) : null;  // ✅ ADD

                                                            let isOnVacation = false;
                                                            for (const vacation of allVacations) {
                                                                if (vacation.vacationStartDate1 && vacation.vacationLastDate1) {
                                                                    const vStart = normalizeDate(new Date(vacation.vacationStartDate1));
                                                                    const vEnd = normalizeDate(new Date(vacation.vacationLastDate1));
                                                                    const vacDays = Math.floor((vEnd - vStart) / (1000 * 60 * 60 * 24)) + 1;
                                                                    if (vacDays >= 15 && currentDate >= vStart && currentDate <= vEnd) {
                                                                        isOnVacation = true;
                                                                        break;
                                                                    }
                                                                }
                                                                if (vacation.vacationStartDate2 && vacation.vacationLastDate2) {
                                                                    const vStart = normalizeDate(new Date(vacation.vacationStartDate2));
                                                                    const vEnd = normalizeDate(new Date(vacation.vacationLastDate2));
                                                                    const vacDays = Math.floor((vEnd - vStart) / (1000 * 60 * 60 * 24)) + 1;
                                                                    if (vacDays >= 15 && currentDate >= vStart && currentDate <= vEnd) {
                                                                        isOnVacation = true;
                                                                        break;
                                                                    }
                                                                }
                                                            }

                                                            // ✅ DOJ Check
                                                            if (doj && currentDate < doj) {
                                                                return <td key={i} className="border border-gray-200 px-1 py-1 bg-red-50 text-red-600">0</td>;
                                                            }

                                                            // ✅ CVD Check (ADD THIS)
                                                            if (cvd && currentDate > cvd) {
                                                                return <td key={i} className="border border-gray-200 px-1 py-1 bg-red-50 text-red-600">0</td>;
                                                            }

                                                            // ✅ Vacation Check
                                                            if (isOnVacation) {
                                                                return <td key={i} className="border border-gray-200 px-1 py-1 bg-red-50 text-red-600">0</td>;
                                                            }

                                                            return <td key={i} className="border border-gray-200 px-1 py-1 font-semibold">1</td>;
                                                        })}

                                                        <td className="border border-gray-200 px-2 py-1 font-bold bg-orange-100 text-orange-800">
                                                            {calculateTotalDays({ ele })}
                                                        </td>

                                                        {/* <td className="border border-gray-200 px-1 py-1">
                                                    <input
                                                        placeholder='Amt'
                                                        type="text"
                                                        value={adjustedFreeEB[`${ele._id}_${ele.ebDoj}`] ?? ""}
                                                        onChange={(e) => {
                                                            const val = e.target.value;
                                                            if (/^-?\d*\.?\d*$/.test(val)) {
                                                                setAdjustedFreeEB((prev) => ({
                                                                    ...prev,
                                                                    [`${ele._id}_${ele.ebDoj}`]:
                                                                        val === "" || val === "-" ? val : Number(val),
                                                                }));
                                                            }
                                                        }}
                                                        className="border border-gray-300 rounded px-1.5 py-0.5 w-20 text-sm focus:border-orange-400 focus:ring-1 focus:ring-orange-400 outline-none"
                                                    />
                                                </td> */}

                                                        <td className="border border-gray-200 px-2 py-1 font-bold bg-orange-100 text-orange-800">
                                                            {getPerHeadFreeEB(ele)}
                                                        </td>

                                                        <td className="border border-gray-200 px-1 py-1">
                                                            <input
                                                                type="text"
                                                                defaultValue={comments1[`${ele._id}_${ele.ebDoj}`] ?? ""}
                                                                onBlur={(e) => {
                                                                    const val = e.target.value;
                                                                    setComments1((prev) => ({
                                                                        ...prev,
                                                                        [`${ele._id}_${ele.ebDoj}`]: val,
                                                                    }));
                                                                }}
                                                                placeholder='Comment'
                                                                className="border border-gray-300 rounded px-1.5 py-0.5 w-full text-sm focus:border-orange-400 focus:ring-1 focus:ring-orange-400 outline-none"
                                                            />
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>

                                        {/* <tfoot>
                                    <tr className="font-bold bg-gray-100">
                                        <td className="border border-gray-300 px-2 py-2 text-left">Total Present</td>
                                        {headerDays.map((d, i) => (
                                            <td key={i} className="border border-gray-300 px-1 py-1 bg-orange-100 text-orange-800">
                                                {getPresentCountForDate(d.date)}
                                            </td>
                                        ))}
                                        <td className="border border-gray-300"></td>
                                        <td className="border border-gray-300"></td>
                                        <td className="border border-gray-300"></td>
                                        <td className="border border-gray-300"></td>
                                    </tr>
                                </tfoot> */}
                                    </table>
                                </div>
                            </>
                        )}
                    </>
                )}





            </div>
        </>
    );
};

export default EbAttendance;

import React, { useEffect, useState } from 'react';
import { Controller } from 'react-hook-form';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { toast } from 'react-toastify';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { AsyncPaginate } from 'react-select-async-paginate';
import { selectStyles } from '../../utils/selectStyles';
import { getPropertyDropdown } from '../properties/services';
import { useClientThrowPropertyData, useACConsumptionData, useUpdateEBAmountInRentHistory, useCreateEBCalculation } from './services';
import Loader from '../common/Loader';
import { convertStringFormatDate, formatDate } from '../../utils/dateFormatter';
import { Info } from 'lucide-react';

const EBCalculation = () => {
    const normalizeDate = (d) => {
        if (!d) return null;
        const nd = new Date(d);
        nd.setHours(0, 0, 0, 0);
        return nd;
    };

    const [flatTotalUnits, setFlatTotalUnits] = useState("");
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
    const [activeDateInfo, setActiveDateInfo] = useState(null);
    const {
        control,
        watch,
    } = useForm({
        resolver: yupResolver(),
    });
    const propertyId = watch("propertyId");

    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    // const formattedStartDate = convertStringFormatDate(startDate);
    // const formattedEndDate = convertStringFormatDate(endDate);


    const {
        data: clientData,
        isLoading: isLoadinClientThrowProperty,
    } = useClientThrowPropertyData(
        propertyId?.value,
        startDate,
        endDate

    );
    const {
        mutate: updateEBRentHistory,
        isPending: isUpdatingEB,
    } = useUpdateEBAmountInRentHistory();

    const {
        mutate: createEBCalculation,
    } = useCreateEBCalculation();
    // API hook to fetch AC consumption data - only when AC clients exist
    const {
        data: acConsumptionData,
        isLoading: isLoadinACData,
        refetch: refetchACData,
    } = useACConsumptionData(
        propertyId?.value,
        startDate,
        endDate,
        isACProperty
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

    // Load property options from API
    const loadPropertyOptions = async (search, loadedOptions, { page }) => {
        try {
            const res = await getPropertyDropdown({ page, limit: 10, search });
            return {
                options: res.data.map((item) => ({
                    value: item._id,
                    label: item.propertyCode,
                    location: item.propertyLocation,
                    bedCount: item.bedCount,
                })),
                hasMore: res.hasMore,
                additional: { page: page + 1 },
            };
        } catch (error) {
            console.error('Error loading properties:', error);
            toast.error('Failed to load properties');
            return {
                options: [],
                hasMore: false,
            };
        }
    };

    // Set clients when API data arrives
    useEffect(() => {
        if (clientData?.data?.clients) {
            setClients(clientData.data.clients);

            // Property ko sirf tab update karo jab property actually change ho
            if (
                clientData.data.property &&
                clientData.data.property._id !== selectedProperty?._id
            ) {
                setSelectedProperty(clientData.data.property);
            }

            const acClients = clientData.data.clients.filter(
                ele =>
                    ele.bedId?.acRoom?.toLowerCase().trim() === "ac"
            );

            setIsACProperty(acClients.length > 0);

            if (acClients.length > 0 && startDate && endDate) {
                refetchACData();
            }
        }
    }, [clientData]);

    // Set AC consumption data when API data arrives
    useEffect(() => {
        if (acConsumptionData?.data) {
            const data = acConsumptionData.data;

            // Complete AC API data store
            setSheetData(data);

            // Flat Total EB
            setElectricityAmt(
                Number(data.FlatTotalEB) || 0
            );

            // AC mein direct API values
            setEbToBeRecovered(
                Number(data.EBToBeRecovered) || 0
            );
        }
    }, [acConsumptionData]);

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
                const vacationDays = Math.floor((vEnd - vStart) / (1000 * 60 * 60 * 24)) - 1;
                  
                if (vacationDays >= 15 && currentDate > vStart && currentDate < vEnd) {
                    return true;    
                }
            }

            // Check VSD2
            if (vacation.vacationStartDate2 && vacation.vacationLastDate2) {
                const vStart = normalizeDate(new Date(vacation.vacationStartDate2));
                const vEnd = normalizeDate(new Date(vacation.vacationLastDate2));
                const vacationDays = Math.floor((vEnd - vStart) / (1000 * 60 * 60 * 24)) - 1;

                if (vacationDays >= 15 && currentDate > vStart && currentDate < vEnd) {
                    return true;
                }
            }
        }
        return false;
    };

    // Get present count for date
    const getPresentCountForDate = (date) => {
        const currentDate = normalizeDate(date);

        return clients.filter(ele => {
            const doj = (ele.ebDoj || ele.clientDoj)
                ? normalizeDate(new Date(ele.ebDoj || ele.clientDoj))
                : null;
            const cvd = ele.clientVacatingDate ? normalizeDate(new Date(ele.clientVacatingDate)) : null;

            if (doj && currentDate < doj) return false;
            if (cvd && currentDate > cvd) return false; // ✅
            if (isClientOnVacation(ele, currentDate)) return false;

            return true;
        }).length;
    };

    // Get client EB for date
    const getClientEBForDate = (client, date) => {
        const currentDate = normalizeDate(date);
        const billEnd = endDate ? normalizeDate(endDate) : null;

        // Check DOJ
        const doj = (client.ebDoj || client.clientDoj)
    ? normalizeDate(new Date(client.ebDoj || client.clientDoj))
    : null;
        if (doj && billEnd && doj > billEnd) return 0;
        if (doj && currentDate < doj) return 0;


        // ✅ CVD check
        const cvd = client.clientVacatingDate ? normalizeDate(new Date(client.clientVacatingDate)) : null;
        if (cvd && currentDate > cvd) return 0;


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

    // Get client AC EB for date
    const getClientACEBForDate = (client, date) => {
        if (client.bedId?.acRoom?.toLowerCase().trim() !== "ac") return 0;
        if (getClientEBForDate(client, date) === 0) return 0;

        const roomNo = client.bedId?.roomNo;
        const monthlyRoomAC = Number(sheetData?.[`RoomNo_${roomNo}_ACEB`] || 0);
        if (!monthlyRoomAC) return 0;

        const billingDays = headerDays.length;
        if (!billingDays) return 0;

        const perDayRoomAC = monthlyRoomAC / billingDays;

        // Get present count for this room on this date
        const presentCount = clients?.filter(c => {
            return String(c.bedId?.roomNo) === String(roomNo) &&
                c.bedId?.acRoom?.toLowerCase().trim() === "ac" &&
                getClientEBForDate(c, date) > 0;
        }).length || 0;

        if (!presentCount) return 0;
        return perDayRoomAC / presentCount;
    };

    // =====================================================
    // FREE EB CALCULATION
    // =====================================================

    // Non-AC ke liye existing calculation
    const totalNormalFreeEB = clients
        ?.filter(ele => ele.fullName && ele.fullName.trim() !== "")
        .reduce((sum, ele) => {
            const billEnd = endDate ? normalizeDate(endDate) : null;
            const doj = (ele.ebDoj || ele.clientDoj)
                ? normalizeDate(new Date(ele.ebDoj || ele.clientDoj))
                : null;
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


    // =====================================================
    // FINAL TOTAL FREE EB
    //
    // AC     => API se FreeEB
    // Non-AC => Existing calculation
    // =====================================================
    const totalFreeEB =
        isACProperty && sheetData
            ? Number(sheetData.FreeEB) || 0
            : totalNormalFreeEB + totalAdjustedFreeEB;
    // Get per-head free EB
    const getPerHeadFreeEB = (client) => {
        const billEnd = endDate ? normalizeDate(endDate) : null;
        const doj = (client.ebDoj || client.clientDoj)
    ? normalizeDate(new Date(client.ebDoj || client.clientDoj))
    : null;
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
        const doj = (ele.ebDoj || ele.clientDoj)
            ? normalizeDate(new Date(ele.ebDoj || ele.clientDoj))
            : null;
        const cvd = ele.clientVacatingDate ? normalizeDate(new Date(ele.clientVacatingDate)) : null;
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
    // Get AC clients
    const FilterDataForACBeds = clients?.filter((ele) => {
        return ele.bedId?.acRoom?.toLowerCase().trim() === "ac";
    }) || [];

    const handleBulkSubmit = () => {
        if (!clients?.length) {
            toast.error("No clients found");
            return;
        }

        setIsLoading(true);

        const bulkData = clients
            .filter(
                ele =>
                    ele.fullName &&
                    ele.fullName.trim() !== ""
            )
            .map(ele => {
                const totalDays = calculateTotalDays({ ele });

                const totalEB = headerDays.reduce((sum, d) => {
                    return (
                        sum +
                        getClientEBForDate(ele, d.date)
                    );
                }, 0);

                const totalACEB = headerDays.reduce((sum, d) => {
                    return (
                        sum +
                        getClientACEBForDate(ele, d.date)
                    );
                }, 0);

                const formatDate = (date) => {
                    if (!date) return "";

                    return new Date(date).toLocaleDateString(
                        "en-GB",
                        {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                        }
                    );
                };

                // Get vacation data
                const firstVacation =
                    ele.vacations?.[0] || {};

                return {
                    PropertyCode:
                        propertyId?.label || "",

                    PropertyId:
                        propertyId?.value || "",

                    FlatEB: isACProperty
                        ? (
                            sheetData?.FlatTotalEB ??
                            electricityAmt
                        )
                        : electricityAmt,

                    CommonEB: isACProperty
                        ? (sheetData?.CommonTotalEB ?? 0)
                        : 0,

                    EBStartDate:
                        formatDate(startDate) || "",

                    EBEndDate:
                        formatDate(endDate) || "",

                    ClientName: ele.fullName,

                    ClientID: `${ele._id}`,

                    ebDoj: ele.ebDoj,

                    RoomNo:
                        ele.bedId?.roomNo || "",

                    BedNo:
                        ele.bedId?.bedNo || "",

                    ACRoom:
                        ele.bedId?.acRoom || "",

                    VacationStart1:
                        firstVacation.vacationStartDate1 || "",

                    VacationEnd1:
                        firstVacation.vacationLastDate1 || "",

                    VacationStart2:
                        firstVacation.vacationStartDate2 || "",

                    VacationEnd2:
                        firstVacation.vacationLastDate2 || "",

                    CEB: totalEB.toFixed(2),

                    ACEB: totalACEB.toFixed(2),

                    TotalDays: totalDays,

                    AdjFreeEB:
                        adjustedFreeEB[
                        `${ele._id}_${ele.ebDoj}`
                        ] || 0,

                    AdjEB:
                        adjustedEB[
                        `${ele._id}_${ele.ebDoj}`
                        ] || 0,

                    FreeEB:
                        getPerHeadFreeEB(ele),

                    PropertyFreeEB:
                        totalFreeEB || 0,

                    EBToBeRecovered:
                        ebToBeRecovered || 0,

                    PropertyEBUnits:
                        totalUnits,

                    FreeEBPerDay:
                        ele.bedId?.freeEbAsPerBed || 0,

                    TotalClientEB: (
                        totalEB +
                        (
                            adjustedEB[
                            `${ele._id}_${ele.ebDoj}`
                            ] || 0
                        ) +
                        totalACEB
                    ).toFixed(2),

                    EBAmt: Math.round(
                        (totalEB || 0) +
                        (adjustedEB[`${ele._id}_${ele.ebDoj}`] || 0) +
                        (totalACEB || 0)
                    ),

                    Comments1:
                        comments1[
                        `${ele._id}_${ele.ebDoj}`
                        ] || "N/A",

                    Comments2:
                        comments2[
                        `${ele._id}_${ele.ebDoj}`
                        ] || "N/A",

                    FlatTotalEB:
                        sheetData?.FlatTotalEB ??
                        electricityAmt,

                    FlatTotalUnits:
                        sheetData?.FlatTotalUnits ??
                        flatTotalUnits,

                    PerUnitCost:
                        sheetData?.PerUnitCost ?? 0,

                    ACTotalUnits:
                        sheetData?.ACTotalUnits ?? 0,

                    ACTotalEB:
                        sheetData?.ACTotalEB ?? 0,
                };
            });



        // ==========================================
        // UPDATE EB IN RENT HISTORY
        // ==========================================

        // ==========================================
        // UPDATE EB IN RENT HISTORY
        // ==========================================

        updateEBRentHistory(bulkData, {
            onSuccess: (response) => {

                // ==========================================
                // CREATE EB CALCULATION
                // ==========================================

                createEBCalculation(
                    {
                        PropertyCode:
                            propertyId?.label || "",

                        PropertyId:
                            propertyId?.value || "",

                        EBStartDate:
                            formatDate(startDate) || "",

                        EBEndDate:
                            formatDate(endDate) || "",

                        clients: bulkData,
                    },
                    {
                        onSuccess: (createResponse) => {

                            toast.success(
                                `Rent History: ${response?.message}
Total: ${response?.totalClients}, Updated: ${response?.updatedCount}, Failed: ${response?.failedCount}

EB Calculation: ${createResponse?.message}`
                            );

                            setIsLoading(false);
                        },

                        onError: (createError) => {
                            console.error(
                                "Create EB Calculation Error:",
                                createError?.response?.data
                            );

                            toast.error(
                                `Rent History: ${response?.message}
Total: ${response?.totalClients}, Updated: ${response?.updatedCount}, Failed: ${response?.failedCount}

EB Calculation: ${createError?.response?.data?.message ||
                                "EB Calculation could not be saved."
                                }`
                            );

                            setIsLoading(false);
                        },
                    }
                );
            },

            onError: (error) => {
                console.error(
                    "EB Rent History Update Error:",
                    error?.response?.data
                );

                const failedClients =
                    error?.response?.data?.failedClients || [];

                if (failedClients.length > 0) {
                    const errorMessage = failedClients
                        .map((client, index) => {
                            return `${index + 1}. ${client.ClientName}\n   ${client.message}`;
                        })
                        .join("\n\n");

                    toast.error(
                        `EB Rent History Update Failed:\n\n${errorMessage}`,
                        {
                            autoClose: 15000,
                        }
                    );
                } else {
                    toast.error(
                        error?.response?.data?.message ||
                        "Failed to update EB amount in Rent History"
                    );
                }

                setIsLoading(false);
            },
        });
    };

    const inputClass = 'w-full px-3 py-2 mt-1 border border-gray-400 rounded-md shadow focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400';

    return (
        <>
            <div className='h-[85vh] w-full'>
                <div className="flex justify-between items-center m-2">
                    <h1 className="text-xl font-bold text-gray-800">
                        Electricity Bill Calculation
                    </h1>
                    <button
                        onClick={handleBulkSubmit}
                        className="px-6 py-2.5 theme-btn text-white font-semibold rounded-lg shadow-md transition duration-200 flex items-center gap-2"
                        disabled={isLoading || isLoadinClientThrowProperty || isLoadinACData}
                    >
                        {isLoading ? (
                            <span className="flex gap-2 justify-center items-center">
                                <Loader /> Submitting...
                            </span>
                        ) : (
                            <>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                </svg>
                                Submit All EB Data
                            </>
                        )}
                    </button>
                </div>

                {/* Filters */}
                <div className="relative flex gap-4 p-3 top-0 z-30 bg-white shadow-md border-b border-gray-200 overflow-visible flex-wrap border">
                    <div className="flex-shrink-0 min-w-[220px]">
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
                    </div>

                    <div className="flex-shrink-0 min-w-[180px]">
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

                    <div className="flex-shrink-0 min-w-[180px]">
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

                    <div className="flex-shrink-0 min-w-[200px]">
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

                    <div className="flex-shrink-0 min-w-[150px] ">
                        <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1 required-label">
                            Total Free EB
                        </label>
                        <input
                            type="number"
                            value={totalFreeEB || 0}
                            className={`${inputClass} bg-gray-50 cursor-not-allowed`}
                            disabled
                        />
                    </div>

                    <div className="flex-shrink-0 min-w-[150px]">
                        <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1 required-label">
                            EB To Be Recovered
                        </label>
                        <input
                            type="number"
                            value={ebToBeRecovered ?? 0}
                            className={`${inputClass} bg-gray-50 cursor-not-allowed`}
                            disabled
                        />
                    </div>

                    {/* AC Consumption - Only show if AC clients exist */}
                    {isACProperty && sheetData && (
                        <>
                            <div className="flex-shrink-0 min-w-[120px]">
                                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1 ">Flat Total EB</label>
                                <input type="number" value={sheetData?.FlatTotalEB ?? 0} className={`${inputClass} bg-gray-50 cursor-not-allowed`} disabled />
                            </div>
                            <div className="flex-shrink-0 min-w-[120px]">
                                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1 ">Flat Total Units</label>
                                <input type="number" value={sheetData?.FlatTotalUnits ?? 0} className={`${inputClass} bg-gray-50 cursor-not-allowed`} disabled />
                            </div>
                            <div className="flex-shrink-0 min-w-[120px]">
                                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1">Per Unit Cost</label>
                                <input type="number" value={sheetData?.PerUnitCost ?? 0} className={`${inputClass} bg-gray-50 cursor-not-allowed`} disabled />
                            </div>
                            <div className="flex-shrink-0 min-w-[120px]">
                                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1">AC Total Units</label>
                                <input type="number" value={sheetData?.ACTotalUnits ?? 0} className={`${inputClass} bg-gray-50 cursor-not-allowed`} disabled />
                            </div>
                            <div className="flex-shrink-0 min-w-[120px]">
                                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1">AC Total EB</label>
                                <input type="number" value={sheetData?.ACTotalEB ?? 0} className={`${inputClass} bg-gray-50 cursor-not-allowed`} disabled />
                            </div>
                            <div className="flex-shrink-0 min-w-[120px]">
                                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1">Common Total EB</label>
                                <input type="number" value={sheetData?.CommonTotalEB ?? 0} className={`${inputClass} bg-gray-50 cursor-not-allowed`} disabled />
                            </div>
                        </>
                    )}

                    {/* Non-AC: Simple input fields */}
                    {!isACProperty && (
                        <>
                            <div className="flex-shrink-0 min-w-[150px]">
                                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1 required-label">
                                    Flat Total EB
                                </label>
                                <input
                                    type="text"
                                    placeholder="Enter EB Amount"
                                    className={inputClass}
                                    value={electricityAmt || ""}
                                    onChange={(e) => setElectricityAmt(e.target.value === "" ? "" : Number(e.target.value))}
                                />
                            </div>
                            <div className="flex-shrink-0 min-w-[150px]">
                                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1 required-label">
                                    Flat Total Units
                                </label>
                                <input
                                    type="number"
                                    value={flatTotalUnits}
                                    placeholder="Enter Total Units"
                                    className={inputClass}
                                    onChange={(e) => setFlatTotalUnits(e.target.value)}
                                />
                            </div>
                        </>
                    )}
                </div>

                {(isLoadinClientThrowProperty || (isACProperty && isLoadinACData)) ? (
                    <div className="flex justify-center items-center h-64">
                        <Loader />
                        <span className="ml-4 text-gray-600">
                            {isLoadinClientThrowProperty ? 'Loading clients data...' : 'Loading AC consumption data...'}
                        </span>
                    </div>
                ) : (
                    <>
                        {/* Client Wise EB Table */}
                        <div className="overflow-auto max-h-150 mt-2">
                            <table className="min-w-full border text-sm border-gray-200 text-center">
                                <thead className="bg-gradient-to-r from-gray-800 to-gray-900 sticky z-20 top-0 font-bold text-white">
                                    <tr>
                                        <th className="border border-gray-700 text-start px-3 py-2.5 sticky left-0 bg-gradient-to-r from-gray-800 to-gray-900 min-w-[180px]">
                                            Client Name &#8595; Date &#8594;
                                        </th>
                                        {headerDays.map((d, i) => (
                                            <th key={i} className="border border-gray-700 px-2 py-2.5 min-w-[60px]">
                                                {d.date.getDate()}
                                            </th>
                                        ))}
                                        <th className="border border-gray-700 px-3 py-2.5 sticky left-0 bg-gradient-to-r from-gray-800 to-gray-900 min-w-[80px]">
                                            C EB
                                        </th>
                                        <th className="border border-gray-700 px-3 py-2.5 sticky left-0 bg-gradient-to-r from-gray-800 to-gray-900 min-w-[80px]">
                                            AC EB
                                        </th>
                                        <th className="border border-gray-700 px-3 py-2.5 sticky left-0 bg-gradient-to-r from-gray-800 to-gray-900 min-w-[80px]">
                                            Adj EB
                                        </th>
                                        <th className="border border-gray-700 px-3 py-2.5 sticky left-0 bg-gradient-to-r from-gray-800 to-gray-900 min-w-[120px]">
                                            Total Client EB
                                        </th>
                                        <th className="border border-gray-700 px-3 py-2.5 min-w-[150px]">Comments2</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {clients
                                        ?.filter(ele => ele.fullName && ele.fullName.trim() !== "")
                                        .map((client, idx) => {
                                            const adjusted = adjustedEB[`${client._id}_${client.ebDoj}`] || 0;

                                            const totalEB = headerDays.reduce((sum, d) => {
                                                return sum + getClientEBForDate(client, d.date);
                                            }, 0);

                                            const totalACEB = headerDays.reduce((sum, d) => {
                                                return sum + getClientACEBForDate(client, d.date);
                                            }, 0);

                                            return (
                                                <tr key={`${client._id}_${client.ebDoj}`} className={`${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-orange-50 transition-colors`}>
                                                    <td className="border border-gray-200 px-3 py-2 sticky left-0 bg-inherit text-left z-10 min-w-[180px]">
                                                        <div className="flex items-center gap-1.5">

                                                            {/* Info Button */}
                                                            {(client.vacations?.length > 0 || client.clientVacatingDate) && (
                                                                <div className="relative">
                                                                    <button
                                                                        type="button"
                                                                        onClick={() =>
                                                                            setActiveDateInfo(
                                                                                activeDateInfo === client._id ? null : client._id
                                                                            )
                                                                        }
                                                                        className="text-blue-500 hover:text-blue-700"
                                                                        title="Vacation & CVD Details"
                                                                    >
                                                                        <Info size={14} />
                                                                    </button>

                                                                    {/* Popup */}
                                                                    {activeDateInfo === client._id && (
                                                                        <>
                                                                            <div
                                                                                className="fixed inset-0 z-40"
                                                                                onClick={() => setActiveDateInfo(null)}
                                                                            />

                                                                            <div className="absolute left-70 top-0 z-50 w-64 bg-white border border-gray-200 rounded-lg shadow-lg p-3">

                                                                                <div className="text-xs font-semibold text-gray-800 mb-2">
                                                                                    Vacation Details
                                                                                </div>

                                                                                {/* Vacation */}
                                                                                {client.vacations?.length > 0 && (
                                                                                    <div className="mb-2">

                                                                                        {client.vacations.map((vacation, index) => (
                                                                                            <div
                                                                                                key={vacation._id || index}
                                                                                                className="text-[11px] font-bold text-gray-600 mb-1"
                                                                                            >
                                                                                                <div>
                                                                                                    {formatDate(vacation.vacationStartDate1)} -{" "}
                                                                                                    {formatDate(vacation.vacationLastDate1)}
                                                                                                </div>

                                                                                                {vacation.vacationStartDate2 &&
                                                                                                    vacation.vacationLastDate2 && (
                                                                                                        <div>
                                                                                                            {formatDate(vacation.vacationStartDate2)} -{" "}
                                                                                                            {formatDate(vacation.vacationLastDate2)}
                                                                                                        </div>
                                                                                                    )}
                                                                                            </div>
                                                                                        ))}
                                                                                    </div>
                                                                                )}

                                                                                {/* CVD */}
                                                                                {client.clientVacatingDate && (
                                                                                    <div className="text-[11px] text-red-600 font-semibold">
                                                                                        CVD: {formatDate(client.clientVacatingDate)}
                                                                                    </div>
                                                                                )}

                                                                            </div>
                                                                        </>
                                                                    )}
                                                                </div>
                                                            )}

                                                            {/* Client Name */}
                                                            <div className="font-semibold">
                                                                {client.fullName}
                                                                <sup className="text-[10px] text-gray-500 ml-1">
                                                                    {client.bedId?.acRoom?.toLowerCase() === "ac"
                                                                        ? `AC-${client.bedId?.roomNo}`
                                                                        : ""}
                                                                </sup>
                                                            </div>

                                                        </div>
                                                    </td>

                                                    {headerDays.map((d, i) => {
                                                        const value = getClientEBForDate(client, d.date);
                                                        const Acvalue = getClientACEBForDate(client, d.date);

                                                        return (
                                                            <td
                                                                key={i}
                                                                className={`border border-gray-200 px-1.5 py-1 text-xs ${value === 0
                                                                    ? "bg-red-50 text-red-600"
                                                                    : "bg-white text-gray-800"
                                                                    }`}
                                                            >
                                                                {value.toFixed(2)}
                                                                <sup className="text-gray-500 text-[9px]">
                                                                    {Acvalue !== 0 ? ` ${Acvalue.toFixed(2)}` : ""}
                                                                </sup>
                                                            </td>
                                                        );
                                                    })}

                                                    <td className="border border-gray-200 px-2 py-2 font-bold bg-orange-100 text-orange-800 sticky left-0 z-10">
                                                        {totalEB.toFixed(2)}
                                                    </td>
                                                    <td className="border border-gray-200 px-2 py-2 font-bold bg-orange-100 text-orange-800 sticky left-0 z-10">
                                                        {totalACEB.toFixed(2)}
                                                    </td>
                                                    <td className="border border-gray-200 px-1 py-1 sticky left-0 z-10 bg-inherit">
                                                        <input
                                                            placeholder='Amt'
                                                            type="text"
                                                            value={adjustedEB[`${client._id}_${client.ebDoj}`] ?? ""}
                                                            onChange={(e) => {
                                                                const val = e.target.value;
                                                                if (/^-?\d*\.?\d*$/.test(val)) {
                                                                    setAdjustedEB((prev) => ({
                                                                        ...prev,
                                                                        [`${client._id}_${client.ebDoj}`]:
                                                                            val === "" || val === "-" ? val : Number(val),
                                                                    }));
                                                                }
                                                            }}
                                                            className="border border-gray-300 rounded px-1.5 py-0.5 w-16 text-sm focus:border-orange-400 focus:ring-1 focus:ring-orange-400 outline-none"
                                                        />
                                                    </td>
                                                    <td className="border border-gray-200 px-2 py-2 font-bold bg-orange-100 text-orange-800 sticky left-0 z-10">
                                                        {(Number(totalEB || 0) + Number(adjusted || 0) + Number(totalACEB || 0)).toFixed(2)}
                                                    </td>
                                                    <td className="border border-gray-200 px-1 py-1">
                                                        <input
                                                            type="text"
                                                            defaultValue={comments2[`${client._id}_${client.ebDoj}`] ?? ""}
                                                            onBlur={(e) => {
                                                                const val = e.target.value;
                                                                setComments2((prev) => ({
                                                                    ...prev,
                                                                    [`${client._id}_${client.ebDoj}`]: val === "" ? "" : val,
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

                                <tfoot>
                                    <tr className="font-bold bg-gray-100">
                                        <td className="border border-gray-300 px-2 py-2 text-left">Total</td>
                                        {headerDays.map((d, i) => (
                                            <td key={i} className="border border-gray-300 px-1 py-1"></td>
                                        ))}
                                        <td className="border border-gray-300 px-2 py-2 bg-orange-200 text-orange-900">
                                            {clients?.filter(ele => ele.fullName && ele.fullName.trim() !== "")
                                                .reduce((sumClients, client) => {
                                                    const clientTotal = headerDays.reduce((sum, d) => {
                                                        const value = getClientEBForDate(client, d.date);
                                                        return sum + (Number(value) || 0);
                                                    }, 0);
                                                    return sumClients + clientTotal;
                                                }, 0)
                                                .toFixed(0)}
                                        </td>
                                        <td className="border border-gray-300 px-2 py-2 bg-orange-200 text-orange-900">
                                            {clients?.filter(ele => ele.fullName && ele.fullName.trim() !== "")
                                                .reduce((sumClients, client) => {
                                                    const clientTotal = headerDays.reduce((sum, d) => {
                                                        const value = getClientACEBForDate(client, d.date);
                                                        return sum + (Number(value) || 0);
                                                    }, 0);
                                                    return sumClients + clientTotal;
                                                }, 0)
                                                .toFixed(0)}
                                        </td>
                                        <td className="border border-gray-300 px-2 py-2 bg-orange-200 text-orange-900">
                                            {clients?.filter(client => client.fullName && client.fullName.trim() !== "")
                                                .reduce((grandTotal, client) => {
                                                    const adjusted = Number(adjustedEB[`${client._id}_${client.ebDoj}`]) || 0;
                                                    return grandTotal + adjusted;
                                                }, 0)
                                                .toFixed(0)}
                                        </td>
                                        <td className="border border-gray-300 px-2 py-2 bg-orange-200 text-orange-900">
                                            {clients?.filter(client => client.fullName && client.fullName.trim() !== "")
                                                .reduce((grandTotal, client) => {
                                                    const clientEBTotal = headerDays.reduce((sum, d) => {
                                                        const value = getClientEBForDate(client, d.date);
                                                        return sum + (Number(value) || 0);
                                                    }, 0);
                                                    const totalACEB = headerDays.reduce((sum, d) => {
                                                        return sum + getClientACEBForDate(client, d.date);
                                                    }, 0);
                                                    const adjusted = Number(adjustedEB[`${client._id}_${client.ebDoj}`]) || 0;
                                                    return grandTotal + clientEBTotal + adjusted + totalACEB;
                                                }, 0)
                                                .toFixed(0)}
                                        </td>
                                        <td className="border border-gray-300"></td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>

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
                                        <th className="border border-gray-700 whitespace-nowrap font-bold px-3 py-2.5 min-w-[100px]">
                                            Adj Free EB
                                        </th>
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
                                                    const doj = (ele.ebDoj || ele.clientDoj)
                                                        ? normalizeDate(new Date(ele.ebDoj || ele.clientDoj))
                                                        : null;
                                                    const cvd = ele.clientVacatingDate ? normalizeDate(new Date(ele.clientVacatingDate)) : null;  // ✅ ADD

                                                    let isOnVacation = false;
                                                    for (const vacation of allVacations) {
                                                        if (vacation.vacationStartDate1 && vacation.vacationLastDate1) {
                                                            const vStart = normalizeDate(new Date(vacation.vacationStartDate1));
                                                            const vEnd = normalizeDate(new Date(vacation.vacationLastDate1));
                                                            const vacDays = Math.floor((vEnd - vStart) / (1000 * 60 * 60 * 24)) - 1;
                                                            if (vacDays >= 15 && currentDate > vStart && currentDate < vEnd) {
                                                                isOnVacation = true;
                                                                break;
                                                            }
                                                        }
                                                        if (vacation.vacationStartDate2 && vacation.vacationLastDate2) {
                                                            const vStart = normalizeDate(new Date(vacation.vacationStartDate2));
                                                            const vEnd = normalizeDate(new Date(vacation.vacationLastDate2));
                                                            const vacDays = Math.floor((vEnd - vStart) / (1000 * 60 * 60 * 24)) - 1;
                                                            if (vacDays >= 15 && currentDate > vStart && currentDate < vEnd) {
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

                                                <td className="border border-gray-200 px-1 py-1">
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
                                                </td>

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

                                <tfoot>
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
                                </tfoot>
                            </table>
                        </div>
                    </>
                )}
            </div>
        </>
    );
};

export default EBCalculation;
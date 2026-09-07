import { useQuery ,useMutation } from "@tanstack/react-query";
import { apiClient } from "../../../api/ApiClient";   

const getClientThrowPropertyData = async (
    id,
    startDate,
    endDate
) => {
    const params = {};

    if (startDate && endDate) {
        params.startDate = startDate;
        params.endDate = endDate;
    }

    const response = await apiClient.get(
        `/eb-calculator/property/${id}`,
        {
            params,
        }
    );

    return response.data;
};

export const useClientThrowPropertyData = (
    id,
    startDate,
    endDate
) => {
    return useQuery({
        queryKey: [
            "client-throw-property-data",
            id,
            startDate,
            endDate,
        ],

        queryFn: () =>
            getClientThrowPropertyData(
                id,
                startDate,
                endDate
            ),

        enabled: !!id,

        staleTime: 5 * 60 * 1000,
    });
};


// GET AC CONSUMPTION DATA
export const getACConsumptionData = async (propertyId) => {
    const response = await apiClient.get(
        `/aceb-reading/ac-consumption/${propertyId}`
    );
    return response.data;
};
export const useACConsumptionData = (
    propertyId,
    startDate,
    endDate,
    isACProperty
) => {
    return useQuery({
        queryKey: [
            "ac-consumption",
            propertyId,
        ],

        queryFn: () => getACConsumptionData(propertyId),

        enabled:
            !!propertyId 
          

    });
};


// ======================================================
// UPDATE EB AMOUNT IN RENT HISTORY
// ======================================================

export const updateEBAmountInRentHistory = async (
    ebData
) => {
    const response = await apiClient.put(
        "/update-eb-rent-history",
        ebData
    );

    return response.data;
};


// ======================================================
// REACT QUERY MUTATION
// ======================================================

export const useUpdateEBAmountInRentHistory = () => {
    return useMutation({
        mutationFn: (ebData) =>
            updateEBAmountInRentHistory(ebData),
    });
};


// ======================================================
// CREATE EB CALCULATION
// ======================================================

export const createEBCalculation = async (ebData) => {
    const response = await apiClient.post(
        "/create-eb-calculation",
        ebData
    );

    return response.data;
};


// ======================================================
// REACT QUERY MUTATION
// ======================================================

export const useCreateEBCalculation = () => {
    return useMutation({
        mutationFn: (ebData) =>
            createEBCalculation(ebData),
    });
};



// ======================================================
// GET ALL EB CALCULATIONS
// ======================================================

export const getAllEBCalculations = async () => {
    const response = await apiClient.get(
        "/eb-calculation-details"
    );

    return response.data;
};


// ======================================================
// REACT QUERY - GET ALL EB CALCULATIONS
// ======================================================

export const useEBCalculations = () => {
    return useQuery({
        queryKey: ["eb-calculations"],

        queryFn: getAllEBCalculations,

        staleTime: 5 * 60 * 1000,
    });
};


// ======================================================
// GET EB CALCULATION BY ID
// ======================================================

export const getEBCalculationById = async (id) => {
    const response = await apiClient.get(
        `/eb-calculation-details/${id}`
    );

    return response.data;
};


// ======================================================
// REACT QUERY - GET EB CALCULATION BY ID
// ======================================================

export const useEBCalculationById = (id) => {
    return useQuery({
        queryKey: [
            "eb-calculation",
            id,
        ],

        queryFn: () =>
            getEBCalculationById(id),

        enabled: !!id,

        staleTime: 5 * 60 * 1000,
    });
};


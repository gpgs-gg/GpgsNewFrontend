import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../../../api/ApiClient";   
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


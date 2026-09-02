import { useQuery } from "@tanstack/react-query";
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
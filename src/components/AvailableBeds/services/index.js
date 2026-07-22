import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../../../api/ApiClient";

const getAvailableBedsData = async ({
  page = 1,
  limit = 10,
  search = "",
  filters = {},
}) => {
  const params = {
    page,
    limit,
  };

  if (search?.trim()) params.search = search.trim();

  if (filters.propertyId) params.propertyId = filters.propertyId;
  if (filters.propertyLocation)
    params.propertyLocation = filters.propertyLocation;
  if (filters.gender) params.gender = filters.gender;
  if (filters.roomNo) params.roomNo = filters.roomNo;
  if (filters.bedNo) params.bedNo = filters.bedNo;
  if (filters.status) params.status = filters.status;
  if (filters.sharingType) params.sharingType = filters.sharingType;
  if (filters.acRoom) params.acRoom = filters.acRoom;
  if (filters.bathAttached) params.bathAttached = filters.bathAttached;

  if (filters.monthlyRentMin) params.monthlyRentMin = filters.monthlyRentMin;
  if (filters.monthlyRentMax) params.monthlyRentMax = filters.monthlyRentMax;

  if (filters.depositAmountMin)
    params.depositAmountMin = filters.depositAmountMin;
  if (filters.depositAmountMax)
    params.depositAmountMax = filters.depositAmountMax;
  if (filters.hasCvd) params.hasCvd = true;
  if (filters.sortByRent) params.sortByRent = true;
  return (await apiClient.get("/available-beds", { params })).data;
};

export const useAvailableBedsData = ({
  page = 1,
  limit = 10,
  search = "",
  filters = {},
  enabled = true,
}) => {
  return useQuery({
    queryKey: [
      "available-beds",
      page,
      limit,
      search,
      filters.propertyId,
      filters.propertyLocation,
      filters.gender,
      filters.roomNo,
      filters.bedNo,
      filters.status,
      filters.sharingType,
      filters.acRoom,
      filters.bathAttached,
      filters.monthlyRentMin,
      filters.monthlyRentMax,
      filters.depositAmountMin,
      filters.depositAmountMax,
      filters.hasCvd,
      filters.sortByRent,
    ],
    queryFn: () =>
      getAvailableBedsData({
        page,
        limit,
        search,
        filters,
      }),
    keepPreviousData: true,
    enabled,
  });
};


const getNewBooking = async () => {
  const response = await apiClient.get("/new-bookings");
  return response.data;
};

export const useNewBooking = (enabled = true) => {
  return useQuery({
    queryKey: ["get-new-booking-data"],
    queryFn: getNewBooking,
    enabled,// Only fetch when enabled is true
  });
};

const createNewBooking = async (data) => {
  const response = await apiClient.post("/new-bookings", data);
  return response.data;
};
export const useCreateNewBooking = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createNewBooking,
    onSuccess: () => {
      // 🔄 Refetch ticket sheet after update
      queryClient.invalidateQueries(["Create-New-Booking"]);
    },
  });
};



const createClientFromNewBooking = async (data) => {
  const response = await apiClient.post("/clients/create-from-booking", data);
  return response.data;
};
export const useClientFromNewBooking = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createClientFromNewBooking,
    onSuccess: () => {
      // 🔄 Refetch ticket sheet after update
      queryClient.invalidateQueries(["Create-New-Booking"]);
    },
  });
};
const cancelNewBooking = async (id) => {
  const response = await apiClient.put(`/new-bookings/cancel/${id}`);
  return response.data;
};
export const useCancelNewBooking = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: cancelNewBooking,
    onSuccess: () => {
      // 🔄 Refetch ticket sheet after update
      queryClient.invalidateQueries(["Create-New-Booking"]);
    },
  });
};
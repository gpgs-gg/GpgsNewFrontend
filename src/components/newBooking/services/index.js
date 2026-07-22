import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../../../api/ApiClient";

const getAvailableBedsData= async () => {
  const response = await apiClient.get("/available-beds");
  return response.data;
};

export const useAvailableBedsData = ( enabled = true ) => {
  return useQuery({
    queryKey: ["available-beds-data"],
    queryFn: getAvailableBedsData,
    enabled ,// Only fetch when enabled is true
  });
};


export const getNewBooking = async (params = {}) => {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== "" && value !== null && value !== undefined) {
      query.append(key, value);
    }
  });

  const { data } = await apiClient.get(`/new-bookings?${query.toString()}`);

  return data;
};
export const useNewBooking = (params) => {
  return useQuery({
    queryKey: ["get-new-booking-data", params],
    queryFn: () => getNewBooking(params),
    keepPreviousData: true,
    staleTime: 30000,
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
      queryClient.invalidateQueries(["get-new-booking-data"]);
    },
  });
};

const updateNewBookingForBooked = async ({id, data}) => {
  const response = await apiClient.put(`/new-bookings/${id}`, data);
  return response.data;
};
export const useUpdateNewBookingForBooked = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateNewBookingForBooked,
    onSuccess: () => {
      // 🔄 Refetch ticket sheet after update
      queryClient.invalidateQueries(["get-new-booking-data"]);
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
      queryClient.invalidateQueries(["get-new-booking-data"]);
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
      queryClient.invalidateQueries(["get-new-booking-data"]);
    },
  });
};

const getSingleNewBookingData = async (id) => {
  const response = await apiClient.get(`/new-bookings/${id}`);
  return response.data;
};

export const useSingleNewBookingData = (id) => {

  return useQuery({
    queryKey: ["get-new-booking-data", id],
    queryFn: () => getSingleNewBookingData(id),
    enabled: !!id,
  });
};

const deleteNewBookingData = async (id) => {
  const response = await apiClient.delete(`/new-bookings/${id}`);
  return response.data;
};

export const useDeleteNewBookingData = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteNewBookingData,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["get-new-booking-data"],
      });
    },
  });
};


const updateNewBooking = async ({ id, payload }) => {
  const response = await apiClient.put(
    `/new-bookings/${id}`,
    payload
  );
  return response.data;
};

export const useUpdateNewBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateNewBooking,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["get-new-booking-data"],
      });

      queryClient.invalidateQueries({
        queryKey: ["get-single-new-booking-data"],
      });
    },
  });
};


const toggleClientLogin = async (id) => {
  const response = await apiClient.patch(`/toggle-client-login/${id}`);
  return response.data;
};
export const useToggleClientLogin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: toggleClientLogin,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["get-new-booking-data"], // ya jo tumhari client list ki query key hai
      });
    },
  });
};



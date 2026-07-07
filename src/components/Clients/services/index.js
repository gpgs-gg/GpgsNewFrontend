import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../../../api/ApiClient";

const getClients= async () => {
  const response = await apiClient.get("/clients");
  return response.data;
};

export const useClients = ( enabled = true ) => {
  return useQuery({
    queryKey: ["get-clients-data"],
    queryFn: getClients,
    enabled ,// Only fetch when enabled is true
  });
};

const createClientData = async (data) => {
  const response = await apiClient.post("/clients", data);
  return response.data;
};
export const useCreateClientData = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createClientData,
    onSuccess: () => {
      // 🔄 Refetch ticket sheet after update
      queryClient.invalidateQueries(["create-client-data"]);
    },
  });
};



// ✅ Update property Sheet
const updateClientData = async ({ clientId, data }) => {
  const response = await apiClient.put(`/clients/${clientId}`, data);
  return response.data;
};
export const useUpdateClientData = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateClientData,
    onSuccess: () => {
      queryClient.invalidateQueries(["update-cleint-data"]);
    },
  });
};


const getSingleClientData = async (id) => {
  const response = await apiClient.get(`/clients/${id}`);
  return response.data;
};

export const useSingleClientData = (id) => {
  return useQuery({
    queryKey: ["client", id],
    queryFn: () => getSingleClientData(id),
    enabled: !!id,
  });
};



const getPropertiesDropdown= async () => {
  const response = await apiClient.get("/properties/dropdown");
  return response.data;
};

export const usePropertiesDropdown = ( enabled = true ) => {
  return useQuery({
    queryKey: ["properties-dropdown"],
    queryFn: getPropertiesDropdown,
    enabled ,// Only fetch when enabled is true
  });
};

const getBedsData= async () => {
  const response = await apiClient.get("/beds");
  return response.data;
};

export const useBedsData = ( enabled = true ) => {
  return useQuery({
    queryKey: ["beds-data"],
    queryFn: getBedsData,
    enabled ,// Only fetch when enabled is true
  });
};


const TransferBed = async (data) => {
  const response = await apiClient.post("/transfer-bed", data);
  return response.data;
};
export const useTransferBed = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: TransferBed,
    onSuccess: () => {
      // 🔄 Refetch ticket sheet after update
      queryClient.invalidateQueries(["transfer-bed"]);
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
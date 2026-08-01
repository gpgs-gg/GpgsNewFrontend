import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../../../api/ApiClient";

const getClients = async ({ page, limit, search, filters }) => {
  const params = {
    page,
    limit,
  };

  if (search?.trim()) {
    params.search = search.trim();
  }

  Object.entries(filters || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      params[key] = value;
    }
  });

  const response = await apiClient.get("/clients", {
    params,
  });

  return response.data;
};

export const useClients = (
  { page, limit, search, filters },
  enabled = true,
) => {
  return useQuery({
    queryKey: ["get-clients-data", page, limit, search, filters],
    queryFn: () =>
      getClients({
        page,
        limit,
        search,
        filters,
      }),
    keepPreviousData: true,
    enabled,
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


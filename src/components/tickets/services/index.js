import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../../../api/ApiClient";

// const getTicketsData= async () => {
//   const response = await apiClient.get("/tickets");
//   return response.data;
// };

// export const useTicketsData = ( enabled = true ) => {
//   return useQuery({
//     queryKey: ["tickets-data"],
//     queryFn: getTicketsData,
//     enabled ,// Only fetch when enabled is true
//   });
// };

// Get tickets data with pagination, search, and filters
export const getTicketsData = async ({
  page = 1,
  limit = 10,
  search = "",
  ...filters
}) => {
  const response = await apiClient.get("/tickets", {
    params: {
      page,
      limit,
      search,
      ...filters,
    },
  });

  return response.data;
};

export const useTicketsData = ({
  page = 1,
  limit = 10,
  search = "",
  enabled = true,
  ...filters
}) => {
  return useQuery({
    queryKey: [
      "tickets-data",
      page,
      limit,
      search,
      filters,
    ],
    queryFn: () =>
      getTicketsData({
        page,
        limit,
        search,
        ...filters,
      }),
    enabled,
    keepPreviousData: true,
  });
};

// Create ticket data
const createTicketData = async (data) => {
  const response = await apiClient.post("/tickets", data);
  return response.data;
};
export const useCreateTicketData = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createTicketData,
    onSuccess: () => {
      // 🔄 Refetch ticket sheet after update
      queryClient.invalidateQueries(["tickets-data"]);
    },
  });
};

// Get single ticket data
const getSingleTicketData = async (id) => {
  const response = await apiClient.get(`/tickets/${id}`);
  return response.data;
};
export const useSingleTicketData = (id) => {
  return useQuery({
    queryKey: ["ticket", id],
    queryFn: () => getSingleTicketData(id),
    enabled: !!id,
  });
};

// Update ticket data
const updateTicketData = async ({ id, data }) => {
  const response = await apiClient.put(`/tickets/${id}`, data);
  return response.data;
};
export const useUpdateTicketData = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateTicketData,
    onSuccess: () => {
      queryClient.invalidateQueries(["tickets-data"]);
    },
  });
};

// Get ticket dropdown data
export const getTicketDropdown = async ({
  page = 1,
  limit = 10,
  search = "",
}) => {
  const response = await apiClient.get("/tickets/dropdown", {
    params: {
      page,
      limit,
      search,
    },
  });

  return response.data;
};
export const useTicketDropdown = ({
  page = 1,
  limit = 10,
  search = "",
  enabled = true,
}) => {
  return useQuery({
    queryKey: [
      "ticket-dropdown",
      page,
      limit,
      search,
    ],
    queryFn: () =>
      getTicketDropdown({
        page,
        limit,
        search,
      }),
    enabled,
    keepPreviousData: true,
  });
};

// Delete ticket data
const deleteTicketData = async (id) => {
  const response = await apiClient.delete(`/tickets/${id}`);
  return response.data;
};
export const useDeleteTicketData = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteTicketData,
    onSuccess: () => {
      queryClient.invalidateQueries(["tickets-data"]);
    },
  });
};

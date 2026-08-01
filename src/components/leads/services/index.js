import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../../../api/ApiClient";

// ================= GET ALL LEADS =================

export const getLeadsData = async ({
  page = 1,
  limit = 10,
  search = "",
  ...filters
}) => {
  const response = await apiClient.get("/leads", {
    params: {
      page,
      limit,
      search,
      ...filters,
    },
  });

  return response.data;
};

export const useLeadsData = ({
  page = 1,
  limit = 10,
  search = "",
  enabled = true,
  ...filters
}) => {
  return useQuery({
    queryKey: [
      "leads-data",
      page,
      limit,
      search,
      filters,
    ],
    queryFn: () =>
      getLeadsData({
        page,
        limit,
        search,
        ...filters,
      }),
    enabled,
    keepPreviousData: true,
  });
};


// ================= CREATE LEAD =================

const createLeadData = async (data) => {
  const response = await apiClient.post("/leads", data);
  return response.data;
};

export const useCreateLeadData = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createLeadData,
    onSuccess: () => {
      queryClient.invalidateQueries(["leads-data"]);
    },
  });
};


// ================= SINGLE LEAD =================

const getSingleLeadData = async (id) => {
  const response = await apiClient.get(`/leads/${id}`);
  return response.data;
};

export const useSingleLeadData = (id) => {
  return useQuery({
    queryKey: ["lead", id],
    queryFn: () => getSingleLeadData(id),
    enabled: !!id,
  });
};


// ================= UPDATE LEAD =================

const updateLeadData = async ({ id, data }) => {
  const response = await apiClient.put(`/leads/${id}`, data);
  return response.data;
};

export const useUpdateLeadData = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateLeadData,
    onSuccess: () => {
      queryClient.invalidateQueries(["leads-data"]);
    },
  });
};


// ================= DROPDOWN =================

export const getLeadDropdown = async ({
  page = 1,
  limit = 10,
  search = "",
}) => {
  const response = await apiClient.get("/leads/dropdown", {
    params: {
      page,
      limit,
      search,
    },
  });

  return response.data;
};

export const useLeadDropdown = ({
  page = 1,
  limit = 10,
  search = "",
  enabled = true,
}) => {
  return useQuery({
    queryKey: [
      "lead-dropdown",
      page,
      limit,
      search,
    ],
    queryFn: () =>
      getLeadDropdown({
        page,
        limit,
        search,
      }),
    enabled,
    keepPreviousData: true,
  });
};


// ================= DELETE LEAD =================

const deleteLeadData = async (id) => {
  const response = await apiClient.delete(`/leads/${id}`);
  return response.data;
};

export const useDeleteLeadData = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteLeadData,
    onSuccess: () => {
      queryClient.invalidateQueries(["leads-data"]);
    },
  });
};


// ================= NAVIGATION =================

export const getLeadNavigation = async ({
  id,
  search = "",
  ...filters
}) => {
  const response = await apiClient.get(
    `/leads/navigation/${id}`,
    {
      params: {
        search,
        ...filters,
      },
    }
  );

  return response.data;
};

// ================= BULK CREATE LEAD =================

const bulkCreateLeadData=async(data)=>{
  const response=await apiClient.post("/leads/bulk",data);
  return response.data;
};

export const useBulkCreateLead=()=>{

const queryClient=useQueryClient();

return useMutation({

mutationFn:bulkCreateLeadData,

onSuccess:()=>{

queryClient.invalidateQueries(["leads-data"]);

}

});

};


const getLeadAutoTransfer = async () => {
  const response = await apiClient.get("/lead-auto-transfer");
  return response.data;
};

export const useLeadAutoTransfer = () => {
  return useQuery({
    queryKey: ["lead-auto-transfer"],
    queryFn: getLeadAutoTransfer,
  });
};

const updateLeadAutoTransfer = async (leadAutoTransfer) => {
  const response = await apiClient.put("/lead-auto-transfer", {
    leadAutoTransfer,
  });

  return response.data;
};

export const useUpdateLeadAutoTransfer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateLeadAutoTransfer,

    onSuccess: () => {
      queryClient.invalidateQueries([
        "lead-auto-transfer",
      ]);
    },
  });
};
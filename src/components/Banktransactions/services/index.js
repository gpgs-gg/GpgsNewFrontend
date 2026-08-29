import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../../../api/ApiClient";

// // const getBankTransactionData= async () => {
// //   const response = await apiClient.get("/bank");
// //   return response.data;
// // };

// // export const useBankTransactionData = ( enabled = true ) => {
// //   return useQuery({
// //     queryKey: ["bank-transaction-data"],
// //     queryFn: getBankTransactionData,
// //     enabled ,// Only fetch when enabled is true
// //   });
// // };




const getBedsData = async ({ page = 1, limit = 10, search, filters = {} }) => {
  const params = {
    page,
    limit,
  };
  if (search?.trim()) {
    params.search = search.trim();
  }
  
  if (filters.propertyId) {
    params.propertyId = filters.propertyId;
  }
  if (filters.gender) {
    params.gender = filters.gender;
  }
  if (filters.sharingType) {
    params.sharingType = filters.sharingType;
  }
  if (filters.bathAttached) {
    params.bathAttached = filters.bathAttached;
  }
  if (filters.propertyLocation) {
    params.propertyLocation = filters.propertyLocation;
  }
  if (filters.acRoom) {
    params.acRoom = filters.acRoom;
  }
  if (filters.roomNo) {
    params.roomNo = filters.roomNo;
  }
  if (filters.bedNo) {
    params.bedNo = filters.bedNo;
  }
  if (filters.status) {
    params.status = filters.status;
  }
  const response = await apiClient.get("/beds", {
    params,
  });
  return response.data;
};
export const useBedsData = ({
  page = 1,
  limit = 10,
  search = "",
  filters = {},
  enabled = true,
}) => {
  return useQuery({
    queryKey: [
      "beds-data",
      page,
      limit,
      search,
      filters.propertyId,
      filters.gender,
      filters.sharingType,
      filters.bathAttached,
      filters.acRoom,
      filters.roomNo,
      filters.bedNo,
      filters.status,
      filters.propertyLocation,
    ],
    queryFn: () =>
      getBedsData({
        page,
        limit,
        search,
        filters,
      }),
    enabled,
    keepPreviousData: true,
  });
};


const getBankTransactionData = async ({
  page = 1,
  limit = 10,
  search = "",
  filters = {},
}) => {
  const params = { page, limit };

  if (search?.trim()) {
    params.search = search.trim();
  }

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      params[key] = value;
    }
  });

  const response = await apiClient.get("/bank", { params });
  return response.data;
};

export const useBankTransactionData = ({
  page = 1,
  limit = 10,
  search = "",
  filters = {},
  enabled = true,
} = {}) => {
  return useQuery({
    queryKey: ["bank-transaction-data", page, limit, search, filters],
    queryFn: () =>
      getBankTransactionData({
        page,
        limit,
        search,
        filters,
      }),
    enabled,
    placeholderData: (previousData) => previousData,
  });
};

// ================= UPLOAD BANK STATEMENT =================

const uploadBankStatement = async ({ file, account }) => {
  const formData = new FormData();

  formData.append("file", file);
  formData.append("account", account);

  const response = await apiClient.post(
    "/bank/upload",
    formData
  );

  return response.data;
};

export const useUploadBankStatement = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: uploadBankStatement,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["bank-transaction-data"],
      });
    },
  });
};

// ================= GET SINGLE TRANSACTION =================

const getBankTransactionById = async ({ account, id }) => {
  const response = await apiClient.get(
    `/bank/${account}/${id}`
  );

  return response.data;
};

export const useBankTransactionById = ({
  account,
  id,
  enabled = true,
}) => {
  return useQuery({
    queryKey: ["bank-transaction-by-id", account, id],
    queryFn: () =>
      getBankTransactionById({
        account,
        id,
      }),
    enabled: enabled && !!account && !!id,
  });
};

// ================= UPDATE TRANSACTION =================

const updateBankTransaction = async ({
  account,
  id,
  data,
}) => {
  const response = await apiClient.put(
    `/bank/${account}/${id}`,
    data
  );

  return response.data;
};

export const useUpdateBankTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateBankTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["bank-transaction-data"],
      });

      queryClient.invalidateQueries({
        queryKey: ["bank-transaction-by-id"],
      });
    },
  });
};

// ================= DELETE TRANSACTION =================

const deleteBankTransaction = async ({
  account,
  id,
}) => {
  const response = await apiClient.delete(
    `/bank/${account}/${id}`
  );

  return response.data;
};

export const useDeleteBankTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteBankTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["bank-transaction-data"],
      });
    },
  });
};

// ================= DELETE MULTIPLE =================

const deleteMultipleBankTransactions = async (ids) => {
  const response = await apiClient.delete(
    "/bank/multiple",
    {
      data: { ids },
    }
  );

  return response.data;
};

export const useDeleteMultipleBankTransactions = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteMultipleBankTransactions,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["bank-transaction-data"],
      });
    },
  });
};

// ================= GET SUMMARY =================

const getBankTransactionSummary = async (filters = {}) => {
  const params = {};

  Object.entries(filters).forEach(([key, value]) => {
    if (
      value !== undefined &&
      value !== null &&
      value !== ""
    ) {
      params[key] = value;
    }
  });

  const response = await apiClient.get(
    "/bank/summary",
    { params }
  );

  return response.data;
};

export const useBankTransactionSummary = ({
  filters = {},
  enabled = true,
} = {}) => {
  return useQuery({
    queryKey: ["bank-transaction-summary", filters],
    queryFn: () =>
      getBankTransactionSummary(filters),
    enabled,
  });
};

// ================= GET CLIENTS BY PROPERTY =================

const getClientDataByProperty = async (id) => {
  const response = await apiClient.get(
    `/bank/clients/property/${id}`
  );

  return response.data;
};

export const useClientDataByProperty = (id) => {
  return useQuery({
    queryKey: ["get-client-data-by-property", id],
    queryFn: () => getClientDataByProperty(id),
    enabled: !!id,
  });
};

// ================= UPDATE RENT RECEIVED =================

const updateBankTransactionReceived = async (data) => {
  const response = await apiClient.put(
    "/bank/transaction-received",
    data
  );

  return response.data;
};

export const useUpdateBankTransactionReceived = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateBankTransactionReceived,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["client-rent-history"],
      });

      queryClient.invalidateQueries({
        queryKey: ["bank-transaction-data"],
      });
    },
  });
};

// ================= GET BY NARRATION =================

const getTransactionByNarration = async (narration) => {
  const response = await apiClient.get(
    `/bank/narration/${encodeURIComponent(narration)}`
  );

  return response.data;
};

export const useTransactionByNarration = (
  narration,
  enabled = true
) => {
  return useQuery({
    queryKey: [
      "bank-transaction-by-narration",
      narration,
    ],
    queryFn: () =>
      getTransactionByNarration(narration),
    enabled: enabled && !!narration?.trim(),
  });
};
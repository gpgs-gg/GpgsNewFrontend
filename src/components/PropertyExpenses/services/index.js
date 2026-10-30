import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../../../api/ApiClient";
// ====================== GET ALL PROPERTY EXPENSES ======================
const getPropertyExpensesData = async ({
  page = 1,
  limit = 10,
  search = "",
  filters = {},
}) => {
  const params = { page, limit };

  if (search?.trim()) params.search = search.trim();
  if (filters.propertyId) params.propertyId = filters.propertyId;
  if (filters.category) params.category = filters.category;
  if (filters.fromDate) params.fromDate = filters.fromDate;
  if (filters.toDate) params.toDate = filters.toDate;

  const response = await apiClient.get("/property-expenses", { params });
  return response.data;
};

export const usePropertyExpensesData = ({
  page = 1,
  limit = 10,
  search = "",
  filters = {},
  enabled = true,
}) => {
  return useQuery({
    queryKey: [
      "property-expenses",
      page,
      limit,
      search,
      filters.propertyId,
      filters.category,
      filters.fromDate,
      filters.toDate,
    ],
    queryFn: () => getPropertyExpensesData({ page, limit, search, filters }),
    enabled,
    keepPreviousData: true,
  });
};

// ====================== GET EXPENSES BY PROPERTY ID ======================

const getExpensesByPropertyIdData = async ({
  propertyId,
  page = 1,
  limit = 10,
  search = "",
  filters = {},
}) => {
  const params = { page, limit };

  if (search?.trim()) params.search = search.trim();
  if (filters.category) params.category = filters.category;
  if (filters.fromDate) params.fromDate = filters.fromDate;
  if (filters.toDate) params.toDate = filters.toDate;

  // Must match the Express route:
  // /propertyExpense/:propertyId
  const response = await apiClient.get(
    `/property-expenses/propertyExpense/${propertyId}`,
    { params },
  );

  return response.data;
};

export const useExpensesByPropertyId = ({
  propertyId,
  page = 1,
  limit = 10,
  search = "",
  filters = {},
  enabled = true,
}) => {
  return useQuery({
    queryKey: [
      "property-expenses-by-property",
      propertyId,
      page,
      limit,
      search,
      filters.category,
      filters.fromDate,
      filters.toDate,
    ],
    queryFn: () =>
      getExpensesByPropertyIdData({
        propertyId,
        page,
        limit,
        search,
        filters,
      }),
    enabled: enabled && !!propertyId,
    keepPreviousData: true,
  });
};

// ====================== GET PROPERTY EXPENSE SUMMARY ======================

const getPropertyExpenseSummaryData = async (filters = {}) => {
  const params = {};

  if (filters.propertyId) params.propertyId = filters.propertyId;
  if (filters.category) params.category = filters.category;
  if (filters.fromDate) params.fromDate = filters.fromDate;
  if (filters.toDate) params.toDate = filters.toDate;

  const response = await apiClient.get("/property-expenses/summary", {
    params,
  });

  return response.data;
};

export const usePropertyExpenseSummary = ({
  filters = {},
  enabled = true,
} = {}) => {
  return useQuery({
    queryKey: [
      "property-expense-summary",
      filters.propertyId,
      filters.category,
      filters.fromDate,
      filters.toDate,
    ],
    queryFn: () => getPropertyExpenseSummaryData(filters),
    enabled,
  });
};

// ====================== CREATE PROPERTY EXPENSE ======================

const createPropertyExpenseData = async (data) => {
  const response = await apiClient.post("/property-expenses", data);
  return response.data;
};

export const useCreatePropertyExpense = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createPropertyExpenseData,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["property-expenses"],
      });

      queryClient.invalidateQueries({
        queryKey: ["property-expenses-by-property"],
      });

      queryClient.invalidateQueries({
        queryKey: ["property-expense-summary"],
      });
    },
  });
};

// ====================== UPDATE PROPERTY EXPENSE ======================

const updatePropertyExpenseData = async ({ id, data }) => {
  const response = await apiClient.put(`/property-expenses/${id}`, data);
  return response.data;
};

export const useUpdatePropertyExpense = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updatePropertyExpenseData,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["property-expenses"],
      });

      queryClient.invalidateQueries({
        queryKey: ["property-expenses-by-property"],
      });

      queryClient.invalidateQueries({
        queryKey: ["property-expense-summary"],
      });
    },
  });
};

// ====================== DELETE PROPERTY EXPENSE ======================

const deletePropertyExpenseData = async (id) => {
  const response = await apiClient.delete(`/property-expenses/${id}`);
  return response.data;
};

export const useDeletePropertyExpense = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deletePropertyExpenseData,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["property-expenses"],
      });

      queryClient.invalidateQueries({
        queryKey: ["property-expenses-by-property"],
      });

      queryClient.invalidateQueries({
        queryKey: ["property-expense-summary"],
      });
    },
  });
};
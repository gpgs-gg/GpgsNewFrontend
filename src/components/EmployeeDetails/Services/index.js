import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { apiClient } from "../../../api/ApiClient";

export const toggleEmployeeLoginApi = async (employeeId) => {
  const response = await apiClient.patch("/employees/toggle-login", {
    employeeId,
  });

  return response.data;
};
export const useToggleEmployeeLogin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: toggleEmployeeLoginApi,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["EmployeeDetails"],
      });
      queryClient.invalidateQueries({
        queryKey: ["Employee"],
      });
    },
  });
};
export const useLoginEnabledEmployees = () => {
  return useQuery({
    queryKey: ["login-enabled-employees"],
    queryFn: async () => {
      const response = await apiClient.get("/employees/login-enabled");

      return response.data;
    },
  });
};

export const getEmployeeDetails = async ({
  page = 1,
  limit = 10,
  search = "",
  filters = {},
}) => {
  const params = {
    page,
    limit,
  };

  if (search?.trim()) {
    params.search = search.trim();
  }

  if (filters.departmentId) {
    params.departmentId = filters.departmentId;
  }

  if (filters.teamCodeId) {
    params.teamCodeId = filters.teamCodeId;
  }

  if (filters.statusId) {
    params.statusId = filters.statusId;
  }

  const response = await apiClient.get("/employees", {
    params,
  });

  return response.data;
};

export const useEmployeeDetailsData = ({
  page = 1,
  limit = 10,
  search = "",
  filters = {},
  enabled = true,
}) => {
  return useQuery({
    queryKey: [
      "EmployeeDetails",
      page,
      limit,
      search,
      filters.departmentId,
      filters.teamCodeId,
      filters.statusId,
    ],

    queryFn: () =>
      getEmployeeDetails({
        page,
        limit,
        search,
        filters,
      }),

    enabled,
    staleTime: 0,
  });
};

// ============================================================
// GET SINGLE EMPLOYEE
// ============================================================

export const getEmployeeById = async (id) => {
  const response = await apiClient.get(`/employees/${id}`);

  return response.data;
};

export const useEmployeeById = (id) => {
  return useQuery({
    queryKey: ["Employee", id],

    queryFn: () => getEmployeeById(id),

    enabled: !!id,
  });
};

// ============================================================
// CREATE EMPLOYEE
// ============================================================

export const createEmployeeDetails = async (payload) => {
  const response = await apiClient.post("/employees", payload);

  return response.data;
};

export const useCreateEmployee = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createEmployeeDetails,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["EmployeeDetails"],
      });
    },
  });
};

// ============================================================
// UPDATE EMPLOYEE
// ============================================================

export const updateEmployeeDetails = async ({ id, payload }) => {
  const response = await apiClient.put(`/employees/${id}`, payload);

  return response.data;
};

export const useUpdateEmployee = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateEmployeeDetails,

    onSuccess: (_, variables) => {
      // Refresh employee list
      queryClient.invalidateQueries({
        queryKey: ["EmployeeDetails"],
      });

      // Refresh individual employee
      if (variables?.id) {
        queryClient.invalidateQueries({
          queryKey: ["Employee", variables.id],
        });
      }
    },
  });
};

// ============================================================
// DELETE / DEACTIVATE EMPLOYEE
// ============================================================

export const deleteEmployee = async (id) => {
  const response = await apiClient.delete(`/employees/${id}`);
  return response.data;
};

export const useDeleteEmployee = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteEmployee,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["EmployeeDetails"],
      });
    },
  });
};

// ============================================================
// EMPLOYEE DOCUMENT UPLOAD
// ============================================================

export const uploadEmployeeDocs = async ({ employeeId, formData }) => {
  const response = await apiClient.post(
    `/employees/${employeeId}/documents`,
    formData,
  );

  return response.data;
};
export const useUploadEmployeeDocs = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: uploadEmployeeDocs,

    onSuccess: (_, variables) => {
      // Refresh employee list
      queryClient.invalidateQueries({
        queryKey: ["EmployeeDetails"],
      });

      // Refresh employee detail
      if (variables?.employeeId) {
        queryClient.invalidateQueries({
          queryKey: ["Employee", variables.employeeId],
        });
      }
    },

    onError: (error) => {
      console.error("Employee document upload failed:", error);
    },
  });
};

// ============================================================
// EMPLOYEE WORKLOGS
// ============================================================

export const getEmployeeWorklogs = async ({
  employeeId,
  page = 1,
  limit = 20,
}) => {
  const response = await apiClient.get(`/employees/${employeeId}/worklogs`, {
    params: {
      page,
      limit,
    },
  });

  return response.data;
};

export const useEmployeeWorklogs = ({ employeeId, page = 1, limit = 20 }) => {
  return useQuery({
    queryKey: ["EmployeeWorklogs", employeeId, page, limit],

    queryFn: () =>
      getEmployeeWorklogs({
        employeeId,
        page,
        limit,
      }),

    enabled: !!employeeId,
  });
};

// ============================================================
// CREATE WORKLOG
// ============================================================

export const createEmployeeWorklog = async ({ employeeId, payload }) => {
  const response = await apiClient.post(
    `/employees/${employeeId}/worklogs`,
    payload,
  );

  return response.data;
};

export const useCreateEmployeeWorklog = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createEmployeeWorklog,

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["EmployeeWorklogs", variables.employeeId],
      });

      queryClient.invalidateQueries({
        queryKey: ["EmployeeDetails"],
      });
    },
  });
};

// ============================================================
// UPDATE WORKLOG
// ============================================================

export const updateEmployeeWorklog = async ({ worklogId, payload }) => {
  const response = await apiClient.put(
    `/employees/worklogs/${worklogId}`,
    payload,
  );

  return response.data;
};

export const useUpdateEmployeeWorklog = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateEmployeeWorklog,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["EmployeeWorklogs"],
      });
    },
  });
};

// ============================================================
// DELETE WORKLOG
// ============================================================

export const deleteEmployeeWorklog = async (worklogId) => {
  const response = await apiClient.delete(`/employees/worklogs/${worklogId}`);

  return response.data;
};

export const useDeleteEmployeeWorklog = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteEmployeeWorklog,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["EmployeeWorklogs"],
      });
    },
  });
};

// ============================================================
// DYNAMIC MASTER OPTIONS
// ============================================================

export const fetchDropDowlList = async () => {
  const response = await apiClient.get("/options");

  return response.data;
};

export const useDropDowlList = () => {
  return useQuery({
    queryKey: ["dynamic-options"],

    queryFn: fetchDropDowlList,

    staleTime: Infinity,

    refetchOnWindowFocus: false,
  });
};
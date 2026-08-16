import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../../../api/ApiClient";

// ============================================================
// SALARY LIST
// ============================================================

export const getSalaryDetails = async (params = {}) => {
  const response = await apiClient.get("/salaries", {
    params,
  });

  return response.data;
};

export const useSalaryDetailsData = (params = {}) => {
  return useQuery({
    queryKey: ["SalaryDetails", params],
    queryFn: () => getSalaryDetails(params),
    staleTime: 0,
  });
};

// ============================================================
// GET SINGLE SALARY
// ============================================================

export const getSalaryById = async (id) => {
  const response = await apiClient.get(`/salaries/${id}`);

  return response.data;
};

export const useSalaryById = (id) => {
  return useQuery({
    queryKey: ["Salary", id],
    queryFn: () => getSalaryById(id),
    enabled: !!id,
  });
};

// ============================================================
// GET EMPLOYEE SALARY
// ============================================================

export const getEmployeeSalary = async ({ employeeId, month, year }) => {
  const response = await apiClient.get("/salaries/employee", {
    params: {
      employeeId,
      month,
      year,
    },
  });

  return response.data;
};

export const useEmployeeSalary = ({ employeeId, month, year }) => {
  return useQuery({
    queryKey: ["EmployeeSalary", employeeId, month, year],

    queryFn: () =>
      getEmployeeSalary({
        employeeId,
        month,
        year,
      }),

    enabled: !!employeeId && !!month && !!year,
  });
};

// ============================================================
// UPDATE SALARY
// ============================================================

// ============================================================
// UPDATE SALARY
// ============================================================

export const updateSalaryDetails = async ({ employeeId, payload }) => {
  const response = await apiClient.patch(
    `/salaries/employee/${employeeId}`,
    payload,
  );

  return response.data;
};

export const useUpdateSalary = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateSalaryDetails,

    onSuccess: (_, variables) => {
      // Refresh salary table
      queryClient.invalidateQueries({
        queryKey: ["SalaryDetails"],
      });

      // Refresh employee salary
      if (
        variables?.employeeId &&
        variables?.payload?.month &&
        variables?.payload?.year
      ) {
        queryClient.invalidateQueries({
          queryKey: [
            "EmployeeSalary",
            variables.employeeId,
            variables.payload.month,
            variables.payload.year,
          ],
        });
      }
    },

    onError: (error) => {
      console.error("Update salary failed:", error);
    },
  });
};
// ============================================================
// EMPLOYEE LIST FOR SALARY
// ============================================================

export const getSalaryEmployees = async (params = {}) => {
  const response = await apiClient.get("/employees", {
    params: {
      ...params,
      limit: 100,
    },
  });

  return response.data;
};

export const useSalaryEmployees = (params = {}) => {
  return useQuery({
    queryKey: ["SalaryEmployees", params],
    queryFn: () => getSalaryEmployees(params),
    staleTime: 0,
  });
};

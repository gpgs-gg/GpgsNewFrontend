import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiClient } from "../../../api/ApiClient";

// =====================================================
// GET MY PERMISSIONS / SIDEBAR
// =====================================================

const getMyPermissionsData = async () => {
  const response = await apiClient.get("/permissions/my");

  return response.data;
};

export const useMyPermissionsData = (enabled = true) => {
  return useQuery({
    queryKey: ["my-permissions"],

    queryFn: getMyPermissionsData,

    enabled,
  });
};

// =====================================================
// GET EMPLOYEE PERMISSIONS
// =====================================================

const getEmployeePermissionsData = async (employeeId) => {
  const response = await apiClient.get(`/permissions/employee/${employeeId}`);

  return response.data;
};

export const useEmployeePermissionsData = (employeeId, enabled = true) => {
  return useQuery({
    queryKey: ["employee-permissions", employeeId],

    queryFn: () => getEmployeePermissionsData(employeeId),

    enabled: !!employeeId && enabled,
  });
};

// =====================================================
// CREATE / UPDATE EMPLOYEE PERMISSIONS
// =====================================================

const updateEmployeePermissionsData = async ({ employeeId, permissions }) => {
  const response = await apiClient.put(`/permissions/employee/${employeeId}`, {
    permissions,
  });

  return response.data;
};

export const useUpdateEmployeePermissionsData = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateEmployeePermissionsData,

    onSuccess: (_, variables) => {
      // Refresh employee permission data
      queryClient.invalidateQueries({
        queryKey: ["employee-permissions", variables.employeeId],
      });

      // Refresh current user's permissions/sidebar
      queryClient.invalidateQueries({
        queryKey: ["my-permissions"],
      });
    },
  });
};

// =====================================================
// RESET / DELETE EMPLOYEE PERMISSIONS
// =====================================================

const resetEmployeePermissionsData = async (employeeId) => {
  const response = await apiClient.delete(
    `/permissions/employee/${employeeId}`,
  );

  return response.data;
};

export const useResetEmployeePermissionsData = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: resetEmployeePermissionsData,

    onSuccess: (_, employeeId) => {
      // Refresh employee permissions
      queryClient.invalidateQueries({
        queryKey: ["employee-permissions", employeeId],
      });

      // Refresh current user's permissions/sidebar
      queryClient.invalidateQueries({
        queryKey: ["my-permissions"],
      });
    },
  });
};

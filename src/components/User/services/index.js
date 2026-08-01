import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../../../api/ApiClient";

// ======================= GET USERS =======================

const getUsersData = async ({
  page = 1,
  limit = 10,
  search,
  filters = {},
}) => {
  const params = {
    page,
    limit,
  };

  if (search?.trim()) {
    params.search = search.trim();
  }

 if (filters.userId) {
    params.userId = filters.userId;
  }

  if (filters.isActive !== undefined && filters.isActive !== "") {
    params.isActive = filters.isActive;
  }

  const response = await apiClient.get("/users", {
    params,
  });

  return response.data;
};

export const useUsersData = ({
  page = 1,
  limit = 10,
  search = "",
  filters = {},
  enabled = true,
}) => {
  return useQuery({
    queryKey: [
      "users-data",
      page,
      limit,
      search,
      filters.role,
      filters.isActive,
      filters.userId,
    ],
    queryFn: () =>
      getUsersData({
        page,
        limit,
        search,
        filters,
      }),
    enabled,
    keepPreviousData: true,
  });
};

// // ======================= CREATE USER =======================

// const createUserData = async (data) => {
//   const response = await apiClient.post("/users", data);
//   return response.data;
// };

// export const useCreateUserData = () => {
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationFn: createUserData,
//     onSuccess: () => {
//       queryClient.invalidateQueries({
//         queryKey: ["users-data"],
//       });
//     },
//   });
// };

// ======================= GET SINGLE USER =======================

const getSingleUserData = async (id) => {
  const response = await apiClient.get(`/users/${id}`);
  return response.data;
};

export const useSingleUserData = (id) => {
  return useQuery({
    queryKey: ["user", id],
    queryFn: () => getSingleUserData(id),
    enabled: !!id,
  });
};

// ======================= UPDATE USER =======================

const updateUserData = async ({ id, data }) => {
  const response = await apiClient.put(`/users/${id}`, data);
  return response.data;
};

export const useUpdateUserData = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateUserData,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["users-data"],
      });
    },
  });
};

// ======================= DELETE USER =======================

const deleteUserData = async (id) => {
  const response = await apiClient.delete(`/users/${id}`);
  return response.data;
};

export const useDeleteUserData = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteUserData,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["users-data"],
      });
    },
  });
};

// ======================= USER DROPDOWN =======================

export const getUserDropdown = async ({
  page = 1,
  limit = 10,
  search = "",
}) => {
  const response = await apiClient.get("/users/dropdown", {
    params: {
      page,
      limit,
      search,
    },
  });

  return response.data;
};

export const useUserDropdown = ({
  page = 1,
  limit = 10,
  search = "",
  enabled = true,
}) => {
  return useQuery({
    queryKey: ["user-dropdown", page, limit, search],
    queryFn: () =>
      getUserDropdown({
        page,
        limit,
        search,
      }),
    enabled,
    keepPreviousData: true,
  });
};
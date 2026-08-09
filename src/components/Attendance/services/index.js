import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiClient } from "../../../api/ApiClient";

// ======================================================
// GET TODAY ATTENDANCE
// ======================================================

const getTodayAttendance = async () => {
  const response = await apiClient.get("/attendance/today");

  return response.data;
};

export const useTodayAttendance = () => {
  return useQuery({
    queryKey: ["attendance-today"],
    queryFn: getTodayAttendance,
  });
};

// ======================================================
// GET MY ATTENDANCE HISTORY
// ======================================================

const getMyAttendance = async ({ page = 1, limit = 10, month = "" }) => {
  const response = await apiClient.get("/attendance/my", {
    params: {
      page,
      limit,
      ...(month && { month }),
    },
  });

  return response.data;
};

export const useMyAttendance = ({ page = 1, limit = 10, month = "" }) => {
  return useQuery({
    queryKey: ["attendance-history", page, limit, month],

    queryFn: () =>
      getMyAttendance({
        page,
        limit,
        month,
      }),

    keepPreviousData: true,
  });
};

// ======================================================
// CHECK IN
// ======================================================

const checkInAttendance = async (formData) => {
  const response = await apiClient.post("/attendance/check-in", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};

export const useCheckInAttendance = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: checkInAttendance,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["attendance-today"],
      });

      queryClient.invalidateQueries({
        queryKey: ["attendance-history"],
      });
    },
  });
};

// ======================================================
// CHECK OUT
// ======================================================

const checkOutAttendance = async (formData) => {
  const response = await apiClient.post("/attendance/check-out", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};

export const useCheckOutAttendance = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: checkOutAttendance,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["attendance-today"],
      });

      queryClient.invalidateQueries({
        queryKey: ["attendance-history"],
      });
    },
  });
};

// ======================================================
// GET SINGLE ATTENDANCE
// ======================================================

const getSingleAttendance = async (id) => {
  const response = await apiClient.get(`/attendance/${id}`);

  return response.data;
};

export const useSingleAttendance = (id) => {
  return useQuery({
    queryKey: ["attendance", id],

    queryFn: () => getSingleAttendance(id),

    enabled: !!id,
  });
};

// ======================================================
// UPDATE ATTENDANCE
// ======================================================

const updateAttendance = async ({ id, data }) => {
  const response = await apiClient.put(`/attendance/${id}`, data);

  return response.data;
};

export const useUpdateAttendance = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateAttendance,

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["attendance-history"],
      });

      queryClient.invalidateQueries({
        queryKey: ["attendance-today"],
      });

      queryClient.invalidateQueries({
        queryKey: ["attendance", variables.id],
      });
    },
  });
};

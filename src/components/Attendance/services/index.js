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
// GET ALL EMPLOYEE ATTENDANCE
// ======================================================

const getAllAttendance = async ({
  page = 1,
  limit = 10,
  month = "",
  date = "",
  status = "",
  employeeId = "",
  department = "",
  search = "",
}) => {
  const response = await apiClient.get("/attendance", {
    params: {
      page,
      limit,

      ...(month && { month }),
      ...(date && { date }),
      ...(status !== "" && { status }),
      ...(employeeId && { employeeId }),
      ...(department && { department }),
      ...(search && { search }),
    },
  });

  return response.data;
};

export const useAllAttendance = ({
  page = 1,
  limit = 10,
  month = "",
  date = "",
  status = "",
  employeeId = "",
  department = "",
  search = "",
}) => {
  return useQuery({
    queryKey: [
      "attendance-all",
      page,
      limit,
      month,
      date,
      status,
      employeeId,
      department,
      search,
    ],

    queryFn: () =>
      getAllAttendance({
        page,
        limit,
        month,
        date,
        status,
        employeeId,
        department,
        search,
      }),

    placeholderData: (previousData) => previousData,
  });
};

//  regularize attendance
export const useRegularizeAttendance = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData) => {
      const response = await apiClient.post(
        "/attendance/admin/regularize",
        formData,
      );

      return response.data;
    },

    onSuccess: () => {
      // Refresh All Attendance table
      queryClient.invalidateQueries({
        queryKey: ["attendance-all"],
      });

      // Optional: refresh single attendance if you use it elsewhere
      queryClient.invalidateQueries({
        queryKey: ["attendance"],
      });

      // Optional if regularization can affect today's attendance
      queryClient.invalidateQueries({
        queryKey: ["attendance-today"],
      });

      // Optional if regularization can affect employee attendance history
      queryClient.invalidateQueries({
        queryKey: ["attendance-history"],
      });
    },
  });
};
// export const useRegularizeAttendance = () => {
//   return useMutation({
//     mutationFn: async (formData) => {
//       const response = await apiClient.post(
//         "/attendance/admin/regularize",
//         formData,
//       );

//       return response.data;
//     },
//   });
// };
// ---
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
// DELETE ATTENDANCE
// ======================================================

const deleteAttendance = async (id) => {
  const response = await apiClient.delete(`/attendance/${id}`);

  return response.data;
};

export const useDeleteAttendance = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteAttendance,

    onSuccess: () => {
      // Refresh All Attendance table
      queryClient.invalidateQueries({
        queryKey: ["attendance-all"],
      });

      // Refresh single attendance if used elsewhere
      queryClient.invalidateQueries({
        queryKey: ["attendance"],
      });

      // Refresh employee attendance history
      queryClient.invalidateQueries({
        queryKey: ["attendance-history"],
      });

      // Refresh today's attendance
      queryClient.invalidateQueries({
        queryKey: ["attendance-today"],
      });
    },
  });
};

// ======================================================
// CREATE ATTENDANCE REQUEST
// ======================================================

const createAttendanceRequest = async (formData) => {
  const response = await apiClient.post("/attendance-requests", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};

export const useCreateAttendanceRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createAttendanceRequest,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["attendance-requests"],
      });
    },
  });
};

// ======================================================
// GET ATTENDANCE REQUESTS
// ======================================================

const getAttendanceRequests = async ({
  page = 1,
  limit = 10,
  requestedBy = "",
  requestedTo = "",
  status = "",
}) => {
  const response = await apiClient.get("/attendance-requests", {
    params: {
      page,
      limit,
      ...(requestedBy && { requestedBy }),
      ...(requestedTo && { requestedTo }),
      ...(status && { status }),
    },
  });

  return response.data;
};

export const useAttendanceRequests = ({
  page = 1,
  limit = 10,
  requestedBy = "",
  requestedTo = "",
  status = "",
} = {}) => {
  return useQuery({
    queryKey: [
      "attendance-requests",
      page,
      limit,
      requestedBy,
      requestedTo,
      status,
    ],

    queryFn: () =>
      getAttendanceRequests({
        page,
        limit,
        requestedBy,
        requestedTo,
        status,
      }),

    placeholderData: (previousData) => previousData,
  });
};

// ======================================================
// GET SINGLE ATTENDANCE REQUEST
// ======================================================
// ======================================================
// GET ALL ATTENDANCE REQUESTS
// ======================================================
const getAllAttendanceRequests = async (params) => {
  const response = await apiClient.get("/attendance-requests", { params });
  return response.data;
};

export const useAllAttendanceRequests = (params) => {
  return useQuery({
    queryKey: ["attendance-requests", params],
    queryFn: () => getAllAttendanceRequests(params),
    keepPreviousData: true,
  });
};

// ======================================================
// GET SINGLE ATTENDANCE REQUEST
// ======================================================
const getSingleAttendanceRequest = async (id) => {
  const response = await apiClient.get(`/attendance-requests/${id}`);
  return response.data;
};

export const useSingleAttendanceRequest = (id) => {
  return useQuery({
    queryKey: ["attendance-request", id],
    queryFn: () => getSingleAttendanceRequest(id),
    enabled: !!id,
  });
};

// ======================================================
// APPROVE / REJECT
const updateAttendanceRequestStatus = async ({ id, ...payload }) => {
  const response = await apiClient.patch(
    `/attendance-requests/${id}/status`,
    payload,
  );
  return response.data;
};

export const useUpdateAttendanceRequestStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateAttendanceRequestStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendance-requests"] });
      queryClient.invalidateQueries({ queryKey: ["attendance-request"] });
      queryClient.invalidateQueries({
        queryKey: ["attendance-requests"],
      });
    },
  });
};


// ======================================================
// DELETE
// ======================================================
const deleteAttendanceRequest = async (id) => {
  const response = await apiClient.delete(`/attendance-requests/${id}`);
  return response.data;
};

export const useDeleteAttendanceRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteAttendanceRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendance-requests"] });
    },
  });
};


// ======================================================
// GET ATTENDANCE REQUESTS ASSIGNED TO ME (for managers)
// ======================================================
const getAttendanceRequestsAssignedToMe = async (params) => {
  const response = await apiClient.get("/attendance-requests/assigned-to-me", {
    params,
  });
  return response.data;
};

export const useAttendanceRequestsAssignedToMe = (params) => {
  return useQuery({
    queryKey: ["attendance-requests-assigned-to-me", params],
    queryFn: () => getAttendanceRequestsAssignedToMe(params),
    keepPreviousData: true,
  });
};


// GET MY ATTENDANCE REQUESTS
const getMyAttendanceRequests = async ({
  page = 1,
  limit = 10,
  status,
} = {}) => {
  const response = await apiClient.get("/attendance-requests/my-requests", {
    params: { page, limit, ...(status ? { status } : {}) },
  });

  return response.data;
};

export const useMyAttendanceRequests = (params = {}) => {
  return useQuery({
    queryKey: ["my-attendance-requests", params],
    queryFn: () => getMyAttendanceRequests(params),
  });
};
// import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// import { apiClient } from "../../../api/ApiClient";

// // ======================================================
// // GET TODAY ATTENDANCE
// // ======================================================

// const getTodayAttendance = async () => {
//   const response = await apiClient.get("/attendance/today");

//   return response.data;
// };

// export const useTodayAttendance = () => {
//   return useQuery({
//     queryKey: ["attendance-today"],
//     queryFn: getTodayAttendance,
//   });
// };

// // ======================================================
// // GET MY ATTENDANCE HISTORY
// // ======================================================

// const getMyAttendance = async ({ page = 1, limit = 10, month = "" }) => {
//   const response = await apiClient.get("/attendance/my", {
//     params: {
//       page,
//       limit,
//       ...(month && { month }),
//     },
//   });

//   return response.data;
// };

// export const useMyAttendance = ({ page = 1, limit = 10, month = "" }) => {
//   return useQuery({
//     queryKey: ["attendance-history", page, limit, month],

//     queryFn: () =>
//       getMyAttendance({
//         page,
//         limit,
//         month,
//       }),

//     keepPreviousData: true,
//   });
// };

// // ======================================================
// // CHECK IN
// // ======================================================

// const checkInAttendance = async (formData) => {
//   const response = await apiClient.post("/attendance/check-in", formData, {
//     headers: {
//       "Content-Type": "multipart/form-data",
//     },
//   });

//   return response.data;
// };

// export const useCheckInAttendance = () => {
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationFn: checkInAttendance,

//     onSuccess: () => {
//       queryClient.invalidateQueries({
//         queryKey: ["attendance-today"],
//       });

//       queryClient.invalidateQueries({
//         queryKey: ["attendance-history"],
//       });
//     },
//   });
// };

// // ======================================================
// // CHECK OUT
// // ======================================================

// const checkOutAttendance = async (formData) => {
//   const response = await apiClient.post("/attendance/check-out", formData, {
//     headers: {
//       "Content-Type": "multipart/form-data",
//     },
//   });

//   return response.data;
// };

// export const useCheckOutAttendance = () => {
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationFn: checkOutAttendance,

//     onSuccess: () => {
//       queryClient.invalidateQueries({
//         queryKey: ["attendance-today"],
//       });

//       queryClient.invalidateQueries({
//         queryKey: ["attendance-history"],
//       });
//     },
//   });
// };

// // ======================================================
// // GET ALL EMPLOYEE ATTENDANCE
// // ======================================================

// const getAllAttendance = async ({
//   page = 1,
//   limit = 10,
//   month = "",
//   date = "",
//   status = "",
//   employeeId = "",
//   department = "",
//   search = "",
// }) => {
//   const response = await apiClient.get("/attendance", {
//     params: {
//       page,
//       limit,

//       ...(month && { month }),
//       ...(date && { date }),
//       ...(status !== "" && { status }),
//       ...(employeeId && { employeeId }),
//       ...(department && { department }),
//       ...(search && { search }),
//     },
//   });

//   return response.data;
// };

// export const useAllAttendance = ({
//   page = 1,
//   limit = 10,
//   month = "",
//   date = "",
//   status = "",
//   employeeId = "",
//   department = "",
//   search = "",
// }) => {
//   return useQuery({
//     queryKey: [
//       "attendance-all",
//       page,
//       limit,
//       month,
//       date,
//       status,
//       employeeId,
//       department,
//       search,
//     ],

//     queryFn: () =>
//       getAllAttendance({
//         page,
//         limit,
//         month,
//         date,
//         status,
//         employeeId,
//         department,
//         search,
//       }),

//     placeholderData: (previousData) => previousData,
//   });
// };

// //  regularize attendance
// export const useRegularizeAttendance = () => {
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationFn: async (formData) => {
//       const response = await apiClient.post(
//         "/attendance/admin/regularize",
//         formData,
//       );

//       return response.data;
//     },

//     onSuccess: () => {
//       // Refresh All Attendance table
//       queryClient.invalidateQueries({
//         queryKey: ["attendance-all"],
//       });

//       // Optional: refresh single attendance if you use it elsewhere
//       queryClient.invalidateQueries({
//         queryKey: ["attendance"],
//       });

//       // Optional if regularization can affect today's attendance
//       queryClient.invalidateQueries({
//         queryKey: ["attendance-today"],
//       });

//       // Optional if regularization can affect employee attendance history
//       queryClient.invalidateQueries({
//         queryKey: ["attendance-history"],
//       });
//     },
//   });
// };
// // export const useRegularizeAttendance = () => {
// //   return useMutation({
// //     mutationFn: async (formData) => {
// //       const response = await apiClient.post(
// //         "/attendance/admin/regularize",
// //         formData,
// //       );

// //       return response.data;
// //     },
// //   });
// // };
// // ---
// // ======================================================
// // GET SINGLE ATTENDANCE
// // ======================================================

// const getSingleAttendance = async (id) => {
//   const response = await apiClient.get(`/attendance/${id}`);

//   return response.data;
// };

// export const useSingleAttendance = (id) => {
//   return useQuery({
//     queryKey: ["attendance", id],

//     queryFn: () => getSingleAttendance(id),

//     enabled: !!id,
//   });
// };

// // ======================================================
// // DELETE ATTENDANCE
// // ======================================================

// const deleteAttendance = async (id) => {
//   const response = await apiClient.delete(`/attendance/${id}`);

//   return response.data;
// };

// export const useDeleteAttendance = () => {
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationFn: deleteAttendance,

//     onSuccess: () => {
//       // Refresh All Attendance table
//       queryClient.invalidateQueries({
//         queryKey: ["attendance-all"],
//       });

//       // Refresh single attendance if used elsewhere
//       queryClient.invalidateQueries({
//         queryKey: ["attendance"],
//       });

//       // Refresh employee attendance history
//       queryClient.invalidateQueries({
//         queryKey: ["attendance-history"],
//       });

//       // Refresh today's attendance
//       queryClient.invalidateQueries({
//         queryKey: ["attendance-today"],
//       });
//     },
//   });
// };
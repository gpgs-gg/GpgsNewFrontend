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

export const getEmployeeDetails = async (params) => {
  if (typeof params === "string") {
    const response = await apiClient.get(`/employees/${params}`);
    return response.data;
  }
  const response = await apiClient.get("/employees", {
    params,
  });
  return response.data;
};

export const useEmployeeDetailsData = (params) => {
  const isSingleEmployee = typeof params === "string";

  return useQuery({
    queryKey: isSingleEmployee
      ? ["Employee", params]
      : ["EmployeeDetails", params],
    queryFn: () => getEmployeeDetails(params),
    enabled: isSingleEmployee ? !!params : true,

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

// import { useQuery, useMutation, useQueryClient} from "@tanstack/react-query";
// import axios from "axios";

// const apiClient = axios.create({
//   baseURL: `${process.env.REACT_APP_BASE_URL}`, // for vercel deployement
//   // baseURL: "http://localhost:3000/api", // for Local Developement
// });

// //========================Read Data==========================
// export const getEmployeesDetails = async () => {
//   const response = await apiClient.get("/getEmployeeDetails");
//   return response.data;
// };

// export const useEmployeeDetailsData = () => {
//   return useQuery({
//     queryKey: ["EmployeeDetails"],
//     queryFn: getEmployeesDetails,
//     refetchOnWindowFocus: true,
//   });
// };

// /* ========================== UPDATE ========================== */
// export const updateEmployeeDetails = async (payload) => {
//   const response = await apiClient.put("/update-employee", payload);
//   return response.data;
// };

// export const useUpdateEmployee = () => {
//   const queryClient = useQueryClient();
//   return useMutation({
//     mutationFn: updateEmployeeDetails,
//     onSuccess: () => {
//       //After update, refetch employee list automatically
//       queryClient.invalidateQueries(["EmployeeDetails"]);
//     },
//   });
// };

// //=========================== Create Employee========================
// export const createEmployeeDetails = async (payload) => {
//   const response = await apiClient.post("/create-employee", payload);
//   return response.data;
// };

// export const useCreateEmployee = () => {
//   const queryClient = useQueryClient();
//   return useMutation({
//     mutationFn: createEmployeeDetails,
//     onSuccess: () => {
//       queryClient.invalidateQueries(["EmployeeDetails"]);
//     },
//   });
// };

// //=====================Upload Docs=======================
// const UploadEmployeetDocs = async (formData) => {
//   const response = await apiClient.post("/employee-upload-docs", formData);
//   return response.data;
// };

// export const useUploadEmployeeDocs = () => {
//   const queryClient = useQueryClient();
//   return useMutation({
//     mutationFn: UploadEmployeetDocs,
//     onSuccess: () => {
//       // Invalidate query cache to refetch fresh data
//       queryClient.invalidateQueries(["EmployeeDetails"]);
//     },
//     onError: (error) => {
//       console.error("Upload failed:", error);
//     },
//   });
// };

// //==================Dynamic-Values (DropDown)=============
// const fetchDropDowlList = async ()=>{
//   const response = await apiClient.get('/dynamic-values')
//   return response.data.data
// }

// export const useDropDowlList = ()=>{
//   return useQuery({
//     queryKey:['dynamic-values'],
//     queryFn: fetchDropDowlList,
//      staleTime: Infinity,
//     cacheTime: Infinity,
//     refetchOnWindowFocus: false,
//     refetchOnMount: false,
//   })
// }
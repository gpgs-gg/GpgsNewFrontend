
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../../../api/ApiClient";

// ================= Get All Properties =================

const getACEBAreaData = async ({
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
  const response = await apiClient.get("/aceb-area", {
    params,
  });
  return response.data;
};

export const useACEBAreaData = ({
  page = 1,
  limit = 10,
  search = "",
  filters = {},
  enabled = true,
}) => {
  return useQuery({
    queryKey: [
      "properties-data",
      page,
      limit,
      search,
      
    ],
    queryFn: () =>
      getACEBAreaData({
        page,
        limit,
        search,
        filters,
      }),
    enabled,
    placeholderData: (previousData) => previousData,
  });
};
// ================= Get Single Property =================

const getSinglePropertyData = async (id) => {
  const response = await apiClient.get(`/aceb-area/${id}`);
  return response.data;
};
export const useSinglePropertyData = (id) => {
  return useQuery({
    queryKey: ["single-property-data", id],
    queryFn: () => getSinglePropertyData(id),
    enabled: !!id,
  });
};
// ================= Create Property =================
const createPropertyData = async (data) => {
  const response = await apiClient.post("/aceb-area", data);
  return response.data;
};
export const useCreatePropertyData = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createPropertyData,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["properties-data"],
      });
    },
  });
};
// ================= Update Property =================
const updatePropertyData = async ({ id, data }) => {
  const response = await apiClient.put(`/aceb-area/${id}`, data);
  return response.data;
};
export const useUpdatePropertyData = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updatePropertyData,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["properties-data"],
      });
      queryClient.invalidateQueries({
        queryKey: ["single-property-data", variables.id],
      });
    },
  });
};
// ================= Delete Property =================
const deletePropertyData = async (id) => {
  const response = await apiClient.delete(`/aceb-area/${id}`);
  return response.data;
};
export const useDeletePropertyData = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deletePropertyData,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["properties-data"],
      });
    },
  });
};

// Readig Code 



// =====================================================
// Create Electricity Reading
// POST /aceb-reading
// =====================================================

// const createACEBReading = async (data) => {
//   const response = await apiClient.post(
//     "/aceb-reading",
//     data
//   );

//   return response.data;
// };

// export const useCreateACEBReading = () => {
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationFn: createACEBReading,

//     onSuccess: (_, variables) => {
//       queryClient.invalidateQueries({
//         queryKey: [
//           "aceb-reading",
//           variables.propertyId,
//           variables.month,
//         ],
//       });

//       queryClient.invalidateQueries({
//         queryKey: [
//           "aceb-property-readings",
//           variables.propertyId,
//         ],
//       });
//     },
//   });
// };


// // =====================================================
// // Get Monthly Electricity Reading
// // GET /aceb-reading?propertyId=xxx&month=xxx
// // =====================================================

// const getACEBReading = async ({
//   propertyId,
//   month,
// }) => {
//   const response = await apiClient.get(
//     "/aceb-reading",
//     {
//       params: {
//         propertyId,
//         month,
//       },
//     }
//   );

//   return response.data;
// };

// export const useACEBReadingData = ({
//   propertyId,
//   month,
//   enabled = true,
// }) => {
//   return useQuery({
//     queryKey: [
//       "aceb-reading",
//       propertyId,
//       month,
//     ],

//     queryFn: () =>
//       getACEBReading({
//         propertyId,
//         month,
//       }),

//     enabled:
//       enabled &&
//       !!propertyId &&
//       !!month,
//   });
// };


// // =====================================================
// // Get All Electricity Readings For Property
// // GET /aceb-reading/property/:propertyId
// // =====================================================

// const getPropertyACEBReadings = async (
//   propertyId
// ) => {
//   const response = await apiClient.get(
//     `/aceb-reading/property/${propertyId}`
//   );

//   return response.data;
// };

// export const usePropertyACEBReadingData = (
//   propertyId,
//   enabled = true
// ) => {
//   return useQuery({
//     queryKey: [
//       "aceb-property-readings",
//       propertyId,
//     ],

//     queryFn: () =>
//       getPropertyACEBReadings(propertyId),

//     enabled:
//       enabled &&
//       !!propertyId,
//   });
// };


// // =====================================================
// // Update Electricity Reading
// // PUT /aceb-reading/:id
// // =====================================================

// const updateACEBReading = async ({
//   id,
//   data,
// }) => {
//   const response = await apiClient.put(
//     `/aceb-reading/${id}`,
//     data
//   );

//   return response.data;
// };

// export const useUpdateACEBReading = () => {
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationFn: updateACEBReading,

//     onSuccess: (response) => {
//       const updatedData = response?.data;

//       queryClient.invalidateQueries({
//         queryKey: [
//           "aceb-reading",
//           updatedData?.propertyId,
//           updatedData?.month,
//         ],
//       });

//       queryClient.invalidateQueries({
//         queryKey: [
//           "aceb-property-readings",
//         ],
//       });
//     },
//   });
// };

const createACEBReading = async (data) => {
    const response = await apiClient.post("/aceb-reading",data);
    return response.data;
};
export const useCreateACEBReadingData = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: createACEBReading,
        onSuccess: (_, variables) => {
            // Monthly reading
            queryClient.invalidateQueries({
                queryKey: [
                    "aceb-reading",
                    variables.propertyId,
                    variables.month,
                ],
            });
            // Property all readings
            queryClient.invalidateQueries({
                queryKey: [
                    "aceb-property-readings",
                    variables.propertyId,
                ],
            });
        },
    });
};

const getACEBReading = async ({
    propertyId,
    month,
}) => {
    const response = await apiClient.get(
        "/aceb-reading",
        {
            params: {
                propertyId,
                month,
            },});
    return response.data;
};
export const useACEBReadingData = ({
    propertyId,
    month,
    enabled = true,
}) => {
    return useQuery({
        queryKey: [
            "aceb-reading",
            propertyId,
            month,
        ],
        queryFn: () =>
            getACEBReading({
                propertyId,
                month,
            }),
        enabled:
            enabled &&
            !!propertyId &&
            !!month,
    });
};

const getSingleACEBReading = async (id) => {
    const response = await apiClient.get(`/aceb-reading/${id}`);
    return response.data;
};

export const useSingleACEBReadingData = (
    id,
    enabled = true
) => {
    return useQuery({
        queryKey: [
            "aceb-reading-single",
            id,
        ],
        queryFn: () =>
            getSingleACEBReading(id),
        enabled:
            enabled &&
            !!id,
    });
};

const getPropertyACEBReadingData = async ({
  propertyId,
  page = 1,
  limit = 10,
  search = "",
}) => {
  const params = {
    page,
    limit,
  };

  if (search.trim()) {
    params.search = search.trim();
  }
  const response = await apiClient.get(
    `/aceb-reading/property/${propertyId}`,{params,});
  return response.data;
};

export const usePropertyACEBReadingData = ({
  propertyId,
  page = 1,
  limit = 10,
  search = "",
}) => {
  return useQuery({
    queryKey: [
      "property-aceb-readings",
      propertyId,
      page,
      limit,
      search,
    ],
    queryFn: () =>
      getPropertyACEBReadingData({
        propertyId,
        page,
        limit,
        search,
      }),
    enabled: !!propertyId,
    placeholderData: (previousData) => previousData,
  });
};

export const usePreviousACEBReadingData = ({
    propertyId,
    month,
    enabled = true,
}) => {
    return useQuery({
        queryKey: ["aceb-previous-reading", propertyId, month],
        queryFn: async () => {
            const response = await apiClient.get(
                "/aceb-reading/previous",
                { params: { propertyId, month } }
            );
            return response.data;
        },
        enabled: enabled && !!propertyId && !!month,
    });
};

const updateACEBReading = async ({
    id,
    data,
}) => {
    const response = await apiClient.put(`/aceb-reading/${id}`,data);
    return response.data;
};
export const useUpdateACEBReadingData = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: updateACEBReading,
        onSuccess: (response, variables) => {
            const updatedData =
                response?.data;
            // Single reading
            queryClient.invalidateQueries({
                queryKey: [
                    "aceb-reading-single",
                    variables.id,
                ],
            });
            // Monthly reading
            if (
                updatedData?.propertyId &&
                updatedData?.month
            ) {
                queryClient.invalidateQueries({
                    queryKey: [
                        "aceb-reading",
                        updatedData.propertyId,
                        updatedData.month,
                    ],
                });
            }
            // All property readings
            if (
                updatedData?.propertyId
            ) {
                queryClient.invalidateQueries({
                    queryKey: [
                        "aceb-property-readings",
                        updatedData.propertyId,
                    ],
                });
                // Previous reading cache
                queryClient.invalidateQueries({
                    queryKey: [
                        "aceb-previous-reading",
                        updatedData.propertyId,
                    ],
                });
            }
        },
    });
};
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { apiClient } from "../../../../api/ApiClient";

/* ================= FETCH ================= */

export const fetchHouseKeepingData = async () => {
  const res = await apiClient.get("/housekeeping");
  return res.data;
};

export const useHouseKeepingData = () => {
  return useQuery({
    queryKey: ["housekeeping"],
    queryFn: fetchHouseKeepingData,
  });
};

/* ================= UPDATE (ROW BASED – FINAL) ================= */

const updateHouseKeepingRow = async (payload) => {
  //console.log("Payload going to backend:", payload);
  const res = await apiClient.post("/housekeeping/update", payload);
  // console.log("Response from backend:", res.data);
  return res.data;
};

export const useUpdateHouseKeepingRow = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateHouseKeepingRow,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["housekeeping"],
      });
    },
  });
};

// import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// import axios from "axios";

// const apiClient = axios.create({
//   baseURL: process.env.REACT_APP_BASE_URL || "http://localhost:4000/api",
// });

// /* ================= FETCH ================= */

// export const fetchHouseKeepingData = async (sheetName) => {
//   const res = await apiClient.get(`/housekeeping/${sheetName}`);
//   return res.data;
// };

// export const useHouseKeepingData = (sheetName) => {
//   return useQuery({
//     queryKey: ["housekeeping", sheetName],
//     queryFn: () => fetchHouseKeepingData(sheetName),
//     enabled: !!sheetName,
//   });
// };

// /* ================= UPDATE (CELL BASED) ================= */

// const updateHouseKeepingCell = async ({
//   name,
//   sheetName,
//   rowIndex,
//   columnName,
//   value,
// }) => {
//   const res = await apiClient.post(`/housekeeping/${sheetName}/update`, {
//     name,
//     rowIndex,
//     columnName,
//     value,
//   });
//   return res.data;
// };

// export const useUpdateHouseKeepingCell = () => {
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationFn: updateHouseKeepingCell,
//     onSuccess: (_, variables) => {
//       // 🔄 refetch same sheet after update
//       queryClient.invalidateQueries(["housekeeping", variables.sheetName]);
//     },
//   });
// };

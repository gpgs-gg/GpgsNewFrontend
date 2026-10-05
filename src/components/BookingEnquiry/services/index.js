
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../../../api/ApiClient";

const getBookingEnquiry = async ({
  page = 1,
  limit = 1,
  search = "",
}) => {
  const params = {
    page,
    limit,
  };

  if (search?.trim()) {
    params.search = search.trim();
  }

  const response = await apiClient.get("/booking-enquiries", {
    params,
  });

  return response.data;
};

export const useBookingEnquiry = ({
  page = 1,
  limit = 1,
  search = "",
} = {}) => {
  return useQuery({
    queryKey: ["booking-enquiry-form", page, limit, search],
    queryFn: () =>
      getBookingEnquiry({
        page,
        limit,
        search,
      }),
    keepPreviousData: true,
  });
};


const createBookingEnquiry = async (data) => {
  const response = await apiClient.post("/booking-enquiries", data);
  return response.data;
};
export const useCreateBookingEnquiry = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createBookingEnquiry,
    onSuccess: () => {
      // 🔄 Refetch ticket sheet after update
      queryClient.invalidateQueries(["booking-enquiry-form"]);
    },
  });
};

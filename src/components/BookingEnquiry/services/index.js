
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../../../api/ApiClient";










const getBookingEnquiry = async () => {
    const response = await apiClient.get("/booking-enquiries");
    return response.data;
};

export const useBookingEnquiry = () => {
    return useQuery({
        queryKey: ["booking-enquiry-form"],
        queryFn: getBookingEnquiry,
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

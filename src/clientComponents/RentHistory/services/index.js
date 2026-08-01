import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../../../api/ApiClient";

const getRentHistoryForBooking = async (bookingId) => {
  const response = await apiClient.get(
    `/rent-history/renthistoryfrombooking/${bookingId}`
  );
  return response.data;
};

export const useRentHistoryForBooking = (bookingId) => {
  return useQuery({
    queryKey: ["rent-history", bookingId],
    queryFn: () => getRentHistoryForBooking(bookingId),
    enabled: Boolean(bookingId),
  });
};
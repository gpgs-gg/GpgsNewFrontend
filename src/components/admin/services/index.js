import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../../../api/ApiClient";

// ========================================
// GET HERO VIDEO
// ========================================

export const getHeroVideo = async () => {
  const response = await apiClient.get("/website-settings/hero-video");

  return response.data;
};

// ========================================
// UPDATE / REPLACE HERO VIDEO
// ========================================

export const updateHeroVideo = async (selectedFile) => {
  const formData = new FormData();

  formData.append("video", selectedFile);

  const response = await apiClient.put(
    "/website-settings/hero-video",
    formData,
  );

  return response.data;
};

// ========================================
// GET HERO VIDEO HOOK
// ========================================

export const useHeroVideo = () => {
  return useQuery({
    queryKey: ["hero-video"],
    queryFn: getHeroVideo,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
  });
};

// ========================================
// UPDATE HERO VIDEO HOOK
// ========================================
export const useUpdateHeroVideo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateHeroVideo,

    onSuccess: async (data) => {
      if (data.success) {
        queryClient.setQueryData(["hero-video"], data);

        await queryClient.invalidateQueries({
          queryKey: ["hero-video"],
          refetchType: "active",
        });
      }
    },
  });
};
import{useMutation,useQuery,useQueryClient}from"@tanstack/react-query";
import{apiClient}from"../../../api/ApiClient";

// ======================= GET EB DATA =======================

const getElectricityBillData = async ({
    page = 1,
    limit = 10,
    search = "",
    billingMonth,
    filters = {},
}) => {
    const params = {
        page,
        limit,
        billingMonth,
        ...filters,
    };

    if (search?.trim()) {
        params.search = search.trim();
    }

    const response = await apiClient.get(
        "/electricity-bill-info",
        { params }
    );

    return response.data;
};

export const useElectricityBillData = ({
    page = 1,
    limit = 10,
    search = "",
    billingMonth,
    filters = {},
    enabled = true,
}) => {
    return useQuery({
        queryKey: [
            "electricity-bill-data",
            page,
            limit,
            search,
            billingMonth,
            filters,
        ],
        queryFn: () =>
            getElectricityBillData({
                page,
                limit,
                search,
                billingMonth,
                filters,
            }),
        enabled: enabled && !!billingMonth,
        placeholderData: (previousData) => previousData,
    });
};

// ======================= GET SINGLE EB =======================

const getSingleElectricityBillData = async (id) => {
  const response = await apiClient.get(
    `/electricity-bill-info/${id}`
  );
  return response.data;
};

export const useSingleElectricityBillData = (id) => {
  return useQuery({
    queryKey: ["electricity-bill", id],
    queryFn: () =>
      getSingleElectricityBillData(id),
    enabled: !!id,
  });
};

// ======================= CREATE EB =======================

const createElectricityBillData=async(formData)=>{
  const response=await apiClient.post(
    "/electricity-bill-info",
    formData,
    {headers:{"Content-Type":"multipart/form-data"}}
  );
  return response.data;
};

export const useCreateElectricityBillData=()=>{
  const queryClient=useQueryClient();

  return useMutation({
    mutationFn:createElectricityBillData,
    onSuccess:()=>{
      queryClient.invalidateQueries({
        queryKey:["electricity-bill-data"],
      });
    },
  });
};

// ======================= UPDATE EB =======================

const updateElectricityBillData=async({id,formData})=>{
  const response=await apiClient.put(
    `/electricity-bill-info/${id}`,
    formData,
    {headers:{"Content-Type":"multipart/form-data"}}
  );
  return response.data;
};

export const useUpdateElectricityBillData=()=>{
  const queryClient=useQueryClient();

  return useMutation({
    mutationFn:updateElectricityBillData,
    onSuccess:()=>{
      queryClient.invalidateQueries({
        queryKey:["electricity-bill-data"],
      });
    },
  });
};
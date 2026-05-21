import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import { AxiosError, AxiosResponse } from "axios";

interface UseFetchObjectsProps<T> {
  queryKey: string[];
  endpoint: string;
  options?: object;
  params?: Record<string, any>;
  enabled?: boolean;
}

interface UseFetchObjectsReturn<T> {
  data: T | undefined;
  isLoading: boolean;
  isError: boolean;
  isSuccess: boolean;
  error: AxiosError | null;
  refetch: () => void;
}

const useFetchObjects = <T,>({
  queryKey,
  endpoint,
  options = {},
  params = {},
  enabled = true,
}: UseFetchObjectsProps<T>): UseFetchObjectsReturn<T> => {
  const { getUser, logout } = useAuth();
  
  const fetchFunction = async (): Promise<T> => {
    const response: AxiosResponse<T> = await api.get(`${endpoint}`, { params });
    return response.data;
  };
  
  const { data, isLoading, isError, isSuccess, error, refetch } = useQuery<
    T,
    AxiosError
  >({
    queryKey,
    queryFn: fetchFunction,
    enabled,
    staleTime: 0,
    gcTime: 1000 * 60, // 1 minute cache (updated from cacheTime)
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    refetchInterval: false,
    refetchOnReconnect: true,
    retry: (failureCount, error) => {
      if (error?.response?.status === 401 || error?.response?.status === 403) {
        logout();
        return false;
      }
      if (error?.response?.status === 404 || error?.response?.status >= 500) {
        return false;
      }
      return failureCount < 2;
    },
    ...options,
  });
  
  return { data, isLoading, isError, isSuccess, error, refetch };
};
export default useFetchObjects;
import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import { AxiosError, AxiosResponse } from "axios";
import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

interface UseUpdateProps<T> {
  queryKey: string[];
  redirectPath?: string;
}

interface UseUpdateReturn<T> {
  handleUpdate: (id: string | number, data: Partial<T> | FormData) => void;
  loading: boolean;
  success: boolean;
  isSuccess: boolean;
}

const useUpdate = <T,>({
  queryKey,
  redirectPath,
}: UseUpdateProps<T>): UseUpdateReturn<T> => {
  const { t } = useLanguage();
  const { getUser, logout } = useAuth();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);



  const updateMutation = useMutation<
    T,
    AxiosError<Record<string, string | string[]>>,
    { id: string | number; data: Partial<T> | FormData }
  >({
    mutationFn: async ({ id, data }) => {
      try {
        setLoading(true);
        
        const user = getUser();
        if (!user || !user.token) {
          throw new Error('User not authenticated');
        }
        
        const headers: Record<string, string> = {};

        if (!(data instanceof FormData)) {
          headers['Content-Type'] = 'application/json';
        }

        const endpoint = queryKey[0] === 'profile' 
          ? 'profile'
          : `${queryKey[0]}/${id}`;
        
        const response: AxiosResponse<T> = await api.patch(
          endpoint,
          data,
          { headers }
        );
        
        return response.data;
      } catch (error) {
        if (error instanceof Error && error.message === 'User not authenticated') {
          logout();
        }
        throw error;
      }
    },
    onSuccess: (data) => {
      setLoading(false);
      setSuccess(true);
      setIsSuccess(true);
      toast.success("Success", {
        description: t("api.use_update.dataUpdatedSuccess") || "Data updated successfully",
        style: {
          background: "#dcfce7", // Light green background
          border: "1px solid #86efac",
        },
        duration: 4000,
        position: "top-right",
        action: {
          label: t("common.dismiss") || "Dismiss",
        },
      });
      setTimeout(() => {
        setSuccess(false);
        setIsSuccess(false);
      }, 100);
      queryClient.invalidateQueries({ queryKey });
    },
    onError: (error: AxiosError<Record<string, string | string[]>>) => {
      setLoading(false);
      setSuccess(false);
      setIsSuccess(false);
      const backendErrors = error.response?.data;
      if (backendErrors && typeof backendErrors === "object") {
        // Handle field-specific errors
        const errorMessages = Object.keys(backendErrors).map((key) => {
          const errorMsg = Array.isArray(backendErrors[key])
            ? backendErrors[key].join(", ")
            : backendErrors[key];
          return `${key.charAt(0).toUpperCase() + key.slice(1)}: ${errorMsg}`;
        });
        // Show a single toast with all errors
        toast.error("Validation Error", {
          description: errorMessages.join(". "),
          style: {
            background: "#fee2e2", // Light red background
            border: "1px solid #fca5a5",
          },
          duration: 6000,
          position: "top-right",
          action: {
            label: t("common.dismiss") || "Dismiss",
          },
        });
      } else {
        // Handle general errors
        const statusCode = error.response?.status || "Unknown";
        const statusText = error.response?.statusText || "Error";
        const errorMsg = error.message || t("api.use_update.updateFailed") || "An unexpected error occurred";
        toast.error(`${statusText} (${statusCode})`, {
          description: errorMsg,
          style: {
            background: "#fee2e2", // Light red background
            border: "1px solid #fca5a5",
          },
          duration: 6000,
          position: "top-right",
          action: {
            label: t("common.dismiss") || "Dismiss",
          },
        });
      }
    },
    onSettled: () => {
      setLoading(false);
    },
  });

  const handleUpdate = (id: string | number, data: Partial<T> | FormData) => {
    updateMutation.mutate({ id, data });
  };

  return {
    handleUpdate,
    loading,
    success,
    isSuccess,
  };
};

export default useUpdate;

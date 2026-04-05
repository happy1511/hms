import { MASTER_IMPORT_CONFIG, MasterImportKey, MasterImportMode } from "@/lib/masterImportConfig";
import { ApiResponse } from "@/lib/type";
import { showError } from "@/lib/utils";
import { createRequest } from "@/services/apiRequest";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";

const importMasterData = createRequest<
  ApiResponse<{ created: number; updated: number; deleted: number; total: number }>,
  undefined,
  { master: MasterImportKey },
  { file: File; mode: MasterImportMode }
>((p) => `/master-import/${p.master}`, "POST", true);

export const useImportMasterData = (master: MasterImportKey) => {
  const queryClient = useQueryClient();
  const config = MASTER_IMPORT_CONFIG[master];

  return useMutation<
    ApiResponse<{ created: number; updated: number; deleted: number; total: number }>,
    AxiosError<ApiResponse<null>>,
    { file: File; mode: MasterImportMode }
  >({
    mutationKey: ["master-import", master],
    mutationFn: (body) =>
      importMasterData({
        urlHelpers: { master },
        body,
      }),
    onSuccess: (response, variables) => {
      toast.success(
        `${config.title} imported successfully (${response.data.total} rows, ${response.data.created} created, ${response.data.updated} updated${variables.mode === "replace" ? `, ${response.data.deleted} deleted` : ""})`,
      );
      queryClient.invalidateQueries({ queryKey: [config.queryKey] });
    },
    onError: showError,
  });
};

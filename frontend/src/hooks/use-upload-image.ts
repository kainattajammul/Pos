import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/lib/axios";
import { uploadImage } from "@/services/upload.service";

export function useUploadImage(defaultPrefix?: string) {
  return useMutation({
    mutationFn: ({
      file,
      prefix,
    }: {
      file: File;
      prefix?: string;
    }) => uploadImage(file, { prefix: prefix ?? defaultPrefix }),
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Failed to upload image"));
    },
  });
}

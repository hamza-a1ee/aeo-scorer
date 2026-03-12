import { MediaAPIService, mediaService } from "@/services/media.service";
import { throwError } from "@/utils/react-query.util";
import { useMutation } from "@tanstack/react-query";

export function useUploadSingleMediaMutation() {
  return useMutation({
    mutationFn: (file: File) => mediaService.uploadFile(file),
    mutationKey: [MediaAPIService.keyFactory.uploadFile],
    onError: throwError("Upload Single Media Failed"),
  });
}

export function useUploadMultipleMediaMutation() {
  return useMutation({
    mutationFn: (files: File[]) => mediaService.uploadMultipleImages(files),
    mutationKey: [MediaAPIService.keyFactory.uploadMultipleImages],
    onError: throwError("Upload Multiple Media Failed"),
  });
}

export function useUploadViaPresignedUrlMutation() {
  return useMutation({
    mutationFn: (file: File) => mediaService.uploadFileViaPresignedUrl(file),
    mutationKey: [MediaAPIService.keyFactory.uploadViaPresignedUrl],
    onError: throwError("Upload via presigned URL failed"),
  });
}




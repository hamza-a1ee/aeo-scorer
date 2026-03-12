import { useUploadViaPresignedUrlMutation } from '@/query/media.query';
import { useCallback } from 'react';
import toast from 'react-hot-toast';

export function useUploadMedia() {
  const uploadMutation = useUploadViaPresignedUrlMutation();

  const uploadSingleFile = async (file: File): Promise<string> => {
    const { sanitizedKey } = await uploadMutation.mutateAsync(file);
    return sanitizedKey;
  };

  const uploadFiles = async (items: (File | string)[]): Promise<string[]> => {
    const keys: string[] = [];
    for (const item of items) {
      if (item instanceof File) {
        const key = await uploadSingleFile(item);
        keys.push(key);
      } else if (typeof item === 'string' && item) {
        keys.push(item);
      }
    }
    return keys;
  };

  const handleFilesChange = useCallback(
    async (
      files: (File | string)[],
      onChange: (v: (File | string)[]) => void,
      setUploadingIndices: (indices: number[]) => void,
      getCurrentValue: () => (File | string)[],
    ) => {
      const existing = files.filter(
        (f): f is string => typeof f === 'string' && f.length > 0,
      );
      const newFiles = files.filter((f): f is File => f instanceof File);
      if (newFiles.length === 0) {
        onChange(files);
        return;
      }

      const startIndex = existing.length;
      onChange([...existing, ...newFiles]);
      setUploadingIndices(
        Array.from({ length: newFiles.length }, (_, i) => startIndex + i),
      );

      try {
        const keys = await Promise.all(
          newFiles.map(async file => {
            const { sanitizedKey } = await uploadMutation.mutateAsync(file);
            return sanitizedKey;
          }),
        );
        const current = getCurrentValue();
        const keyMap = new Map(newFiles.map((f, i) => [f, keys[i]]));
        const next = current.map(item => keyMap.get(item as File) ?? item);
        onChange(next);
      } catch {
        toast.error('Upload failed. Please try again.');
      } finally {
        setUploadingIndices([]);
      }
    },
    [uploadMutation],
  );

  return {
    uploadFiles,
    uploadSingleFile,
    handleFilesChange,
    isUploading: uploadMutation.isPending,
  };
}

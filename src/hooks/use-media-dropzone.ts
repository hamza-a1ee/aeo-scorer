import { useDropzone, type DropzoneOptions } from 'react-dropzone';

function createFileTypeValidator(
  accept: Record<string, string[] | readonly string[]>,
) {
  return (file: File) => {
    const allowed = Object.values(accept).flat();
    const ext = '.' + (file.name.split('.').pop()?.toLowerCase() ?? '');
    if (!allowed.includes(ext)) {
      return {
        code: 'file-invalid-type' as const,
        message: 'Only PDF, PNG, JPEG allowed',
      };
    }
    return null;
  };
}

export function useMediaDropzone(
  options?: Omit<DropzoneOptions, 'validator'>,
) {
  const { accept, ...rest } = options ?? {};
  const validator = accept ? createFileTypeValidator(accept) : undefined;

  return useDropzone({
    ...rest,
    accept,
    multiple: rest.multiple ?? true,
    validator,
  });
}

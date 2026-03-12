import { DOC_ACCEPT_EXTENSIONS } from '@/constants';

export function getFileExtension(nameOrUrl: string): string {
  const name = nameOrUrl.split('?')[0];
  return '.' + (name.split('.').pop()?.toLowerCase() ?? '');
}

export function isValidDocFileFormat(item: File | string): boolean {
  const ext =
    item instanceof File ? getFileExtension(item.name) : getFileExtension(item);
  return DOC_ACCEPT_EXTENSIONS.includes(ext);
}

export function allFilesValidFormat(files: (File | string)[]): boolean {
  return files.every(isValidDocFileFormat);
}

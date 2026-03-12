'use client';

import DocumentIcon from '@/icons/document.icon';
import SendSqaureIcon from '@/icons/send-square.icon';
import TrashIcon from '@/icons/trash.icon';
import { Film, Music } from 'lucide-react';
import { cn } from '@/lib/utils';
import { constructImageUrl, isFullUrl } from '@/utils/construct-image-url.util';
import { getFileExtensionFromUrl } from '@/utils/helper.util';
import { useCallback, useMemo, useRef } from 'react';
import { useMediaDropzone } from '@/hooks/use-media-dropzone';
import toast from 'react-hot-toast';

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatFileDate(file: File): string {
  const d = new Date(file.lastModified);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

type FileOrUrl = File | string;

interface Props {
  value?: FileOrUrl[];
  onChange: (files: FileOrUrl[]) => void;
  className?: string;
  content?: React.ReactNode;
  accept?: Record<string, string[]>;
  loading?: boolean;
  uploadingIndices?: number[];
  maxFiles?: number;
  formatLabel?: string;
  previewClassName?: string;
  /** When false, selected items are shown below the dropzone instead of above. Default: true */
  showPreviewAbove?: boolean;
  /** Custom error message when file type is rejected. Default: "Only PDF, PNG, or JPEG files are allowed." */
  fileRejectErrorMessage?: string;
}

const DEFAULT_ACCEPT: Record<string, string[]> = {
  'application/pdf': ['.pdf'],
  'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
};

const IMAGE_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.gif', '.webp'];
const VIDEO_EXTENSIONS = ['.mp4', '.webm', '.mov', '.avi', '.mkv'];
const AUDIO_EXTENSIONS = ['.mp3', '.wav', '.m4a', '.ogg', '.aac'];

function isImageFile(file: File): boolean {
  return file.type.startsWith('image/');
}

function isImageUrl(url: string): boolean {
  const ext = getFileExtensionFromUrl(url);
  return ext ? IMAGE_EXTENSIONS.includes(`.${ext}`) : false;
}

function isVideoUrl(url: string): boolean {
  const ext = getFileExtensionFromUrl(url);
  return ext ? VIDEO_EXTENSIONS.includes(`.${ext}`) : false;
}

function isAudioUrl(url: string): boolean {
  const ext = getFileExtensionFromUrl(url);
  return ext ? AUDIO_EXTENSIONS.includes(`.${ext}`) : false;
}

function FilePreviewItem({
  item,
  onRemove,
  previewClassName,
}: {
  item: FileOrUrl;
  onRemove: () => void;
  previewClassName?: string;
}) {
  const objectUrlRef = useRef<{ file: File; url: string } | null>(null);
  const file = item instanceof File ? item : null;
  let isPdf = file?.type === 'application/pdf';
  const isVideo =
    file?.type.startsWith('video/') ||
    (typeof item === 'string' && isVideoUrl(item));
  const isAudio =
    file?.type.startsWith('audio/') ||
    (typeof item === 'string' && isAudioUrl(item));

  const imageUrl = useMemo(() => {
    if (file && isImageFile(file)) {
      if (objectUrlRef.current?.file === file) return objectUrlRef.current.url;
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current.url);
      const url = URL.createObjectURL(file);
      objectUrlRef.current = { file, url };
      return url;
    }
    if (typeof item === 'string' && item && isImageUrl(item)) {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current.url);
        objectUrlRef.current = null;
      }
      const url = constructImageUrl(item);
      return url || null;
    }
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current.url);
      objectUrlRef.current = null;
    }
    return null;
  }, [item, file]);

  const fileName =
    file?.name ??
    (typeof item === 'string'
      ? isFullUrl(item)
        ? 'Uploaded file'
        : item
      : '');
  const fileMeta = file
    ? previewClassName
      ? formatFileSize(file.size)
      : `${formatFileSize(file.size)} • ${formatFileDate(file)}`
    : '';

  if (typeof item === 'string') {
    const fileExtension = getFileExtensionFromUrl(item);
    if (fileExtension === 'pdf') isPdf = true;
  }

  const renderIcon = () => {
    if (imageUrl) {
      return (
        <div className="relative size-14 shrink-0 overflow-hidden rounded-lg border border-neutral-gray-40">
          <img
            src={imageUrl}
            alt={fileName}
            className="size-full object-cover"
          />
        </div>
      );
    }
    if (isVideo) {
      return (
        <div className="flex size-14 shrink-0 items-center justify-center rounded-lg border border-neutral-gray-40 bg-neutral-gray-10">
          <Film className="size-7 text-neutral-gray-50" />
        </div>
      );
    }
    if (isAudio) {
      return (
        <div className="flex size-14 shrink-0 items-center justify-center rounded-lg border border-neutral-gray-40 bg-neutral-gray-10">
          <Music className="size-7 text-neutral-gray-50" />
        </div>
      );
    }
    return <DocumentIcon className="size-10 shrink-0" strokeWidth={1.5} />;
  };

  return (
    <div
      className={cn(
        'relative flex w-full min-w-0 max-w-full items-center gap-3 overflow-hidden rounded-lg px-4 py-3',
        previewClassName ?? 'bg-neutral-gray-10',
      )}
    >
      {renderIcon()}
      <div className="min-w-0 flex-1 overflow-hidden">
        <p
          className="overflow-hidden text-ellipsis whitespace-nowrap text-sm font-medium text-neutral-gray-100"
          title={fileName}
        >
          {fileName}
        </p>
        {fileMeta && (
          <p
            className={cn(
              'mt-0.5',
              previewClassName
                ? 'text-sm text-test-secondary'
                : 'text-xs text-neutral-gray-60',
            )}
          >
            {fileMeta}
          </p>
        )}
      </div>
      <button
        type="button"
        onClick={onRemove}
        className="cursor-pointer shrink-0 rounded p-1.5 text-red-500 hover:bg-red-50 transition-colors"
        aria-label="Remove file"
      >
        <TrashIcon className="size-5 [&_path]:fill-[#F14D4D]" />
      </button>
    </div>
  );
}

export default function MultiFileReactDropzone({
  value = [],
  onChange,
  className,
  content,
  accept = DEFAULT_ACCEPT,
  loading = false,
  uploadingIndices = [],
  maxFiles,
  formatLabel = 'PDF, JPEG & PNG',
  previewClassName,
  showPreviewAbove = true,
  fileRejectErrorMessage = 'Only PDF, PNG, or JPEG files are allowed.',
}: Props) {
  const files = Array.isArray(value) ? value : [];
  const isUploading = uploadingIndices.length > 0 || loading;
  const atLimit = maxFiles != null && files.length >= maxFiles;

  const onDrop = useCallback(
    (
      acceptedFiles: File[],
      fileRejections: ReadonlyArray<{
        errors: ReadonlyArray<{ message: string }>;
      }>,
    ) => {
      if (fileRejections.length > 0) {
        toast.error(fileRejectErrorMessage);
      }
      if (acceptedFiles.length === 0) return;
      const remaining = maxFiles
        ? maxFiles - files.length
        : acceptedFiles.length;
      const toAdd = remaining > 0 ? acceptedFiles.slice(0, remaining) : [];
      if (toAdd.length > 0) onChange([...files, ...toAdd]);
      if (maxFiles && acceptedFiles.length > remaining) {
        toast.error(
          `More than ${maxFiles} files are not allowed. Only the first ${maxFiles} have been selected.`,
        );
      }
    },
    [onChange, files, maxFiles, fileRejectErrorMessage],
  );

  const { getRootProps, getInputProps, isDragActive } = useMediaDropzone({
    onDrop,
    accept,
    multiple: true,
    disabled: isUploading || atLimit,
  });

  const handleRemove = useCallback(
    (index: number) => {
      const next = files.filter((_, i) => i !== index);
      onChange(next);
    },
    [files, onChange],
  );

  const previewSection = files.length > 0 && (
    <div className="min-w-0 w-full overflow-hidden space-y-2">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs text-neutral-gray-60">
          {maxFiles != null ? `${files.length}/${maxFiles} files` : null}
        </span>
        <button
          type="button"
          onClick={() => onChange([])}
          className="text-sm font-medium text-red-500 hover:text-red-600 cursor-pointer"
        >
          Clear all
        </button>
      </div>
      {files.map((item, index) => (
        <FilePreviewItem
          key={index}
          item={item}
          onRemove={() => handleRemove(index)}
          previewClassName={previewClassName}
        />
      ))}
    </div>
  );

  return (
    <div className={cn('relative min-w-0 max-w-full overflow-hidden space-y-3', className)}>
      {showPreviewAbove && previewSection}
      <div
        {...getRootProps()}
        className={cn(
          'relative border-2 border-dashed border-neutral-gray-40 bg-neutral-gray-0 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors min-h-32 rounded-xl py-6 px-4',
          isDragActive
            ? 'border-primary bg-primary/5'
            : 'hover:border-primary/50',
        )}
      >
        {isUploading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-neutral-gray-10">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-neutral-gray-20 border-t-primary" />
            <span className="text-sm font-medium text-neutral-gray-80 ml-2">
              Uploading...
            </span>
          </div>
        )}
        <input {...getInputProps()} />
        {(isUploading ? false : content ? true : false) && (
          <div className="flex flex-col items-center justify-center gap-2 text-center">
            <SendSqaureIcon />
            <span className="text-sm text-neutral-gray-80">
              Click to upload
            </span>
            <span className="text-sm text-primary">{formatLabel}</span>
          </div>
        )}
      </div>
      {!showPreviewAbove && previewSection}
    </div>
  );
}

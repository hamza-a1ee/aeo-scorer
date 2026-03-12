'use client';

import AddGalleryIcon from '@/icons/add-gallery.icon';
import DocumentIcon from '@/icons/document.icon';
import TrashIcon from '@/icons/trash.icon';
import { cn } from '@/lib/utils';
import { Plus } from 'lucide-react';
import Image from 'next/image';
import { useCallback, useMemo, useRef } from 'react';
import { FileRejection, useDropzone } from 'react-dropzone';
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

const DEFAULT_ACCEPT: Record<string, string[]> = {
  'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg'],
};

interface Props {
  value?: string | File | null;
  onChange: (file: File | null) => void;
  className?: string;
  content?: React.ReactNode;
  accept?: Record<string, string[]>;
  loading?: boolean;
}

type ObjectUrlEntry = { file: File; url: string };

export default function ImageReactDropzone({
  value,
  onChange,
  className,
  content,
  accept = DEFAULT_ACCEPT,
  loading = false,
}: Props) {
  const objectUrlRef = useRef<ObjectUrlEntry | null>(null);

  // Create URL synchronously so first paint shows the image. Don't revoke in cleanup so Strict Mode
  // unmount doesn't revoke before paint; we revoke only when value changes or on remove.
  const imageUrl = useMemo(() => {
    if (value instanceof File && value.type !== 'application/pdf') {
      if (objectUrlRef.current?.file === value) return objectUrlRef.current.url;
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current.url);
        objectUrlRef.current = null;
      }
      const url = URL.createObjectURL(value);
      objectUrlRef.current = { file: value, url };
      return url;
    }
    if (typeof value === 'string' && value) {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current.url);
        objectUrlRef.current = null;
      }
      return value;
    }
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current.url);
      objectUrlRef.current = null;
    }
    return null;
  }, [value]);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        onChange(acceptedFiles[0]);
      }
    },
    [onChange],
  );

  const onDropRejected = useCallback((rejections: FileRejection[]) => {
    const firstError = rejections[0]?.errors[0];
    if (firstError?.code === 'file-invalid-type') {
      toast.error('Only PDF, PNG, or JPEG files are allowed.');
    } else if (firstError?.message) {
      toast.error(firstError.message);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    onDropRejected,
    accept,
    multiple: false,
    disabled: loading,
  });

  const handleRemove = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current.url);
        objectUrlRef.current = null;
      }
      onChange(null);
    },
    [onChange],
  );

  const hasValue =
    value != null && (typeof value !== 'string' || value.trim() !== '');
  const file = value instanceof File ? value : null;
  const fileName =
    file?.name ?? (typeof value === 'string' && value ? 'Uploaded file' : '');
  const fileMeta = file
    ? `${formatFileSize(file.size)} • ${formatFileDate(file)}`
    : '';

  const isImage = !!imageUrl;
  const showSelectedFileCard =
    hasValue && !isImage && (content || file);
  const showPreview = !!imageUrl;

  return (
    <div
      className={cn(
        'relative max-w-full',
        content ? 'w-full' : 'w-24',
        className,
      )}
    >
      {loading && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center gap-2 rounded-xl bg-background/80">
          <div
            className="h-8 w-8 animate-spin rounded-full border-2 border-neutral-gray-20 border-t-primary"
            aria-hidden
          />
          <span className="text-sm font-medium text-neutral-gray-80">
            Uploading...
          </span>
        </div>
      )}
      {showSelectedFileCard ? (
        <div className="flex items-center gap-3 w-full rounded-lg bg-neutral-gray-10 px-4 py-3">
          {/* <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-orange-100 text-orange-500"> */}
          <DocumentIcon className="size-10" strokeWidth={1.5} />
          {/* </div> */}
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-neutral-gray-100 truncate">
              {fileName}
            </p>
            {fileMeta && (
              <p className="text-xs text-neutral-gray-60 mt-0.5">{fileMeta}</p>
            )}
          </div>
          {!loading && (
            <button
              type="button"
              onClick={handleRemove}
              className="cursor-pointer shrink-0 rounded p-1.5 text-red-500 hover:bg-red-50 transition-colors"
              aria-label="Remove file"
            >
              <TrashIcon className="size-5 [&_path]:fill-[#F14D4D]" />
            </button>
          )}
        </div>
      ) : showPreview ? (
        <div
          className={cn(
            'relative z-10 border border-neutral-gray-40 bg-neutral-gray-0 flex flex-col items-center justify-center',
            content
              ? 'w-full min-h-32 rounded-xl'
              : 'w-24 h-24 rounded-full',
          )}
        >
          <div
            className={cn(
              'absolute inset-0 overflow-hidden',
              content ? 'rounded-xl' : 'rounded-full',
            )}
          >
            <Image
              src={imageUrl as string}
              alt="Preview"
              fill
              className={cn(
                'object-cover text-center',
                content ? 'rounded-xl' : 'rounded-full',
              )}
              unoptimized={value instanceof File}
            />
          </div>
          {!loading && (
            <button
              type="button"
              onClick={handleRemove}
              className="group absolute top-2 right-2 z-50 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-red-400 cursor-pointer transition-colors"
              aria-label="Remove image"
            >
              <TrashIcon className="[&_path]:fill-[#F14D4D] group-hover:[&_path]:fill-white transition-colors" />
            </button>
          )}
        </div>
      ) : (
        <div
          {...getRootProps()}
          className={cn(
            'border-2 border-dashed border-neutral-gray-40 bg-neutral-gray-0 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors',
            content
              ? 'w-full min-h-32 rounded-xl py-6 px-4'
              : 'relative w-24 h-24 rounded-full gap-3',
            isDragActive
              ? 'border-primary bg-primary/5'
              : 'hover:border-primary/50',
          )}
        >
          <input {...getInputProps()} />
          {content ?? (
            <>
              <AddGalleryIcon />
              <div className="absolute -bottom-1 right-0 w-8 h-8 flex items-center justify-center rounded-full text-primary bg-white shadow-md">
                <span className="text-lg leading-none">
                  <Plus />
                </span>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

"use client";

import PlusIcon from "@/icons/plus.icon";
import TrashIcon from "@/icons/trash.icon";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDropzone } from "react-dropzone";
import toast from "react-hot-toast";

interface Props {
  value?: string | File | null;
  onChange: (file: File | null) => void;
  className?: string;
}

export default function SquaredImageReactDropzone({
  value,
  onChange,
  className,
}: Props) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const objectUrlRef = useRef<string | null>(null);

  const imageUrl = useMemo(() => {
    if (value instanceof File) {
      if (!previewUrl) {
        const url = URL.createObjectURL(value);
        setPreviewUrl(url);
        if (objectUrlRef.current) {
          URL.revokeObjectURL(objectUrlRef.current);
        }
        objectUrlRef.current = url;
        return url;
      }
      return previewUrl;
    }
    if (typeof value === "string") {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }
      setPreviewUrl(null);
      return value;
    }
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
    setPreviewUrl(null);
    return null;
  }, [value, previewUrl]);

  useEffect(() => {
    return () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
      }
    };
  }, []);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        onChange(acceptedFiles[0]);
      }
    },
    [onChange]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    onDropRejected: () => {
      toast.error('Only JPG and PNG files are allowed.');
    },
    accept: {
      "image/png": [".png"],
      "image/jpeg": [".jpg", ".jpeg"],
    },
    multiple: false,
  });

  const handleRemove = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }
      setPreviewUrl(null);
      onChange(null);
    },
    [onChange]
  );

  return (
    <div className={cn("relative w-full max-w-full", className)}>
      {imageUrl ? (
        <div className="relative w-full aspect-3/1 min-h-32 rounded-xl border border-primary bg-neutral-gray-0 overflow-hidden">
          <Image
            src={imageUrl}
            alt="Preview"
            fill
            className="object-cover rounded-xl"
            unoptimized={
              value instanceof File ||
              (typeof value === "string" && /^https?:\/\//.test(value))
            }
          />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-2 right-2 w-8 h-8 bg-white  rounded-full flex items-center justify-center shadow-md hover:bg-red-400/90 cursor-pointer transition-colors z-10"
          >
            <TrashIcon />
          </button>
        </div>
      ) : (
        <div
          {...getRootProps()}
          className={cn(
            "w-full min-h-32 aspect-3/1 border-2 border-dashed rounded-xl border-neutral-gray-40 bg-neutral-gray-0 flex flex-col items-center justify-center gap-3 cursor-pointer transition-colors",
            isDragActive ? "border-primary bg-primary/5" : "hover:border-primary/50"
          )}
        >
          <input {...getInputProps()} />
          <PlusIcon />
          <span className="text-sm text-neutral-gray-80">
            Click to Add Shop Image
          </span>
        </div>
      )}
    </div>
  );
}

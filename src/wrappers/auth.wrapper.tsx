import React from "react";
import Image from "next/image";
import { StaticImport } from "next/dist/shared/lib/get-img-props";
import { cn } from "@/lib/utils";

interface Props {
  img: string | StaticImport;
  children: React.ReactNode;
  containerClassName?: string;
  imageClassName?: string;
}
export default function AuthWrapper({
  children,
  imageClassName,
  img,
  containerClassName,
}: Props) {
  return (
    <div className="w-full min-h-dvh flex overflow-y-auto relative">
      <div className="bg-white md:w-1/2 flex items-center justify-center ">
        <div
          className={cn(
            "w-full md:max-w-125   lg:py-24 lg:px-8 px-6 py-8",
            containerClassName,
          )}
        >
          {children}
        </div>
      </div>
      <div className="hidden md:block md:w-1/2 h-dvh fixed right-0 top-0">
        <Image
          src={img}
          priority
          alt="Preview Images"
          className={cn(
            "w-full h-full object-cover object-top",
            imageClassName,
          )}
        />
      </div>
    </div>
  );
}

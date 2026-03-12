"use client";

// React
import { InputHTMLAttributes, JSX, useState } from "react";

// Components
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { Input } from "../ui/input";
import { cn } from "@/lib/utils";
import { EyeOff } from "lucide-react";
import { Control, FieldValues, Path } from "react-hook-form";
import EyeIcon from "@/icons/eye.icon";

interface Props<TFieldValues extends FieldValues = FieldValues> extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "name"
> {
  label: string;
  control: Control<TFieldValues>;
  name: Path<TFieldValues>;
  error?: string;
  icon?: JSX.Element;
}

export default function InputWithLabelComponent<
  TFieldValues extends FieldValues,
>({
  label,
  control,
  name,
  error,
  type = "text",
  icon,
  ...rest
}: Props<TFieldValues>) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";

  const flexClasses =
    rest.className?.match(/\b(flex-\d+|flex|flex-grow|flex-shrink)\b/g) || [];
  const inputClassName =
    rest.className
      ?.replace(/\b(flex-\d+|flex|flex-grow|flex-shrink)\b/g, "")
      .trim() || "";

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem
          className={cn("relative flex flex-col gap-2", flexClasses.join(" "), rest.disabled && 'text-neutral-gray-50')}
        >
          <FormLabel className="text-base font-medium mb-0 pb-0 flex items-center gap-1">
            {label}
            {rest.required && <span className="text-red-500">*</span>}
          </FormLabel>
          <FormControl className="">
            <div className="relative w-full">
              {icon && (
                <span className="absolute top-[19px] left-3 -translate-y-1/2 text-gray-400">
                  {icon}
                </span>
              )}
              <Input
                type={isPassword ? (showPassword ? "text" : "password") : type}
                {...field}
                value={field.value?.toString() || ""}
                {...rest}
                className={cn(
                  " rounded-lg text-sm bg-transparent h-14 shadow-none disabled:bg-neutral-gray-0 disabled:border-neutral-gray-20 disabled:text-neutral-gray-60",
                  icon && "pl-10",
                  isPassword && "pr-10",
                  inputClassName,
                )}
              />
              {isPassword && (
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute cursor-pointer right-2 top-1/2 -translate-y-[50%] text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={23} /> : <EyeIcon />}
                </button>
              )}
            </div>
          </FormControl>
          <FormMessage className="text-xs text-red-500">{error}</FormMessage>
        </FormItem>
      )}
    />
  );
}

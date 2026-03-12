import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { TVoidCallback } from "@/types/types/common/common.type";
interface Props {
  onChange: TVoidCallback<[string]>;
  value?: string;
}
export function OtpInput({ onChange, value }: Props) {
  const OTP_LENGTH = 6;

  // ==================Handlers=================
  const handleChange = (newValue: string) => {
    const numericValue = newValue.replace(/\D/g, "");
    onChange(numericValue);
  };

  return (
    <InputOTP
      placeholder="0"
      onChange={handleChange}
      value={value}
      maxLength={OTP_LENGTH}
    >
      <InputOTPGroup className="w-full flex items-center justify-between text- text-sm font-semibold">
        {Array.from({ length: OTP_LENGTH }).map((_, index) => (
          <InputOTPSlot
            key={index}
            index={index}
            className="rounded-xl border border-neutral-gray-20 sm:h-12 sm:w-14 h-14 w-15 font-normal shadow-none"
          />
        ))}
      </InputOTPGroup>
    </InputOTP>
  );
}

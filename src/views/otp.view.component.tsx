"use client";
import CoverImage from "@/../public/assets/3.svg";
import GoBackButton from "@/components/button/go-back-button.component";
import { OtpInput } from "@/components/otp-input.component";
import {
  OtpResendButton,
  OtpTimerDisplay,
} from "@/components/otp-resend-timer.component";
import Heading from "@/components/text/heading.component";
import SubText from "@/components/text/subtext.component";
import { useOtpTimer } from "@/hooks/useOtpTimer";
import SignupIcon from "@/icons/signup.icon";
import { cn } from "@/lib/utils";
import { TVoidCallback } from "@/types/types/common/common.type";
import AuthWrapper from "@/wrappers/auth.wrapper";
import { useState } from "react";

interface Props {
  title: string;
  description: string;
  onSubmit: TVoidCallback<[string]>;
  onGoBack?: TVoidCallback;
  onResend: (resetTimer?: () => void) => void;
  isLoading?: boolean;
}
export default function OtpView({
  title,
  description,
  onSubmit,
  onGoBack,
  isLoading,
  onResend,
}: Props) {
  const [otpValue, setOtpValue] = useState("");
  const OTP_LENGTH = 6;
  const isOtpComplete = otpValue.length === OTP_LENGTH;

  const { timeLeft, isActive, handleReset } = useOtpTimer(60);

  // ==================Handlers=================
  const handleOtpChange = (value: string) => {
    setOtpValue(value);
  };

  const handleContinue = () => {
    if (isOtpComplete) {
      onSubmit(otpValue);
    }
  };

  const handleResetOtp = () => {
    onResend(handleReset);
  };

  return (
    <AuthWrapper img={CoverImage}>
      <div className="max-w-112.5 flex flex-col gap-8">
        <SignupIcon />
        <div>
          <Heading>{title}</Heading>
          <SubText>{description}</SubText>
        </div>

        {/* OTP Input */}
        <OtpInput onChange={handleOtpChange} value={otpValue} />
        {isActive && <OtpTimerDisplay timeLeft={timeLeft} />}

        {/* Buttons */}
        <div className=" flex items-center gap-3">
          <GoBackButton onClick={onGoBack} />
          <button
            type="button"
            className={cn(
              "w-full bg-primary hover:bg-primary/90 h-12 rounded-lg cursor-pointer font-medium text-white",
              (!isOtpComplete || isLoading || isLoading) && "disabled:bg-primary/50",
            )}
            disabled={!isOtpComplete || isLoading}
            onClick={handleContinue}
          >
            Continue
          </button>
        </div>

        <OtpResendButton
          isActive={isActive}
          onResend={handleResetOtp}
          timeLeft={timeLeft}
        />
      </div>
    </AuthWrapper>
  );
}

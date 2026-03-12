interface Props {
  timeLeft: number;
  isActive: boolean;
  onResend: () => void;
}

export function OtpTimerDisplay({ timeLeft }: { timeLeft: number }) {
  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;

  return (
    <div className="self-center">
      <p className="text-neutral-gray-80 text-sm font-medium">
        Remaining Time{" "}
        <span className="font-semibold text-primary-2">
          {mins}:{secs.toString().padStart(2, "0")}
        </span>
      </p>
    </div>
  );
}

export function OtpResendButton({ isActive, onResend }: Props) {
  return (
    <p className="text-center text-sm self-center text-neutral-gray-80 flex items-center gap-2">
      {`Didn't receive the code?`}
      <button
        className="text-primary cursor-pointer underline underline-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={onResend}
        disabled={isActive}
      >
        Resend
      </button>
    </p>
  );
}

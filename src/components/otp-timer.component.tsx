// React
import { useEffect, useState } from "react";

interface Props {
  duration: number;
  onTimerEnd: () => void;
}

export default function OtpTimer({ duration, onTimerEnd }: Props) {
  const [timeLeft, setTimeLeft] = useState<number>(duration);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (timeLeft > 0) {
      timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    } else {
      onTimerEnd();
    }
    return () => clearTimeout(timer);
  }, [timeLeft, onTimerEnd]);

  return (
    <p className="text-tertiary text-sm">
      Resend available in{" "}
      <span className="font-semibold text-primary">{timeLeft}</span>s
    </p>
  );
}

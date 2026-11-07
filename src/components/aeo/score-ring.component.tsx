interface IScoreRingProps {
  score: number;
  grade: string;
  size?: number;
}

/** Circular 0–100 gauge from the report's score card. */
export function ScoreRing({ score, grade, size = 200 }: IScoreRingProps) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, score));
  const dash = (clamped / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 120 120"
        role="img"
        aria-label={`AEO score ${Math.round(clamped)} out of 100, grade ${grade}`}
      >
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke="var(--subtle)"
          strokeWidth="10"
        />
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke="var(--primary)"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circumference}`}
          transform="rotate(-90 60 60)"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[64px] leading-none font-bold tracking-[-0.03em]">
          {Math.round(clamped)}
        </span>
        <span className="text-[13px] text-muted-foreground">out of 100</span>
      </div>
    </div>
  );
}

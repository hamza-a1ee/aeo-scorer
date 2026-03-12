interface Props {
  message?: string;
}

export default function SuspenseLoading({ message = "Loading..." }: Props) {
  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center gap-6 bg-background px-4">
      <div
        className="h-10 w-10 animate-spin rounded-full border-2 border-neutral-gray-20 border-t-primary"
        aria-hidden
      />
      {message && (
        <p className="text-sm text-muted-foreground animate-pulse">
          {message}
        </p>
      )}
    </div>
  );
}

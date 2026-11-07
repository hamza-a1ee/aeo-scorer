/** Renders text with every [confirm: …] token shown as a red mark. */
export function ConfirmMarkText({ text }: { text: string }) {
  const parts = text.split(/(\[confirm:[^\]]*\])/g);
  return (
    <>
      {parts.map((part, i) =>
        part.startsWith('[confirm:') ? (
          <mark
            key={i}
            className="rounded bg-destructive-muted px-1 py-px text-destructive-strong"
          >
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </>
  );
}

export function countConfirmTokens(text: string | null | undefined): number {
  return text ? (text.match(/\[confirm:[^\]]*\]/g) ?? []).length : 0;
}

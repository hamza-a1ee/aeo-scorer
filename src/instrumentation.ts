export async function register() {
  if (process.env.NEXT_RUNTIME !== 'nodejs') return;
  const { resumeStaleScans } = await import('@/server/pipeline/resume');
  // Give the server a moment to boot, then resume, and keep checking.
  setTimeout(() => void resumeStaleScans(), 5_000);
  setInterval(() => void resumeStaleScans(), 2 * 60_000).unref?.();
}

export default function Separator() {
  return (
    <div className="relative flex items-center justify-center w-full my-4">
      <div className="absolute left-0 right-0 h-px bg-border" />
      <div className="relative bg-white px-4">
        <span className="text-sm font-medium text-accent-200 uppercase">OR</span>
      </div>
    </div>
  );
}

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-neutral-gray-0 to-neutral-gray-10 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-10 left-5 md:top-20 md:left-10 w-20 h-20 md:w-32 md:h-32 bg-primary/5 rounded-full animate-[float_3s_ease-in-out_infinite]"></div>
        <div className="absolute top-32 right-5 md:top-40 md:right-20 w-16 h-16 md:w-24 md:h-24 bg-primary/10 rounded-lg rotate-45 animate-[float-delayed_4s_ease-in-out_infinite]"></div>
        <div className="absolute bottom-24 left-1/4 w-24 h-24 md:w-40 md:h-40 bg-primary/5 rounded-full animate-[float-slow_5s_ease-in-out_infinite]"></div>
        <div className="absolute bottom-10 right-1/4 md:bottom-20 md:right-1/3 w-12 h-12 md:w-20 md:h-20 bg-primary/10 rounded-lg animate-[float_3s_ease-in-out_infinite]"></div>
        <div className="absolute top-1/3 right-5 md:right-10 w-12 h-12 md:w-16 md:h-16 bg-primary/5 rounded-full animate-[float-delayed_4s_ease-in-out_infinite]"></div>
      </div>

      <div className="flex flex-col items-center gap-6 z-10">
        <div className="relative w-20 h-20">
          <div className="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-transparent border-t-primary rounded-full animate-spin"></div>
        </div>

        <div className="flex gap-2">
          <div className="w-3 h-3 bg-primary rounded-full animate-bounce [animation-delay:0ms]"></div>
          <div className="w-3 h-3 bg-primary rounded-full animate-bounce [animation-delay:150ms]"></div>
          <div className="w-3 h-3 bg-primary rounded-full animate-bounce [animation-delay:300ms]"></div>
        </div>

        <p className="text-neutral-gray-80 font-medium animate-pulse">
          Loading...
        </p>
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-20px); }
          }
          @keyframes float-delayed {
            0%, 100% { transform: translateY(0px) rotate(45deg); }
            50% { transform: translateY(-30px) rotate(45deg); }
          }
          @keyframes float-slow {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-15px); }
          }
        `,
        }}
      />
    </div>
  );
}

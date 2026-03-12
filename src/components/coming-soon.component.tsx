"use client";
import { COMMON_ROUTES } from "@/routes/common-routes";
import { removeClientCookie } from "@/utils/get-client-cookie";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function ComingSoon() {
  const router = useRouter();
  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-neutral-gray-0 flex flex-col items-center justify-center px-4">
      {/* Floating shapes - Tailwind only */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[10%] left-[8%] w-24 h-24 rounded-full bg-primary/10 animate-bounce [animation-delay:0ms] animation-duration-[4s]" />
        <div className="absolute top-[20%] right-[12%] w-40 h-40 rounded-full bg-primary/20 animate-pulse animation-duration-[3s]" />
        <div className="absolute bottom-[25%] left-[15%] w-32 h-32 rounded-full bg-primary/15 animate-bounce [animation-delay:700ms] animation-duration-[5s]" />
        <div className="absolute bottom-[15%] right-[10%] w-20 h-20 rounded-full bg-primary/10 animate-bounce [animation-delay:400ms] animation-duration-[3.5s]" />
        <div className="absolute top-1/2 left-[5%] w-16 h-16 rounded-full bg-neutral-gray-40/20 animate-pulse animation-duration-[2.5s]" />
        <div className="absolute top-[35%] right-[25%] w-12 h-12 rounded-full bg-primary/20 animate-bounce [animation-delay:1200ms] animation-duration-[4s]" />
        <div className="absolute bottom-[40%] right-[20%] w-28 h-28 rounded-full bg-neutral-gray-20 animate-pulse animation-duration-[4s]" />
        <div className="absolute top-[60%] left-[20%] w-14 h-14 rounded-full bg-primary/10 animate-bounce [animation-delay:200ms] animation-duration-[3s]" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center gap-8 text-center">
        <div className="relative">
          <Image
            src="/assets/car.svg"
            alt="Logo"
            width={120}
            height={120}
            className="object-contain drop-shadow-sm"
          />

        </div>

        <div className="space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold text-primary tracking-tight">
            Coming Soon
          </h1>
          <p className="text-neutral-gray-80 text-base md:text-lg max-w-sm">
            We&apos;re working on something great. Stay tuned.
          </p>
        </div>

        {/* Loader dots */}
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:0ms] animation-duration-[1.2s]" />
          <span className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:150ms] animation-duration-[1.2s]" />
          <span className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:300ms] animation-duration-[1.2s]" />
        </div>

        <button
          type="button"
          onClick={async () => {
            removeClientCookie()
            router.push(COMMON_ROUTES.selectRole)

            // redirect(COMMON_ROUTES.selectRole)
            // redirect(COMMON_ROUTES.selectRole)
          }}
          className="mt-2 px-6 cursor-pointer py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
        >
          Logout
        </button>
      </div>
    </main>
  );
}

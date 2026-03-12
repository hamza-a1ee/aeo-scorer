'use client';
import Logo from '@/../public/assets/some.svg';
import { useLogout } from '@/hooks/use-logout.hook';
import Image from 'next/image';

export default function Page() {
  // ============================ Hooks ============================
  const logout = useLogout();

  return (
    <main className="min-h-screen w-full bg-white flex flex-col items-center justify-center px-4 py-12">
      <div className="flex flex-col items-center gap-8 text-center w-full">
        {/* Logo */}sans
        <div className="flex flex-col items-center gap-1">
          <Image
            src={Logo}
            alt="some"
            width={220}
            height={78}
            className="object-contain h-12 w-auto"
          />
        </div>

        {/* Heading */}
        <h1 className="text-[28px] md:text-3xl font-bold text-neutral-900">
          Profile Submitted for Review
        </h1>

        {/* Description */}
        <p className="text-base text-test-secondary text-[18px]">
          Thank you for submitting your profile. Our team will review your
          information,
          <br />
          and you’ll be notified once your profile is approved. This may take up
          to
          <br />
          24-48 hours.
        </p>

        {/* Log Out */}
        <form action={() => logout()} className="pt-2">
          <button
            type="submit"
            className="h-12 w-125 cursor-pointer text-base rounded-lg border-0  bg-neutral-gray-0 text-neutral-700 font-medium hover:bg-neutral-300 transition-colors "
          >
            Log Out
          </button>
        </form>
      </div>
    </main>
  );
}

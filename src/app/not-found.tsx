'use client';
import Link from 'next/link';
import { Home, Search } from 'lucide-react';
import Heading from '@/components/text/heading.component';
import SubText from '@/components/text/subtext.component';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-neutral-gray-0 to-neutral-gray-10 px-4">
      <div className="max-w-2xl w-full text-center space-y-8">
        <div className="relative">
          <div className="text-[150px] md:text-[200px] font-bold text-primary/10 animate-pulse">
            404
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Search className="w-20 h-20 md:w-32 md:h-32 text-primary animate-bounce" />
          </div>
        </div>

        <div className="space-y-4 animate-fade-in">
          <Heading className="text-3xl md:text-4xl">Page Not Found</Heading>
          <SubText className="text-lg">
            The page you're looking for doesn't exist or has been moved.
          </SubText>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
          <Link href="/">
            <button className="w-full sm:w-auto flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-lg font-medium transition-all hover:scale-105">
              <Home className="w-5 h-5" />
              Go Home
            </button>
          </Link>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
      `}</style>
    </div>
  );
}

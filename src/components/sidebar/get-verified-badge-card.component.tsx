import Link from 'next/link';
import { MECHANIC_ROUTES } from '@/routes/mechanic-routes';

const BENEFITS = [
  'Higher ranking in search',
  'More customer trust',
  'Verification badge displayed on profile',
];

export default function GetVerifiedBadgeCard() {
  return (
    <div className="mx-4 mb-4 rounded-xl border border-primary bg-[#FE63001A] p-4">
      <h3 className="text-base font-semibold text-white">Get Verified Badge</h3>
      <ul className="mt-3 list-disc list-inside  text-sm font-normal text-white">
        {BENEFITS.map(benefit => (
          <li key={benefit} className="text-white/90 text-[10px]">
            {benefit}
          </li>
        ))}
      </ul>
      <Link
        href={MECHANIC_ROUTES.profileVerification}
        className="mt-4 flex  rounded-md w-full bg-primary text-base font-medium items-center justify-center  py-3 text-white"
      >
        Get Verified Badge
      </Link>
    </div>
  );
}

import { COMMON_ROUTES } from '@/routes/common-routes';
import { TNavbarBtn } from '@/types/types/common/common.type';

export const NavbarItems: TNavbarBtn[] = [
  {
    label: 'Home',
    href: () => COMMON_ROUTES.home,
  },
  {
    label: 'Search',
    href: () => COMMON_ROUTES.search,
  },
  {
    label: 'Mechanic',
    href: () => COMMON_ROUTES.mechanics,
  },
  {
    label: 'FAQs',
    href: () => COMMON_ROUTES.faqs,
  },
];

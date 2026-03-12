import { TNavbarBtn } from '@/types/types/common/common.type';
import DashboardIcon from '@/icons/dashboard.icon';
import QuotesIcon from '@/icons/quotes.icon';
import BookingManagementIcon from '@/icons/booking-management.icon';
import ServiceManagementIcon from '@/icons/service-management.icon';
import DiscountOffersIcon from '@/icons/discount-offers.icon';
import MessageIcon from '@/icons/message.icon';
import MarketingIcon from '@/icons/marketing.icon';
import SettingsIcon from '@/icons/settings.icon';
import { MECHANIC_ROUTES } from '@/routes/mechanic-routes';

const R = MECHANIC_ROUTES;
export const SidebarItems: TNavbarBtn[] = [
  { label: 'Dashboard', logo: [<DashboardIcon />], href: () => R.dashboard },
  {
    label: 'Quote Requests',
    logo: [<QuotesIcon />],
    href: () => R.quoteRequests,
  },
  {
    label: 'Bookings Management',
    logo: [<BookingManagementIcon />],
    href: () => R.bookingsManagement,
  },
  {
    label: 'Service Management',
    logo: [<ServiceManagementIcon />],
    href: () => R.serviceManagement,
  },
  {
    label: 'Discount Offers',
    logo: [<DiscountOffersIcon />],
    href: () => R.discountOffers,
  },
  { label: 'Messages', logo: [<MessageIcon />], href: () => R.messages },
  {
    label: 'Marketing Tools',
    logo: [<MarketingIcon />],
    href: () => R.marketingTools,
  },
  {
    label: 'Profile & Settings',
    logo: [<SettingsIcon />],
    href: () => R.profileSettings,
  },
];

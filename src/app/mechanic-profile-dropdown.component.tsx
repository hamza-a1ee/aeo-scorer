import CustomAvatar from '@/components/custom-avatar.component';
import UserDropdownContent from '@/components/user-dropdown-content.component';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Props {
  avatarUrl: string;
  displayName: string;
  email?: string | null;
}

export default function MechanicProfileDropdown({
  avatarUrl,
  displayName,
  email,
}: Props) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="rounded-full focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2"
        aria-label="User menu"
      >
        <CustomAvatar className="size-12 cursor-pointer" image={avatarUrl} />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="w-60 rounded-xl shadow-md p-0 border border-neutral-gray-10 bg-white overflow-hidden"
      >
        <UserDropdownContent
          displayName={displayName}
          profileUrl={avatarUrl}
          email={email}
        />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

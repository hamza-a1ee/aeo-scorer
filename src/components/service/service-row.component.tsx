import { Checkbox } from '@/components/ui/checkbox';
import { IMechanicService } from '@/types/interfaces/customer/request-a-quote/api.interface';
import { TVoidCallback } from '@/types/types/common/common.type';
import Image from 'next/image';

export function formatPrice(price: number, isFixed: boolean) {
  return isFixed ? `$${price}` : `From $${price}`;
}

interface Props {
  service: IMechanicService;
  checked: boolean;
  onCheckedChange: TVoidCallback<[boolean]>;
}

export function ServiceRow({ service, checked, onCheckedChange }: Props) {
  return (
    <label className="flex items-start gap-3 py-3 cursor-pointer border-b border-neutral-gray-10 last:border-b-0">
      <Image
        src={service.icon_url}
        alt={service.title}
        width={40}
        height={40}
        className="size-10 shrink-0 rounded-lg object-contain"
      />
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm text-primary-2">{service.title}</p>
        <p className="text-xs text-test-secondary">{service.description}</p>
      </div>
      <div className="flex flex-col gap-1 items-end">
        <Checkbox
          checked={checked}
          onCheckedChange={onCheckedChange}
          className="mt-1 shrink-0"
        />
        <p className="text-sm font-medium text-primary mt-1 float-end">
          {formatPrice(service.price, service.is_fixed)}
        </p>
      </div>
    </label>
  );
}

import Image from 'next/image';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';

interface Props {
  image: string;
  fallback?: string;
  fallbackText?: string;
  className?: string;
}
export default function CustomAvatar({
  image,
  fallback,
  fallbackText,
  className,
}: Props) {
  return (
    <Avatar className={className}>
      <AvatarImage src={image} className="object-cover" />
      <AvatarFallback className="rounded-full bg-neutral-gray-20 text-primary-2 text-sm">
        {fallback ? (
          <Image
            src={fallback}
            className="rounded-full"
            alt="fallback"
            width={20}
            height={20}
          />
        ) : (
          fallbackText
        )}
      </AvatarFallback>
    </Avatar>
  );
}

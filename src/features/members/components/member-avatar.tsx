import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface MemberAvatarProps {
  name: string;
  className?: string;
  fallbackClassName?: string;
}

export const MemberAvatar = ({
  name,
  className,
  fallbackClassName,
}: MemberAvatarProps) => {
  return (
    <Avatar
      className={cn(
        'size-5 transition border border-neutral-300 rounded-full',
        className
      )}
    >
      <AvatarFallback
        className={cn(
          // items-center：縦方向に中央揃え justify-center：横方向に中央揃え
          'bg-neutral-200 font-medium text-neutral-500 flex items-center justify-center',
          fallbackClassName
        )}
      >
        {name.charAt(0).toUpperCase()}
      </AvatarFallback>
    </Avatar>
  );
};

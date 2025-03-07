import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface IconAvatarProps {
  avatarFallback: string;
}

export const IconAvatar = ({ avatarFallback }: IconAvatarProps) => {
  return (
    <Avatar className='size-[52px] border border-neutral-300'>
      <AvatarFallback className='bg-neutral-200 text-xl font-medium text-neutral-500 flex items-center justify-center'>
        {avatarFallback}
      </AvatarFallback>
    </Avatar>
  );
};

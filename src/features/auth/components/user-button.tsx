'use client';

import { Loader, LogOut } from 'lucide-react';
import { useCurrent } from '../api/use-current';
import { useLogout } from '../api/use-logout';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { DottedSeparator } from '@/components/dotted-separator';

export const UserButton = () => {
  const { data: user, isLoading } = useCurrent();
  // useLogout内の処理をまとめてmutateと名前をつけて、ここではlogout()として使えるようにする
  const { mutate: logout } = useLogout();

  // ユーザーが取得中の場合はローディングアイコンを表示
  if (isLoading) {
    return (
      <div className='size-10 rounded-full flex items-center justify-center bg-neutral-200 border border-neutral-300'>
        <Loader className='size-4 animate-spin text-muted-foreground' />
      </div>
    );
  }

  // もしユーザーが存在しなければ、ボタンを押しても何も起こらない
  if (!user) {
    return null;
  }

  const { email, name } = user;

  // アバターの文字表示のために使われる
  // nameがあればnameの最初の文字を大文字にして、なければemailの最初の文字を大文字にする。
  // どちらもなければUを表示する。
  const avatarFallback = name
    ? name.charAt(0).toUpperCase()
    : email.charAt(0).toUpperCase() ?? 'U';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className='outline-none relative'>
        <Avatar className='size-10 hover:opacity-75 transition border border-neutral-300'>
          {/* 最初に表示される一文字の部分の設定 */}
          <AvatarFallback className='bg-neutral-200 font-medium text-neutral-500 flex items-center justify-center'>
            {avatarFallback}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align='end'
        side='bottom'
        className='w-60'
        // 円のアバターの下端から10pxの位置に表示
        sideOffset={10}
      >
        <div className='flex flex-col items-center justify-center gap-2 px-2.5 py-4'>
          {/* 丸文字 */}
          <Avatar className='size-[52px] border border-neutral-300'>
            <AvatarFallback className='bg-neutral-200 text-xl font-medium text-neutral-500 flex items-center justify-center'>
              {avatarFallback}
            </AvatarFallback>
          </Avatar>
          {/* 名前とメール */}
          <div className='flex flex-col items-center justify-center'>
            <p className='text-sm font-medium text-neutral-900'>
              {name || 'User'}
            </p>
            <p className='text-xs text-neutral-500'>{email}</p>
          </div>
        </div>
        <DottedSeparator className='mb-1' />
        {/* ログアウト */}
        <DropdownMenuItem
          onClick={() => logout()}
          className='h-10 flex items-center justify-center text-amber-700 font-medium cursor-pointer'
        >
          <LogOut className='size-4 mr-2' />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

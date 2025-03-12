'use client';

import { Loader, LogOut, SmilePlus } from 'lucide-react';
import { useCurrent } from '../api/use-current';
import { useLogout } from '../api/use-logout';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { DottedSeparator } from '@/components/dotted-separator';
import { Button } from '@/components/ui/button';
import { useCreateFaceModal } from '@/features/members/hooks/use-create-face-modal';
import { IconAvatar } from './icon-avatar';
import { IconImage } from './icon-image';

export const UserButton = () => {
  const { open } = useCreateFaceModal();
  const { mutate: logout } = useLogout();

  const { data: user, isLoading } = useCurrent();

  // const currentPath = usePathname();
  // const defaultLanguageSetting = localStorage.getItem('language') || 'en';

  // const [languageSetting, setLanguageSetting] = useState(
  //   defaultLanguageSetting
  // );

  // const ChangeLanguage = (event: React.ChangeEvent<HTMLInputElement>) =>
  //   setLanguageSetting(event.target.value);

  // もしユーザーが存在しなければ、ボタンを押しても何も起こらない
  if (!user) {
    return null;
  }

  // ユーザーが取得中の場合はローディングアイコンを表示
  if (isLoading) {
    return (
      <div className='size-10 rounded-full flex items-center justify-center bg-neutral-200 border border-neutral-300'>
        <Loader className='size-4 animate-spin text-muted-foreground' />
      </div>
    );
  }

  // アバターの文字表示のために使われる
  // nameがあればnameの最初の文字を大文字にして、なければemailの最初の文字を大文字にする。
  // どちらもなければUを表示する。
  const { email, name } = user;
  const avatarFallback = name
    ? name.charAt(0).toUpperCase()
    : email.charAt(0).toUpperCase() ?? 'U';

  const userEmailFirst = user.email.split('@')[0];

  const userIconId = user?.prefs?.icon;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className='outline-none relative'>
        {userIconId ? (
          <IconImage />
        ) : (
          <IconAvatar avatarFallback={avatarFallback} />
        )}
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
          {userIconId ? (
            <IconImage />
          ) : (
            <IconAvatar avatarFallback={avatarFallback} />
          )}
          {/* 名前とメール */}
          <div className='flex flex-col items-center justify-center'>
            <p className='text-sm font-medium text-neutral-900'>
              {name || userEmailFirst || 'User'}
            </p>
            <p className='text-xs text-neutral-500'>{email}</p>
          </div>
        </div>
        {/* 言語選択のラジオボタン */}
        {/* <div className='flex place-content-center pb-4'>
          <div>
          <input
          id='en'
          type='radio'
          name='en_button'
          value='en'
          checked={languageSetting !== 'ja'}
          onChange={ChangeLanguage}
          />
          <label htmlFor='#en' className='form-check-label'>
          &nbsp;EN
          </label>
          </div>
          <div className='ml-4'>
          <input
          id='ja'
          type='radio'
          name='ja_button'
          value='ja'
          checked={languageSetting === 'ja'}
          onChange={ChangeLanguage}
          />
          <label htmlFor='#ja' className='form-check-label'>
          &nbsp;JA
          </label>
          </div>
          </div> */}
        {/* アイコン変更用のボタン */}
        <div className='flex flex-col items-center justify-center mb-4'>
          <Button
            size='sm'
            variant='outline'
            className='w-5/6 h-8 font-medium'
            onClick={() => {
              open();
            }}
          >
            <SmilePlus className='size-4 mr-2' />
            Change Avatar
          </Button>
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

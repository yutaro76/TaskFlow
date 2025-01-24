'use-client';

import { MenuIcon } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from './ui/sheet';
import { Button } from './ui/button';
import { Sidebar } from './sidebar';
import { VisuallyHidden } from 'radix-ui';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

export const MobileSidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // パスが変わる時に発火し、setIsOpenでisOpenの状態をfalseにすることで、メニューを閉じる。
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  return (
    // 要素がはみ出さないようにする。
    <Sheet modal={false} open={isOpen} onOpenChange={setIsOpen}>
      {/* SheetTrigger自体がボタン。ボタンの中にボタンを入れるときはasChildをつける */}
      <SheetTrigger asChild>
        {/* lg以上の画面では非表示 */}
        <Button variant='secondary' className='lg:hidden'>
          <MenuIcon className='size-4 text-neutral-500' />
        </Button>
      </SheetTrigger>
      {/* エラー解消のため表示されない仮のタイトルを配置 */}
      <SheetContent side='left' className='p-0'>
        <VisuallyHidden.Root>
          <SheetTitle>Menu</SheetTitle>
          <SheetDescription>Description</SheetDescription>
        </VisuallyHidden.Root>
        <Sidebar />
      </SheetContent>
    </Sheet>
  );
};

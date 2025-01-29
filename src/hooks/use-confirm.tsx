import { useState } from 'react';
import { Button, type ButtonProps } from '@/components/ui/button';
import { ResponsiveModal } from '@/components/responsive-modal';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export const useConfirm = (
  title: string,
  message: string,
  variant: ButtonProps['variant'] = 'primary' // ボタンの色はprimary（青色）がデフォルト
  // 返される値の型を示す。前半は確認ダイアログの JSX 要素、後半はtrueまたはfalse。
): [() => JSX.Element, () => Promise<unknown>] => {
  // promiseの初期値はnull。setPromiseでpromiseの状態を変更する。
  const [promise, setPromise] = useState<{
    // promiseの状態の型を定義。
    // 一つはresolve関数を持つオブジェクト（引数にboolean型をとる）、もう一つはnull。
    resolve: (value: boolean) => void;
  } | null>(null);

  const confirm = () => {
    return new Promise((resolve) => {
      setPromise({ resolve });
    });
  };

  // promiseの状態をnullにする。
  // 確認ダイアログを閉じる。
  const handleClose = () => {
    setPromise(null);
  };

  // promiseのresolve関数を呼び出して、Promiseにtrueを返す。
  // promiseの状態をnullにする。
  const handleConfirm = () => {
    promise?.resolve(true);
    handleClose();
  };

  // promiseのresolve関数を呼び出して、Promiseにfalseを返す。
  // promiseの状態をnullにする。
  const handleCancel = () => {
    promise?.resolve(false);
    handleClose();
  };

  const ConfirmationDialog = () => (
    // onOpenChangeはモーダルの開閉状態が変わった時に呼び出される関数。
    <ResponsiveModal open={promise !== null} onOpenChange={handleClose}>
      <Card className='w-full h-full border-none shadow-none'>
        <CardContent className='pt-8'>
          <CardHeader className='p-0'>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{message}</CardDescription>
          </CardHeader>
          <div className='pt-4 w-full flex flex-col gap-y-2 lg:flex-row gap-x-2 items-center justify-end'>
            <Button
              onClick={handleCancel}
              variant='outline'
              className='w-full lg:w-auto'
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirm}
              variant={variant}
              className='w-full lg:w-auto'
            >
              Confirm
            </Button>
          </div>
        </CardContent>
      </Card>
    </ResponsiveModal>
  );

  return [ConfirmationDialog, confirm];
};

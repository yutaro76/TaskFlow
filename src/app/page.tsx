'use client';
// @をつければ、srcディレクトリから始まる相対パスでimportできる
import { Button } from '@/components/ui/button';
import { useCurrent } from '@/features/auth/api/use-current';
import { useLogout } from '@/features/auth/api/use-logout';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Home() {
  const router = useRouter();
  // useCurrentフックを使って、現在のユーザー情報を取得する。
  // データが取得中の場合はisLoadingがtrueになる。取得が終わればisLoadingはfalseになる。
  const { data, isLoading } = useCurrent();
  // mutateは自由につけた名前で、他の呼び方でもよい。
  const { mutate } = useLogout();

  useEffect(() => {
    // isLoadingがtrueのときはfalseになり、逆も同じ。
    // dataがない場合、isLoadingがtrueで!isLoadingがfalseのとき（両方falseのとき）にサインインページにリダイレクトする。
    if (!data && !isLoading) {
      router.push('/sign-in');
    }
  });
  return (
    <>
      only visible to authenticated users
      <Button
        onClick={() => {
          mutate();
        }}
      ></Button>
    </>
  );
}

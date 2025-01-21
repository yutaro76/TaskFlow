'use client';

import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

// childrenとして子ファイルを受け取る。この書き方はReactの書き方。
interface AuthLayoutProps {
  children: React.ReactNode;
}

// sign-up, sign-inの元のデザインを作成する。
// export constとする場合とconstとして最後にexportする場合がある。
// 最後にexportする場合は、export defaultを使い、複数のexportをまとめて行うことがある。
const AuthLayout = ({ children }: AuthLayoutProps) => {
  const pathname = usePathname();
  return (
    // min-h-screenは、最低限の高さを指定し、それがスクリーンの大きさなので、画面全体が埋まる。
    <main className='bg-neutral-100 min-h-screen'>
      {/* mx-autoでmargin-leftとmargin-rightをautoにし、水平方向に中央揃え
      max-withをscreen-2xl(tailwindで1536px)にし、paddingを4に設定 */}
      <div className='mx-auto max-w-screen-2xl p-4'>
        <nav className='flex justify-between items-center'>
          <Image
            src='/logo.png'
            alt='logo'
            width={152}
            height={56}
            style={{ width: 'auto', height: 'auto' }}
            priority
          />
          {/* asChildはレンダリングされる子要素で内容が変わる場合に使う。 */}
          <Button asChild variant='secondary'>
            <Link href={pathname === '/sign-in' ? '/sign-up' : '/sign-in'}>
              {pathname === '/sign-in' ? 'Sign up' : 'Sign in'}
            </Link>
          </Button>
        </nav>
      </div>
      {/* flexでflexが使えるようにする 
      flex-colで縦方向に並べる
      items-centerで要素の中で上下に中央揃え
      justify-centerで要素の中で左右に中央揃え
      md:pt-14は画面のサイズがmd以上でpadding-top: 14(3.5rem = 56px)を適用 */}
      <div className='flex flex-col items-center justify-center pt-4 md:pt-14'>
        {children}
      </div>
    </main>
  );
};

export default AuthLayout;

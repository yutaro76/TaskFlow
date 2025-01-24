import { Navbar } from '@/components/navbar';
import { Sidebar } from '@/components/sidebar';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  return (
    <div className='min-h-screen'>
      <div className='flex w-full h-full'>
        {/* 左上端に固定 画面サイズが lg（1024px）以上の場合に要素を表示 要素の縦方向のオーバーフローを自動でスクロール */}
        <div className='fixed left-0 top-0 hidden lg:block lg:w-[264px] h-full overflow-y-auto'>
          <Sidebar />
        </div>
        {/* largeの画面ではサイドバーが入るためその分のpadding left 264px */}
        <div className='lg:pl-[264px] w-full'>
          {/* mx-auto 水平方向に中央揃え 要素の最大幅を 2xl スクリーンサイズ（1536px）*/}
          <div className='mx-auto max-w-screen-2xl h-full'>
            <Navbar />
            <main className='h-full py-8 px-6 flex flex-col'>{children}</main>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;

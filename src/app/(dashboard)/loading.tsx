import { Loader } from 'lucide-react';

// loading.tsxはnext.jsの予約語で、特に他のファイルにこのコンポーネントをインポートすることなく、使われる。
const DashboardLoading = () => {
  return (
    <div className='h-full flex items-center justify-center'>
      <Loader className='size-6 animate-spin text-muted-foreground' />
    </div>
  );
};

export default DashboardLoading;

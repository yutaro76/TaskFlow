// @をつければ、srcディレクトリから始まる相対パスでimportできる
import { Button } from '@/components/ui/button';

export default function Home() {
  return (
    <>
      <Button>Click me</Button>
      <p className='text-red-500 font-semibold'>test123</p>
    </>
  );
}

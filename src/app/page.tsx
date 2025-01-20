// @をつければ、srcディレクトリから始まる相対パスでimportできる
import { Button } from '@/components/ui/button';

export default function Home() {
  return (
    <>
      <input />
      <Button variant='primary' size='sm'>
        primary
      </Button>
      <Button variant='destructive'>destructive</Button>
      <Button variant='outline'>outline</Button>
      <Button variant='secondary'>secondary</Button>
      <Button variant='ghost'>phost</Button>
      <Button variant='muted'>muted</Button>
      <Button variant='teritary'>teritary</Button>
    </>
  );
}

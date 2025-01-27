import { useMedia } from 'react-use';
import { Dialog, DialogContent, DialogTitle } from './ui/dialog';
import { Drawer, DrawerContent } from './ui/drawer';
import { VisuallyHidden } from 'radix-ui';
import { Description } from '@radix-ui/react-dialog';

interface ResponsiveModalProps {
  children: React.ReactNode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ResponsiveModal = ({
  // コンポーネントの中に他のコンポーネントをネストするときに使う。
  // createResponsiveModal -> ResponsiveModal -> Dialog -> DialogContent
  children,
  open,
  onOpenChange,
}: ResponsiveModalProps) => {
  const isDeskTop = useMedia('(min-width:1024px)', true);
  if (isDeskTop) {
    return (
      // このファイルの時点で、open={open}となりダイアログが開いている。
      // onOpenChange={onOpenChange}で{children}に入るcreate-workspace-modal.tsxダイアログの開閉状態を変更する。
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className='w-full sm:max-w-lg p-0 border-none overflow-y-auto hide-scroller max-h-[85vh]'>
          {/* childrenには<CreateWorkspaceForm />が入る。 */}
          {children}
        </DialogContent>
        <VisuallyHidden.Root>
          <DialogTitle>Title</DialogTitle>
          <Description>Description</Description>
        </VisuallyHidden.Root>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <div className='overflow-y-auto hide-scrollbar max-h-[85vh]'>
          {children}
        </div>
      </DrawerContent>
      <VisuallyHidden.Root>
        <DialogTitle>Title</DialogTitle>
        <Description>Description</Description>
      </VisuallyHidden.Root>
    </Drawer>
  );
};

'use client';

import { ResponsiveModal } from '@/components/responsive-modal';
import { useCreateWorkspaceModal } from '../hooks/use-create-workspace-modal';
import { CreateWorkspaceForm } from './create-workspace-form';

export const CreateWorkspaceModal = () => {
  // useCreateWorkspaceModal から isOpen, setIsOpen, close を取得
  // URLの作成に使われ、モーダルの開閉状態を管理する。isOpen が true の場合、モーダルが表示され、false の場合は非表示。
  const { isOpen, setIsOpen, close } = useCreateWorkspaceModal();

  return (
    // モーダルはデフォルトではisOpen = falseで閉じている。onOpenChange でモーダルの開閉状態を変更する。
    // ResponsiveModalでモーダルの表示を制御する。モーダルの中にはCreateWorkspaceFormが入る。
    // CreateWorkspaceModal ResponsiveModal CreateWorkspaceModal CreateWorkspaceForm の順番で推移する。
    <ResponsiveModal open={isOpen} onOpenChange={setIsOpen}>
      {/* create-workspace-modal.tsxの中でonCancelが実行されるとcloseになる */}
      <CreateWorkspaceForm onCancel={close} />
    </ResponsiveModal>
  );
};

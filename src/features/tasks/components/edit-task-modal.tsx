'use client';

import { ResponsiveModal } from '@/components/responsive-modal';
import { EditTaskFormWrapper } from './edit-task-form-wrapper';
import { useEditTaskModal } from '../hooks/use-edit-task-modal';

export const EditTaskModal = () => {
  const { taskId, close } = useEditTaskModal();

  return (
    // onOpenChangeはモーダルが開かれた時または閉じられた時に、setIsOpenに処理がいく。
    // taskIdがあればモーダルが開く。
    // !!は真偽値を得るための記号。値が真（truthy）であればtrueに、偽（falsy）であればfalseに変換。
    <ResponsiveModal open={!!taskId} onOpenChange={close}>
      {taskId && <EditTaskFormWrapper id={taskId} onCancel={close} />}
    </ResponsiveModal>
  );
};

'use client';

import { ResponsiveModal } from '@/components/responsive-modal';
import { useCreateFaceModal } from '../hooks/use-create-face-modal';
import { CreateFaceFormWrapper } from './create-face-form-wrapper';

export const CreateFacerModal = () => {
  const { isOpen, setIsOpen, close } = useCreateFaceModal();
  return (
    <ResponsiveModal open={isOpen} onOpenChange={setIsOpen}>
      <CreateFaceFormWrapper onCancel={close} />
    </ResponsiveModal>
  );
};

'use client';

import { ResponsiveModal } from '@/components/responsive-modal';
import { useCreateAvatarModal } from '../hooks/use-create-avatar-modal';
import { CreateAvatarFormWrapper } from './create-avatar-form-wrapper';

export const CreateAvatarModal = () => {
  const { isOpen, setIsOpen, close } = useCreateAvatarModal();
  return (
    <ResponsiveModal open={isOpen} onOpenChange={setIsOpen}>
      <CreateAvatarFormWrapper onCancel={close} />
    </ResponsiveModal>
  );
};

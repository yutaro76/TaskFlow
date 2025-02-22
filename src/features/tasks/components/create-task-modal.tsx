'use client';

import { ResponsiveModal } from '@/components/responsive-modal';
import { useCreateTaskModal } from '../hooks/use-create-task-modal';
import { CreateTaskFormWrapper } from './create-task-form-wrapper';
import { useEffect, useState } from 'react';

export const CreateTaskModal = () => {
  const { isOpen, setIsOpen, close } = useCreateTaskModal();
  const [parsedDueDate, setParsedDueDate] = useState<Date | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedDate = sessionStorage.getItem('defaultDueDate');
      if (storedDate) {
        setParsedDueDate(JSON.parse(storedDate));
      } else {
        setParsedDueDate(null);
      }
    }
  }, [isOpen]);

  return (
    <ResponsiveModal open={isOpen} onOpenChange={setIsOpen}>
      <CreateTaskFormWrapper onCancel={close} defaultDueDate={parsedDueDate} />
    </ResponsiveModal>
  );
};

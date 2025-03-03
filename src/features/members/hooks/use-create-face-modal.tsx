import { parseAsBoolean, useQueryState } from 'nuqs';

export const useCreateFaceModal = () => {
  const [isOpen, setIsOpen] = useQueryState(
    'create-avatar',
    parseAsBoolean.withDefault(false).withOptions({ clearOnDefault: true })
  );

  const open = () => {
    setIsOpen(true);
  };

  const close = () => {
    setIsOpen(false);
  };

  return {
    open,
    isOpen,
    setIsOpen,
    close,
  };
};

import { parseAsBoolean, useQueryState } from 'nuqs';

export const useCreateProjectModal = () => {
  const [isOpen, setIsOpen] = useQueryState(
    'create-project',
    // 'create-project'というパラメータの状態を管理している
    parseAsBoolean.withDefault(false).withOptions({ clearOnDefault: true })
  );

  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);

  return {
    isOpen,
    setIsOpen,
    open,
    close,
  };
};

import { useQueryState, parseAsBoolean } from 'nuqs';

export const useCreateWorkspaceModal = () => {
  const [isOpen, setIsOpen] = useQueryState(
    'create-workspace',
    // falseのとき、URLからcreate-workspaceパラメータを削除する。
    parseAsBoolean.withDefault(false).withOptions({ clearOnDefault: true })
  );

  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);

  return {
    isOpen,
    open,
    close,
    setIsOpen,
  };
};

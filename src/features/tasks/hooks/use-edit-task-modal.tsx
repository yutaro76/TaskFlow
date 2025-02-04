import { parseAsString, useQueryState } from 'nuqs';

export const useEditTaskModal = () => {
  const [taskId, setTaskId] = useQueryState(
    // 'edit-task'というクエリパラメータの状態を管理している。
    // クエリパラメータはURLの一部として使われる。
    'edit-task',
    parseAsString
  );

  const open = (id: string) => setTaskId(id);
  const close = () => setTaskId(null);

  return {
    taskId,
    open,
    close,
    setTaskId,
  };
};

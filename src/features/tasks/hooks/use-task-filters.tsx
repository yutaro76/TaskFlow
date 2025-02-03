import { parseAsString, parseAsStringEnum, useQueryStates } from 'nuqs';
import { TaskStatus } from '../types';

export const useTaskFilters = () => {
  // nuqsのuseQueryStatesを使って、URLの最後に&status=BACKLOGのようにクエリパラメータを追加する。
  return useQueryStates({
    projectId: parseAsString,
    // Enum(Enumeration(列挙))：複数の選択肢があるときにEnumを使う。
    status: parseAsStringEnum(Object.values(TaskStatus)),
    assigneeId: parseAsString,
    search: parseAsString,
    dueDate: parseAsString,
  });
};

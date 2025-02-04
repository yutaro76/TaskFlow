import { client } from '@/lib/rpc';
import { useQuery } from '@tanstack/react-query';
import { TaskStatus } from '../types';

interface UseGetTasksProps {
  workspaceId: string;
  projectId?: string | null;
  status?: TaskStatus | null;
  search?: string | null;
  assigneeId?: string | null;
  dueDate?: string | null;
}

export const useGetTasks = ({
  workspaceId,
  projectId,
  status,
  search,
  assigneeId,
  dueDate,
}: UseGetTasksProps) => {
  const query = useQuery({
    // queryKeyはクエリのキーを指定するためのプロパティ。
    // 特定のワークスペースに関連するプロジェクトを取得する。
    queryKey: [
      'tasks',
      workspaceId,
      projectId,
      status,
      search,
      assigneeId,
      dueDate,
    ],
    queryFn: async () => {
      const response = await client.api.tasks.$get({
        query: {
          workspaceId,
          projectId: projectId || undefined,
          status: status || undefined,
          search: search || undefined,
          assigneeId: assigneeId || undefined,
          dueDate: dueDate || undefined,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch tasks');
      }

      const { data } = await response.json();

      return data;
    },
  });
  return query;
};

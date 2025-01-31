import { client } from '@/lib/rpc';
import { useQuery } from '@tanstack/react-query';

interface UseGetProjectProps {
  workspaceId: string;
}

export const useGetProjects = ({ workspaceId }: UseGetProjectProps) => {
  const query = useQuery({
    // queryKeyはクエリのキーを指定するためのプロパティ。
    // 特定のワークスペースに関連するプロジェクトを取得する。
    queryKey: ['projects', workspaceId],
    queryFn: async () => {
      const response = await client.api.projects.$get({
        query: { workspaceId },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch projects');
      }

      const { data } = await response.json();

      return data;
    },
  });
  return query;
};

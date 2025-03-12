import { client } from '@/lib/rpc';
import { useQuery } from '@tanstack/react-query';

interface UseGetFaceIconProps {
  userIconId: string;
}

export const useGetFaceIcon = ({ userIconId }: UseGetFaceIconProps) => {
  const query = useQuery({
    // queryKeyはクエリのキーを指定するためのプロパティ。
    queryKey: ['userIconId', userIconId],
    queryFn: async () => {
      const response = await client.api.auth[':userIconId']['$get']({
        param: { userIconId },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch face icon');
      }

      const { data } = await response.json();

      return data;
    },
  });

  return query.data;
};

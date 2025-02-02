import { client } from '@/lib/rpc';
// import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useMutation } from '@tanstack/react-query';
import { InferResponseType } from 'hono';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

// InferResponseTypeはAPIのレスポンスの型を取得するための型。
type ResponseType = InferResponseType<(typeof client.api.auth.logout)['$post']>;

export const useLogout = () => {
  const router = useRouter();
  // useQueryClientは現在のユーザーのインスタンスを取得するためのフック。
  // const queryClient = useQueryClient();
  // useMutationはデータの変更（作成、更新、削除など）を行うために使用されるフック。
  const mutation = useMutation<ResponseType, Error>({
    mutationFn: async () => {
      const response = await client.api.auth.logout['$post']();
      if (!response.ok) {
        throw new Error('Failed to logout');
      }
      return await response.json();
    },
    onSuccess: () => {
      // queryClient.invalidateQueriesは指定されたクエリ（ここではcurrent）を無効にするためのメソッド。
      // useCurrent.tsxで'current'クエリキーが指定されているため、ここで無効にする。
      // クライアント側でログアウト処理
      toast.success('Logged out');
      router.refresh();
      // queryClient.invalidateQueries({ queryKey: ['current'] });
      // queryClient.invalidateQueries({ queryKey: ['workspaces'] });
    },
    onError: () => {
      toast.error('Failed to logout');
    },
  });
  return mutation;
};

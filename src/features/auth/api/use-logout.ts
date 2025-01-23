import { client } from '@/lib/rpc';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { InferResponseType } from 'hono';

// InferResponseTypeはAPIのレスポンスの型を取得するための型。
type ResponseType = InferResponseType<(typeof client.api.auth.logout)['$post']>;

export const useLogout = () => {
  // useQueryClientは現在のユーザーのインスタンスを取得するためのフック。
  const queryClient = useQueryClient();
  // useMutationはデータの変更（作成、更新、削除など）を行うために使用されるフック。
  const mutation = useMutation<ResponseType, Error>({
    mutationFn: async () => {
      const response = await client.api.auth.logout['$post']();
      return await response.json();
    },
    onSuccess: () => {
      // queryClient.invalidateQueriesは指定されたクエリ（ここではcurrent）を無効にするためのメソッド。
      // useCurrent.tsxで'current'クエリキーが指定されているため、ここで無効にする。
      // クライアント側でログアウト処理
      queryClient.invalidateQueries({ queryKey: ['current'] });
    },
  });
  return mutation;
};

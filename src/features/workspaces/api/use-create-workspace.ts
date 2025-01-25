import { client } from '@/lib/rpc';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { InferRequestType, InferResponseType } from 'hono';
import { toast } from 'sonner';

type ResponseType = InferResponseType<(typeof client.api.workspaces)['$post']>;
type RequestType = InferRequestType<(typeof client.api.workspaces)['$post']>;

export const useCreateWorkspace = () => {
  const queryClient = useQueryClient();
  // useMutation<ResponseType, Error, RequestType>は非同期操作を管理するための Reactフック。
  const mutation = useMutation<ResponseType, Error, RequestType>({
    // mutationFnはuseMutationと一緒に使われる。

    mutationFn: async ({ form }) => {
      // formデータを使用することで、画像ファイルなどのバイナリデータを含む複数のフィールドを一度に送信することができる。
      // application/json 形式ではバイナリデータを直接送信できない。
      // form にはワークスペースの名前、ID、画像が含まれる。
      const response = await client.api.workspaces['$post']({ form });
      if (!response.ok) {
        throw new Error('Failed to create workspace');
      }
      return await response.json();
    },
    onSuccess: () => {
      toast.success('Workspace created');
      // invalidatedQueriesは指定されたクエリ（ここではworkspaces）を無効にするためのメソッド。
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });
    },
    onError: () => {
      toast.error('Failed to create workspace');
    },
  });
  return mutation;
};

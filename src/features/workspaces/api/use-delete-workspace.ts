import { client } from '@/lib/rpc';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { InferRequestType, InferResponseType } from 'hono';
import { toast } from 'sonner';

type ResponseType = InferResponseType<
  (typeof client.api.workspaces)[':workspaceId']['$delete'],
  200
>;
type RequestType = InferRequestType<
  (typeof client.api.workspaces)[':workspaceId']['$delete']
>;

export const useDeleteWorkspace = () => {
  const queryClient = useQueryClient();
  // useMutation<ResponseType, Error, RequestType>は非同期操作を管理するための Reactフック。
  const mutation = useMutation<ResponseType, Error, RequestType>({
    // mutationFnはuseMutationと一緒に使われる。
    mutationFn: async ({ param }) => {
      // formデータを使用することで、画像ファイルなどのバイナリデータを含む複数のフィールドを一度に送信することができる。
      // application/json 形式ではバイナリデータを直接送信できない。
      // form にはワークスペースの名前、ID、画像が含まれる。
      const response = await client.api.workspaces[':workspaceId']['$delete']({
        param,
      });
      if (!response.ok) {
        throw new Error('Failed to delete workspace');
      }
      return await response.json();
    },
    // dataは上側のresponseで帰ってきた値が入る。route.tsのdeleteエンドポイントで、workspaceのIDが返ってくる。
    onSuccess: ({ data }) => {
      toast.success('Workspace deleted');
      // invalidatedQueriesは指定されたクエリ（ここではworkspaces）を無効にするためのメソッド。
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });
      queryClient.invalidateQueries({ queryKey: ['workspaces', data.$id] });
    },
    onError: () => {
      toast.error('Failed to delete workspace');
    },
  });
  return mutation;
};

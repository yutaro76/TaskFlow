import { client } from '@/lib/rpc';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { InferRequestType, InferResponseType } from 'hono';
import { toast } from 'sonner';

type ResponseType = InferResponseType<
  // ResponseTypeはエラーと正しいものを返す仕様になっており、今は正しいものだけ取得したいので、200を指定している。
  (typeof client.api.workspaces)[':workspaceId']['$patch'],
  200
>;
type RequestType = InferRequestType<
  (typeof client.api.workspaces)[':workspaceId']['$patch']
>;

export const useUpdateWorkspace = () => {
  const queryClient = useQueryClient();
  // useMutation<ResponseType, Error, RequestType>は非同期操作を管理するための Reactフック。
  const mutation = useMutation<ResponseType, Error, RequestType>({
    // mutationFnはuseMutationと一緒に使われる。

    mutationFn: async ({ form, param }) => {
      // formデータを使用することで、画像ファイルなどのバイナリデータを含む複数のフィールドを一度に送信することができる。
      // application/json 形式ではバイナリデータを直接送信できない。
      // form にはワークスペースの名前、ID、画像が含まれる。
      const response = await client.api.workspaces[':workspaceId']['$patch']({
        form,
        param,
      });
      if (!response.ok) {
        throw new Error('Failed to update workspace');
      }
      return await response.json();
    },
    // このdataはroutes.tsのworkspaceのエンドポイントのレスポンスデータを指す。
    // dataには上側のresponse.json()で取得したデータが入る。
    onSuccess: ({ data }) => {
      toast.success('Workspace updated');

      // invalidatedQueriesは指定されたクエリ（ここではworkspaces）のキャッシュ無効にするためのメソッド。
      // use-get-workspace.tsでクエリキーが再度付与される。
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });
      queryClient.invalidateQueries({ queryKey: ['workspace', data.$id] });
    },
    onError: () => {
      toast.error('Failed to update workspace');
    },
  });
  return mutation;
};

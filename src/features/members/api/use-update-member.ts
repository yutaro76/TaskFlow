import { client } from '@/lib/rpc';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { InferRequestType, InferResponseType } from 'hono';
import { toast } from 'sonner';

type ResponseType = InferResponseType<
  (typeof client.api.members)[':memberId']['$patch'],
  200
>;
type RequestType = InferRequestType<
  (typeof client.api.members)[':memberId']['$patch']
>;

export const useUpdateMember = () => {
  const queryClient = useQueryClient();
  // useMutation<ResponseType, Error, RequestType>は非同期操作を管理するための Reactフック。
  const mutation = useMutation<ResponseType, Error, RequestType>({
    // mutationFnはuseMutationと一緒に使われる。
    mutationFn: async ({ param, json }) => {
      // formデータを使用することで、画像ファイルなどのバイナリデータを含む複数のフィールドを一度に送信することができる。
      // application/json 形式ではバイナリデータを直接送信できない。
      // form にはワークスペースの名前、ID、画像が含まれる。
      const response = await client.api.members[':memberId']['$patch']({
        param,
        json,
      });
      if (!response.ok) {
        throw new Error('Failed to update member');
      }
      return await response.json();
    },
    // dataは上側のresponseで帰ってきた値が入る。route.tsのdeleteエンドポイントで、workspaceのIDが返ってくる。
    onSuccess: () => {
      toast.success('Member updated');
      // invalidatedQueriesは指定されたクエリ（ここではworkspaces）を無効にするためのメソッド。
      queryClient.invalidateQueries({ queryKey: ['members'] });
    },
    onError: () => {
      toast.error('Failed to update member');
    },
  });
  return mutation;
};

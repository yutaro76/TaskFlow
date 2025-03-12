import { client } from '@/lib/rpc';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { InferRequestType, InferResponseType } from 'hono';
import { toast } from 'sonner';

type ResponseType = InferResponseType<
  (typeof client.api.auth)['face']['$patch'],
  200
>;
type RequestType = InferRequestType<(typeof client.api.auth)['face']['$patch']>;
export const useUpdateFace = () => {
  const queryClient = useQueryClient();
  // useMutation<ResponseType, Error, RequestType>は非同期操作を管理するための Reactフック。
  const mutation = useMutation<ResponseType, Error, RequestType>({
    // mutationFnはuseMutationと一緒に使われる。
    mutationFn: async ({ form }) => {
      // formデータを使用することで、画像ファイルなどの
      // バイナリデータを含む複数のフィールドを一度に送信することができる。
      // application/json 形式ではバイナリデータを直接送信できない。
      // form にはワークスペースの名前、ID、画像が含まれる。
      const response = await client.api.auth['face']['$patch']({
        form,
      });
      if (!response.ok) {
        throw new Error('Failed to update icon');
      }
      return await response.json();
    },
    onSuccess: async () => {
      toast.success('Icon updated');
      queryClient.invalidateQueries({ queryKey: ['current'] });
    },
    onError: () => {
      toast.error('Failed to update icon');
    },
  });
  return mutation;
};

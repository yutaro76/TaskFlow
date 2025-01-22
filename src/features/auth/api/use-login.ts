import { client } from '@/lib/rpc';
import { useMutation } from '@tanstack/react-query';
import { InferRequestType, InferResponseType } from 'hono';

type ResponseType = InferResponseType<(typeof client.api.auth.login)['$post']>;
type RequestType = InferRequestType<(typeof client.api.auth.login)['$post']>;

export const useLogin = () => {
  // useMutation<ResponseType, Error, RequestType>は非同期操作を管理するための Reactフック。
  const mutation = useMutation<ResponseType, Error, RequestType>({
    // mutationFnはuseMutationと一緒に使われる。
    // jsonにはsign-in-cardから渡されるemailとpasswordが入る。
    // そのjsonがclient.api.auth.login['$post']に渡され、エンドポイントで値を取得したあと、responseに格納される。
    // clientはsrc/lib/rpc.tsで定義されているAPIの型を定めたもの。
    // apiはapp/api/[[...route]]/route.tsで定義され、ベースパスのapiフォルダを指す。
    // authはapp/api/[[...route]]/route.tsで定義され、@/features/auth/server/routeのauthと名付けられたAPIを使用する。
    // loginは@/features/auth/server/routeのauthで定義されたエンドポイントのloginを指す。
    // $postはエンドポイントのメソッド（postメソッド）を指す。
    mutationFn: async ({ json }) => {
      const response = await client.api.auth.login['$post']({ json });
      return await response.json();
    },
  });
  return mutation;
};

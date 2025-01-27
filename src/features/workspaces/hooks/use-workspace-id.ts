import { useParams } from 'next/navigation';

export const useWorkspaceId = () => {
  // 現在のURLパラメータを取得し、その中のworkspaceIdパラメータを文字列として返す。
  const params = useParams();
  return params.workspaceId as string;
};

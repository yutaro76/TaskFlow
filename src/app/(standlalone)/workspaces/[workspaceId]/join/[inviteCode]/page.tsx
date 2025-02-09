import { getCurrent } from '@/features/auth/queries';
import { redirect } from 'next/navigation';
import { WorkspaceIdJoinClient } from './client';

// paramsでパスの[]内の値を取得できる。
// このファイルではworkspaceIdとinviteCodeを取得しており、paramsにはそれらの値が入っている。
const WorkspaceIdJoinPage = async () => {
  const user = await getCurrent();
  if (!user) redirect('/sign-in');

  return <WorkspaceIdJoinClient />;
};

export default WorkspaceIdJoinPage;

import { getCurrent } from '@/features/auth/actions';
import { getWorkspace } from '@/features/workspaces/actions';
import { EditWorkspaceForm } from '@/features/workspaces/components/edit-workspace-form';
import { redirect } from 'next/navigation';

// [workspaceId]ページのコンポーネントを作成する。
// [workspaceId]の配下にあるので、workspaceIdを取得するできる。

interface WorkspaceIdSettingsPageProps {
  params: {
    workspaceId: string;
  };
}

const WorkspaceIdSettingsPage = async ({
  params,
}: WorkspaceIdSettingsPageProps) => {
  const user = await getCurrent();
  if (!user) {
    redirect('/sign-in');
  }

  // paramsはUrlのパラメーター[workspaceId]を取得し、それを利用してgetWorkspaceでワークスペースの情報を取得する。
  const initialValues = await getWorkspace({ workspaceId: params.workspaceId });

  if (!initialValues) {
    redirect(`/workspaces/${params.workspaceId}`);
  }

  return (
    <div className='w-full lg:max-w-xl'>
      <EditWorkspaceForm initialValues={initialValues} />;
    </div>
  );
};

export default WorkspaceIdSettingsPage;

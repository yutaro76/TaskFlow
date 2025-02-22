import { Card, CardContent } from '@/components/ui/card';
import { useGetMembers } from '@/features/members/api/use-get-members';
import { useGetProjects } from '@/features/projects/api/use-get-projects';
import { useWorkspaceId } from '@/features/workspaces/hooks/use-workspace-id';
import { Loader } from 'lucide-react';
import { CreateTaskForm } from './create-task-form';
import { AskCreateProjectForm } from '@/features/projects/components/ask-create-project-form';

interface CreateTaskFormWrapperProps {
  onCancel: () => void;
  defaultDueDate?: Date | null;
}

export const CreateTaskFormWrapper = ({
  onCancel,
  defaultDueDate,
}: CreateTaskFormWrapperProps) => {
  const workspaceId = useWorkspaceId();
  const { data: projects, isLoading: isLoadingProjects } = useGetProjects({
    workspaceId,
  });
  // ワークスーペース内のメンバーを取得
  const { data: members, isLoading: isLoadingMembers } = useGetMembers({
    workspaceId,
  });

  const projectOptions = projects?.documents.map((project) => ({
    id: project.$id,
    name: project.name,
    imageUrl: project.imageUrl,
  }));

  const memberOptions = members?.documents.map((member) => ({
    id: member.$id,
    name: member.name,
  }));

  const isLoading = isLoadingProjects || isLoadingMembers;

  if (isLoading) {
    return (
      // 要素の高さを714ピクセルに設定
      <Card className='w-full h-[714px] border-none shadow-none'>
        <CardContent className='flex items-center justify-center h-full'>
          <Loader className='size-5 animate-spin text-muted-foreground' />
        </CardContent>
      </Card>
    );
  }

  if (projects?.total === 0) {
    return <AskCreateProjectForm />;
  }

  return (
    <CreateTaskForm
      onCancel={onCancel}
      projectOptions={projectOptions ?? []}
      memberOptions={memberOptions ?? []}
      defaultDueDate={defaultDueDate}
    />
  );
};

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useConfirm } from '@/hooks/use-confirm';
import { ExternalLinkIcon, PencilIcon, TrashIcon } from 'lucide-react';
import { useDeleteTask } from '../api/use-delete-task';
import { useRouter } from 'next/navigation';
import { useWorkspaceId } from '@/features/workspaces/hooks/use-workspace-id';
import { useEditTaskModal } from '../hooks/use-edit-task-modal';

interface TaskActionProps {
  id: string;
  projectId: string;
  children: React.ReactNode;
}

export const TaskActions = ({ id, projectId, children }: TaskActionProps) => {
  const workspaceId = useWorkspaceId();
  const router = useRouter();

  const { open } = useEditTaskModal();

  const [ConfirmDialog, confirm] = useConfirm(
    'Delete Task',
    'This action cannot be undone.',
    'destructive'
  );

  const { mutate, isPending } = useDeleteTask();

  const onDelete = async () => {
    const ok = await confirm();
    if (!ok) {
      return;
    }
    // エンドポイントに値を渡す
    // onDelete関数を実行時に、idを渡す
    mutate({ param: { taskId: id } });
  };

  // このファイルの大元のcolumn.tsxからidやprojectIdを受け取り、それを使ってrouter.pushを実行する
  const onOpenTask = () => {
    router.push(`/workspaces/${workspaceId}/tasks/${id}`);
  };

  const onOpenProject = () => {
    router.push(`/workspaces/${workspaceId}/projects/${projectId}`);
  };

  return (
    <div className='flex justify-end' onClick={(e) => e.stopPropagation()}>
      <ConfirmDialog />
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
        <DropdownMenuContent align='end' className='w-48'>
          <DropdownMenuItem
            onClick={onOpenTask}
            className='font-medium p-[10px]'
          >
            <ExternalLinkIcon className='size-4 mr-2 stroke-2' />
            Task Details
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={onOpenProject}
            className='font-medium p-[10px]'
          >
            <ExternalLinkIcon className='size-4 mr-2 stroke-2' />
            Open Project
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => open(id)}
            className='font-medium p-[10px]'
          >
            <PencilIcon className='size-4 mr-2 stroke-2' />
            Edit Task
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={onDelete}
            disabled={isPending}
            className='text-amber-700 focus:text-amber-700 font-medium p-[10px]'
          >
            <TrashIcon className='size-4 mr-2 stroke-2' />
            Delete Task
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

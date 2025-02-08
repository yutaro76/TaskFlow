import { useGetProjects } from '@/features/projects/api/use-get-projects';
import { useWorkspaceId } from '@/features/workspaces/hooks/use-workspace-id';
import { useGetMembers } from '@/features/members/api/use-get-members';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FolderIcon, ListChecks, UserIcon } from 'lucide-react';
import { TaskStatus } from '../types';
import { useTaskFilters } from '../hooks/use-task-filters';
import { DatePicker } from '@/components/date-picker';

interface DataFiltersProps {
  hideProjectFilter?: boolean;
}

export const DataFilters = ({ hideProjectFilter }: DataFiltersProps) => {
  const workspaceId = useWorkspaceId();
  const { data: projects, isLoading: isLoadingProjects } = useGetProjects({
    workspaceId,
  });
  const { data: members, isLoading: isLoadingTasks } = useGetMembers({
    workspaceId,
  });

  const isLoading = isLoadingProjects || isLoadingTasks;

  const projectOptions = projects?.documents.map((project) => ({
    value: project.$id,
    label: project.name,
  }));

  const memberOptions = members?.documents.map((member) => ({
    value: member.$id,
    label: member.name,
  }));

  // {}の中が取りうる値で、setFiltersがその値を操作するもの
  // useTaskFilters()でURLにクエリパラメータを追加する。setFiltersでクエリパラメータを操作する。
  const [{ status, assigneeId, projectId, dueDate }, setFilters] =
    useTaskFilters();

  // valueをstatusに設定する関数
  // URLの最後に&status=BACKLOGのようにクエリパラメータを追加する。
  const onStatusChange = (value: string) => {
    if (value === 'all') {
      setFilters({ status: null });
    } else {
      setFilters({ status: value as TaskStatus });
    }
  };

  const onAssigneeChange = (value: string) => {
    if (value === 'all') {
      setFilters({ assigneeId: null });
    } else {
      setFilters({ assigneeId: value as string });
    }
  };

  const onProjectChange = (value: string) => {
    if (value === 'all') {
      setFilters({ projectId: null });
    } else {
      setFilters({ projectId: value as string });
    }
  };

  if (isLoading) return null;

  return (
    <div className='flex flex-col lg:flex-row gap-2'>
      <Select
        defaultValue={status ?? undefined}
        onValueChange={(value) => onStatusChange(value)}
      >
        <SelectTrigger className='w-full lg:w-auto h-8'>
          <div className='flex items-center pr-2'>
            <ListChecks className='size-4 mr-2' />
            <SelectValue placeholder='All statuses' />
          </div>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value='all'>All statues</SelectItem>
          <SelectSeparator />
          <SelectItem value={TaskStatus.BACKLOG}>Backlog</SelectItem>
          <SelectItem value={TaskStatus.TODO}>Todo</SelectItem>
          <SelectItem value={TaskStatus.IN_PROGRESS}>In Progress</SelectItem>
          <SelectItem value={TaskStatus.IN_REVIEW}>In Review</SelectItem>
          <SelectItem value={TaskStatus.DONE}>Done</SelectItem>
        </SelectContent>
      </Select>
      <Select
        defaultValue={assigneeId ?? undefined}
        onValueChange={(value) => onAssigneeChange(value)}
      >
        <SelectTrigger className='w-full lg:w-auto h-8'>
          <div className='flex items-center pr-2'>
            <UserIcon className='size-4 mr-2' />
            <SelectValue placeholder='All assignees' />
          </div>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value='all'>All assignees</SelectItem>
          <SelectSeparator />
          {memberOptions?.map((member) => (
            <SelectItem key={member.value} value={member.value}>
              {member.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {!hideProjectFilter && (
        <Select
          defaultValue={projectId ?? undefined}
          onValueChange={(value) => onProjectChange(value)}
        >
          <SelectTrigger className='w-full lg:w-auto h-8'>
            <div className='flex items-center pr-2'>
              <FolderIcon className='size-4 mr-2' />
              <SelectValue placeholder='All projects' />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>All projects</SelectItem>
            <SelectSeparator />
            {projectOptions?.map((project) => (
              <SelectItem key={project.value} value={project.value}>
                {project.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
      <DatePicker
        placeholder='Due Date'
        className='h-8 w-full lg:w-auto'
        value={dueDate ? new Date(dueDate) : undefined}
        onChange={(date) =>
          setFilters({ dueDate: date ? date.toISOString() : null })
        }
      />
    </div>
  );
};

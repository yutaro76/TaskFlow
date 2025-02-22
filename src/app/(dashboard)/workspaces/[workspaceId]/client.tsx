'use client';

import { Analytics } from '@/components/analytics';
import { DottedSeparator } from '@/components/dotted-separator';
import { PageError } from '@/components/page-error';
import { PageLoader } from '@/components/page-loader';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useGetMembers } from '@/features/members/api/use-get-members';
import { MemberAvatar } from '@/features/members/components/member-avatar';
import { Member } from '@/features/members/types';
import { useGetProjects } from '@/features/projects/api/use-get-projects';
import { ProjectAvatar } from '@/features/projects/components/project-avatar';
import { useCreateProjectModal } from '@/features/projects/hooks/use-create-project-modal';
import { Project } from '@/features/projects/types';
import { useGetTasks } from '@/features/tasks/api/use-get-tasks';
import { useCreateTaskModal } from '@/features/tasks/hooks/use-create-task-modal';
import { Task } from '@/features/tasks/types';
import { useGetWorkspaceAnalytics } from '@/features/workspaces/api/use-get-workspace-analytics';
import { useWorkspaceId } from '@/features/workspaces/hooks/use-workspace-id';
import { formatDistanceToNow } from 'date-fns';
import { CalendarIcon, PlusIcon, SettingsIcon } from 'lucide-react';
import Link from 'next/link';

export const WorkspaceIdClient = () => {
  const workspaceId = useWorkspaceId();
  const { data: analytics, isLoading: isLoadingAnalytics } =
    useGetWorkspaceAnalytics({
      workspaceId,
    });
  // ワークスペース内のタスクの全情報を取得する。
  const { data: tasks, isLoading: isLoadingTasks } = useGetTasks({
    workspaceId,
  });

  // ワークスペース内のプロジェクトの全情報を取得する。
  const { data: projects, isLoading: isLoadingProjects } = useGetProjects({
    workspaceId,
  });
  // ワークスペース内のメンバーの全情報を取得する。
  const { data: members, isLoading: isLoadingMembers } = useGetMembers({
    workspaceId,
  });

  const isLoading =
    isLoadingAnalytics ||
    isLoadingTasks ||
    isLoadingProjects ||
    isLoadingMembers;

  if (isLoading) {
    return <PageLoader />;
  }

  if (!analytics || !tasks || !projects || !members) {
    return <PageError message='Failed to fetch workspace data' />;
  }

  return (
    <div className='h-full flex flex-col space-y-4'>
      <Analytics data={analytics} />
      {/* xlの場合は2列のレイアウトでそれ以下は1列のレイアウト */}
      <div className='grid grid-cols-1 xl:grid-cols-2 gap-4'>
        <TaskList data={tasks.documents} total={tasks.total} />
        <ProjectList data={projects.documents} total={projects.total} />
        <MembersList data={members.documents} total={members.total} />
      </div>
    </div>
  );
};

interface TaskListProps {
  // []は配列型を意味する。具体的には、Task型の要素を持つ配列を意味する。
  // 例：{ id: '1', title: 'Task 1', completed: false }
  data: Task[];
  total: number;
}

export const TaskList = ({ data, total }: TaskListProps) => {
  const workspaceId = useWorkspaceId();
  const { open: createTask } = useCreateTaskModal();

  return (
    <div className='flex flex-col gap-y-4 col-span-1'>
      <div className='bg-muted rounded-lg p-4'>
        <div className='flex items-center justify-between'>
          <p className='text-lg font-semibold'>Tasks ({total})</p>
          <Button variant='muted' size='icon' onClick={() => createTask()}>
            <PlusIcon className='size-4 text-neutral-400' />
          </Button>
        </div>
        <DottedSeparator className='my-4' />
        <ul className='flex flex-col gap-y-4'>
          {data.map((task) => (
            <li key={task.$id}>
              <Link href={`/workspaces/${workspaceId}/tasks/${task.$id}`}>
                <Card className='shadow-none rounded-lg hover:opacity-75 transition'>
                  <CardContent className='p-4'>
                    <p className='text-lg font-medium truncate'>{task.name}</p>
                    {/* items-center 縦方向に中央揃え */}
                    <div className='flex items-center gap-x-2'>
                      <p>{task.project?.name}</p>
                      {/* 視覚的な区切りや装飾として使用される小さな丸い要素 */}
                      <div className='size-1 rounded-full bg-neutral-300' />
                      <div className='text-sm text-muted-foreground flex items-center'>
                        <CalendarIcon className='size-3 mr-1' />
                        <span className='truncate'>
                          {/* 指定された日付がどれくらい前か、またはどれくらい後かを人間が読みやすい形式で表示 */}
                          {formatDistanceToNow(new Date(task.dueDate))}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </li>
          ))}
          {/* 一つ上のli要素内にタスクがあれば、hidden。タスクがなければこのliにブロック要素が適用され表示される。 */}
          <li className='text-sm text-muted-foreground text-center hidden first-of-type:block'>
            No tasks found
          </li>
        </ul>
        <Button variant='muted' className='mt-4 w-full' asChild>
          <Link href={`/workspaces/${workspaceId}/tasks`}>Show all tasks</Link>
        </Button>
      </div>
    </div>
  );
};

interface ProjectListProps {
  data: Project[];
  total: number;
}

export const ProjectList = ({ data, total }: ProjectListProps) => {
  const workspaceId = useWorkspaceId();
  const { open: createProject } = useCreateProjectModal();

  return (
    <div className='flex flex-col gap-y-4 col-span-1'>
      <div className='bg-white border rounded-lg p-4'>
        <div className='flex items-center justify-between'>
          <p className='text-lg font-semibold'>Projects ({total})</p>
          <Button variant='secondary' size='icon' onClick={createProject}>
            <PlusIcon className='size-4 text-neutral-400' />
          </Button>
        </div>
        <DottedSeparator className='my-4' />
        <ul className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
          {data.map((project) => (
            <li key={project.$id}>
              <Link href={`/workspaces/${workspaceId}/projects/${project.$id}`}>
                <Card className='shadow-none rounded-lg hover:opacity-75'>
                  <CardContent className='p-4 flex items-center gap-x-2.5'>
                    <ProjectAvatar
                      className='size-12'
                      fallbackClassName='text-lg'
                      name={project.name}
                      image={project.imageUrl}
                    />
                    <p className='text-lg font-medium truncate'>
                      {project.name}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            </li>
          ))}
          {/* 一つ上のli要素内にタスクがあれば、hidden。タスクがなければこのliにブロック要素が適用され表示される。 */}
          <li className='text-sm text-muted-foreground text-center hidden first-of-type:block'>
            No projects found
          </li>
        </ul>
      </div>
    </div>
  );
};

interface MembersListProps {
  data: Member[];
  total: number;
}

export const MembersList = ({ data, total }: MembersListProps) => {
  const workspaceId = useWorkspaceId();

  return (
    <div className='flex flex-col gap-y-4 col-span-1'>
      <div className='bg-white rounded-lg p-4'>
        <div className='flex items-center justify-between'>
          <p className='text-lg font-semibold'>Members ({total})</p>
          <Button asChild variant='secondary' size='icon'>
            <Link href={`/workspaces/${workspaceId}/members`}>
              <SettingsIcon className='size-4 text-neutral-400' />
            </Link>
          </Button>
        </div>
        <DottedSeparator className='my-4' />
        <ul className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
          {data.map((member) => (
            <li key={member.$id}>
              <Card className='shadow-none rounded-lg overflow-hidden'>
                <CardContent className='p-3 flex flex-col items-center gap-x-2'>
                  <MemberAvatar className='size-12' name={member.name} />
                  <div className='flex flex-col items-center overflow-hidden'>
                    <p className='text-lg font-medium line-clamp-1'>
                      {member.name}
                    </p>
                    <p className='text-sm font-medium line-clamp-1'>
                      {member.email}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </li>
          ))}
          <li className='text-sm text-muted-foreground text-center hidden first-of-type:block'>
            No members found
          </li>
        </ul>
      </div>
    </div>
  );
};

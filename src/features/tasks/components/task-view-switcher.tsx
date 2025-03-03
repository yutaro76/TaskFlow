'use client';

import { DottedSeparator } from '@/components/dotted-separator';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader, PlusIcon } from 'lucide-react';
import { useCreateTaskModal } from '../hooks/use-create-task-modal';
import { useWorkspaceId } from '@/features/workspaces/hooks/use-workspace-id';
import { useGetTasks } from '../api/use-get-tasks';
import { useQueryState } from 'nuqs';
import { DataFilters } from './data-filters';
import { useTaskFilters } from '../hooks/use-task-filters';
import { DataTable } from './data-table';
import { columns } from './columns';
import { DataKanban } from './data-kanban';
import { useCallback, useEffect } from 'react';
import { TaskStatus } from '../types';
import { useBulkUpdateTasks } from '../api/use-bulk-update-tasks';
import { DataCalendar } from './data-calendar';
import { useProjectId } from '@/features/projects/hooks/use-project-id';
import { usePathname, useSearchParams } from 'next/navigation';

interface TaskViewSwitcherProps {
  hideProjectFilter?: boolean;
}

export const TaskViewSwitcher = ({
  hideProjectFilter,
}: TaskViewSwitcherProps) => {
  // pathnameで/workspaces/67b41e4e000ca3be3b72/tasksを取得。
  const pathname = usePathname();
  const pathnameParts = pathname.split('/');

  // tasks, settings, members, projectsのいずれかを取得。
  const pathnameKey = pathnameParts[3];
  const workspaceId = useWorkspaceId();
  const paramProjectId = useProjectId();

  // URLの最後に?task-view=tableのようにタブごとに違うURLを作成する。
  const [view, setView] = useQueryState('task-view', {
    defaultValue:
      // クライアントサイドでのみlocalStorageが使えるので、typeof window !== 'undefined'で条件分岐している。
      typeof window !== 'undefined'
        ? (() => {
            if (pathnameKey === 'tasks') {
              return localStorage.getItem('MyTaskView') || 'table';
            } else if (
              pathnameKey === 'projects' &&
              localStorage.getItem(paramProjectId)
            ) {
              return localStorage.getItem(paramProjectId) || 'table';
            } else {
              return 'table';
            }
          })()
        : 'table',
  });
  // useGetTasksでstatusなどが使えるように型を定義している。
  const [{ status, assigneeId, projectId, dueDate }] = useTaskFilters();
  const { open } = useCreateTaskModal();
  const { mutate: bulkUpdate } = useBulkUpdateTasks();

  const { data: tasks, isLoading: isLoadingTasks } = useGetTasks({
    workspaceId,
    status,
    assigneeId,
    projectId: paramProjectId || projectId,
    dueDate,
  });

  // useCallbackで中の関数を使い回すことができる。
  // タスクが動かされるたびに呼び出される。
  const onKanbanChange = useCallback(
    (tasks: { $id: string; status: TaskStatus; position: number }[]) => {
      bulkUpdate({ json: { tasks } });
    },
    [bulkUpdate]
  );

  const setDefaultProjectId = () => {
    sessionStorage.setItem('defaultProjectId', paramProjectId);
  };

  // taskViewでtask-viewの後のkanbanなどを取得。ないときはnull。
  const searchParams = useSearchParams();

  const taskView = searchParams.get('task-view') || 'table';

  // ページが読み込まれた際に、tasksまたはprojectsであれば、そのタブの値をlocalStorageに保存する。
  useEffect(() => {
    if (!searchParams.has('task-view')) return;
    if (pathnameKey === 'tasks') {
      localStorage.setItem('MyTaskView', taskView);
    } else if (pathnameKey === 'projects') {
      localStorage.setItem(paramProjectId, taskView);
    }
    // eslint-disable-next-line
  }, [pathnameKey, searchParams, taskView]);

  // ページが読み込まれる際に、保存していたタブのページを表示する。
  useEffect(() => {
    if (pathnameKey === 'tasks') {
      const savedTaskTab = localStorage.getItem('MyTaskView') || 'table';
      setView(savedTaskTab);
    } else if (pathnameKey === 'projects') {
      const savedProjectTaskTab =
        localStorage.getItem(paramProjectId) || 'table';
      setView(savedProjectTaskTab);
    }
    // eslint-disable-next-line
  }, [pathnameKey, setView]);

  // タブが切り替わるたびにその値をlocalStorageに保存する。
  useEffect(() => {
    if (pathnameKey === 'tasks' && view) {
      localStorage.setItem('MyTaskView', view);
      localStorage.setItem('WorkspaceId', workspaceId);
    } else if (pathnameKey === 'projects' && view) {
      localStorage.setItem(paramProjectId, view);
    }
    // eslint-disable-next-line
  }, [view]);

  return (
    // flex-1 中の要素が均等に横幅を占有する。中の長さは文字の長さによって変わる。
    <Tabs
      value={view}
      onValueChange={setView}
      className='flex-1 w-full border rounded-lg'
    >
      {/* overflow-autoは要素が横に長くなった際にスクロールバーを自動的に表示 */}
      <div className='h-full flex flex-col overflow-auto p-4'>
        <div className='flex flex-col gap-y-2 lg:flex-row justify-between items-center'>
          <TabsList className='w-full lg:w-auto'>
            {/* valueでタブの出し分けをするので、valueを間違えないように注意 */}
            <TabsTrigger className='h-8 w-full lg:w-auto' value='table'>
              Table
            </TabsTrigger>
            <TabsTrigger className='h-8 w-full lg:w-auto' value='kanban'>
              Kanban
            </TabsTrigger>
            <TabsTrigger className='h-8 w-full lg:w-auto' value='calendar'>
              Calendar
            </TabsTrigger>
          </TabsList>
          <Button
            size='sm'
            className='w-full lg:w-auto'
            onClick={() => {
              setDefaultProjectId();
              open();
            }}
          >
            <PlusIcon className='size-4 mr-2' />
            New
          </Button>
        </div>
        <DottedSeparator className='my-4' />
        <DataFilters hideProjectFilter={hideProjectFilter} />
        <DottedSeparator className='my-4' />
        {isLoadingTasks ? (
          <div className='w-full border rounded-lg h-[200px] flex flex-col items-center justify-center'>
            <Loader className='size-5 animate-spin text-mutated-foreground' />
          </div>
        ) : (
          <>
            <TabsContent value='table' className='mt-0'>
              <DataTable columns={columns} data={tasks?.documents ?? []} />
            </TabsContent>
            <TabsContent value='kanban' className='mt-0'>
              {/* tasksオブジェクトが存在し、その中にdocumentsプロパティが存在する場合はその値を使用し、そうでない場合は空の配列を使用する。 */}
              {/* ?.を使うと、値が無くてもエラーが出なくなる。 */}
              <DataKanban
                onChange={onKanbanChange}
                data={tasks?.documents ?? []}
              />
            </TabsContent>
            <TabsContent value='calendar' className='mt-0 h-full pb-4'>
              <DataCalendar data={tasks?.documents ?? []} />
            </TabsContent>
          </>
        )}
      </div>
    </Tabs>
  );
};

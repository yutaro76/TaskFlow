'use client';

import { DottedSeparator } from '@/components/dotted-separator';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader, PlusIcon } from 'lucide-react';
import { useCreateTaskModal } from '../hooks/use-create-task-modal';
import { useWorkspaceId } from '@/features/workspaces/hooks/use-workspace-id';
import { useGetTasks } from '../api/use-get-task';
import { useQueryState } from 'nuqs';
import { DataFilters } from './data-filters';
import { useTaskFilters } from '../hooks/use-task-filters';

export const TaskViewSwitcher = () => {
  // URLの最後に?task-view=tableのようにタブごとに違うURLを作成する。
  const [view, setView] = useQueryState('task-view', {
    defaultValue: 'table',
  });
  // useGetTasksでstatusなどが使えるように型を定義している。
  const [{ status, assigneeId, projectId, dueDate }] = useTaskFilters();
  const workspaceId = useWorkspaceId();
  const { open } = useCreateTaskModal();
  const { data: tasks, isLoading: isLoadingTasks } = useGetTasks({
    workspaceId,
    status,
    assigneeId,
    projectId,
    dueDate,
  });

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
          <Button size='sm' className='w-full lg:w-auto' onClick={open}>
            <PlusIcon className='size-4 mr-2' />
            New
          </Button>
        </div>
        <DottedSeparator className='my-4' />
        <DataFilters />
        <DottedSeparator className='my-4' />
        {isLoadingTasks ? (
          <div className='w-full border rounded-lg h-[200px] flex flex-col items-center justify-center'>
            <Loader className='size-5 animate-spin text-mutated-foreground' />
          </div>
        ) : (
          <>
            <TabsContent value='table' className='mt-0'>
              {JSON.stringify(tasks)}
            </TabsContent>
            <TabsContent value='kanban' className='mt-0'>
              {JSON.stringify(tasks)}
            </TabsContent>
            <TabsContent value='calendar' className='mt-0'>
              {JSON.stringify(tasks)}
            </TabsContent>
          </>
        )}
      </div>
    </Tabs>
  );
};

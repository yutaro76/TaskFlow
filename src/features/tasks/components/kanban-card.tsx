import { MoreHorizontal } from 'lucide-react';
import { Task } from '../types';
import { TaskActions } from './task-actions';
import { DottedSeparator } from '@/components/dotted-separator';
import { MemberAvatar } from '@/features/members/components/member-avatar';
import { TaskDate } from './task-date';
import { ProjectAvatar } from '@/features/projects/components/project-avatar';
import { Tooltip } from 'react-tooltip';

interface KanbanCardProps {
  task: Task;
}

export const KanbanCard = ({ task }: KanbanCardProps) => {
  const taskNameLength = task.name.length > 15;
  return (
    <div
      className='bg-white p-2.5 mb-1.5 rounded shadow-sm space-y-3'
      data-tooltip-id={taskNameLength ? 'kanban-task' : undefined}
      data-tooltip-place='top'
      data-tooltip-content={taskNameLength ? task.name : undefined}
    >
      {taskNameLength && <Tooltip id='kanban-task' />}
      <div className='flex items-start justify-between gap-x-2'>
        {/* テキストを1行に制限し、それ以上のテキストは省略記号（...）で表示されるようにする */}
        <p className='text-sm line-clamp-1  overflow-hidden break-all'>
          {task.name}
        </p>
        <TaskActions id={task.$id} projectId={task.projectId}>
          {/* stroke-1: SVG要素のストローク幅を 1 に設定。shrink-0: Flexboxコンテナ内で要素が縮小しないように設定。 */}
          <MoreHorizontal className='size-[18px] stroke-1 shrink-0 text-neutral-700 hover:opacity-75 transition' />
        </TaskActions>
      </div>
      <DottedSeparator />
      <div className='flex items-center gap-x-1.5'>
        <MemberAvatar
          // apiでtaskのassigneeを取得しているので、ここではassigneeのnameを表示する。
          // route.tsのgetメソッド。
          name={task.assignee.name}
          fallbackClassName='text-[10px]'
        />
        <div className='size-1 rounded-full bg-neutral-300' />
        <TaskDate value={task.dueDate} className='text-xs' />
      </div>
      <div className='flex items-center gap-x-1.5'>
        <ProjectAvatar
          name={task.project.name}
          image={task.project.imageUrl}
          fallbackClassName='text-[10px]'
        />
        <span className='text-xs font-medium'>{task.project.name}</span>
      </div>
    </div>
  );
};

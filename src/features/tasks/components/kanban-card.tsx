import { MoreHorizontal } from 'lucide-react';
import { Task } from '../types';
import { TaskActions } from './task-actions';
import { DottedSeparator } from '@/components/dotted-separator';
import { MemberAvatar } from '@/features/members/components/member-avatar';
import { TaskDate } from './task-date';
import { ProjectAvatar } from '@/features/projects/components/project-avatar';
import { Tooltip } from 'react-tooltip';
import { useEffect, useRef, useState } from 'react';

interface KanbanCardProps {
  task: Task;
}

export const KanbanCard = ({ task }: KanbanCardProps) => {
  const textRef = useRef<HTMLDivElement>(null);
  const [isOverflowing, setIsOverflowing] = useState(false);

  useEffect(() => {
    const checkOverflow = () => {
      if (textRef.current) {
        setIsOverflowing(
          // scrollWidth: 要素の全ての横の長さ。はみ出ている部分も含む。
          // clientWIdth: 要素の見えている部分の横の長さ。
          // trueは文字がはみ出ていることになる。
          textRef.current.scrollWidth > textRef.current.clientWidth
        );
      }
    };
    checkOverflow();
  }, []);

  return (
    <div
      className='bg-white p-2.5 mb-1.5 rounded shadow-sm space-y-3'
      data-tooltip-id={isOverflowing ? 'kanban-task' : undefined}
      data-tooltip-place='top'
      data-tooltip-content={isOverflowing ? task.name : undefined}
    >
      {isOverflowing && <Tooltip id='kanban-task' />}
      <div className='flex items-start justify-between gap-x-2'>
        {/* テキストを1行に制限し、それ以上のテキストは省略記号（...）で表示されるようにする */}
        <p
          ref={textRef}
          className='text-sm whitespace-nowrap overflow-hidden text-ellipsis'
        >
          {task.name}
        </p>
        <TaskActions id={task.$id} projectId={task.projectId}>
          {/* stroke-1: SVG要素のストローク幅を 1 に設定。shrink-0: Flexboxコンテナ内で要素が縮小しないように設定。 */}
          <MoreHorizontal className='size-[18px] stroke-1 shrink-0 text-neutral-700 hover:opacity-75 transition cursor-default' />
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

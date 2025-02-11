import { Project } from '@/features/projects/types';
import { TaskStatus } from '../types';
import { cn } from '@/lib/utils';
import { MemberAvatar } from '@/features/members/components/member-avatar';
import { ProjectAvatar } from '@/features/projects/components/project-avatar';
import { useWorkspaceId } from '@/features/workspaces/hooks/use-workspace-id';
import { useRouter } from 'next/navigation';
import { Member } from '@/features/members/types';

interface EventCardProps {
  title: string;
  assignee: Member;
  project: Project;
  status: TaskStatus;
  id: string;
}

// stringはステータスの部分のため
const statusColorMap: Record<TaskStatus, string> = {
  [TaskStatus.BACKLOG]: 'border-l-pink-500',
  [TaskStatus.TODO]: 'border-l-red-500',
  [TaskStatus.IN_PROGRESS]: 'border-l-yellow-500',
  [TaskStatus.IN_REVIEW]: 'border-l-blue-500',
  [TaskStatus.DONE]: 'border-l-emerald-500',
};

export const EventCard = ({
  title,
  assignee,
  project,
  status,
  id,
}: EventCardProps) => {
  const workspaceId = useWorkspaceId();
  const router = useRouter();

  const onClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // イベントが親要素に伝播するのを防ぐ。
    e.stopPropagation();
    router.push(`/workspaces/${workspaceId}/tasks/${id}`);
  };

  return (
    <div className='px-2'>
      {/* 
      text-primary：テキストの色の変更
      border：ボーダーを追加
      border-l-4：左側のボーダーを4px
      cursor-pointer：クリック可能な要素を示す
      transition：スタイルの変更をスムーズにする
       */}
      <div
        onClick={onClick}
        className={cn(
          'p-1.5 text-xs bg-white text-primary border rounded-md border-l-4 flex flex-col gap-y-1.5 cursor-pointer hover:opacity-75 transition',
          // statusは親のファイルから渡され、そのstatusに対応する色を取得
          statusColorMap[status]
        )}
      >
        <p className='line-clamp-1'>{title}</p>
        <div className='flex items-center gap-x-1'>
          <MemberAvatar name={assignee?.name} />
          <div className='size-1 rounded-full bg-neutral-300' />
          <ProjectAvatar name={project?.name} image={project?.imageUrl} />
        </div>
      </div>
    </div>
  );
};

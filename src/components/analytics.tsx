import { ProjectAnalyticsResponseType } from '@/features/projects/api/use-get-project-analytics';
import { ScrollArea, ScrollBar } from './ui/scroll-area';
import { AnalyticsCard } from './ui/analytics-card';
import { DottedSeparator } from './dotted-separator';

export const Analytics = ({ data }: ProjectAnalyticsResponseType) => {
  if (!data) {
    return null;
  }
  return (
    // whitespace-nowrap: テキストが改行されずに一行で表示されるようにする。
    // shrink-0: Flexbox コンテナ内で要素が縮小されないようにする。
    <ScrollArea className='border rounded-lg w-full whitespace-nowrap shrink-0'>
      <div className='w-full flex flex-row'>
        {/* flex-1はFlexbox コンテナ内の要素が利用可能なスペースを均等に占有するように設定 */}
        <div className='flex items-center flex-1'>
          <AnalyticsCard
            title='Total tasks'
            value={data.taskCount}
            variant={data.taskDifference > 0 ? 'up' : 'down'}
            increaseValue={data.taskDifference}
          />
          <DottedSeparator direction='vertical' />
        </div>
        <div className='flex items-center flex-1'>
          <AnalyticsCard
            title='Assigned tasks'
            value={data.assignedTaskCount}
            variant={data.assignedTaskDifference > 0 ? 'up' : 'down'}
            increaseValue={data.assignedTaskDifference}
          />
          <DottedSeparator direction='vertical' />
        </div>
        <div className='flex items-center flex-1'>
          <AnalyticsCard
            title='Completed tasks'
            value={data.completedTaskCount}
            variant={data.completedTaskDifference > 0 ? 'up' : 'down'}
            increaseValue={data.completedTaskDifference}
          />
          <DottedSeparator direction='vertical' />
        </div>
        <div className='flex items-center flex-1'>
          <AnalyticsCard
            title='Overdue tasks'
            value={data.overdueTaskCount}
            variant={data.overdueTaskDifference > 0 ? 'up' : 'down'}
            increaseValue={data.overdueTaskDifference}
          />
          <DottedSeparator direction='vertical' />
        </div>
        <div className='flex items-center flex-1'>
          <AnalyticsCard
            title='Incomplete tasks'
            value={data.incompleteTaskCount}
            variant={data.incompleteTaskDifference > 0 ? 'up' : 'down'}
            increaseValue={data.incompleteTaskDifference}
          />
        </div>
      </div>
      <ScrollBar orientation='horizontal' />
    </ScrollArea>
  );
};

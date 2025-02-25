import { useState } from 'react';
import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import { Task } from '../types';
import {
  format,
  getDay,
  parse,
  startOfWeek,
  addMonths,
  subMonths,
} from 'date-fns';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { enUS } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './data-calendar.css';
import { Button } from '@/components/ui/button';
import { EventCard } from './event-card';
import { useCreateTaskModal } from '../hooks/use-create-task-modal';
import { useProjectId } from '@/features/projects/hooks/use-project-id';

const locales = {
  'en-US': enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

interface DataCalendarProps {
  data: Task[];
}

interface CustomToolbarProps {
  date: Date;
  onNavigate: (action: 'PREV' | 'NEXT' | 'TODAY') => void;
}

export const DataCalendar = ({ data }: DataCalendarProps) => {
  const [value, setValue] = useState(
    // dataには日付の情報が入っており、もしデータがあればその情報の中のdueDateを取得する。
    // もし日付が無ければ今日の日付を取得する。
    data.length > 0 ? new Date(data[0].dueDate) : new Date()
  );

  const events = data.map((task) => ({
    // イベントを1日だけ設定する意味でstartとendに同じ日付を設定している。
    start: new Date(task.dueDate),
    end: new Date(task.dueDate),
    title: task.name,
    project: task.project,
    assignee: task.assignee,
    status: task.status,
    id: task.$id,
  }));

  const { open } = useCreateTaskModal();
  const projectId = useProjectId();
  sessionStorage.setItem('delayedTaskLog', 'true');

  // ワンクリックに変更のためダブルクリックの処理はコメントアウト
  // let lastClickTime = 0;
  // const DOUBLE_CLICK_THRESHOLD = 300; // 300ms以内の2回クリックで実行
  // 一回目のクリックでhandleClickを実行し、nowに現在の時間を取得する。
  // 二回目のクリックでnowとlastClickTimeを比較し、条件を満たせばタブルクリックとみなされる
  const handleClick = (date: Date) => {
    if (sessionStorage.getItem('delayedTaskLog') === 'true') {
      open();
    }
    sessionStorage.setItem('defaultDueDate', JSON.stringify(date));
    sessionStorage.setItem('defaultProjectId', projectId);
  };

  const handleNavigate = (action: 'PREV' | 'NEXT' | 'TODAY') => {
    if (action === 'PREV') {
      // 一ヶ月前の日付を取得
      setValue(subMonths(value, 1));
    } else if (action === 'NEXT') {
      setValue(addMonths(value, 1));
    } else {
      setValue(new Date());
    }
  };

  const CustomToolbar = ({ date, onNavigate }: CustomToolbarProps) => {
    return (
      <div className='flex mb-4 gap-x-2 items-center w-full lg:auto justify-center lg:justify-start'>
        <Button
          onClick={() => onNavigate('PREV')}
          variant='secondary'
          size='icon'
          className='flex items-center'
        >
          <ChevronLeftIcon className='size-4' />
        </Button>
        {/* border-inputはボーダーカラーを変更 */}
        <div className='flex items-center border border-input rounded-md px-3 py-2 h-8 justify-center w-full lg:w-auto'>
          <CalendarIcon className='size-4 mr-2' />
          <p className='text-sm'>{format(date, 'MMMM yyyy')}</p>
        </div>
        <Button
          onClick={() => onNavigate('NEXT')}
          variant='secondary'
          size='icon'
          className='flex items-center'
        >
          <ChevronRightIcon className='size-4' />
        </Button>
      </div>
    );
  };

  return (
    <Calendar
      localizer={localizer}
      date={value}
      events={events}
      views={['month']}
      defaultView='month'
      toolbar
      showAllEvents
      className='h-full cursor-pointer'
      selectable
      // 月名や日づけの部分を指すプロパティ
      onNavigate={handleClick}
      // startはbig-calendarの予約語で、クリックした部分の最初の日をさす。
      // 一つのタスクが複数にまたがるようなアプリでは最初の日を取得する。
      // onSelectSlotはプロパティで、カレンダーの空白部分をクリックした時に実行される。
      onSelectSlot={({ start }) => handleClick(start)}
      // 現在の日付から一年後の日付まで選択できるようにする。
      // 年 new Date().getFullYear() + 1：現在の年から1年後の年を取得
      // 日 new Date().setFullYear(new Date().getFullYear() + 1))：今日から1年後の日付を取得
      // 日の単位変換 一番左のnew DateはsetFullYearをミリ秒から日付に変換するために必要
      max={new Date(new Date().setFullYear(new Date().getFullYear() + 1))}
      formats={{
        weekdayFormat: (date, culture, localizer) =>
          // EEEは曜日の省略形（例：月、火、水）を表示する。
          // cultureは言語設定を取得する。
          localizer?.format(date, 'EEE', culture) ?? '',
      }}
      components={{
        eventWrapper: ({ event }) => (
          <EventCard
            id={event.id}
            title={event.title}
            assignee={event.assignee}
            project={event.project}
            status={event.status}
          />
        ),
        toolbar: () => (
          <CustomToolbar date={value} onNavigate={handleNavigate} />
        ),
      }}
    />
  );
};

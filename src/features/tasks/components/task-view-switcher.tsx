import { DottedSeparator } from '@/components/dotted-separator';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PlusIcon } from 'lucide-react';

export const TaskViewSwitcher = () => {
  return (
    // flex-1 中の要素が均等に横幅を占有する。中の長さは文字の長さによって変わる。
    <Tabs className='flex-1 w-full border rounded-lg'>
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
          <Button size='sm' className='w-full lg:w-auto'>
            <PlusIcon className='size-4 mr-2' />
            New
          </Button>
        </div>
        <DottedSeparator className='my-4' />
        Data Filters
        <DottedSeparator className='my-4' />
        <>
          <TabsContent value='table' className='mt-0'>
            Data Table
          </TabsContent>
          <TabsContent value='kanban' className='mt-0'>
            Data Kanban
          </TabsContent>
          <TabsContent value='calendar' className='mt-0'>
            Data Calendar
          </TabsContent>
        </>
      </div>
    </Tabs>
  );
};

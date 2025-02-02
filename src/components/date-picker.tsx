'use client';

import * as React from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface DatePickerProps {
  value: Date | undefined;
  onChange: (date: Date) => void;
  className?: string;
  placeholder?: string;
}

export const DatePicker = React.forwardRef<HTMLButtonElement, DatePickerProps>(
  ({ value, onChange, className, placeholder = 'Select date' }, ref) => {
    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button
            ref={ref}
            variant='outline'
            size='lg'
            className={cn(
              'w-full justify-start text-left font-normal px-3',
              !value && 'text-muted-foreground',
              // 別のファイルでclassNameを追加できるようにする。
              className
            )}
          >
            <CalendarIcon className='mr-2 h-4 w-4' />
            {value ? format(value, 'PPP') : <span>{placeholder}</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className='w-auto p-0'>
          <Calendar
            mode='single'
            selected={value}
            onSelect={(date) => onChange(date as Date)}
            // このプロパティを外すことでカレンダーが表示されるようになった。
            // initialFocus
          />
        </PopoverContent>
      </Popover>
    );
  }
);

DatePicker.displayName = 'DatePicker';

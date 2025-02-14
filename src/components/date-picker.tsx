'use client';

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
import React, { useState } from 'react';

interface DatePickerProps {
  value: Date | undefined;
  onChange: (date: Date) => void;
  className?: string;
  placeholder?: string;
}

export const DatePicker = React.forwardRef<HTMLButtonElement, DatePickerProps>(
  ({ value, onChange, className, placeholder = 'Select date' }, ref) => {
    // trueにすると、リロードが終わった瞬間からカレンダーが表示されている。
    const [isOpen, setIsOpen] = useState(false);

    const handleSelect = (date: Date) => {
      onChange(date);
      setIsOpen((prev) => !prev);
    };

    return (
      // openはカレンダーが開いているか閉じているか。
      // onOpenChangeは日付が選択されたら実行され、setIsOpenに処理がいき、isOpenの状態を変更し、カレンダーの開閉を切り替える。
      <Popover open={isOpen} onOpenChange={setIsOpen}>
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
            onSelect={(date) => handleSelect(date as Date)}
            // このプロパティを外すことでカレンダーが表示されるようになった。
            // initialFocus
          />
        </PopoverContent>
      </Popover>
    );
  }
);

DatePicker.displayName = 'DatePicker';

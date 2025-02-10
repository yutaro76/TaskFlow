import { FaCaretDown, FaCaretUp } from 'react-icons/fa';
import { Card, CardDescription, CardHeader, CardTitle } from './card';
import { cn } from '@/lib/utils';

interface AnalyticsCardProps {
  title: string;
  value: number;
  variant: 'up' | 'down';
  increaseValue: number;
}

export const AnalyticsCard = ({
  title,
  value,
  variant,
  increaseValue,
}: AnalyticsCardProps) => {
  const iconColor = variant === 'up' ? 'text-emerald-500' : 'text-red-500';
  const increaseValueColor =
    variant === 'up' ? 'text-emerald-500' : 'text-red-500';
  const Icon = variant === 'up' ? FaCaretUp : FaCaretDown;

  return (
    <Card className='shadow-none border-none w-full'>
      <CardHeader>
        <div className='flex items-center gap-x-2.5'>
          {/* overflow-hiddenは要素の内容がそのコンテナの境界を超えた場合に、超えた部分を隠すために使用 */}
          <CardDescription className='flex items-center gap-x-2 font-medium overflow-hidden'>
            {/* truncate テキストがコンテナの幅を超えた場合に省略記号（...）を表示 */}
            {/* text-base テキストのサイズを基本サイズに設定 */}
            <span className='truncate text-base'>{title}</span>
          </CardDescription>
          <div className='flex items-center gap-x-1'>
            <Icon className={cn(iconColor, 'size-4')} />
            <span
              className={cn(
                increaseValueColor,
                'truncate text-base font-medium'
              )}
            >
              {increaseValue}
            </span>
          </div>
        </div>
        <CardTitle className='3xl font-semibold'>{value}</CardTitle>
      </CardHeader>
    </Card>
  );
};

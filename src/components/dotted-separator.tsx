import { cn } from '@/lib/utils';

interface DottedSeparatorProps {
  className?: string;
  color?: string;
  height?: string;
  dotSize?: string;
  gapSize?: string;
  direction?: 'horizontal' | 'vertical';
}

export const DottedSeparator = ({
  // className プロパティを使用することで、コンポーネントを使用する際に追加のクラス（ここではcss）を適用することができる
  className,
  color = '#d4d4d8',
  height = '2px',
  dotSize = '2px',
  gapSize = '6px',
  direction = 'horizontal',
}: DottedSeparatorProps) => {
  // コンポーネントが横方向か縦方向かを区別する
  const isHorizontal = direction === 'horizontal';

  return (
    <div
      className={cn(
        isHorizontal
          ? 'w-full flex items-center'
          : 'h-full flex flex-col items-center',
        // classNameを追加することで、別のコンポーネントでdottedseparatorを使用する際に、追加のクラスを適用することができるようになる
        className
      )}
    >
      <div
        // flex-growは横いっぱいに広げ、flex-grow-0は横幅を固定する
        className={isHorizontal ? 'flex-grow' : 'flex-grow-0'}
        style={{
          width: isHorizontal ? '100%' : height,
          height: isHorizontal ? height : '100%',
          // 円形のグラデーションを作成する
          backgroundImage: `radial-gradient(circle, ${color} 25%, transparent 25%)`,
          // バックグラウンドのサイズを決める
          // dotSizeなどが文字列で渡されるため、数値に変換するためにparseIntを使用する
          backgroundSize: isHorizontal
            ? `${parseInt(dotSize) + parseInt(gapSize)}px ${height}` // 横 縦
            : `${height} ${parseInt(dotSize) + parseInt(gapSize)}px`,
          backgroundRepeat: isHorizontal ? 'repeat-x' : 'repeat-y',
          // 縦と横を中央に揃える
          backgroundPosition: 'center',
        }}
      />
    </div>
  );
};

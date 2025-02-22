import { parseAsBoolean, useQueryState } from 'nuqs';
import { useEffect } from 'react';

// このファイルの中では何も実行されない。他のファイルからこのファイル内の関数が実行される。
export const useCreateTaskModal = () => {
  // useQueryStateはnuqsの関数で、URLのクエリパラメータを取得する。
  const [isOpen, setIsOpen] = useQueryState(
    // クエリのキー。URLの最後にcreate-task=trueのように設定する。
    'create-task',
    // デフォルトはfalseでクエリが設定されていない。
    // isOpenがtrueになるとクエリが設定される。
    // isOpenがfalseになると.withOptions({ clearOnDefault: true })でクエリが削除される。
    parseAsBoolean.withDefault(false).withOptions({ clearOnDefault: true })
  );

  // カレンダーのような呼び出す際にopen関数を使う。
  // setIsOpenがtrueになると、isOpenがtrueになり、クエリの設定されモーダルがopen={isOpen}により開く。
  const open = () => {
    setIsOpen(true);
  };

  const close = () => {
    setIsOpen(false);
    sessionStorage.removeItem('defaultDueDate');
  };

  // isOpenがfalseになったらsessionStorageをクリア
  useEffect(() => {
    if (!isOpen) {
      sessionStorage.removeItem('defaultDueDate');
    }
  }, [isOpen]);

  return {
    open,
    isOpen,
    setIsOpen,
    close,
  };
};

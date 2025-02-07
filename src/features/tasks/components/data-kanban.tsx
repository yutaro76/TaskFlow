import React, { useCallback, useEffect, useState } from 'react';
import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult,
} from '@hello-pangea/dnd';

import { Task, TaskStatus } from '../types';
import { KanbanColumnHeader } from './kanban-column-header';
import { KanbanCard } from './kanban-card';

const boards: TaskStatus[] = [
  TaskStatus.BACKLOG,
  TaskStatus.TODO,
  TaskStatus.IN_PROGRESS,
  TaskStatus.IN_REVIEW,
  TaskStatus.DONE,
];

type TasksState = {
  [key in TaskStatus]: Task[];
};

interface DataKanbanProps {
  data: Task[];
  onChange: (
    tasks: { $id: string; status: TaskStatus; position: number }[]
  ) => void;
}

export const DataKanban = ({ data, onChange }: DataKanbanProps) => {
  const [tasks, setTasks] = useState<TasksState>(() => {
    const initialTasks: TasksState = {
      [TaskStatus.BACKLOG]: [],
      [TaskStatus.TODO]: [],
      [TaskStatus.IN_PROGRESS]: [],
      [TaskStatus.IN_REVIEW]: [],
      [TaskStatus.DONE]: [],
    };

    data.forEach((task) => {
      // statusによってtasksを分ける。
      initialTasks[task.status].push(task);
    });

    Object.keys(initialTasks).forEach((status) => {
      initialTasks[status as TaskStatus].sort(
        // positionの値によって小さい順（昇順）に並べる。
        // (a, b) => b.position - a.positionで大きい順（降順）に並べる。
        (a, b) => a.position - b.position
      );
    });

    return initialTasks;
  });

  // レンダリングされた後に実行される関数
  // 変更後の新しいタスクに書き換えられる
  useEffect(() => {
    const newTasks: TasksState = {
      [TaskStatus.BACKLOG]: [],
      [TaskStatus.TODO]: [],
      [TaskStatus.IN_PROGRESS]: [],
      [TaskStatus.IN_REVIEW]: [],
      [TaskStatus.DONE]: [],
    };

    data.forEach((task) => {
      newTasks[task.status].push(task);
    });

    Object.keys(newTasks).forEach((status) => {
      newTasks[status as TaskStatus].sort((a, b) => a.position - b.position);
    });

    setTasks(newTasks);
  }, [data]);

  // ドラッグ&ドロップ操作が終了したときに呼び出される関数
  const onDragEnd = useCallback(
    (result: DropResult) => {
      if (!result.destination) {
        return;
      }

      const { source, destination } = result;
      // 開始位置のステータス
      const sourceStatus = source.droppableId as TaskStatus;
      // 終了位置のステータス
      const destStatus = destination.droppableId as TaskStatus;

      let updatesPayload: {
        $id: string;
        status: TaskStatus;
        position: number;
      }[] = [];

      // タスクの状態を更新
      // ドラッグ＆ドロップ操作の結果に基づいて、タスクを元のカラムから削除し、新しいカラムに追加
      setTasks((prevTasks) => {
        // prevTasksのコピーを作成して変数に格納
        const newTasks = { ...prevTasks };
        // sourceColumnには移動前のあるステータスのタスク一覧が入る
        const sourceColumn = [...newTasks[sourceStatus]];
        // 配列から要素を削除し、その削除された要素を配列として返す
        // 元のステータスの配列から削除され、別のステータスに移動されるタスクの情報が入る
        const [movedTask] = sourceColumn.splice(source.index, 1);

        if (!movedTask) {
          console.log('No task found at the source index');
          // 正しくタスクが移動されない場合は元のタスクを返して元に戻す
          return prevTasks;
        }

        const updatedMovedTask =
          sourceStatus !== destStatus
            ? // 別のステータスに移動した場合は移動先のステータスを入れる
              { ...movedTask, status: destStatus }
            : // 同じステータスに移動した場合は同じステータスを入れる
              movedTask;

        // 移動先ではなく移動元の後処理
        // sourceColumn.splice(source.index, 1);で一つタスクが減ったため、その状態にする。
        newTasks[sourceStatus] = sourceColumn;

        // 移動先のステータスを取得
        const destColumn = [...newTasks[destStatus]];
        // タスクを移動したその位置に移動したタスクを追加
        destColumn.splice(destination.index, 0, updatedMovedTask);
        // 移動先のステータスを更新済みのステータスで更新
        newTasks[destStatus] = destColumn;

        // タスクの更新情報を格納するための配列を初期化
        // この配列は、後でバックエンドに送信するためのタスクの更新情報を収集するために使用される
        updatesPayload = [];

        updatesPayload.push({
          $id: updatedMovedTask.$id,
          status: destStatus,
          // positionは、タスクの順序を管理するための値
          // 1,000,000は超えないようにする
          // route.tsで1000刻みで新しいタスクを追加したので、ここでも1000刻みで追加する
          position: Math.min((destination.index + 1) * 1000, 1_000_000),
        });

        // 横に動かして縦にも動かす場合
        // 移動先のステータスのタスクをループして取り出す
        newTasks[destStatus].forEach((task, index) => {
          // updatedMovedTaskの$idとそれぞれのtaskが異なる場合にのみ、ブロック内のコードを実行。
          // 移動したタスク以外のタスクに対して処理を行う。
          if (task && task.$id !== updatedMovedTask.$id) {
            // 新しいタスクの位置を決める。
            const newPosition = Math.min((index + 1) * 1000, 1_000_000);
            // 現在のタスクの位置 (task.position) が新しい位置 (newPosition) と異なる場合にのみ、ブロック内のコードを実行
            if (task.position !== newPosition) {
              // ドラッグ＆ドロップ操作の結果、位置が変更されたすべてのタスクの情報がupdatesPayloadに追加される
              updatesPayload.push({
                $id: task.$id,
                status: destStatus,
                position: newPosition,
              });
            }
          }
        });

        // 横にそのまま動かした結果、他のタスクのindexが変わる場合
        // 移動してステータスが変わった場合
        if (sourceStatus !== destStatus) {
          newTasks[sourceStatus].forEach((task, index) => {
            if (task) {
              const newPosition = Math.min((index + 1) * 1000, 1_000_000);
              if (task.position !== newPosition) {
                updatesPayload.push({
                  $id: task.$id,
                  status: sourceStatus,
                  position: newPosition,
                });
              }
            }
          });
        }

        return newTasks;
      });

      onChange(updatesPayload);
    },
    [onChange]
  );

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className='flex overflow-x-auto'>
        {boards.map((board) => {
          return (
            <div
              key={board}
              className='flex-1 mx-2 bg-muted p-1.5 rounded-md min-w-[200px]'
            >
              <KanbanColumnHeader
                board={board}
                taskCount={tasks[board].length}
              />
              {/* ドラッグ&ドロップする範囲を決める */}
              <Droppable droppableId={board}>
                {/* providedにドラッグ&ドロップに必要な情報が入っている */}
                {(provided) => (
                  <div
                    // このdivをドラッグ&ドロップできるようにする。
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className='min-h-[200px] py-1.5'
                  >
                    {/* 各タスクをboard（ステータス）ごとに展開する */}
                    {tasks[board].map((task, index) => (
                      // ドラッグ&ドロップする要素を決める
                      <Draggable
                        key={task.$id}
                        draggableId={task.$id}
                        index={index}
                      >
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                          >
                            <KanbanCard task={task} />
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {/* ドラッグ＆ドロップ操作中に要素のスペースを確保するために使用される。 */}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          );
        })}
      </div>
    </DragDropContext>
  );
};

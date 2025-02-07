import { sessionMiddleware } from '@/lib/session-middleware';
import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { createTaskSchema } from '../schemas';
import { getMember } from '@/features/members/utils';
import {
  DATABASE_ID,
  MEMBERS_ID,
  PROJECTS_ID,
  TASKS_ID,
} from '../../../../config';
import { ID, Query } from 'node-appwrite';
import { z } from 'zod';
import { Task, TaskStatus } from '../types';
import { createAdminClient } from '@/lib/appwrite';
import { Project } from '@/features/projects/types';

const app = new Hono()
  .delete('/:taskId', sessionMiddleware, async (c) => {
    const user = c.get('user');
    const databases = c.get('databases');
    const { taskId } = c.req.param();

    const task = await databases.getDocument<Task>(
      DATABASE_ID,
      TASKS_ID,
      taskId
    );

    const member = await getMember({
      // getMember関数は定義元でdatabasesを使用するとされているため、DATABASE_IDでは代用できない。
      databases,
      workspaceId: task.workspaceId,
      userId: user.$id,
    });

    if (!member) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    await databases.deleteDocument(DATABASE_ID, TASKS_ID, taskId);

    return c.json({ data: { $id: task.$id } });
  })
  .get(
    '/',
    sessionMiddleware,
    zValidator(
      'query',
      z.object({
        workspaceId: z.string(),
        // nullishはnullまたはundefinedを許容する。
        projectId: z.string().nullish(),
        assigneeId: z.string().nullish(),
        status: z.nativeEnum(TaskStatus).nullish(),
        search: z.string().nullish(),
        dueDate: z.string().nullish(),
      })
    ),

    async (c) => {
      //　ユーザー情報を取得、作成、更新、削除するためのメソッドが含まれているが、具体的な情報が含まれているわけではない。
      const { users } = await createAdminClient();
      const databases = c.get('databases');
      const user = c.get('user');

      const { workspaceId, projectId, status, search, assigneeId, dueDate } =
        c.req.valid('query');

      const member = await getMember({
        databases,
        workspaceId,
        userId: user.$id,
      });

      if (!member) {
        return c.json({ error: 'Unauthorized' }, 401);
      }

      const query = [
        Query.equal('workspaceId', workspaceId),
        Query.orderDesc('$createdAt'),
      ];

      // リクエストにprojectIdが含まれている場合、そのprojectIdをクエリに追加
      if (projectId) {
        console.log('projectId', projectId);
        query.push(Query.equal('projectId', projectId));
      }

      if (status) {
        console.log('status', status);
        query.push(Query.equal('status', status));
      }

      if (search) {
        console.log('search', search);
        query.push(Query.equal('search', search));
      }

      if (assigneeId) {
        console.log('assigneeId', assigneeId);
        query.push(Query.equal('assigneeId', assigneeId));
      }

      if (dueDate) {
        console.log('dueDate', dueDate);
        query.push(Query.equal('dueDate', dueDate));
      }

      const tasks = await databases.listDocuments<Task>(
        DATABASE_ID,
        TASKS_ID,
        query
      );

      const projectIds = tasks.documents.map((tasks) => tasks.projectId);

      const assigneeIds = tasks.documents.map((tasks) => tasks.assigneeId);

      const projects = await databases.listDocuments<Project>(
        DATABASE_ID,
        PROJECTS_ID,
        // 変数projectIdsに含まれるプロジェクトのIDが、DBのプロジェクトIDと一致するものがあるかを検索
        // ここでは検索する方法を作成するだけで、実際の検索は下記のmapの中で行われる。
        projectIds.length > 0 ? [Query.contains('$id', projectIds)] : []
      );

      // タスクをアサインした人（assignees）をここではmembersとしているので混乱しないようにする。
      const members = await databases.listDocuments(
        DATABASE_ID,
        MEMBERS_ID,
        assigneeIds.length > 0 ? [Query.contains('$id', assigneeIds)] : []
      );

      // タスクをアサインした人のnameとemailを取得している。
      // この中で[Query.contains('$id', assigneeIds)]も実行され、assigneeIdsに含まれるユーザーの情報を取得している。
      const assignees = await Promise.all(
        members.documents.map(async (member) => {
          const user = await users.get(member.userId);
          // returnされる時点では、assigneesにはアサインした人それぞれのid, name, emailがそれぞれ格納される。
          return {
            ...member,
            name: user.name,
            email: user.email,
          };
        })
      );

      // 各タスクにprojectとassigneeの詳細な情報を追加。
      const populatedTasks = tasks.documents.map((task) => {
        const project = projects.documents.find(
          (project) => project.$id === task.projectId
        );
        const assignee = assignees.find(
          (assignee) => assignee.$id === task.assigneeId
        );

        return {
          ...task,
          project,
          assignee,
        };
      });

      return c.json({
        data: {
          // 各タスクにpopulatedTasksを追加してreturnする。
          ...tasks,
          documents: populatedTasks,
        },
      });
    }
  )
  .post(
    '/',
    sessionMiddleware,
    zValidator('json', createTaskSchema),
    async (c) => {
      const user = c.get('user');
      const databases = c.get('databases');
      const { name, status, workspaceId, projectId, dueDate, assigneeId } =
        c.req.valid('json');

      const member = await getMember({
        databases,
        workspaceId,
        userId: user.$id,
      });

      // もし自分自身がこのワークスペースにいなければタスクは作成できないようにする。
      if (!member) {
        return c.json({ error: 'Unauthorized' }, 401);
      }

      const highestPositionTask = await databases.listDocuments(
        DATABASE_ID,
        TASKS_ID,
        [
          Query.equal('workspaceId', workspaceId),
          Query.equal('status', status),
          // positionの値が小さい順に並べられる
          Query.orderAsc('position'),
          // 一件だけ表示
          Query.limit(1),
        ]
      );

      const newPosition =
        highestPositionTask.documents.length > 0
          ? highestPositionTask.documents[0].position + 1000
          : 1000;

      const task = await databases.createDocument(
        DATABASE_ID,
        TASKS_ID,
        ID.unique(),
        {
          name,
          status,
          workspaceId,
          projectId,
          dueDate,
          assigneeId,
          position: newPosition,
        }
      );

      return c.json({ data: task });
    }
  )
  .patch(
    '/:taskId',
    sessionMiddleware,
    zValidator('json', createTaskSchema.partial()),
    async (c) => {
      const user = c.get('user');
      const databases = c.get('databases');
      const { name, status, description, projectId, dueDate, assigneeId } =
        c.req.valid('json');
      const { taskId } = c.req.param();

      const existingTask = await databases.getDocument<Task>(
        DATABASE_ID,
        TASKS_ID,
        taskId
      );

      const member = await getMember({
        databases,
        workspaceId: existingTask.workspaceId,
        userId: user.$id,
      });

      // もし自分自身がこのワークスペースにいなければタスクは作成できないようにする。
      if (!member) {
        return c.json({ error: 'Unauthorized' }, 401);
      }

      const task = await databases.updateDocument<Task>(
        DATABASE_ID,
        TASKS_ID,
        taskId,
        {
          name,
          status,
          projectId,
          dueDate,
          assigneeId,
          description,
        }
      );

      return c.json({ data: task });
    }
  )
  .get('/:taskId', sessionMiddleware, async (c) => {
    const currentUser = c.get('user');
    const databases = c.get('databases');
    // userの情報を取得するためのインスタンス。
    // このusersにusersの情報が格納されるわけではない。AppwriteのUsersクラスのインスタンスが入る。
    const { users } = await createAdminClient();
    const { taskId } = c.req.param();

    const task = await databases.getDocument<Task>(
      DATABASE_ID,
      TASKS_ID,
      taskId
    );

    const currentMember = await getMember({
      databases,
      workspaceId: task.workspaceId,
      userId: currentUser.$id,
    });

    if (!currentMember) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const project = await databases.getDocument<Project>(
      DATABASE_ID,
      PROJECTS_ID,
      task.projectId
    );

    // taskのassigneeの情報が部分的に入る。
    const member = await databases.getDocument(
      DATABASE_ID,
      MEMBERS_ID,
      task.assigneeId
    );

    // userたち（そのワークスペースにいる人）からassigneeのidを使ってassigneeの情報をさらに取得する。
    const user = await users.get(member.userId);

    // assigneeの情報が入ったmemberを展開して、nameとemailを追加する。
    const assignee = {
      ...member,
      name: user.name,
      email: user.email,
    };

    return c.json({ data: { ...task, project, assignee } });
  })
  // タスクをかんばんで動かして複数のタスクの情報（ステータスや位置）をupdateするためのエンドポイント。
  .post(
    '/bulk-update',
    sessionMiddleware,
    zValidator(
      'json',
      z.object({
        tasks: z.array(
          z.object({
            $id: z.string(),
            status: z.nativeEnum(TaskStatus),
            position: z.number().int().positive().min(1000).max(1_000_000),
          })
        ),
      })
    ),
    async (c) => {
      const databases = c.get('databases');
      const user = c.get('user');
      const { tasks } = c.req.valid('json');

      // updateされようとしているtaskの情報をテーブルから取得する。
      const tasksToUpdate = await databases.listDocuments<Task>(
        DATABASE_ID,
        TASKS_ID,
        [
          Query.contains(
            '$id',
            tasks.map((task) => task.$id)
          ),
        ]
      );

      // workspaceを超えてタスクがupdateされようとしている場合、エラーを返す。
      const workspaceIds = new Set(
        tasksToUpdate.documents.map((task) => task.workspaceId)
      );
      if (workspaceIds.size !== 1) {
        return c.json(
          { error: 'Tasks must belong to the same workspace' },
          400
        );
      }

      // workspaceIdsというSetオブジェクトから最初の値を取得
      const workspaceId = workspaceIds.values().next().value;

      if (!workspaceId) {
        return c.json({ error: 'Invalid workspace' }, 400);
      }

      // userがそのworkspaceにいるかどうかを確認する。
      const member = await getMember({
        databases,
        workspaceId,
        userId: user.$id,
      });

      if (!member) {
        return c.json({ error: 'Unauthorized' }, 401);
      }

      const updatedTasks = await Promise.all(
        tasks.map(async (task) => {
          const { $id, status, position } = task;
          // statusとpositionをupdateする。
          return databases.updateDocument<Task>(DATABASE_ID, TASKS_ID, $id, {
            status,
            position,
          });
        })
      );

      return c.json({ data: updatedTasks });
    }
  );

export default app;

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
import { TaskStatus } from '../types';
import { createAdminClient } from '@/lib/appwrite';
import { Project } from '@/features/projects/types';

const app = new Hono()
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

      const tasks = await databases.listDocuments(DATABASE_ID, TASKS_ID, query);

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
  );

export default app;

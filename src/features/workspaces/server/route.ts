import { sessionMiddleware } from '@/lib/session-middleware';
import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { createWorkspaceSchema, updateWorkspaceSchema } from '../schema';
import {
  DATABASE_ID,
  IMAGES_BUCKET_ID,
  MEMBERS_ID,
  WORKSPACES_ID,
  TASKS_ID,
} from '../../../../config';
import { ID, Query } from 'node-appwrite';
import { MemberRole } from '@/features/members/types';
import { generateInviteCode } from '@/lib/utils';
import { getMember } from '@/features/members/utils';
import { z } from 'zod';
import { Workspace } from '../types';
import { endOfMonth, startOfMonth, subMonths } from 'date-fns';
import { TaskStatus } from '@/features/tasks/types';

const app = new Hono()
  .get('/', sessionMiddleware, async (c) => {
    const user = c.get('user');
    const databases = c.get('databases');

    // MEMBERSのコレクションの中で、現在ログインしているユーザーのIDが登録されているものをメンバーとして全て取得
    // 'userId'はMembersコレクションの中のフィールド名
    // user.$idはログインしているユーザーのID
    const members = await databases.listDocuments(DATABASE_ID, MEMBERS_ID, [
      Query.equal('userId', user.$id),
    ]);

    if (members.total === 0) {
      // HTTP レスポンスとして JSON データを返すためのもの。
      // 具体的には、空のドキュメントリストと合計数 0 を含むオブジェクトを返す。
      return c.json({ data: { documents: [], total: 0 } });
    }

    const workspaceIds = members.documents.map((member) => member.workspaceId);

    const workspaces = await databases.listDocuments(
      DATABASE_ID,
      WORKSPACES_ID,
      [
        // Membersコレクションの中で、現在ログインしているユーザーが登録されているワークスペースに紐づくmemberID（$id）を取得する。
        Query.contains('$id', workspaceIds),
        Query.orderDesc('$createdAt'),
      ]
    );

    return c.json({ data: workspaces });
  })
  .post(
    '/',
    zValidator('form', createWorkspaceSchema),
    sessionMiddleware,
    async (c) => {
      // sessionMiddleWareでセットされたdatabase, user, storage, workspaceとimage情報を取得
      const databases = c.get('databases');
      const user = c.get('user');
      const storage = c.get('storage');
      const { name, image } = c.req.valid('form');

      let uploadedImageUrl: string | undefined;

      if (image instanceof File) {
        // createFileはAppwriteのStorageクラスから提供されるメソッド
        const file = await storage.createFile(
          IMAGES_BUCKET_ID,
          ID.unique(),
          image
        );

        // getFilePreviewはAppwriteのStorageクラスから提供されるメソッド
        // arrayBufferには画像のバイナリデータが入る。バイナリデータとは、画像や音声、動画などのデータを表すためのデータ形式。
        const arrayBuffer = await storage.getFilePreview(
          IMAGES_BUCKET_ID,
          // file.$id はアップロードされた画像のID
          file.$id
        );

        // Bufferはバイナリデータを扱うためのNode.js の標準ライブラリで提供されるグローバルオブジェクト
        uploadedImageUrl = `data:image/png;base64,${Buffer.from(
          arrayBuffer
        ).toString('base64')}`;
      }

      const workspace = await databases.createDocument(
        // どのデータベースにデータを追加するかを指定
        DATABASE_ID,
        // どのコレクションにデータを追加するかを指定
        WORKSPACES_ID,
        // 新しいワークスペース用のIDをランダムに生成
        ID.unique(),
        {
          // 上側のnameと同じ。新しいワークスペースの名前。
          name,
          // appwriteの中ではidではなく、$idとして扱われる。
          userId: user.$id,
          imageUrl: uploadedImageUrl,
          inviteCode: generateInviteCode(10),
        }
      );

      // MEMBERS_IDメンバーのIDではなく、メンバーを格納するappwriteのコレクションのID
      // createDocumentメソッドでDBとやりとりしている。
      // このメソッドは、appwriteのMembersコレクションに新しいメンバーを追加するために使用される。
      // ID.unique()は新しく作成されるメンバーのIDを生成するために使用される。
      // membersコレクション
      // - memberID（＊memberIDとuserIDは異なる）
      // -- userID
      // -- workspaceID
      // -- role
      // 純粋な会員登録を経て作られたメンバーとワークスペースに紐づくメンバーは別で管理される。
      // 純粋な会員登録を経て作られたメンバー：appwriteではAuthとして保存される。
      // ワークスペースに紐づくメンバー：DBのMembersコレクションにワークスペースのIDと一緒に保存される。
      await databases.createDocument(DATABASE_ID, MEMBERS_ID, ID.unique(), {
        // $idは上側で作られたworkspaceのID
        workspaceId: workspace.$id,
        // $idはconst user = c.get('user');で取得したユーザーのID
        userId: user.$id,
        // ワークスペースを作成したユーザーは自動的に管理者になる
        role: MemberRole.ADMIN,
      });

      return c.json({ data: workspace });
    }
  )
  // ワークスペースの名前と画像を更新するためのエンドポイント
  .patch(
    '/:workspaceId',
    sessionMiddleware,
    zValidator('form', updateWorkspaceSchema),
    // Honoでcが使えるようになる。
    async (c) => {
      const databases = c.get('databases');
      // Appwrite のストレージサービスを取得するためのコード
      const storage = c.get('storage');
      const user = c.get('user');

      const { workspaceId } = c.req.param();
      const { name, image } = c.req.valid('form');

      // 現在表示されているワークスペースにログインしているメンバーの情報を取得する。
      const member = await getMember({
        databases,
        workspaceId,
        userId: user.$id,
      });

      if (!member || member.role != MemberRole.ADMIN) {
        return c.json({ error: 'Unauthorized' }, 401);
      }

      let uploadedImageUrl: string | undefined;

      if (image instanceof File) {
        // createFileはAppwriteのStorageクラスから提供されるメソッド
        const file = await storage.createFile(
          IMAGES_BUCKET_ID,
          ID.unique(),
          image
        );

        // getFilePreviewはAppwriteのStorageクラスから提供されるメソッド
        // arrayBufferには画像のバイナリデータが入る。バイナリデータとは、画像や音声、動画などのデータを表すためのデータ形式。
        const arrayBuffer = await storage.getFilePreview(
          IMAGES_BUCKET_ID,
          // file.$id はアップロードされた画像のID
          file.$id
        );

        // Bufferはバイナリデータを扱うためのNode.js の標準ライブラリで提供されるグローバルオブジェクト
        uploadedImageUrl = `data:image/png;base64,${Buffer.from(
          arrayBuffer
        ).toString('base64')}`;
      } else {
        uploadedImageUrl = image;
      }

      const workspace = await databases.updateDocument(
        DATABASE_ID,
        WORKSPACES_ID,
        workspaceId,
        {
          name,
          imageUrl: uploadedImageUrl,
        }
      );
      return c.json({ data: workspace });
    }
  )
  .delete('/:workspaceId', sessionMiddleware, async (c) => {
    const databases = c.get('databases');
    const user = c.get('user');

    const { workspaceId } = c.req.param();

    // getMember関数を使って、現在ログインしているユーザーの情報を取得
    const member = await getMember({
      databases,
      workspaceId,
      userId: user.$id,
    });

    if (!member || member.role != MemberRole.ADMIN) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    await databases.deleteDocument(DATABASE_ID, WORKSPACES_ID, workspaceId);

    return c.json({ data: { $id: workspaceId } });
  })
  .post('/:workspaceId/reset-invite-code', sessionMiddleware, async (c) => {
    const databases = c.get('databases');
    const user = c.get('user');

    const { workspaceId } = c.req.param();

    // getMember関数を使って、現在ログインしているユーザーの情報を取得
    const member = await getMember({
      databases,
      workspaceId,
      userId: user.$id,
    });

    if (!member || member.role != MemberRole.ADMIN) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const workspace = await databases.updateDocument(
      DATABASE_ID,
      WORKSPACES_ID,
      workspaceId,
      { inviteCode: generateInviteCode(10) }
    );

    return c.json({ data: workspace });
  })
  .post(
    '/:workspaceId/join',
    // すでにログイン済みの人のみ他のワークスペースに招待されることができる。
    // このシステムにアカウントを持っていないメールアドレスは、招待されてワークスペースに入ることができない。
    sessionMiddleware,
    // リクエストボディがJSON 形式であり、codeプロパティが文字列であることを検証
    // codeはリクエストで渡される招待コード
    zValidator('json', z.object({ code: z.string() })),
    async (c) => {
      const { workspaceId } = c.req.param();
      const { code } = c.req.valid('json');
      const databases = c.get('databases');
      const user = c.get('user');

      const member = await getMember({
        databases,
        workspaceId,
        userId: user.$id,
      });

      // もしすでにワークスペースに参加している場合は、エラーを返す
      if (member) {
        return c.json({ error: 'Already a member' }, 400);
      }

      const workspace = await databases.getDocument<Workspace>(
        DATABASE_ID,
        WORKSPACES_ID,
        workspaceId
      );

      // workspace.inviteCodeでデータベースに保存されている招待用コード
      if (workspace.inviteCode !== code) {
        return c.json({ error: 'Invalid invite code' }, 400);
      }

      // ここでワークスペースにそのログインしているユーザーをMEMBERとして追加する
      await databases.createDocument(DATABASE_ID, MEMBERS_ID, ID.unique(), {
        workspaceId,
        userId: user.$id,
        role: MemberRole.MEMBER,
      });

      return c.json({ data: workspace });
    }
  )
  .get('/:workspaceId', sessionMiddleware, async (c) => {
    const user = c.get('user');
    const databases = c.get('databases');
    const { workspaceId } = c.req.param();

    const member = await getMember({
      databases,
      workspaceId,
      userId: user.$id,
    });

    if (!member) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const workspace = await databases.getDocument<Workspace>(
      DATABASE_ID,
      WORKSPACES_ID,
      workspaceId
    );

    return c.json({ data: workspace });
  })
  .get('/:workspaceId/info', sessionMiddleware, async (c) => {
    const databases = c.get('databases');
    const { workspaceId } = c.req.param();

    const workspace = await databases.getDocument<Workspace>(
      DATABASE_ID,
      WORKSPACES_ID,
      workspaceId
    );

    return c.json({
      data: {
        $id: workspace.$id,
        name: workspace.name,
        imageUrl: workspace.imageUrl,
      },
    });
  })
  .get('/:workspaceId/analytics', sessionMiddleware, async (c) => {
    const databases = c.get('databases');
    const user = c.get('user');
    const { workspaceId } = c.req.param();

    // ログインしているユーザーの情報を取得
    const member = await getMember({
      databases,
      workspaceId,
      userId: user.$id,
    });

    if (!member) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    // 日付の取得
    const now = new Date();
    const thisMonthStart = startOfMonth(now);
    const thisMonthEnd = endOfMonth(now);
    // 1は1ヶ月前を表す。
    const lastMonthStart = startOfMonth(subMonths(now, 1));
    const lastMonthEnd = endOfMonth(subMonths(now, 1));

    // 作成日が今月のタスクを取得
    const thisMonthTasks = await databases.listDocuments(
      DATABASE_ID,
      TASKS_ID,
      [
        Query.equal('workspaceId', workspaceId),
        Query.greaterThanEqual('$createdAt', thisMonthStart.toISOString()),
        Query.lessThanEqual('$createdAt', thisMonthEnd.toISOString()),
      ]
    );

    // 作成日が先月のタスクを取得
    const lastMonthTasks = await databases.listDocuments(
      DATABASE_ID,
      TASKS_ID,
      [
        Query.equal('workspaceId', workspaceId),
        Query.greaterThanEqual('$createdAt', lastMonthStart.toISOString()),
        Query.lessThanEqual('$createdAt', lastMonthEnd.toISOString()),
      ]
    );

    // 今月作成されたタスク数
    const taskCount = thisMonthTasks.total;
    // 今月作成されたタスク数と先月作成されたタスク数の差
    const taskDifference = taskCount - lastMonthTasks.total;

    // 今月作成されて、現在ログインしているユーザーがアサインされているタスクを取得
    const thisMonthAssignedTasks = await databases.listDocuments(
      DATABASE_ID,
      TASKS_ID,
      [
        Query.equal('workspaceId', workspaceId),
        Query.equal('assigneeId', member.$id),
        Query.greaterThanEqual('$createdAt', thisMonthStart.toISOString()),
        Query.lessThanEqual('$createdAt', thisMonthEnd.toISOString()),
      ]
    );

    // 先月作成されて、現在ログインしているユーザーがアサインされているタスクを取得
    const lastMonthAssignedTasks = await databases.listDocuments(
      DATABASE_ID,
      TASKS_ID,
      [
        Query.equal('workspaceId', workspaceId),
        Query.equal('assigneeId', member.$id),
        Query.greaterThanEqual('$createdAt', lastMonthStart.toISOString()),
        Query.lessThanEqual('$createdAt', lastMonthEnd.toISOString()),
      ]
    );

    // 今月作成されて、現在ログインしているユーザーがアサインされているタスクの数
    const assignedTaskCount = thisMonthAssignedTasks.total;
    // 今月と先月の差
    const assignedTaskDifference =
      assignedTaskCount - lastMonthAssignedTasks.total;

    // 今月作成されて、現在のステータスがDONEではないタスクを取得
    const thisMonthIncompleteTasks = await databases.listDocuments(
      DATABASE_ID,
      TASKS_ID,
      [
        Query.equal('workspaceId', workspaceId),
        Query.notEqual('status', TaskStatus.DONE),
        Query.greaterThanEqual('$createdAt', thisMonthStart.toISOString()),
        Query.lessThanEqual('$createdAt', thisMonthEnd.toISOString()),
      ]
    );

    // 先月作成されて、現在のステータスがDONEではないタスクを取得
    const lastMonthIncompleteTasks = await databases.listDocuments(
      DATABASE_ID,
      TASKS_ID,
      [
        Query.equal('workspaceId', workspaceId),
        Query.notEqual('status', TaskStatus.DONE),
        Query.greaterThanEqual('$createdAt', lastMonthStart.toISOString()),
        Query.lessThanEqual('$createdAt', lastMonthEnd.toISOString()),
      ]
    );

    // 今月作成されて、ステータスがDONEではないタスクの数
    const incompleteTaskCount = thisMonthIncompleteTasks.total;
    // 今月と先月の差
    const incompleteTaskDifference =
      incompleteTaskCount - lastMonthIncompleteTasks.total;

    // 今月作成されて、現在のステータスがDONEのタスクを取得
    const thisMonthCompletedTasks = await databases.listDocuments(
      DATABASE_ID,
      TASKS_ID,
      [
        Query.equal('workspaceId', workspaceId),
        Query.equal('status', TaskStatus.DONE),
        Query.greaterThanEqual('$createdAt', thisMonthStart.toISOString()),
        Query.lessThanEqual('$createdAt', thisMonthEnd.toISOString()),
      ]
    );

    // 先月作成されて、現在のステータスがDONEのタスクを取得
    const lastMonthCompletedTasks = await databases.listDocuments(
      DATABASE_ID,
      TASKS_ID,
      [
        Query.equal('workspaceId', workspaceId),
        Query.equal('status', TaskStatus.DONE),
        Query.greaterThanEqual('$createdAt', lastMonthStart.toISOString()),
        Query.lessThanEqual('$createdAt', lastMonthEnd.toISOString()),
      ]
    );

    // 今月作成されて、ステータスがDONEのタスクの数
    const completedTaskCount = thisMonthCompletedTasks.total;
    // 今月と先月の差
    const completedTaskDifference =
      completedTaskCount - lastMonthCompletedTasks.total;

    // 今月作成されて、タスクがDONE以外で、duedateが本日より前（duedateを過ぎている）のタスクを取得
    const thisMonthOverdueTasks = await databases.listDocuments(
      DATABASE_ID,
      TASKS_ID,
      [
        Query.equal('workspaceId', workspaceId),
        Query.notEqual('status', TaskStatus.DONE),
        Query.lessThan('dueDate', now.toISOString()),
        Query.greaterThanEqual('$createdAt', thisMonthStart.toISOString()),
        Query.lessThanEqual('$createdAt', thisMonthEnd.toISOString()),
      ]
    );

    // 先月作成されて、タスクがDONE以外で、duedateが本日より前（duedateをかなり過ぎている）のタスクを取得
    const lastMonthOverdueTasks = await databases.listDocuments(
      DATABASE_ID,
      TASKS_ID,
      [
        Query.equal('workspaceId', workspaceId),
        Query.notEqual('status', TaskStatus.DONE),
        Query.lessThan('dueDate', now.toISOString()),
        Query.greaterThanEqual('$createdAt', lastMonthStart.toISOString()),
        Query.lessThanEqual('$createdAt', lastMonthEnd.toISOString()),
      ]
    );

    // 今月作成されて、タスクがDONE以外で、duedateが本日より前（duedateを過ぎている）のタスクの数
    const overdueTaskCount = thisMonthOverdueTasks.total;
    const overdueTaskDifference =
      overdueTaskCount - lastMonthOverdueTasks.total;

    return c.json({
      data: {
        taskCount,
        taskDifference,
        assignedTaskCount,
        assignedTaskDifference,
        completedTaskCount,
        completedTaskDifference,
        incompleteTaskCount,
        incompleteTaskDifference,
        overdueTaskCount,
        overdueTaskDifference,
      },
    });
  });

export default app;

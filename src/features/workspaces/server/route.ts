import { sessionMiddleware } from '@/lib/session-middleware';
import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { createWorkspaceSchema } from '../schema';
import { DATABASE_ID, WORKSPACES_ID } from '../../../../config';
import { ID } from 'node-appwrite';

const app = new Hono().post(
  '/',
  zValidator('json', createWorkspaceSchema),
  sessionMiddleware,
  async (c) => {
    // sessionMiddleWareでセットされたdatabase, user, workspaceの情報を取得
    const databases = c.get('databases');
    const user = c.get('user');
    const { name } = c.req.valid('json');

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
      }
    );
    return c.json({ data: workspace });
  }
);

export default app;

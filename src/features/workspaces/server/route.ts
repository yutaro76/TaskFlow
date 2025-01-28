import { sessionMiddleware } from '@/lib/session-middleware';
import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { createWorkspaceSchema, updateWorkspaceSchema } from '../schema';
import {
  DATABASE_ID,
  IMAGES_BUCKET_ID,
  MEMBERS_ID,
  WORKSPACES_ID,
} from '../../../../config';
import { ID, Query } from 'node-appwrite';
import { MemberRole } from '@/features/members/types';
import { generateInviteCode } from '@/lib/utils';
import { getMember } from '@/features/members/utils';

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
  );

export default app;

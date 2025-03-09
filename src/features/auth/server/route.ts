import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { loginSchema, registerSchema, updateFaceSchema } from '../schemas';
import { createAdminClient } from '@/lib/appwrite';
import { ID } from 'node-appwrite';
import { deleteCookie, setCookie } from 'hono/cookie';
import { AUTH_COOKIE } from '../constants';
import { sessionMiddleware } from '@/lib/session-middleware';
import {
  APIKEY,
  ENDPOINT,
  FACE_IMAGES_BUCKET_ID,
  PROJECT,
} from '../../../../config';

import { Client, Storage } from 'appwrite';

const app = new Hono()
  .get('/current', sessionMiddleware, (c) => {
    const user = c.get('user');
    return c.json({ data: user });
  })
  .post(
    '/login',
    zValidator('json', loginSchema),
    // (c)にはリクエストとレスポンスに関する情報が入る。c.--で情報を取得する。cはcontextの略。
    async (c) => {
      // リクエストボディからバリデーション済みのデータを抽出するコード。
      // リクエストボディが JSON 形式であることを前提に、email と password フィールドを抽出
      const { email, password } = c.req.valid('json');

      // ↓デモ用に作った部分なのでコメントアウト。
      // JSON形式でデータを返すためにc.jsonメソッドを使用
      // return c.json({ email, password });

      // アカウントに関する操作のときはappwriteでアカウントを操作するためのオブジェクトを作成。名前はaccount。
      // createAdminClient関数からaccountオブジェクトを作成。
      const { account } = await createAdminClient();
      // accountオブジェクトが持つcreateEmailPasswordSessionメソッドを使って、email と password を使ってセッションを作成。
      const session = await account.createEmailPasswordSession(email, password);
      // setCookieはhonoのcookieヘルパーで、クッキーを設定するための関数。
      // cはリクエストとレスポンスに関する情報が入っているオブジェクト。
      // AUTH_COOKIEはクッキーの名前。
      // session.secretのsecretはユーザーを認証に通すためのプロパティ。
      setCookie(c, AUTH_COOKIE, session.secret, {
        path: '/', // クッキーの有効範囲を指定。'/' は全てのパスで有効。
        httpOnly: true, // クッキーが HTTP リクエストのみでアクセス可能。
        secure: true, // クッキーが HTTPS 接続でのみ送信される
        sameSite: 'strict', // 同一サイトからのリクエストでのみクッキーが送信
        maxAge: 60 * 60 * 24 * 30, // クッキーの有効期限を秒単位で指定する。60 * 60 * 24 * 30 は、クッキーが 30 日間有効であることを示す。
      });

      return c.json({ success: true });
    }
  )
  .post('/register', zValidator('json', registerSchema), async (c) => {
    const { name, email, password } = c.req.valid('json');
    const { account } = await createAdminClient();
    await account.create(ID.unique(), email, password, name);
    const session = await account.createEmailPasswordSession(email, password);

    setCookie(c, AUTH_COOKIE, session.secret, {
      path: '/',
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 30,
    });

    return c.json({ email, password });
  })
  .post('/logout', sessionMiddleware, async (c) => {
    // account は、Appwrite のアカウント管理機能にアクセスするためのインスタンス。
    const account = c.get('account');
    // AUTH_COOKIE という名前のクッキーを削除
    deleteCookie(c, AUTH_COOKIE);
    // 現在のユーザーセッションを削除
    // サーバー側でログアウト処理
    await account.deleteSession('current');
    return c.json({ success: true });
  })
  .patch(
    '/face',
    sessionMiddleware,
    zValidator('form', updateFaceSchema),
    // Honoでcが使えるようになる。
    async (c) => {
      // Appwrite のストレージサービスを取得するためのコード
      const storage = c.get('storage');
      const user = c.get('user');

      const { image } = c.req.valid('form');

      let uploadedImageUrl: string | undefined | null;

      // eslint-disable-next-line
      const sdk = require('node-appwrite');

      const client = new sdk.Client()
        .setEndpoint(ENDPOINT)
        .setProject(PROJECT)
        .setKey(APIKEY);

      const users = new sdk.Users(client);

      if (image instanceof File) {
        // createFileはAppwriteのStorageクラスから提供されるメソッド
        const file = await storage.createFile(
          FACE_IMAGES_BUCKET_ID,
          ID.unique(),
          image
        );

        // getFilePreviewはAppwriteのStorageクラスから提供されるメソッド
        // arrayBufferには画像のバイナリデータが入る。バイナリデータとは、画像や音声、動画などのデータを表すためのデータ形式。
        const arrayBuffer = await storage.getFilePreview(
          FACE_IMAGES_BUCKET_ID,
          // file.$id はアップロードされた画像のID
          file.$id
        );

        // Bufferはバイナリデータを扱うためのNode.jsの標準ライブラリで提供されるグローバルオブジェクト
        uploadedImageUrl = `data:image/png;base64,${Buffer.from(
          arrayBuffer
        ).toString('base64')}`;

        await users.updatePrefs(user.$id, {
          icon: file.$id,
        });
      } else {
        uploadedImageUrl = image;
        await users.updatePrefs(user.$id, {
          icon: null,
        });
      }

      return c.json({
        success: true,
        data: { image: uploadedImageUrl },
      });
    }
  )
  .get('/:userIconId', sessionMiddleware, async (c) => {
    const { userIconId } = c.req.param();

    const client = new Client().setEndpoint(ENDPOINT).setProject(PROJECT);

    const storage = new Storage(client);

    const result = await storage.getFile(FACE_IMAGES_BUCKET_ID, userIconId);
    return c.json({ data: result });
  });
export default app;

import 'server-only';

import {
  Account,
  Client,
  Databases,
  Models,
  Storage,
  type Account as AccountType,
  type Databases as DatabasesType,
  type Storage as StorageType,
  type Users as UsersType,
} from 'node-appwrite';

import { getCookie } from 'hono/cookie';
import { createMiddleware } from 'hono/factory';
import { AUTH_COOKIE } from '@/features/auth/constants';

type AdditionalContext = {
  Variables: {
    account: AccountType;
    databases: DatabasesType;
    storage: StorageType;
    users: UsersType;
    user: Models.User<Models.Preferences>;
  };
};

export const sessionMiddleware = createMiddleware<AdditionalContext>(
  // cにはリクエストとレスポンスに関する情報が入る。cはcontextの略。nextは次の処理に進むための関数。
  async (c, next) => {
    // この時点でまだユーザーは特定されておらず、単にユーザーの形を作るだけ
    const client = new Client()
      .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
      .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT!);

    // クッキーの値には、ユーザーごとに異なるセッション情報や認証トークンが含まれる。
    // セッション情報も同時に取得できる。
    // getCookie関数を使って、ユーザーの情報は入っているcからAUTH_COOKIEの値を取得する
    const session = getCookie(c, AUTH_COOKIE);

    if (!session) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    client.setSession(session);

    // Appwrite のアカウント管理機能にアクセスできるようにするために、Account クラスのインスタンスを作成
    const account = new Account(client);
    // Appwrite のデータベース管理機能にアクセスできるようにするために、Databases クラスのインスタンスを作成
    const databases = new Databases(client);
    // Appwrite のストレージ管理機能にアクセスできるようにするために、Storage クラスのインスタンスを作成
    const storage = new Storage(client);
    // 空のaccountインスタンスにgetメソッドを使って、ユーザー情報を取得し、userに格納
    const user = await account.get();
    // account, databases, storageの機能が使えるようにcにセットする。
    c.set('account', account);
    c.set('databases', databases);
    c.set('storage', storage);
    // ユーザーの情報が入るcに改めてuserをセットすることで、後からユーザー情報を取得しやすくする。
    c.set('user', user);

    await next();
  }
);

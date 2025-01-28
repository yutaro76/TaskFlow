'use server';

import { Account, Client, Databases, Query } from 'node-appwrite';
import { AUTH_COOKIE } from '@/features/auth/constants';
import { cookies } from 'next/headers';
import { DATABASE_ID, MEMBERS_ID, WORKSPACES_ID } from '../../../config';
import { getMember } from '../members/utils';
import { Workspace } from './types';

export const getWorkspaces = async () => {
  try {
    const client = new Client()
      .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
      .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT!);

    const session = await cookies().get(AUTH_COOKIE);

    if (!session) {
      return { documents: [], total: 0 };
    }

    client.setSession(session.value);
    // Appwriteのデータベース操作やアカウント操作を行うためのメソッドを使えるようにする。
    const databases = new Databases(client);
    const account = new Account(client);
    // AppwriteのAccountクラスのメソッドで、現在ログインしているユーザーのアカウント情報を取得する。
    const user = await account.get();

    // ユーザーがメンバーになっているワークスペースを取得する。
    const members = await databases.listDocuments(DATABASE_ID, MEMBERS_ID, [
      Query.equal('userId', user.$id),
    ]);

    if (members.total === 0) {
      return { documents: [], total: 0 };
    }

    // ユーザーが所属するワークスペースのIDを取得する。
    const workspaceIds = members.documents.map((member) => member.workspaceId);

    // ユーザーが所属するワークスペースの情報を取得する。
    const workspaces = await databases.listDocuments(
      DATABASE_ID,
      WORKSPACES_ID,
      [Query.orderDesc('$createdAt'), Query.contains('$id', workspaceIds)]
    );

    return await workspaces;
  } catch {
    return { documents: [], total: 0 };
  }
};

interface GetWorkspaceProps {
  workspaceId: string;
}

export const getWorkspace = async ({ workspaceId }: GetWorkspaceProps) => {
  try {
    const client = new Client()
      .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
      .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT!);

    const session = await cookies().get(AUTH_COOKIE);

    if (!session) {
      return null;
    }

    client.setSession(session.value);
    // Appwriteのデータベース操作やアカウント操作を行うためのメソッドを使えるようにする。
    const databases = new Databases(client);
    const account = new Account(client);
    // AppwriteのAccountクラスのメソッドで、現在ログインしているユーザーのアカウント情報を取得する。
    const user = await account.get();

    const member = await getMember({
      databases,
      userId: user.$id,
      workspaceId,
    });

    if (!member) {
      return null;
    }

    // ユーザーの現在のワークスペースの情報を取得する。
    const workspace = await databases.getDocument<Workspace>(
      DATABASE_ID,
      WORKSPACES_ID,
      workspaceId
    );

    return await workspace;
  } catch {
    return null;
  }
};

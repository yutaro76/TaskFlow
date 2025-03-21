'use server';

import { Query } from 'node-appwrite';
import { DATABASE_ID, MEMBERS_ID, WORKSPACES_ID } from '../../../config';
import { getMember } from '../members/utils';
import { Workspace } from './types';
import { createSessionClient } from '@/lib/appwrite';

export const getWorkspaces = async () => {
  const { databases, account } = await createSessionClient();

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
  const workspaces = await databases.listDocuments(DATABASE_ID, WORKSPACES_ID, [
    Query.orderDesc('$createdAt'),
    Query.contains('$id', workspaceIds),
  ]);

  return await workspaces;
};

interface GetWorkspaceProps {
  workspaceId: string;
}

export const getWorkspace = async ({ workspaceId }: GetWorkspaceProps) => {
  const { databases, account } = await createSessionClient();

  const user = await account.get();

  const member = await getMember({
    databases,
    userId: user.$id,
    workspaceId,
  });

  if (!member) {
    throw new Error('Unauthorized');
  }

  // ユーザーの現在のワークスペースの情報を取得する。
  const workspace = await databases.getDocument<Workspace>(
    DATABASE_ID,
    WORKSPACES_ID,
    workspaceId
  );

  return await workspace;
};

interface GetWorkspaceInfoProps {
  workspaceId: string;
}

export const getWorkspaceInfo = async ({
  workspaceId,
}: GetWorkspaceInfoProps) => {
  const { databases } = await createSessionClient();

  // ユーザーの現在のワークスペースの情報を取得する。
  const workspace = await databases.getDocument<Workspace>(
    DATABASE_ID,
    WORKSPACES_ID,
    workspaceId
  );

  return { name: workspace.name };
};

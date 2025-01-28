import { Databases, Query } from 'node-appwrite';
import { DATABASE_ID, MEMBERS_ID } from '../../../config';

interface GetMemberProps {
  databases: Databases;
  workspaceId: string;
  userId: string;
}

export const getMember = async ({
  databases,
  workspaceId,
  userId,
}: GetMemberProps) => {
  const members = await databases.listDocuments(DATABASE_ID, MEMBERS_ID, [
    Query.equal('workspaceId', workspaceId),
    Query.equal('userId', userId),
  ]);
  // 結果は一つであることが期待される、DB内で重複したデータがあり結果が複数になる可能性があるため[0]としている。
  return members.documents[0];
};

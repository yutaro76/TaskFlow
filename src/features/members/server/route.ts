import { createAdminClient } from '@/lib/appwrite';
import { sessionMiddleware } from '@/lib/session-middleware';
import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { z } from 'zod';
import { getMember } from '../utils';
import { DATABASE_ID, MEMBERS_ID } from '../../../../config';
import { Query } from 'node-appwrite';
import { MemberRole, Member } from '../types';

const app = new Hono()
  .get(
    '/',
    sessionMiddleware,
    // クライアントがリクエストを送信する際に URL に含める形で渡される
    zValidator('query', z.object({ workspaceId: z.string() })),
    async (c) => {
      const { users } = await createAdminClient();
      const databases = c.get('databases');
      const user = c.get('user');
      const { workspaceId } = c.req.valid('query');

      const member = await getMember({
        databases,
        workspaceId,
        userId: user.$id,
      });

      if (!member) {
        return c.json({ error: 'Unauthorized' }, 401);
      }

      const members = await databases.listDocuments<Member>(
        DATABASE_ID,
        MEMBERS_ID,
        [
          // workspaceIdが一致するメンバーを全員取得する
          Query.equal('workspaceId', workspaceId),
        ]
      );

      // 複数のPromiseを並行して実行し、すべてのPromiseが解決されるのを待つためのメソッド
      const populatedMembers = await Promise.all(
        members.documents.map(async (member) => {
          // getはnode-appwriteのUsersクラスのメソッド
          const user = await users.get(member.userId);
          const userEmailFirst = user.email.split('@')[0];
          // メンバーを一人ずつ追加
          return {
            ...member,
            name: user.name || userEmailFirst,
            email: user.email,
          };
        })
      );

      return c.json({
        data: {
          // 元はmembersにidしか入っていなかったが、そこにそのidに紐づくnameとemailを追加した。
          // 両方を保持するため、membersとdocuments: populatedMembersを返す。
          ...members,
          documents: populatedMembers,
        },
      });
    }
  )
  .delete('/:memberId', sessionMiddleware, async (c) => {
    const { memberId } = c.req.param();
    const user = c.get('user');
    const databases = c.get('databases');

    // 削除するメンバーのidを取得
    const memberToDelete = await databases.getDocument(
      DATABASE_ID,
      MEMBERS_ID,
      memberId
    );

    // 削除しようとしているメンバーと同じワークスペースに所属するメンバーを全員取得する
    const allMembersInWorkspace = await databases.listDocuments(
      DATABASE_ID,
      MEMBERS_ID,
      [Query.equal('workspaceId', memberToDelete.workspaceId)]
    );

    // 自分自身の情報を取得
    const member = await getMember({
      // getMember関数に渡す値
      databases,
      workspaceId: memberToDelete.workspaceId,
      userId: user.$id,
    });

    // もし自分自身が削除しようとしているメンバーが所属するワークスペースに所属していない場合
    if (!member) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    // 自分自身を削除しようとせず、自分の権限がADMINでない場合
    if (member.$id !== memberToDelete.$id && member.role !== MemberRole.ADMIN) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    if (allMembersInWorkspace.documents.length === 1) {
      return c.json({ error: 'cannot delete the only member' }, 400);
    }

    // memberIdを使ってメンバーをワークスペースから削除
    await databases.deleteDocument(DATABASE_ID, MEMBERS_ID, memberId);

    // memberIdとmemberToDelete.$idは、取得方法が異なっても同じメンバーを指す。
    // メンバーを削除した後に、そのメンバーのidを返す。
    return c.json({ data: { $id: memberToDelete.$id } });
  })
  .patch(
    '/:memberId',
    sessionMiddleware,
    zValidator('json', z.object({ role: z.nativeEnum(MemberRole) })),
    async (c) => {
      const { memberId } = c.req.param();
      const { role } = c.req.valid('json');
      const user = c.get('user');
      const databases = c.get('databases');

      const memberToUpdate = await databases.getDocument(
        DATABASE_ID,
        MEMBERS_ID,
        memberId
      );

      const allMembersInWorkspace = await databases.listDocuments(
        DATABASE_ID,
        MEMBERS_ID,
        [Query.equal('workspaceId', memberToUpdate.workspaceId)]
      );

      // 自分自身の情報を取得
      const member = await getMember({
        databases,
        workspaceId: memberToUpdate.workspaceId,
        userId: user.$id,
      });

      if (!member) {
        return c.json({ error: 'Unauthorized' }, 401);
      }

      if (member.role !== MemberRole.ADMIN) {
        return c.json({ error: 'Unauthorized' }, 401);
      }

      if (allMembersInWorkspace.documents.length === 1) {
        return c.json({ error: 'cannot downgrade the only member' }, 400);
      }

      await databases.updateDocument(DATABASE_ID, MEMBERS_ID, memberId, {
        // 更新される予定のroleはリクエストで渡される。
        role,
      });

      return c.json({ data: { $id: memberToUpdate.$id } });
    }
  );

export default app;

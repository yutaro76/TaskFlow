'use client';

import { useConfirm } from '@/hooks/use-confirm';
import { useWorkspaceId } from '../hooks/use-workspace-id';
import { useGetMembers } from '@/features/members/api/use-get-members';
import { useDeleteMember } from '@/features/members/api/use-delete-member';
import { useUpdateMember } from '@/features/members/api/use-update-member';
import { MemberRole } from '@/features/members/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeftIcon, MoreVerticalIcon } from 'lucide-react';
import { DottedSeparator } from '@/components/dotted-separator';
import { Fragment } from 'react';
import { MemberAvatar } from '@/features/members/components/member-avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';

export const MembersList = () => {
  const workspaceId = useWorkspaceId();
  // useConfirmフックからConfirmDialogとconfirm関数を取得。
  const [ConfirmDialog, confirm] = useConfirm(
    'Remove member',
    'This member will be removed from the workspace.',
    'destructive'
  );

  const { data } = useGetMembers({ workspaceId });

  const { mutate: deleteMember, isPending: isDeletingMember } =
    useDeleteMember();

  const { mutate: updateMember, isPending: isUpdatingMember } =
    useUpdateMember();

  // 渡されたmemberIdとroleでそのメンバーのroleをupdateする関数
  const handleUpdateMember = (memberId: string, role: MemberRole) => {
    updateMember({
      json: { role },
      param: { memberId },
    });
  };

  const handleDeleteMember = async (memberId: string) => {
    const ok = await confirm();
    if (!ok) {
      return;
    }

    deleteMember(
      { param: { memberId } },
      {
        onSuccess: () => {
          window.location.reload();
        },
      }
    );
  };

  return (
    <Card className='w-full h-full border-none shadow-none'>
      <ConfirmDialog />
      <CardHeader className='flex flex-row items-center gap-x-4 space-y-0'>
        {/* asChildで子要素をレンダリングできるようにする。 */}
        <Button asChild variant='secondary' size='sm'>
          <Link href={`/workspaces/${workspaceId}`}>
            <ArrowLeftIcon className='size-4 mr-2' />
            Back
          </Link>
        </Button>
        <CardTitle className='text-xl font-bold'>Members List</CardTitle>
      </CardHeader>
      <div className='px-7'>
        <DottedSeparator />
      </div>
      <CardContent className='p-7'>
        {data?.documents.map((member, index) => (
          <Fragment key={member.$id}>
            <div className='flex items-center gap-2'>
              <MemberAvatar
                className='size-10'
                fallbackClassName='text-lg'
                name={member.name}
              />
              <div className='flex flex-col'>
                <p className='text-sm font-medium'>{member.name}</p>
                <p className='text-xs text-muted-foreground'>{member.email}</p>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button className='ml-auto' variant='secondary' size='icon'>
                    <MoreVerticalIcon className='size-4 text-muted-foreground' />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  // ドロップダウンメニューが表示される方向。この場合は下側。
                  side='bottom'
                  align='end'
                >
                  <DropdownMenuItem
                    className='font-medium'
                    onClick={() =>
                      handleUpdateMember(member.$id, MemberRole.ADMIN)
                    }
                    disabled={isUpdatingMember}
                  >
                    Set as Administrator
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className='font-medium'
                    onClick={() =>
                      handleUpdateMember(member.$id, MemberRole.MEMBER)
                    }
                    disabled={isUpdatingMember}
                  >
                    Set as Member
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className='font-medium text-amber-700'
                    onClick={() => handleDeleteMember(member.$id)}
                    disabled={isDeletingMember}
                  >
                    Remove {member.name}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            {/* リストの最後の要素以外の各要素の後に区切り線を表示する。 */}
            {index < data.documents.length - 1 && (
              <Separator className='my-2.5' />
            )}
          </Fragment>
        ))}
      </CardContent>
    </Card>
  );
};

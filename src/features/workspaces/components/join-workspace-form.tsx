'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardDescription,
  CardTitle,
} from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { useWorkspaceId } from '../hooks/use-workspace-id';
import { useInviteCode } from '../hooks/use-invite-code';
import { useJoinWorkspace } from '../api/use-join-workspace';
import { DottedSeparator } from '@/components/dotted-separator';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface JoinWorkspaceFormProps {
  initialValues: {
    // ワークスペースの名前
    name: string;
  };
}

export const JoinWorkspaceForm = ({
  initialValues,
}: JoinWorkspaceFormProps) => {
  // URLのパスを取得
  const router = useRouter();
  const workspaceId = useWorkspaceId();
  const inviteCode = useInviteCode();
  const { mutate, isPending } = useJoinWorkspace();

  const onSubmit = () => {
    mutate(
      {
        // mutate関数に渡す値
        param: { workspaceId },
        json: { code: inviteCode },
      },
      {
        onSuccess: ({ data }) => {
          router.push(`/workspaces/${data.$id}`);
        },
      }
    );
  };

  return (
    <Card className='w-full h-full border-none shadow-none'>
      <CardHeader className='p-7'>
        <CardTitle className='text-2xl font-bold'>Join Workspace</CardTitle>
        <CardDescription>
          You&apos;ve been invited to join <strong>{initialValues.name}</strong>{' '}
          workspace.
        </CardDescription>
      </CardHeader>
      <div className='px-7'>
        <DottedSeparator />
      </div>
      <CardContent className='p-7'>
        {/* 画面の大きさがlg以上になると、flex-rowを適用。*/}
        {/* gap-2 items-center justify-betweenは画面サイズに関わらず常に適用。 */}
        <div className='flex flex-col lg:flex-row gap-2 items-center justify-between'>
          <Button
            variant='secondary'
            type='button'
            asChild
            size='lg'
            className='w-full lg:w-fit'
            disabled={isPending}
          >
            <Link href='/'>Cancel</Link>
          </Button>
          <Button
            size='lg'
            className='w-full lg:w-fit'
            type='button'
            onClick={onSubmit}
            disabled={isPending}
          >
            <Link href='/'>Join Workspace</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

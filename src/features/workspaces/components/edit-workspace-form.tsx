'use client';
import { updateWorkspaceSchema } from '@/features/workspaces/schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Card, CardContent } from '../../../components/ui/card';
import { DottedSeparator } from '../../../components/dotted-separator';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../../../components/ui/form';
import { Input } from '../../../components/ui/input';
import { Button } from '../../../components/ui/button';
import { useRef } from 'react';
import { CopyIcon, ImageIcon } from 'lucide-react';
import Image from 'next/image';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { Workspace } from '../types';
import { useUpdateWorkspace } from '../api/use-update-workspace';
import { useDeleteWorkspace } from '../api/use-delete-workspace';
import { useConfirm } from '@/hooks/use-confirm';
import { useResetInviteCode } from '../api/use-reset-invite-code';
import { toast } from 'sonner';

interface EditWorkspaceFormProps {
  // onCancel プロパティを使用することで、キャンセルボタンがクリックされたときに特定の処理を実行できるようになる。
  // どのタイミングでモーダルがクリックされてモーダルが閉じられるかを明記するために予め型を定義しておく。
  onCancel?: () => void;
  initialValues: Workspace;
}

export const EditWorkspaceForm = ({
  onCancel,
  initialValues,
}: EditWorkspaceFormProps) => {
  // const router = useRouter();
  const { mutate, isPending } = useUpdateWorkspace();
  const { mutate: resetInviteCode, isPending: isResettingInviteCode } =
    useResetInviteCode();
  // inputRefはinputフィールドに入力された値を取得し、その値をアップロードするために使われる。
  const inputRef = useRef<HTMLInputElement>(null);
  // フォームのバリデーション
  // z.infer<typeof updateWorkspaceSchema>の型を使用する。
  // Zod スキーマから TypeScript の型を推論するために使用される。
  const form = useForm<z.infer<typeof updateWorkspaceSchema>>({
    // zodResolver を使用して、Zod スキーマをバリデーションに使用する。
    resolver: zodResolver(updateWorkspaceSchema),
    defaultValues: {
      ...initialValues,
      image: initialValues.imageUrl ?? '',
    },
  });
  const onSubmit = (values: z.infer<typeof updateWorkspaceSchema>) => {
    const finalValues = {
      ...values,
      image: values.image instanceof File ? values.image : '',
    };
    // dataはmutateの中に含まれており、useUpdateWorkspaceフックで定義され、エンドポイントで取得したデータが入っている。
    mutate(
      // finalValues にはワークスペースの名前、画像が含まれる。
      { form: finalValues, param: { workspaceId: initialValues.$id } }
    );
  };

  // 画像fileをformにセットする。
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // e.target.files はファイルのリストを返す。[0]は最初のファイルを取得する。
    const file = e.target.files?.[0];
    if (file) {
      form.setValue('image', file);
    }
  };

  // カスタムフックから渡される値を別の名前で保存する。
  // mutateはワークスペースの保存に関するもの。
  // isPendingはワークスペースの保存が実行中かどうかを判定する。useMutationについてくる状態を表すもの。
  const { mutate: deleteWorkspace, isPending: isDeleteWorkspace } =
    useDeleteWorkspace();

  const [DeleteDialog, confirmDelete] = useConfirm(
    'Delete workspace',
    'This action cannot be undone.',
    'destructive'
  );

  const handleDelete = async () => {
    const ok = await confirmDelete();
    if (!ok) {
      return;
    }
    deleteWorkspace(
      // initialValuesはこのEditWorkspaceFormフックが使われる画面から渡される。
      { param: { workspaceId: initialValues.$id } },
      {
        onSuccess: () => {
          window.location.href = '/';
        },
      }
    );
  };

  const [ResetDialog, confirmReset] = useConfirm(
    'Reset invite code',
    'This will invalidate the current invite code and generate a new one.',
    'destructive'
  );

  const handleResetInviteCode = async () => {
    const ok = await confirmReset();
    if (!ok) {
      return;
    }
    resetInviteCode({ param: { workspaceId: initialValues.$id } });
  };

  const isClient = typeof window !== 'undefined';
  const fullInviteLink = isClient
    ? `${window.location.origin}/workspaces/${initialValues.$id}/join/${initialValues.inviteCode}`
    : '';

  const handleCopyInviteLink = () => {
    navigator.clipboard
      .writeText(fullInviteLink)
      .then(() => toast.success('Invite link copied'));
  };

  return (
    <div className='flex flex-col gap-y-4'>
      <DeleteDialog />
      <Card className='w-full h-full border-none shadow-none'>
        {/* <CardHeader className='flex flex-row items-center gap-x-4 p-7 space-y-0'> */}
        {/* <CardTitle className='text-xl font-bold'> */}
        {/* <Button */}
        {/* size='sm' */}
        {/* variant='secondary' */}
        {/* onClick={ */}
        {/* // onCancelが渡されている場合、キャンセルボタンがクリックされたときにonCancelを実行する。 */}
        {/* // onCancelは通常のフローでsettingsをクリックして遷移してきたときに渡されるようになっている。 */}
        {/* onCancel */}
        {/* ? onCancel */}
        {/* : () => router.push(`/workspaces/${initialValues.$id}`) */}
        {/* } */}
        {/* > */}
        {/* <ArrowLeftIcon className='size-4 mr-2' /> */}
        {/* {initialValues.name} */}
        {/* </Button> */}
        {/* </CardTitle> */}
        {/* </CardHeader> */}
        {/* <div className='px-7'> */}
        {/* <DottedSeparator /> */}
        {/* </div> */}
        <CardContent className='p-7'>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <div className='flex flex-col gap-y-4'>
                <FormField
                  name='name'
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Workspace Name</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder='enter workspace name' />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                ></FormField>
                <FormField
                  control={form.control}
                  name='image'
                  render={({ field }) => (
                    <div className='flex flex-col gap-y-2'>
                      <div className='flex items-center gap-x-5'>
                        {field.value ? (
                          <div className='size-[72px] relative rounded-md overflow-hidden'>
                            <Image
                              alt='logo'
                              fill
                              className='object-cover'
                              src={
                                // field.valueがFileインスタンスであるかどうかをチェックし、FileインスタンスであればそのファイルのURLを生成
                                // ファイルのURLをブラウザに入力すればちゃんと画像が表示される。
                                field.value instanceof File
                                  ? URL.createObjectURL(field.value)
                                  : // Fileインスタンスでない場合、そのままの値を使用。
                                    field.value
                              }
                            />
                          </div>
                        ) : (
                          <Avatar className='size-[72px]'>
                            <AvatarFallback>
                              <ImageIcon className='size-[36px] text-neutral-400' />
                            </AvatarFallback>
                          </Avatar>
                        )}
                        <div className='flex flex-col'>
                          <p className='text-sm'>Workspace Icon</p>
                          <p className='text-sm text-muted-foreground'>
                            JPG, PNG, SVG, or JPEG, max 1MB
                          </p>
                          <input
                            className='hidden'
                            type='file'
                            accept='.jpg, .png, .jpeg, .svg'
                            ref={inputRef}
                            onChange={handleImageChange}
                            disabled={isPending}
                          />
                          {field.value ? (
                            <Button
                              type='button'
                              disabled={isPending}
                              variant='destructive'
                              size='xs'
                              className='w-fit mt-2'
                              // ファイル選択ダイアログを開くために使用される。
                              // このボタンをクリックすると、上側のinputフィールドが裏側でクリックされ、画像選択ダイアログが表示される。
                              onClick={() => {
                                field.onChange(null);
                                if (inputRef.current) {
                                  inputRef.current.value = '';
                                }
                              }}
                            >
                              Remove Image
                            </Button>
                          ) : (
                            <Button
                              type='button'
                              disabled={isPending}
                              variant='tertiary'
                              size='xs'
                              className='w-fit mt-2'
                              // ファイル選択ダイアログを開くために使用される。
                              // このボタンをクリックすると、上側のinputフィールドが裏側でクリックされ、画像選択ダイアログが表示される。
                              onClick={() => inputRef.current?.click()}
                            >
                              Upload Image
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                />
              </div>
              <DottedSeparator className='py-7' />
              <div className='flex items-center justify-between'>
                <Button
                  type='button'
                  size-='lg'
                  variant='secondary'
                  onClick={onCancel}
                  disabled={isPending}
                  className={cn(!onCancel && 'invisible')}
                >
                  Cancel
                </Button>
                <Button type='submit' size-='lg' disabled={isPending}>
                  Save Changes
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
      <Card className='w-full h-full border-none shadow-none'>
        <ResetDialog />
        <CardContent className='p-7'>
          <div className='flex flex-col'>
            <h3 className='font-bold'>Invite Members</h3>
            <p className='text-sm text-muted-foreground py-5'>
              Use this link to invite members to your workspace.
            </p>
            <div className='mt-4'>
              <div className='flex items-center gap-x-2'>
                <Input disabled value={fullInviteLink} />
                <Button
                  onClick={handleCopyInviteLink}
                  variant='secondary'
                  className='size-12'
                >
                  <CopyIcon className='size-5' />
                </Button>
              </div>
            </div>
            <DottedSeparator className='py-7' />
            <Button
              onClick={handleResetInviteCode}
              variant='destructive'
              className='mt-6 w-fit ml-auto'
              size='sm'
              type='button'
              disabled={isPending || isResettingInviteCode}
            >
              Reset Invite Link
            </Button>
          </div>
        </CardContent>
      </Card>
      <Card className='w-full h-full border-none shadow-none'>
        <CardContent className='p-7'>
          <div className='flex flex-col'>
            <h3 className='font-bold'>Danger Zone</h3>
            <p className='text-sm text-muted-foreground pt-5 pd-2'>
              Deleting a workspace is irreversible. All associated date will be
              lost.
            </p>
            <DottedSeparator className='py-7' />
            <Button
              className='mt-6 w-fit ml-auto'
              size='sm'
              variant='destructive'
              type='button'
              disabled={isPending || isDeleteWorkspace}
              onClick={handleDelete}
            >
              Delete Workspace
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

'use client';
import { useCreateProject } from '@/features/projects/api/use-create-project';
import { createProjectSchema } from '@/features/projects/schemas';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../../components/ui/card';
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
import { ImageIcon } from 'lucide-react';
import Image from 'next/image';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { useWorkspaceId } from '@/features/workspaces/hooks/use-workspace-id';

interface CreateProjectFormProps {
  // onCancel プロパティを使用することで、キャンセルボタンがクリックされたときに特定の処理を実行できるようになる。
  // どのタイミングでモーダルがクリックされてモーダルが閉じられるかを明記するために予め型を定義しておく。
  onCancel?: () => void;
}

export const CreateProjectForm = ({ onCancel }: CreateProjectFormProps) => {
  const workspaceId = useWorkspaceId();

  const { mutate, isPending } = useCreateProject();
  // inputRefはinputフィールドに入力された値を取得し、その値をアップロードするために使われる。
  const inputRef = useRef<HTMLInputElement>(null);
  // フォームのバリデーション
  // z.infer<typeof createWorkspaceSchema>の型を使用する。
  // Zod スキーマから TypeScript の型を推論するために使用される。
  const form = useForm<z.infer<typeof createProjectSchema>>({
    // zodResolver を使用して、Zod スキーマをバリデーションに使用する。
    resolver: zodResolver(createProjectSchema.omit({ workspaceId: true })),
    defaultValues: {
      name: '',
    },
  });
  const onSubmit = (values: z.infer<typeof createProjectSchema>) => {
    const finalValues = {
      ...values,
      workspaceId,
      image: values.image instanceof File ? values.image : '',
    };
    // dataはmutateの中に含まれており、useCreateWorkspaceフックで定義され、エンドポイントで取得したデータが入っている。
    mutate(
      { form: finalValues },
      {
        onSuccess: ({ data }) => {
          form.reset();
          // Todo: redirect to project page
        },
      }
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

  return (
    <Card className='w-full h-full border-none shadow-none'>
      <CardHeader className='flex p-7'>
        <CardTitle className='text-xl font-bold'>
          Create a new project
        </CardTitle>
      </CardHeader>
      <div className='px-7'>
        <DottedSeparator />
      </div>
      <CardContent className='p-7'>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className='flex flex-col gap-y-4'>
              <FormField
                name='name'
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder='enter project name' />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
                                : // Fileインスタンスでない場合、そのままの値を使用します。
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
                        <p className='text-sm'>Project Icon</p>
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
                // onCancel が渡されていない場合、キャンセルボタンは非表示になる。
                // すでにワークスペースがある状態でワークスペースを作成する際は、CreateWorkspaceFormからonCancelが渡されるため、表示。
                // 全くワークスペースがない状態で新たにワークスペースを作る場合はonCancelが渡されないため、非表示。
                className={cn(!onCancel && 'invisible')}
              >
                Cancel
              </Button>
              <Button type='submit' size-='lg' disabled={isPending}>
                Create Project
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

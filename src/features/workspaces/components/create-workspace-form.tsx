'use client';
import { useCreateWorkspace } from '@/features/workspaces/api/use-create-workspace';
import { createWorkspaceSchema } from '@/features/workspaces/schema';
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

interface CreateWorkspaceFormProps {
  // onCancel プロパティを使用することで、キャンセルボタンがクリックされたときに特定の処理を実行できるようになる。
  // どのタイミングでモーダルがクリックされてモーダルが閉じられるかを明記するために予め型を定義しておく。
  onCancel?: () => void;
}

export const CreateWorkspaceForm = ({ onCancel }: CreateWorkspaceFormProps) => {
  const { mutate, isPending } = useCreateWorkspace();
  // inputRefはinputフィールドに入力された値を取得し、その値をアップロードするために使われる。
  const inputRef = useRef<HTMLInputElement>(null);
  // フォームのバリデーション
  // z.infer<typeof createWorkspaceSchema>の型を使用する。
  // Zod スキーマから TypeScript の型を推論するために使用される。
  const form = useForm<z.infer<typeof createWorkspaceSchema>>({
    // zodResolver を使用して、Zod スキーマをバリデーションに使用する。
    resolver: zodResolver(createWorkspaceSchema),
    defaultValues: {
      name: '',
    },
  });
  const onSubmit = (values: z.infer<typeof createWorkspaceSchema>) => {
    const finalValues = {
      ...values,
      image: values.image instanceof File ? values.image : '',
    };
    mutate(
      // finalValues にはワークスペースの名前、画像が含まれる。
      { form: finalValues },
      {
        onSuccess: () => {
          form.reset();
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
        <CardTitle>Create a new workspace</CardTitle>
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
                        <p className='text-sm'>Workspace Icon</p>
                        <p className='text-sm text-muted-foreground'>
                          JPG, PNG, SVG, or JPEG, max 1mb
                        </p>
                        <input
                          className='hidden'
                          type='file'
                          accept='.jpg, .png, .jpeg, .svg'
                          ref={inputRef}
                          onChange={handleImageChange}
                          disabled={isPending}
                        />
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
              >
                Cancel
              </Button>
              <Button type='submit' size-='lg' disabled={isPending}>
                Create Workspace
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

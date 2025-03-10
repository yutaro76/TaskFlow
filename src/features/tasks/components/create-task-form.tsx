'use client';
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
import { cn } from '@/lib/utils';
import { useWorkspaceId } from '@/features/workspaces/hooks/use-workspace-id';
import { useCreateTask } from '../api/use-create-task';
import { createTaskSchema } from '../schemas';
import { DatePicker } from '@/components/date-picker';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { MemberAvatar } from '@/features/members/components/member-avatar';
import { TaskStatus } from '../types';
import { ProjectAvatar } from '@/features/projects/components/project-avatar';
import { useGetProjects } from '@/features/projects/api/use-get-projects';
import { useMemo } from 'react';

interface CreateTaskFormProps {
  // onCancel プロパティを使用することで、キャンセルボタンがクリックされたときに特定の処理を実行できるようになる。
  // どのタイミングでモーダルがクリックされてモーダルが閉じられるかを明記するために予め型を定義しておく。
  onCancel?: () => void;
  projectOptions: { id: string; name: string; imageUrl: string }[];
  memberOptions: { id: string; name: string }[];
  defaultDueDate?: Date | null;
  defaultProjectId?: string | null;
}

export const CreateTaskForm = ({
  onCancel,
  projectOptions,
  memberOptions,
  defaultDueDate,
  defaultProjectId,
}: CreateTaskFormProps) => {
  const workspaceId = useWorkspaceId();
  const { mutate, isPending } = useCreateTask();
  // フォームのバリデーション
  // z.infer<typeof createWorkspaceSchema>の型を使用する。
  // Zod スキーマから TypeScript の型を推論するために使用される。
  // console.log(defaultDueDate);
  const projects = useGetProjects({ workspaceId });

  const initialProjectId = useMemo(() => {
    if (!defaultProjectId && projects.data?.total === 1) {
      return projects.data.documents[0].$id;
    }
    return defaultProjectId ?? undefined;
  }, [projects, defaultProjectId]);

  const form = useForm<z.infer<typeof createTaskSchema>>({
    // zodResolver を使用して、Zod スキーマをバリデーションに使用する。
    resolver: zodResolver(createTaskSchema.omit({ workspaceId: true })),
    defaultValues: {
      workspaceId,
      name: '',
      dueDate: defaultDueDate ?? undefined,
      projectId: initialProjectId,
      assigneeId: memberOptions.length === 1 ? memberOptions[0].id : undefined,
    },
  });
  const onSubmit = (values: z.infer<typeof createTaskSchema>) => {
    mutate(
      // valueからworkspaceIdを取り出して、jsonとして渡す。
      { json: { ...values, workspaceId } },
      {
        onSuccess: () => {
          form.reset();
          // onCancelが定義されている場合にのみonCancel関数を呼び出す。
          // ?.はJavaScript のオプショナルチェイニング演算子。
          onCancel?.();
        },
      }
    );
  };
  return (
    <Card className='w-full h-full border-none shadow-none'>
      <CardHeader className='flex p-7'>
        <CardTitle className='text-xl font-bold'>Create a new task</CardTitle>
      </CardHeader>
      <div className='px-7'>
        <DottedSeparator />
      </div>
      <CardContent className='p-7'>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className='flex flex-col gap-y-4'>
              <FormField
                control={form.control}
                name='name'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Task Name <span className='text-red-600'> *</span>
                    </FormLabel>
                    <FormControl>
                      <Input {...field} placeholder='Enter task name' />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='dueDate'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Due Date<span className='text-red-600'> *</span>
                    </FormLabel>
                    <FormControl>
                      {/* filedに選択した日付が表示される */}
                      <DatePicker {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='assigneeId'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Assignee<span className='text-red-600'> *</span>
                    </FormLabel>
                    <Select
                      defaultValue={field.value}
                      // onChangeはフィールドの値が変更されたときに呼び出される。
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder='Select assignee' />
                        </SelectTrigger>
                      </FormControl>
                      <FormMessage />
                      <SelectContent>
                        {memberOptions.map((member) => (
                          <SelectItem key={member.id} value={member.id}>
                            <div className='flex items-center gap-x-2'>
                              <MemberAvatar
                                className='size-6'
                                name={member.name}
                              />
                              {member.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='status'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Status <span className='text-red-600'> *</span>
                    </FormLabel>
                    <Select
                      defaultValue={field.value}
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder='Select status' />
                        </SelectTrigger>
                      </FormControl>
                      <FormMessage />
                      <SelectContent>
                        <SelectItem value={TaskStatus.BACKLOG}>
                          Backlog
                        </SelectItem>
                        <SelectItem value={TaskStatus.TODO}>Todo</SelectItem>
                        <SelectItem value={TaskStatus.IN_PROGRESS}>
                          In Progress
                        </SelectItem>
                        <SelectItem value={TaskStatus.IN_REVIEW}>
                          In Review
                        </SelectItem>
                        <SelectItem value={TaskStatus.DONE}>Done</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='projectId'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Project <span className='text-red-600'> *</span>
                    </FormLabel>
                    <Select
                      defaultValue={field.value}
                      // onChangeはフィールドの値が変更されたときに呼び出される。
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger
                          disabled={typeof defaultProjectId === 'string'}
                        >
                          <SelectValue placeholder='Select project' />
                        </SelectTrigger>
                      </FormControl>
                      <FormMessage />
                      <SelectContent>
                        {projectOptions.map((project) => (
                          <SelectItem key={project.id} value={project.id}>
                            <div className='flex items-center gap-x-2'>
                              <ProjectAvatar
                                className='size-6'
                                name={project.name}
                                image={project.imageUrl}
                              />
                              {project.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
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
                Create Task
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

'use client';

import { FcGoogle } from 'react-icons/fc';
import { FaGithub } from 'react-icons/fa';
import { DottedSeparator } from '@/components/dotted-separator';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema } from '../schemas';
import { useLogin } from '../api/use-login';
import { signUpWithGithub, signUpWithGoogle } from '@/lib/oath';

// ↓auth/schemas.tsにバリデーション部分を書き出しloginSchemaとしたため、こちらはコメントアウト
// zodのスキーマを定義
// const formSchema = z.object({
//   email: z.string().email(),
//   password: z.string().min(8, 'Minimum 8 characters required'),
// });

export const SignInCard = () => {
  const form = useForm<z.infer<typeof loginSchema>>({
    // loginSchemaに変更。
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });
  const { mutate, isPending } = useLogin();
  const onSubmit = (values: z.infer<typeof loginSchema>) => {
    mutate({ json: values });
  };
  return (
    <Card className='w-full h-full md:w-[487px] border-none shadow-none'>
      <CardHeader className='flex items-center justify-center text-center p-6'>
        <CardTitle className='text-2xl'>Sign In</CardTitle>
      </CardHeader>
      <div className='px-7 mb-2'>
        <DottedSeparator />
      </div>
      <CardContent className='p-7'>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
            <FormField
              name='email'
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      {...field}
                      type='email'
                      placeholder='Enter your email address'
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name='password'
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      {...field}
                      type='password'
                      placeholder='Enter your password'
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* disabled={false}で常に押せる状態になっている。 */}
            {/* isPendingでクリック後は押せないようにする */}
            <Button disabled={isPending} size='lg' className='w-full'>
              Login
            </Button>
          </form>
        </Form>
      </CardContent>
      <div className='px-7'>
        <DottedSeparator />
      </div>
      <CardContent className='p-7 flex flex-col gap-y-4'>
        <Button
          disabled={isPending}
          variant='secondary'
          size='lg'
          className='w-full'
          onClick={() => signUpWithGoogle()}
        >
          <FcGoogle className='mr-2 size-5' />
          Login with Google
        </Button>
        <Button
          disabled={isPending}
          variant='secondary'
          size='lg'
          className='w-full'
          onClick={() => signUpWithGithub()}
        >
          <FaGithub className='mr-2 size-5' />
          Login with Github
        </Button>
      </CardContent>
      <div className='px-7'>
        <DottedSeparator />
      </div>
      <CardContent className='p-7 flex items-center justify-center'>
        <p>
          Don&apos;t have an account? {''}
          <Link href='/sign-up'>
            <span className='text-blue-700'>Sign Up</span>
          </Link>
        </p>
      </CardContent>
    </Card>
  );
};

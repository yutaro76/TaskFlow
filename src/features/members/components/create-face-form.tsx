'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Card, CardContent } from '../../../components/ui/card';
import { DottedSeparator } from '../../../components/dotted-separator';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
} from '../../../components/ui/form';
import { Button } from '../../../components/ui/button';
import { useRef, useState } from 'react';
import { ImageIcon } from 'lucide-react';
import Image from 'next/image';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { useUpdateFace } from '@/features/auth/api/use-update-face';
import { updateFaceSchema } from '@/features/auth/schemas';
import { Client, Storage } from 'appwrite';
import { ENDPOINT, FACE_IMAGES_BUCKET_ID, PROJECT } from '../../../../config';
import { useCurrent } from '@/features/auth/api/use-current';

interface CreateFaceFormProps {
  onCancel?: () => void;
}

export const CreateFaceForm = ({ onCancel }: CreateFaceFormProps) => {
  const [isEdited, setIsEdited] = useState(false);
  const { mutate, isPending } = useUpdateFace();
  const inputRef = useRef<HTMLInputElement>(null);

  // storageからimageを取得する
  const { data: user } = useCurrent();
  const userIconId = user?.prefs?.icon;

  const client = new Client();
  client.setEndpoint(ENDPOINT).setProject(PROJECT);
  const storage = new Storage(client);

  // storageからimageのURLを取得する

  let imageUrl: string | undefined;
  // eslint-disable-next-line
  userIconId
    ? (imageUrl = storage.getFilePreview(FACE_IMAGES_BUCKET_ID, userIconId))
    : (imageUrl = '');

  const form = useForm<z.infer<typeof updateFaceSchema>>({
    resolver: zodResolver(updateFaceSchema),
    defaultValues: {
      image: imageUrl ? imageUrl : undefined,
    },
  });

  const onSubmit = (values: z.infer<typeof updateFaceSchema>) => {
    const finalValues = {
      ...values,
      image: values.image instanceof File ? values.image : '',
    };
    mutate(
      { form: finalValues },
      {
        onSuccess: () => {
          form.reset();
          onCancel?.();
        },
      }
    );
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      form.setValue('image', file);
      setIsEdited(true);
    }
  };

  return (
    <div className='flex flex-col gap-y-4'>
      <Card className='w-full h-full border-none shadow-none'>
        <CardContent className='p-7'>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <div className='flex flex-col gap-y-4'>
                <FormItem>
                  <FormLabel>Change Account Icon</FormLabel>
                </FormItem>
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
                              className='rounded-full h-20 w-20 flex items-center justify-center'
                              src={
                                field.value instanceof File
                                  ? URL.createObjectURL(field.value)
                                  : imageUrl
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
                              onClick={() => {
                                setIsEdited(true);
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
                              // クリックで<input>と紐づき、画像を選択できる。
                              // 本来はinputの欄があるが、それをボタンで隠している。
                              onClick={() => {
                                inputRef.current?.click();
                              }}
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
              <DottedSeparator className='py-5' />
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
                <Button
                  type='submit'
                  size='lg'
                  disabled={isPending || !isEdited}
                >
                  Save Changes
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

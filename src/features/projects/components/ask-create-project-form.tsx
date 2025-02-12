'use client';
import Image from 'next/image';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../../components/ui/card';

export const AskCreateProjectForm = () => {
  return (
    <Card className='w-full h-full border-none shadow-none flex flex-col items-center'>
      <CardHeader className='p-7'>
        <CardTitle className='text-xl font-bold'>
          please make a project first
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Image
          src='/modal.png'
          alt='modal'
          width={0}
          height={0}
          sizes='100vw'
          style={{ width: '100%', height: 'auto' }}
        />
      </CardContent>
    </Card>
  );
};

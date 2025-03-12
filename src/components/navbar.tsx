'use client';
import { UserButton } from '@/features/auth/components/user-button';
import { MobileSidebar } from './mobile-sidebar';
import { usePathname } from 'next/navigation';
import { CreateFaceModal } from '@/features/members/components/create-face-modal';

export const Navbar = () => {
  const pathname = usePathname();
  // const getText = useGetText();

  const pathnameMap = {
    tasks: {
      title: 'My Tasks',
      // description: getText('tasks_description'),
    },
    projects: {
      title: 'My Project',
      // description: 'These are the details of this project.',
    },
    settings: {
      title: 'My Settings',
      // description: 'These are the settings of this workspace.',
    },
    members: {
      title: 'My Members',
      // description: 'This is the member list for this workspace.',
    },
  };

  const defaultMap = {
    title: 'Home',
    // description: 'This is the home of this workspace.',
  };
  // workspace/123/tasks/123/...
  // workspace/123/projects/123/...
  const pathnameParts = pathname.split('/');
  // as keyof typeofで型を保証できる。
  // pathnameKeyがpathnameMapのkeyであることをtypescriptに伝える。
  const pathnameKey = pathnameParts[3] as keyof typeof pathnameMap;

  const { title } = pathnameMap[pathnameKey] || defaultMap;

  return (
    <nav className='pt-4 px-6 flex items-center justify-between'>
      <div className='flex-col hidden lg:flex'>
        <h1 className='text-2xl font-semibold'>{title}</h1>
        {/* <p className='text-muted-foreground'>{description}</p> */}
      </div>
      <MobileSidebar />
      <CreateFaceModal />
      <UserButton />
    </nav>
  );
};

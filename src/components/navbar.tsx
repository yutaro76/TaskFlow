'use client';
import { UserButton } from '@/features/auth/components/user-button';
import { MobileSidebar } from './mobile-sidebar';
import { redirect, usePathname, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

const pathnameMap = {
  tasks: {
    title: 'My Tasks',
    description: 'This is the list of my tasks.',
  },
  projects: {
    title: 'My Project',
    description: 'These are the details of this project.',
  },
  settings: {
    title: 'My Settings',
    description: 'These are the settings of this workspace.',
  },
  members: {
    title: 'My Members',
    description: 'This is the member list for this workspace.',
  },
};

const defaultMap = {
  title: 'Home',
  description: 'This is the home of this workspace.',
};

export const Navbar = () => {
  const pathname = usePathname();
  // workspace/123/tasks/123/...
  // workspace/123/projects/123/...
  const pathnameParts = pathname.split('/');
  // as keyof typeofで型を保証できる。
  // pathnameKeyがpathnameMapのkeyであることをtypescriptに伝える。
  const pathnameKey = pathnameParts[3] as keyof typeof pathnameMap;

  const { title, description } = pathnameMap[pathnameKey] || defaultMap;

  // taskViewでtask-viewの後のkanbanなどを取得。ないときはnull。
  const searchParams = useSearchParams();
  const taskView = searchParams.get('task-view');
  // pathnameで/workspaces/67b41e4e000ca3be3b72/tasks、taskViewでkanbanを取得。
  useEffect(() => {
    if (pathnameKey === 'tasks' && taskView == 'table') {
      localStorage.setItem('myTasksView', 'table');
    } else if (pathnameKey === 'tasks' && taskView == 'kanban') {
      localStorage.setItem('myTasksView', 'kanban');
    } else if (pathnameKey === 'tasks' && taskView == 'calendar') {
      localStorage.setItem('myTasksView', 'calendar');
    } else if (pathnameKey === 'tasks' && taskView == null) {
      localStorage.setItem('myTasksView', 'table');
    }

    if (
      pathnameKey === 'settings' ||
      pathnameKey === 'members' ||
      pathnameKey === undefined
    ) {
      localStorage.removeItem('myTasksView');
    }
  }, [pathnameKey, taskView]);

  // workspaceId
  const workspaceId = pathnameParts[2] as keyof typeof pathnameMap;

  useEffect(() => {
    const lastPage = localStorage.getItem('myTasksView');
    if (pathnameKey != 'tasks' && lastPage != null) {
      localStorage.removeItem('myTasksView');
      redirect(`/workspaces/${workspaceId}/tasks?task-view=${lastPage}`);
    }
    // eslint-disable-next-line
  }, []);

  return (
    <nav className='pt-4 px-6 flex items-center justify-between'>
      <div className='flex-col hidden lg:flex'>
        <h1 className='text-2xl font-semibold'>{title}</h1>
        <p className='text-muted-foreground'>{description}</p>
      </div>
      <MobileSidebar />
      <UserButton />
    </nav>
  );
};

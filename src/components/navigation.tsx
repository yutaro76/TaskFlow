'use client';

import { cn } from '@/lib/utils';
import { SettingsIcon, UsersIcon } from 'lucide-react';
import Link from 'next/link';
import {
  GoCheckCircle,
  GoCheckCircleFill,
  GoHome,
  GoHomeFill,
} from 'react-icons/go';
import { useWorkspaceId } from '@/features/workspaces/hooks/use-workspace-id';
import { usePathname } from 'next/navigation';

const routes = [
  {
    label: 'Home',
    href: '',
    icon: GoHome,
    activeIcon: GoHomeFill,
  },
  {
    label: 'My Tasks',
    href: '/tasks',
    icon: GoCheckCircle,
    activeIcon: GoCheckCircleFill,
  },
  {
    label: 'Settings',
    href: '/settings',
    icon: SettingsIcon,
    activeIcon: SettingsIcon,
  },
  {
    label: 'Members',
    href: '/members',
    icon: UsersIcon,
    activeIcon: UsersIcon,
  },
];

export const Navigation = () => {
  const workspaceId = useWorkspaceId();
  const pathname = usePathname();

  return (
    <ul className='flex flex-col'>
      {routes.map((item) => {
        const fullHref = `/workspaces/${workspaceId}${item.href}`;
        // isActiveのもの（最初の状態はHome）は見た目が強調される。
        const isActive = pathname === fullHref;
        const Icon = isActive ? item.activeIcon : item.icon;
        return (
          <Link key={item.href} href={fullHref}>
            <div
              className={cn(
                // gap-2.5 フレックスアイテム間の間隔を 0.625rem
                // p-2.5 パディングを 0.625rem
                // rounded-md 角丸を 0.375rem
                'flex items-center gap-2.5 p-2.5 rounded-md font-medium hover:text-primary transition text-neutral-500',
                isActive && 'bg-white shadow-sm hover:opacity-100 text-primary'
              )}
            >
              <Icon className='size-5 text-neutral-500' />
              {item.label}
            </div>
          </Link>
        );
      })}
    </ul>
  );
};

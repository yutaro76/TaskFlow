import { getCurrent } from '@/features/auth/queries';
import { MembersList } from '@/features/workspaces/components/members-list';
import { redirect } from 'next/navigation';

const WorkspaceMembersPage = async () => {
  const user = await getCurrent();
  if (!user) {
    redirect('/sign-in');
  }
  return (
    <div className='w-full lg:max-w-xl lg:mx-auto'>
      <MembersList />
    </div>
  );
};

export default WorkspaceMembersPage;

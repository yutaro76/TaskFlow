import { getCurrent } from '@/features/auth/queries';
import { SignUpCard } from '../../../features/auth/components/sign-up-card';
import { redirect } from 'next/navigation';

const SignUpPage = async () => {
  const user = await getCurrent();
  // もしすでにユーザーがログインしている状態で新規登録に遷移すれば、ログイン後のホームページにリダイレクトする。
  if (user) {
    redirect('/');
  }
  return <SignUpCard />;
};

export default SignUpPage;

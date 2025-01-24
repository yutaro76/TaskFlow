import { getCurrent } from '@/features/auth/actions';
import { SignInCard } from '@/features/auth/components/sign-in-card';
import { redirect } from 'next/navigation';

const SignInPage = async () => {
  const user = await getCurrent();
  // もしすでにユーザーがログインしている状態でログインページに遷移すれば、ログイン後のホームページにリダイレクトする。
  if (user) {
    redirect('/');
  }
  return <SignInCard />;
};

export default SignInPage;

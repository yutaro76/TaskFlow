// @をつければ、srcディレクトリから始まる相対パスでimportできる
import { getCurrent } from '@/features/auth/actions';
import { redirect } from 'next/navigation';

export default async function Home() {
  const user = await getCurrent();
  // const router = useRouter();
  // useCurrentフックを使って、現在のユーザー情報を取得する。
  // データが取得中の場合はisLoadingがtrueになる。取得が終わればisLoadingはfalseになる。
  // const { data, isLoading } = useCurrent();
  // mutateは自由につけた名前で、他の呼び方でもよい。
  // const { mutate } = useLogout();

  // useEffect(() => {
  // isLoadingがtrueのときはfalseになり、逆も同じ。
  // dataがない場合、isLoadingがtrueで!isLoadingがfalseのとき（両方falseのとき）にサインインページにリダイレクトする。
  //   if (!data && !isLoading) {
  //     router.push('/sign-in');
  //   }
  // });
  if (!user) {
    redirect('/sign-in');
  }
  return (
    <div>
      This is the home page.
      {/* only visible to authenticated users
      <Button
        onClick={() => {
          mutate();
        }}
      ></Button> */}
    </div>
  );
}

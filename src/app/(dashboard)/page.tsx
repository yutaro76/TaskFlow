// @をつければ、srcディレクトリから始まる相対パスでimportできる
import { CreateWorkspaceForm } from '@/features/workspaces/components/create-workspace-form';
import { getCurrent } from '@/features/auth/actions';
import { redirect } from 'next/navigation';
import { getWorkspaces } from '@/features/workspaces/actions';

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

  const workspaces = await getWorkspaces();
  if (workspaces.total === 0) {
    redirect('/workspaces/create');
  } else {
    // ユーザーが所属するワークスペースのリストで一番最初にあるもののIDを取得する。
    // ワークスペースの作成日時の新しい順に並べ替えられているため、最初のワークスペースが最新のワークスペースである。
    redirect(`/workspaces/${workspaces.documents[0].$id}`);
  }

  return (
    <div>
      <div className='bg-neutral-500 p-4 h-full'>
        <CreateWorkspaceForm />
      </div>
      {/* This is the home page. */}
      {/* only visible to authenticated users
      <Button
        onClick={() => {
          mutate();
        }}
      ></Button> */}
    </div>
  );
}

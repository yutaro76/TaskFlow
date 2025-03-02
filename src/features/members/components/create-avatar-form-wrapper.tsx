import { CreateAvatarForm } from './create-avatar-form';

interface CreateTaskFormWrapperProps {
  onCancel: () => void;
}

export const CreateAvatarFormWrapper = ({
  onCancel,
}: CreateTaskFormWrapperProps) => {
  // アバターを取得するためのカスタムフック
  // アバターを取得中のLoadingの表示

  return <CreateAvatarForm onCancel={onCancel} />;
};

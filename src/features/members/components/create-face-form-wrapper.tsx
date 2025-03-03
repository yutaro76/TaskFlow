import { CreateFaceForm } from './create-face-form';

interface CreateTaskFormWrapperProps {
  onCancel: () => void;
}

export const CreateFaceFormWrapper = ({
  onCancel,
}: CreateTaskFormWrapperProps) => {
  // アバターを取得するためのカスタムフック
  // アバターを取得中のLoadingの表示

  return <CreateFaceForm onCancel={onCancel} />;
};

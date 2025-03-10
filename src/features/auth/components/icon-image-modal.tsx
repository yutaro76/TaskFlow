import { Client, Storage } from 'appwrite';
import { ENDPOINT, FACE_IMAGES_BUCKET_ID, PROJECT } from '../../../../config';

interface IconImageModalProps {
  userIconId: string;
}
const client = new Client();
const storage = new Storage(client);

client.setEndpoint(ENDPOINT).setProject(PROJECT);
export const IconImageModal = ({ userIconId }: IconImageModalProps) => {
  const result = storage.getFilePreview(FACE_IMAGES_BUCKET_ID, userIconId);
  return (
    <div className='flex flex-col items-center justify-center w-full h-full'>
      <img src={result} alt='icon' className='rounded-full w-full h-full' />
    </div>
  );
};

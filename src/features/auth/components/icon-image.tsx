import { Client, Storage } from 'appwrite';
import { ENDPOINT, FACE_IMAGES_BUCKET_ID, PROJECT } from '../../../../config';

interface IconImageProps {
  userIconId: string;
}
const client = new Client();
const storage = new Storage(client);

client.setEndpoint(ENDPOINT).setProject(PROJECT);

export const IconImage = ({ userIconId }: IconImageProps) => {
  const result = storage.getFilePreview(FACE_IMAGES_BUCKET_ID, userIconId);
  return (
    <>
      <img
        src={result}
        alt='icon'
        className='rounded-full h-12 w-12 flex items-center justify-center'
      />
    </>
  );
};

import { useCurrent } from '../api/use-current';
import { Client, Storage } from 'appwrite';
import { ENDPOINT, FACE_IMAGES_BUCKET_ID, PROJECT } from '../../../../config';

const client = new Client();
const storage = new Storage(client);
client.setEndpoint(ENDPOINT).setProject(PROJECT);

export const IconImage = () => {
  const { data: user } = useCurrent();
  const userIconId = user?.prefs?.icon;
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

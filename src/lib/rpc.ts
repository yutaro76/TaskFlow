import { hc } from 'hono/client';
import { AppType } from '@/app/api/[[...route]]/route';

// AppTypeの型でlocalhost:3000にアクセスするための定数を作成し、クライアントと名付けた。
// !はnullでないことを示す。
export const client = hc<AppType>(process.env.NEXT_PUBLIC_APP_URL!);

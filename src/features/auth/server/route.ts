import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { loginSchema, registerSchema } from '../schemas';

const app = new Hono()
  .post(
    '/login',
    zValidator('json', loginSchema),
    // (c)にはリクエストとレスポンスに関する情報が入る。c.--で情報を取得する。
    (c) => {
      // リクエストボディからバリデーション済みのデータを抽出するコード。
      // リクエストボディが JSON 形式であることを前提に、email と password フィールドを抽出
      const { email, password } = c.req.valid('json');
      // JSON形式でデータを返すためにc.jsonメソッドを使用
      return c.json({ email, password });
    }
  )
  .post('/register', zValidator('json', registerSchema), (c) => {
    const { name, email, password } = c.req.valid('json');
    return c.json({ name, email, password });
  });
export default app;

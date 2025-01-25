import { z } from 'zod';

export const createWorkspaceSchema = z.object({
  name: z.string().trim().min(1, 'Required'),
  image: z
    .union([
      z.instanceof(File),
      // ===は型が違うとエラーになり、==は型が違ってもエラーにならない。===はより厳密。
      z.string().transform((value) => (value === '' ? undefined : value)),
    ])
    // フィールドが存在しなくてもバリデーションエラーにならないように設定できる。
    .optional(),
});

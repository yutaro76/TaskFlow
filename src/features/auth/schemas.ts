import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, 'Required'),
});

export const registerSchema = z.object({
  name: z.string().trim().min(1, 'Required'),
  email: z.string().email(),
  password: z.string().min(8, 'Minimum 8 characters required'),
});

export const updateFaceSchema = z.object({
  image: z
    .union([
      // fileインスタンスであることの確認
      z.instanceof(File),
      // 空文字の場合はundefinedに変換
      z
        .string()
        .nullable()
        .transform((value) => (value === '' ? undefined : value)),
    ])
    .optional(),
});

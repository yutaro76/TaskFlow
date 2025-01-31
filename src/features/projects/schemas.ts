import { z } from 'zod';

export const createProjectSchema = z.object({
  name: z.string().trim().min(1, 'Required'),
  image: z
    .union([
      // fileインスタンスであることの確認
      z.instanceof(File),
      // 空文字の場合はundefinedに変換
      z.string().transform((value) => (value === '' ? undefined : value)),
    ])
    .optional(),
  workspaceId: z.string(),
});

export const updateProjectSchema = z.object({
  name: z.string().trim().min(1, 'minimum 1 character required').optional(),
  image: z
    .union([
      // fileインスタンスであることの確認
      z.instanceof(File),
      // 空文字の場合はundefinedに変換
      z.string().transform((value) => (value === '' ? undefined : value)),
    ])
    .optional(),
});

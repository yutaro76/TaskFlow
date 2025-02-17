import { Hono } from 'hono';
import { handle } from 'hono/vercel';

// デフォルトエクスポートをした際は、こちらのファイルで任意の名前をつけられる。
// route.tsがデフォルトエクスポートのため、このファイルでauthと名前をつけた。
import auth from '@/features/auth/server/route';
import workspaces from '@/features/workspaces/server/route';
import members from '@/features/members/server/route';
import projects from '@/features/projects/server/route';
import tasks from '@/features/tasks/server/route';

const app = new Hono().basePath('/api');

// @/features/auth/server/routeのエンドポイントを/authとして使えるようにする。
// eslint-disable-next-line
const routes = app
  .route('/auth', auth)
  .route('/workspaces', workspaces)
  .route('/members', members)
  .route('/projects', projects)
  .route('/tasks', tasks);

// handle(app)でhonoで作ったものをvercelで使えるようにする。
// このファイルを例えばGETリクエストで呼び出すと、appが実行される。
export const GET = handle(app);
export const POST = handle(app);
export const PATCH = handle(app);
export const DELETE = handle(app);

// routesには/authだけでなく、他のエンドポイントも含まれ、その型をAppTypeとしてエクスポートする。
export type AppType = typeof routes;

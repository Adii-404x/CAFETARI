import { app } from '../server/app';

// Export Express app compatible with Vercel Serverless Functions and standalone Node runtimes
export default function handler(req: any, res: any) {
  return app(req, res);
}

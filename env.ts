// @ts-expect-error: FIXME add types for custom-env
import { env as loadEnv } from 'custom-env';
import { z } from 'zod';

import { Env, envSchema } from './env.schema.ts';

/**
 * APP_STAGE is the app's source-of-truth deployment stage.
 *
 * NODE_ENV is left as the conventional Node/runtime flag for framework and
 * library behaviour. To avoid requiring operators to set both, derive NODE_ENV
 * from APP_STAGE only when it is not provided explicitly.
 *
 * Local runs may use `.env.*` files. Hosted environments should inject
 * variables directly and must not depend on env files being present on disk.
 */
process.env.APP_STAGE = process.env.APP_STAGE || 'local';
process.env.NODE_ENV = process.env.NODE_ENV || (
  process.env.APP_STAGE === 'prod' ? 'production' :
    process.env.APP_STAGE === 'test' ? 'test' :
      'development'
);

// Only load `.env.*` files outside hosted environments such as Render.
const shouldLoadEnvFile = !process.env.RENDER;
if (shouldLoadEnvFile) {
  // APP_STAGE selects which env file to load and which app-only behaviours apply.
  loadEnv(process.env.APP_STAGE);
}

// export verified env

let env: Env;
try {
  env = envSchema.parse(process.env);
  env.IS_PROD = env.APP_STAGE === 'prod';
  env.IS_DEV = env.APP_STAGE === 'dev';
  env.IS_LOCAL = env.APP_STAGE === 'local';
  env.IS_TEST = env.APP_STAGE === 'test';
} catch (err) {
  if (err instanceof z.ZodError) {
    console.warn('Invalid env variables');
    console.error(JSON.stringify(z.treeifyError(err), null, 2));
    err.issues.forEach((e) => {
      const path = e.path.join('.');
      console.log(`${path}: ${e.message}`);
    });

    // Kill process
    process.exit(1);
  } else {
    throw err;
  }
}

// export validated env
export { env };

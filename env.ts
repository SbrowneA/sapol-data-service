// @ts-expect-error: FIXME add types for custom-env
import { env as loadEnv } from 'custom-env';
import { z } from 'zod';

import { type Env, envSchema } from './env.schema.ts';
import { appStage } from './app-stage.ts';


// Only load `.env.*` files outside hosted environments such as Render.
const shouldLoadEnvFile = !process.env.RENDER;
if (shouldLoadEnvFile) {
  // APP_STAGE selects which env file to load and which app-only behaviours apply.
  loadEnv(appStage);
}

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

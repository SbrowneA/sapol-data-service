// FIXME add types for custom-env
// @ts-ignore
import { env as loadEnv } from 'custom-env';
import { z } from 'zod';

process.env.APP_STAGE = process.env.APP_STAGE || 'local';

const isProduction = process.env.APP_STAGE === 'prod';
const isDevelop = process.env.APP_STAGE === 'dev';
const isTesting = process.env.APP_STAGE === 'test';
const isLocalEnv = process.env.APP_STAGE === 'local';

// Assign variables for specified
if (isDevelop) {
  loadEnv()
} else if (isLocalEnv) {
  loadEnv('local');
} else if (isTesting) {
  loadEnv('test');
}
// no isProd > variables will be injected by hosting provider

/**
 * Converts a comma-separated string value into an array of strings
 * e.g.
 * * Input: string - `"this,is,a,test"`
 * * Output: array - `["this", "is", "a", "test"]`
 * @param commaString
 */
const commaStringToArray = (commaString: string) =>
  commaString.split(',').map(subStr => subStr.trim()).filter(subStr => !!subStr)

const mockPathSchema = z.object({
  SCRAPED: z.string().startsWith('/').endsWith('.html'),
  SUCCESS: z.string().startsWith('/').endsWith('.html'),
  ERROR: z.string().startsWith('/').endsWith('.html'),
  SIMPLE: z.string().startsWith('/').endsWith('.html'),
})

const requestOptionsSchema = z.object({
  path: z.string().startsWith('/'),
  host: z.string(),
  protocol: z.enum(['https:', 'http:']),
})

// define the env schema
const envSchema = z.object({
  // Environment
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  APP_STAGE: z.enum(['dev', 'test', 'prod', 'local']).default('local'),
  // Server
  API_URL: z.string().startsWith('http://', 'https://'),
  PORT: z.coerce.number().positive().default(3000),
  CORS_ORIGINS: z.string().transform(commaStringToArray).pipe(z.string().array()),
  SAPOL_LOCATIONS_URL: z.string().startsWith('https://'),
  // SAPOL
  // JSON object string
  SAPOL_LOCATIONS_REQUEST_OPTS: z.string().transform((str) => JSON.parse(str)).pipe(requestOptionsSchema),
  SAPOL_MOCK_RESPONSE_FILE_PATHS: z.string().transform((str) => JSON.parse(str)).pipe(mockPathSchema),
  // todo
  // SAPOL_GET_EXPIATION_DATA_ENDPOINT: z.string().startsWith('https://'),
  // JSON object string
  SAPOL_MOCK_RESPONSE_FILE_PATHS: z.string().transform((str) => JSON.parse(str)).pipe(mockPathSchema),
  REQUEST_TIMEOUT: z.coerce.number().default(60_000)
});

// Type for the validated environment
export type Env = z.infer<typeof envSchema>
// export verified env

let env: Env;
try {
  env = envSchema.parse(process.env);
} catch (err) {
  if (err instanceof z.ZodError) {
    console.warn('Invalid env variables');
    console.error(JSON.stringify(z.treeifyError(err), null, 2));
    err.issues.forEach(e => {
      const path = e.path.join('.');
      console.log(`${path}: ${e.message}`);
    });

    // Kill process
    process.exit(1);
  }
  else {
    throw err;
  }
}

// export validated env
export { env };

// global variables once env has been validated
export const isProd = env.APP_STAGE === 'prod';
export const isDev = env.APP_STAGE === 'dev';
export const isLocal = env.APP_STAGE === 'local';
export const isTest = env.APP_STAGE === 'test';
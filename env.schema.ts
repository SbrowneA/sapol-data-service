import { z } from 'zod';

import { RequestMethodEnum } from './src/schemas/domain/request-method.enum.ts';
import { appStage } from './app-stage.ts';

const isLocalEnv = appStage === 'local';

/**
 * Converts a comma-separated string value into an array of strings
 * e.g.
 * * Input: string - `"this,is,a,test"`
 * * Output: array - `["this", "is", "a", "test"]`
 * @param commaString
 */
const commaStringToArray = (commaString: string) =>
  commaString.split(',').map((subStr) => subStr.trim()).filter((subStr) => !!subStr);

const mockPathSchema = z.object({
  SCRAPED: z.string().startsWith('/').endsWith('.html'),
  SUCCESS: z.string().startsWith('/').endsWith('.html'),
  ERROR: z.string().startsWith('/').endsWith('.html'),
  SIMPLE: z.string().startsWith('/').endsWith('.html'),
});

const requestOptionsSchema = z.object({
  path: z.string().startsWith('/'),
  host: z.string(),
  protocol: z.enum(['https:']),
});

const apiUrlSchema = z.string().refine((value) => {
  if (value.startsWith('https://')) {
    return true;
  }

  return isLocalEnv && value.startsWith('http://');
}, {
  message: 'API_URL must use https unless APP_STAGE is local',
});

// Environment schema after APP_STAGE/NODE_ENV normalisation.
export const envSchema = z.object({
  // App-specific deployment stage. This is the primary operator-facing flag.
  APP_STAGE: z.enum(['dev', 'test', 'prod', 'local']).default('local'),
  // Standard Node runtime mode. May be set explicitly in env files, otherwise
  // it is derived from APP_STAGE during startup.
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  // Server
  API_URL: apiUrlSchema,
  // how long api responses should be cached by client (seconds)
  API_CACHE_DURATION_S: z.coerce.number().default(60),
  PORT: z.coerce.number().positive().default(3000),
  CORS_ORIGINS: z.string().transform(commaStringToArray).pipe(z.string().array()),
  CRON_API_KEYS: z.string().transform(commaStringToArray).pipe(z.string().array()),
  CRON_ALLOWED_METHODS: z.string().transform(commaStringToArray).pipe(RequestMethodEnum.array()),
  REQUEST_TIMEOUT: z.coerce.number().default(60_000),
  RATE_LIMIT_REQUESTS: z.coerce.number().default(100),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(300_000),
  // DB - Supabse
  NEXT_PUBLIC_SUPABASE_URL: z.string().startsWith('https://').endsWith('supabase.co'),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(10),
  PRIVATE_SUPABASE_NODE_SERVICE_KEY: z.string().min(10),
  // SAPOL
  // JSON object string
  SAPOL_LOCATIONS_REQUEST_OPTS: z.string().transform((str) => JSON.parse(str)).pipe(requestOptionsSchema),
  SAPOL_MOCK_RESPONSE_FILE_PATHS: z.string().transform((str) => JSON.parse(str)).pipe(mockPathSchema),
  // favoring using mock HTML over making reques
  USE_MOCK_HTML: z.transform((v): boolean => v !== 'false').default(false),
  IS_PROD: z.boolean().default(false),
  IS_LOCAL: z.boolean().default(false),
  IS_DEV: z.boolean().default(false),
  IS_TEST: z.boolean().default(false)
});

// Type for the validated environment
export type Env = z.infer<typeof envSchema>;

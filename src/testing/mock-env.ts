import { Env } from '../../env.schema.ts';

export const mockEnv: Env = {
  APP_STAGE: 'test',
  NODE_ENV: 'test',

  API_URL: 'https://api.test.com',
  API_CACHE_DURATION_S: 60,
  PORT: 3000,

  CORS_ORIGINS: ['http://localhost:3000'],
  CRON_API_KEYS: ['cron-test-key'],
  CRON_ALLOWED_METHODS: ['GET'],

  REQUEST_TIMEOUT: 60000,
  RATE_LIMIT_REQUESTS: 100,
  RATE_LIMIT_WINDOW_MS: 300000,

  NEXT_PUBLIC_SUPABASE_URL: 'https://test.supabase.co',
  NEXT_PUBLIC_SUPABASE_ANON_KEY: 'anon-test-key',
  PRIVATE_SUPABASE_NODE_SERVICE_KEY: 'service-test-key',

  SAPOL_LOCATIONS_REQUEST_OPTS: {
    path: '/test-sapol',
    host: 'example.com',
    protocol: 'https:',
  },

  SAPOL_MOCK_RESPONSE_FILE_PATHS: {
    SCRAPED: '/scraped.html',
    SUCCESS: '/success.html',
    ERROR: '/error.html',
    SIMPLE: '/simple.html',
  },

  USE_MOCK_HTML: false,

  IS_PROD: false,
  IS_DEV: false,
  IS_LOCAL: false,
  IS_TEST: true,
};

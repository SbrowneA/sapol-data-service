import express from 'express';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

import cors from 'cors';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import morgan from 'morgan';

import { env, isLocal, isTest } from '../env.ts';

const app = express();

/**
 * Set-up global middleware
 */
app.use(rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  // requests per IP
  limit: () => env.RATE_LIMIT_REQUESTS,
  skip: () => (isLocal || isTest)
}));

app.use(helmet());
app.use(cors({ origin: env.CORS_ORIGINS }));
// Parse Request body to JSON object
app.use(express.json());
// Helps handle query strings
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev', { skip: () => isTest }));
// serve static files
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log(`Public (static) files dir: ${__dirname}\\public`);
app.use(express.static(path.join(__dirname, 'public')));

export default app;

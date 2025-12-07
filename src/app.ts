import express from 'express';
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan"

import { env, isTest } from '../env.ts'

const app = express();

/**
 * Set-up global middleware
 */
app.use(helmet());
app.use(cors({origin: env.CORS_ORIGINS}));
// Parse Request body to JSON object
app.use(express.json());
// Helps handle query strings
app.use(express.urlencoded({extended: true}));
app.use(morgan('dev', { skip: () => isTest }));

app.listen(env.PORT, () =>{
  console.log(`Server running on ${env.API_URL}:${env.PORT}`);
});

export default app;

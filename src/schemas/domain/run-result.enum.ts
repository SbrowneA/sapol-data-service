import { z } from 'zod';

export const RunResultEnum = z.enum(['SUCCESS', 'FAIL', 'PENDING']);

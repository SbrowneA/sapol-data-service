import type { Request, Response } from 'express';

import app from './app.ts';
import apiLocationsRoutes from './routes/api-locations.routes.ts';
import testingRoutes from './routes/testing-routes.ts';
import { env, isLocal } from '../env.ts';

app.get('/health', (req: Request, res: Response) => {
  res.send(`App is running - uptime: ${process.uptime()}s`);
});

if (isLocal) {
  // only expose routes if developing locally
  app.use('/test', testingRoutes);
}
app.use('/api/camera-locations', apiLocationsRoutes);

app.get('/', (req: Request, res: Response) => {
  res.redirect(302, '/health');
});

// catch all route
app.get('/*splat', (req: Request, res: Response) => {
  res.status(404).json({ message: '404: Not Found' });
});

app.listen(env.PORT, () => {
  console.log(`Server running on ${env.API_URL}:${env.PORT}`);
});

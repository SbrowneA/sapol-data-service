import type { Response } from 'express';

import app from './app.ts';
import apiLocationsRoutes from './routes/api-locations.routes.ts';
import testingRoutes from './routes/testing-routes.ts';
import { isLocal } from '../env.ts';

app.get('/health', (res: Response) => {
  res.send(`App is running - uptime: ${process.uptime()}s`);
});

if (isLocal) {
  // only expose routes if developing locally
  app.use('/test', testingRoutes);
}
app.use('/api/camera-locations', apiLocationsRoutes);

app.get('/', (res: Response) => {
  res.redirect(300, '/health');
});
// catch all route
app.get('/*splat', (res: Response) => {
  res.status(404).json({ message: '404: Not Found' });
});

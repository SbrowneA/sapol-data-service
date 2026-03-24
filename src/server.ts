import type { Request, Response } from 'express';

import app from './app.ts';
import apiLocationsRoutes from './routes/api-locations.routes.ts';
import testingRoutes from './routes/testing-routes.ts';
import viewsRoutes from './routes/views.routes.ts';
import normalisationRoutes from './routes/data-normalisation-routes.ts';
import testDbRoutes from './routes/test-db-routes.ts';

app.get('/health', (req: Request, res: Response) => {
  res.send(`App is running - uptime: ${process.uptime()}s`);
});

// other subdirectories
app.use('/test', testingRoutes);
app.use('/normalise', normalisationRoutes);
app.use('/test-db', testDbRoutes);
app.use('/api/camera-locations', apiLocationsRoutes);

app.use('/', viewsRoutes);

// catch all route
app.get('/*splat', (req: Request, res: Response) => {
  res.status(404).json({ message: '404: Not Found' });
});

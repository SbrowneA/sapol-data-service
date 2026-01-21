import type {Request, Response } from 'express';

import app from "./app.ts";
import testingRoutes from "./routes/testing-routes.ts";
import viewsRoutes from "./routes/views.routes.ts";

app.get('/health', (req: Request, res: Response) => {
  res.send(`App is running - uptime: ${process.uptime()}s`);
})

// other subdirectories
app.use('/test', testingRoutes);

app.use('/', viewsRoutes);

// catch all route
app.get('/*splat', (req: any, res: any) => {
  res.status(404).json({message: '404: Not Found'});
})

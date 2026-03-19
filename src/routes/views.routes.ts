import { Router } from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import helmet from 'helmet';

const viewsRoutes = Router();

viewsRoutes.get('/',
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'"],
      workerSrc: ["'self'", 'blob:'], // allow MapLibre Web Workers
      connectSrc: ["'self'", 'https://api.maptiler.com'],
      imgSrc: ["'self'", 'data:', 'https://api.maptiler.com'],
      fontSrc: ["'self'", 'data:'],
      objectSrc: ["'none'"]
    }
  }),
  (req, res) => {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const filePath = path.join(__dirname, '../public/html/map.html');
    res.sendFile(filePath);
  });

export default viewsRoutes;

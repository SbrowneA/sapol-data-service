import {Router} from 'express';
import path from "node:path";
import {fileURLToPath} from "node:url";
import helmet from "helmet";

const viewsRoutes = Router();

viewsRoutes.get('/',
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      workerSrc: ["'self'", "blob:"], // allow MapLibre Web Workers
      styleSrc: ["'self'", "'unsafe-inline'"], // allow MapLibre CSS
      'connect-src': ["'self'", "https://demotiles.maplibre.org"],
      imgSrc: ["'self'", "data:"],
      fontSrc: ["'self'", "data:"],
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
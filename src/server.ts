import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import compression from 'compression';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

const serverDistFolder = dirname(fileURLToPath(import.meta.url));
const browserDistFolder = resolve(serverDistFolder, '../browser');

const app = express();

// ======= PRODUCTION MIDDLEWARE =======
app.use(compression());
app.use(helmet({
  contentSecurityPolicy: false, // Configure based on your app needs
}));
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
}));

// Static files with cache control
app.use(express.static(browserDistFolder, {
  maxAge: '1y',
  index: false,
  redirect: false,
}));

const angularApp = new AngularNodeAppEngine();

// SSR Rendering with error handling
app.use('/**', (req, res, next) => {
  angularApp
    .handle(req)
    .then((response) =>
      response ? writeResponseToNodeResponse(response, res) : next(),
    )
    .catch((err) => {
      console.error('SSR Error:', err);
      res.status(500).send('Server Error');
    });
});

// Start server
if (isMainModule(import.meta.url)) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });
}

export const reqHandler = createNodeRequestHandler(app);
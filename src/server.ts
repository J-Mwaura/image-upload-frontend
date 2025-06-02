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
// Compression (gzip)
app.use(compression({
  level: 6,            // Optimal compression level
  threshold: '10kb',   // Only compress responses >10kb
}));

// Security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://code.jquery.com",
        "https://cdn.jsdelivr.net"],
      styleSrc: ["'self'", "'unsafe-inline'",
        "https://fonts.googleapis.com",
        "https://fonts.gstatic.com",
        "https://cdn.jsdelivr.net"],
      imgSrc: ["'self'", "data:", "https://storage.googleapis.com"],
      connectSrc: ["'self'", "http://localhost:8080",
        "https://revenue-backend-bf7e5e6a786a.herokuapp.com"
      ],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"]
    }
  },
  hsts: {
    maxAge: 63072000,  // 2 years in seconds
    includeSubDomains: true,
    preload: true
  }
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,                 // Limit each IP to 100 requests
  standardHeaders: true,    // Return rate limit info in headers
  legacyHeaders: false,     // Disable X-RateLimit headers
  message: 'Too many requests, please try again later.'
});
app.use(limiter);

// Static files with cache control
app.use(express.static(browserDistFolder, {
  maxAge: '1y',
  index: false,
  redirect: false,
  setHeaders: (res, path) => {
    if (path.endsWith('.html')) {
      res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
    }
  }
}));

const angularApp = new AngularNodeAppEngine();

// SSR Rendering with enhanced error handling
app.use('/**', (req, res, next) => {
  const startTime = Date.now();

  angularApp
    .handle(req)
    .then((response) => {
      if (response) {
        console.log(`SSR rendered in ${Date.now() - startTime}ms`);
        writeResponseToNodeResponse(response, res);
      } else {
        next();
      }
    })
    .catch((err) => {
      console.error('SSR Error:', err);
      if (!res.headersSent) {
        res.status(500).send(`
          <!DOCTYPE html>
          <html>
            <head><title>Server Error</title></head>
            <body>
              <h1>500 Server Error</h1>
              <p>Please try again later</p>
            </body>
          </html>
        `);
      }
    });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy' });
});

// Start server
if (isMainModule(import.meta.url)) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
    console.log(`Serving static files from: ${browserDistFolder}`);
  });
}

export const reqHandler = createNodeRequestHandler(app);
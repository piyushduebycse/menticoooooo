import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function vercelApiDevPlugin() {
  return {
    name: 'vercel-api-dev-middleware',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url.startsWith('/api/')) {
          return next();
        }

        const urlParts = req.url.split('?');
        const urlPath = urlParts[0].replace(/^\/api\//, '');
        let filePath = path.resolve(__dirname, 'api', `${urlPath}.js`);
        let routeQuery = {};

        // Parse query params
        if (urlParts[1]) {
          const searchParams = new URLSearchParams(urlParts[1]);
          routeQuery = Object.fromEntries(searchParams.entries());
        }

        // Support dynamic serverless routes e.g. api/pdf/[bookId].js
        if (!fs.existsSync(filePath)) {
          const segments = urlPath.split('/');
          if (segments.length === 2 && segments[0] === 'pdf') {
            const dynamicPath = path.resolve(__dirname, 'api', 'pdf', '[bookId].js');
            if (fs.existsSync(dynamicPath)) {
              filePath = dynamicPath;
              routeQuery.bookId = segments[1];
            }
          }
        }

        req.query = { ...(req.query || {}), ...routeQuery };

        try {
          // Parse JSON body for incoming requests
          if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
            const buffers = [];
            for await (const chunk of req) {
              buffers.push(chunk);
            }
            req.rawBody = Buffer.concat(buffers);
            const rawBody = req.rawBody.toString();
            try {
              req.body = rawBody ? JSON.parse(rawBody) : {};
            } catch {
              req.body = rawBody;
            }
          }

          // Add Vercel Serverless Function helper methods to response
          res.status = function (code) {
            res.statusCode = code;
            return res;
          };
          res.json = function (data) {
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(data));
            return res;
          };

          const module = await server.ssrLoadModule(filePath);
          if (typeof module.default === 'function') {
            await module.default(req, res);
          } else {
            res.status(404).json({ error: `Handler not found in api/${urlPath}.js` });
          }
        } catch (err) {
          console.error(`[API Dev Server Error at /api/${urlPath}]:`, err.message);
          if (!res.writableEnded) {
            res.status(500).json({ error: err.message });
          }
        }
      });
    },
  };
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load full .env variables into process.env for local API development
  const env = loadEnv(mode, process.cwd(), '');
  Object.assign(process.env, env);

  return {
    plugins: [react(), vercelApiDevPlugin()],
    build: {
      target: 'es2020',
      cssCodeSplit: true,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.includes('pdfjs-dist')) {
                return 'vendor-pdfjs';
              }
              if (id.includes('firebase')) {
                return 'vendor-firebase';
              }
              if (id.includes('lucide-react')) {
                return 'vendor-icons';
              }
              if (id.includes('react-dom') || id.includes('react-router-dom') || id.includes('/react/')) {
                return 'vendor-react';
              }
            }
          },
        },
      },
      chunkSizeWarningLimit: 800,
    },
    server: {
      port: 5173,
      host: '127.0.0.1',
    },
  };
});

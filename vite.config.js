import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';
import path from 'path';
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

        const urlPath = req.url.split('?')[0].replace(/^\/api\//, '');
        const filePath = path.resolve(__dirname, 'api', `${urlPath}.js`);

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
    server: {
      port: 5173,
      host: '127.0.0.1',
    },
  };
});

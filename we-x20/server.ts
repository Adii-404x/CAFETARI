import express from 'express';
import http from 'http';
import path from 'path';
import { app } from './server/app';
import { initSocketIO } from './server/socket';
import { connectMongoDB } from './server/mongodb';
import { db } from './server/db';

async function startServer() {
  const PORT = Number(process.env.PORT || 3000);
  const httpServer = http.createServer(app);

  // Initialize Real-time WebSockets
  initSocketIO(httpServer);

  // Initialize persistent database connection
  connectMongoDB()
    .then(connected => {
      if (connected) {
        db.syncWithMongo();
      }
    })
    .catch(err => {
      console.warn('MongoDB connection process encountered a non-fatal error:', err);
    });

  // ==========================================
  // Client Static Asset Serving & SPA Fallback
  // ==========================================
  if (process.env.NODE_ENV !== 'production') {
    // Development mode: Vite middleware handles client HMR & TypeScript/JSX bundling
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    // Production mode: Serve compiled frontend distribution assets
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 CafeteriaAI Server running at http://0.0.0.0:${PORT}`);
    console.log(`📡 API routes mounted under /api/`);
    console.log(`⚡ Real-Time Socket.IO server listening on port ${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Fatal server startup error:', err);
  process.exit(1);
});

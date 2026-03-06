import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import rateLimit from "express-rate-limit";
import { registerOAuthRoutes } from "./oauth";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import { handleWebhookEvent } from "../stripe";
import { registerUploadRoutes } from "../upload";

// ── Rate limiters ─────────────────────────────────────────────────────────────
// General API: 120 requests per minute per IP
const trpcLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 120,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: {
    error: "Too many requests. Please slow down and try again in a minute.",
  },
  skip: req => process.env.NODE_ENV === "test" || req.ip === "127.0.0.1",
});

// Upload endpoint: stricter 20 requests per minute per IP (prevents DoS via large uploads)
const uploadLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: {
    error: "Upload rate limit exceeded. Maximum 20 uploads per minute allowed.",
  },
  skip: req => process.env.NODE_ENV === "test" || req.ip === "127.0.0.1",
});

// Auth brute-force protection: 10 attempts per 15 minutes per IP
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: {
    error: "Too many authentication attempts. Please try again in 15 minutes.",
  },
  skip: () => process.env.NODE_ENV === "test",
});

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const app = express();
  const server = createServer(app);
  // ⚠️ Stripe webhook MUST be registered BEFORE express.json() to preserve raw body
  app.post(
    "/api/stripe/webhook",
    express.raw({ type: "application/json" }),
    async (req, res) => {
      const sig = req.headers["stripe-signature"] as string;
      try {
        const result = await handleWebhookEvent(req.body as Buffer, sig);
        res.json(result);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Webhook error";
        console.error("[Stripe Webhook Error]", message);
        res.status(400).json({ error: message });
      }
    }
  );

  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  // File upload routes (multipart/form-data) — rate limited to 20/min
  app.use("/api/upload", uploadLimiter);
  registerUploadRoutes(app);
  // OAuth callback — brute-force protected
  app.use("/api/oauth", authLimiter);
  registerOAuthRoutes(app);
  // tRPC API — rate limited to 120/min
  app.use(
    "/api/trpc",
    trpcLimiter,
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);

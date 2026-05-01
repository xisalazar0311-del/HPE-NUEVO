/**
 * proxy.js  — Proxy seguro hacia LM Studio
 *
 * CAMBIOS VS VERSIÓN ORIGINAL:
 *  1. Requiere cabecera  X-API-Key: <PROXY_SECRET>  en cada petición
 *  2. CORS restringido a tu dominio (configura ALLOWED_ORIGINS en .env)
 *  3. Rate-limit básico: máx 30 peticiones por minuto por IP
 *  4. Solo escucha en 127.0.0.1 — no exponer el puerto 8080 al internet;
 *     que Nginx/Caddy haga el forward interno.
 */

require('dotenv').config();
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = 8080;
const LM_STUDIO_URL = process.env.LM_STUDIO_URL || 'http://localhost:1234';
const PROXY_SECRET   = process.env.PROXY_SECRET;   // define esto en .env

if (!PROXY_SECRET) {
  console.error('❌ PROXY_SECRET no está definido en .env. El proxy no iniciará.');
  process.exit(1);
}

// ─── CORS ──────────────────────────────────────────────────────────────────
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:5500', 'http://localhost:3000'];

app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    cb(new Error('Origen no permitido'));
  }
}));

// ─── Rate limit ────────────────────────────────────────────────────────────
app.use(rateLimit({
  windowMs: 60 * 1000,   // 1 minuto
  max: 30,               // máx 30 peticiones por IP por minuto
  message: { error: 'Demasiadas peticiones. Espera un momento.' }
}));

// ─── Autenticación por API Key ─────────────────────────────────────────────
app.use((req, res, next) => {
  const key = req.headers['x-api-key'];
  if (!key || key !== PROXY_SECRET) {
    return res.status(403).json({ error: 'API Key inválida o ausente' });
  }
  next();
});

// ─── Proxy hacia LM Studio ────────────────────────────────────────────────
app.use('/', createProxyMiddleware({
  target: LM_STUDIO_URL,
  changeOrigin: true,
  on: {
    error: (err, req, res) => {
      console.error('Error de proxy:', err.message);
      res.status(502).json({ error: 'LM Studio no disponible' });
    }
  }
}));

// ─── Solo escuchar en localhost ────────────────────────────────────────────
app.listen(PORT, '127.0.0.1', () => {
  console.log(`✅ Proxy seguro en http://127.0.0.1:${PORT} → ${LM_STUDIO_URL}`);
  console.log(`   Requiere cabecera: X-API-Key: <PROXY_SECRET>`);
});
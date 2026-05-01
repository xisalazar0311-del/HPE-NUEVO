const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');
const app = express();
app.use(cors());
app.use('/', createProxyMiddleware({ target: 'http://localhost:1234', changeOrigin: true }));
app.listen(8080, () => console.log('Proxy CORS en 8080 → LM Studio 1234'));
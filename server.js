const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// ─── CORS: solo permite tu dominio en producción ───────────────────────────
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:3000', 'http://localhost:5500']; // ajusta en .env

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error('Origen no permitido por CORS'));
  }
}));
app.use(express.json({ limit: '10kb' })); // evita payloads gigantes

// ─── MongoDB ───────────────────────────────────────────────────────────────
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/techcore_auth';

mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ Conectado a MongoDB'))
  .catch(err => { console.error('❌ Error de conexión a MongoDB:', err); process.exit(1); });

// ─── Modelo de Usuario ─────────────────────────────────────────────────────
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  nombre: { type: String, default: '' },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  createdAt: { type: Date, default: Date.now },
  lastLogin: { type: Date }
});

const User = mongoose.model('User', userSchema);

// ─── Helper: generar JWT ───────────────────────────────────────────────────
function generateToken(user) {
  if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET no definido en .env');
  return jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '8h' }
  );
}

// ─── Middleware: verificar JWT ─────────────────────────────────────────────
function requireAuth(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') && authHeader.slice(7);
  if (!token) return res.status(401).json({ success: false, message: 'Token requerido' });

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ success: false, message: 'Token inválido o expirado' });
  }
}

// ─── Middleware: solo admins ───────────────────────────────────────────────
function requireAdmin(req, res, next) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Acceso denegado' });
  }
  next();
}

// ═══════════════════════════════════════════════════════════════════════════
//  RUTAS PÚBLICAS
// ═══════════════════════════════════════════════════════════════════════════

// POST /api/register
app.post('/api/register', async (req, res) => {
  try {
    const { email, password, nombre } = req.body;

    if (!email || !password)
      return res.status(400).json({ success: false, message: 'Email y contraseña son requeridos' });

    if (password.length < 8)
      return res.status(400).json({ success: false, message: 'La contraseña debe tener al menos 8 caracteres' });

    const emailRegex = /^[^\s@]+@([^\s@]+\.)+[^\s@]+$/;
    if (!emailRegex.test(email))
      return res.status(400).json({ success: false, message: 'Formato de email inválido' });

    if (await User.findOne({ email }))
      return res.status(400).json({ success: false, message: 'Este email ya está registrado' });

    const hashedPassword = await bcrypt.hash(password, 12); // 12 rounds en producción

    await new User({
      email,
      password: hashedPassword,
      nombre: nombre || email.split('@')[0]
    }).save();

    res.status(201).json({ success: true, message: 'Usuario registrado exitosamente' });
  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ success: false, message: 'Error del servidor' });
  }
});

// POST /api/login
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ success: false, message: 'Email y contraseña son requeridos' });

    const user = await User.findOne({ email });

    // Siempre comparar aunque no exista el usuario (evitar timing attacks)
    const dummyHash = '$2a$12$invalidhashfortimingatttackprevention000000000000000000';
    const isValid = user
      ? await bcrypt.compare(password, user.password)
      : await bcrypt.compare(password, dummyHash);

    if (!user || !isValid)
      return res.status(401).json({ success: false, message: 'Email o contraseña incorrectos' });

    user.lastLogin = new Date();
    await user.save();

    const token = generateToken(user);

    res.json({
      success: true,
      message: 'Inicio de sesión exitoso',
      token,                    // ← el frontend guarda esto, NO la auth simple
      email: user.email,
      nombre: user.nombre,
      role: user.role
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ success: false, message: 'Error del servidor' });
  }
});

// ═══════════════════════════════════════════════════════════════════════════
//  RUTAS PROTEGIDAS  (requieren JWT válido)
// ═══════════════════════════════════════════════════════════════════════════

// GET /api/me  — el usuario consulta sus propios datos
app.get('/api/me', requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id, { password: 0 });
    if (!user) return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    res.json({ success: true, user });
  } catch {
    res.status(500).json({ success: false, message: 'Error del servidor' });
  }
});

// GET /api/users  — solo admins pueden ver la lista completa
app.get('/api/users', requireAuth, requireAdmin, async (req, res) => {
  try {
    const users = await User.find({}, { password: 0 });
    res.json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ─── Arrancar servidor ─────────────────────────────────────────────────────
app.listen(PORT, '127.0.0.1', () => {   // solo escucha en localhost; usa Nginx/Caddy como proxy
  console.log(`\n✅ Servidor corriendo en http://127.0.0.1:${PORT}`);
  console.log(`   POST /api/register`);
  console.log(`   POST /api/login`);
  console.log(`   GET  /api/me        (requiere JWT)`);
  console.log(`   GET  /api/users     (requiere JWT + rol admin)\n`);
});
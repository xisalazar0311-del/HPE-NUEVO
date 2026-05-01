

const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Configuración de MongoDB
// Opción 1: MongoDB local
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/techcore_auth';

// Opción 2: MongoDB Atlas (descomenta y usa tu connection string)
// const MONGODB_URI = 'mongodb+srv://<usuario>:<contraseña>@cluster.mongodb.net/techcore_auth';

mongoose.connect(MONGODB_URI)
.then(() => console.log(' Conectado a MongoDB'))
.catch(err => console.error(' Error de conexión a MongoDB:', err));

// Esquema de Usuario
const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    nombre: {
        type: String,
        default: ''
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    lastLogin: {
        type: Date
    }
});

const User = mongoose.model('User', userSchema);

// ============ RUTAS DE LA API ============

// Registro de usuario
app.post('/api/register', async (req, res) => {
    try {
        const { email, password, nombre } = req.body;
        
        // Validaciones
        if (!email || !password) {
            return res.status(400).json({ 
                success: false, 
                message: 'Email y contraseña son requeridos' 
            });
        }
        
        if (password.length < 4) {
            return res.status(400).json({ 
                success: false, 
                message: 'La contraseña debe tener al menos 4 caracteres' 
            });
        }
        
        const emailRegex = /^[^\s@]+@([^\s@]+\.)+[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ 
                success: false, 
                message: 'Formato de email inválido' 
            });
        }
        
        // Verificar si el usuario ya existe
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ 
                success: false, 
                message: 'Este email ya está registrado' 
            });
        }
        
        // Encriptar contraseña
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Crear usuario
        const user = new User({
            email,
            password: hashedPassword,
            nombre: nombre || email.split('@')[0]
        });
        
        await user.save();
        
        res.json({ 
            success: true, 
            message: 'Usuario registrado exitosamente' 
        });
    } catch (error) {
        console.error('Error en registro:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error del servidor durante el registro' 
        });
    }
});

// Inicio de sesión
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({ 
                success: false, 
                message: 'Email y contraseña son requeridos' 
            });
        }
        
        // Buscar usuario
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ 
                success: false, 
                message: 'Email o contraseña incorrectos' 
            });
        }
        
        // Verificar contraseña
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ 
                success: false, 
                message: 'Email o contraseña incorrectos' 
            });
        }
        
        // Actualizar último login
        user.lastLogin = new Date();
        await user.save();
        
        res.json({ 
            success: true, 
            message: 'Inicio de sesión exitoso',
            email: user.email,
            nombre: user.nombre
        });
    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error del servidor durante el login' 
        });
    }
});

// Obtener todos los usuarios (solo para pruebas)
app.get('/api/users', async (req, res) => {
    try {
        const users = await User.find({}, { password: 0 });
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`\n Servidor corriendo en http://localhost:${PORT}`);
    console.log(` Endpoints disponibles:`);
    console.log(`   POST http://localhost:${PORT}/api/register`);
    console.log(`   POST http://localhost:${PORT}/api/login`);
    console.log(`   GET  http://localhost:${PORT}/api/users\n`);
});
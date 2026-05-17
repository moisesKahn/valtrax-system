require('dotenv').config();
const express = require('express');
const path    = require('path');
const app     = express();
const PORT    = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));

// API REST — se monta antes que los estáticos
const apiRouter = require('./routes/api');
app.use('/api', apiRouter);

// Health check para Railway
app.get('/health', (req, res) => res.json({ status: 'ok', app: 'VALTRAX', ts: new Date() }));

// Servir archivos estáticos desde la raíz del proyecto
app.use(express.static(path.join(__dirname)));

// Cualquier ruta no encontrada → index.html (SPA fallback)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Iniciar servidor — conectar MySQL primero si está disponible
async function start() {
    // Si hay variables de MySQL configuradas, inicializar DB
    if (process.env.MYSQLHOST || process.env.DATABASE_URL) {
        try {
            const { initDB } = require('./db');
            await initDB();
            console.log('🗄️  MySQL conectado');
        } catch (e) {
            console.warn('⚠️  MySQL no disponible, modo solo-local:', e.message);
        }
    } else {
        console.log('ℹ️  Sin MySQL configurado — modo localStorage');
    }
    app.listen(PORT, () => {
        console.log(`🚀 VALTRAX corriendo en http://localhost:${PORT}`);
    });
}

start();

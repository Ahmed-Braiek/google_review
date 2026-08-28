const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const healthRoutes = require('./routes/health.routes');
const authRoutes = require('./routes/auth.routes');
const storeRoutes = require('./routes/store.routes');
const gameRoutes = require('./routes/game.routes');
const prizeRoutes = require('./routes/prize.routes');
const publicRoutes =require('./routes/public.routes');
const couponRoutes =
    require('./routes/coupon.routes');
const dashboardRoutes =
    require('./routes/dashboard.routes');    
    const userRoutes =
    require('./routes/user.routes');

const app = express();

app.use(helmet());

app.use(cors({
    origin: '*'
}));

app.use(express.json());
app.use(express.urlencoded({
    extended: true
}));

app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Google Review Gamification SaaS API',
        version: '1.0.0'
    });
});

app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/stores', storeRoutes);
app.use('/api/games', gameRoutes);
app.use('/api/prizes', prizeRoutes);
app.use(
    '/api/public',
    publicRoutes
);
app.use(
    '/api/coupons',
    couponRoutes
);

app.use(
    '/api/dashboard',
    dashboardRoutes
);

app.use(
    '/api/users',
    userRoutes
);

app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

module.exports = app;
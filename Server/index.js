const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const lostItemRoutes = require('./routes/lostItemRoutes');
const discoveryRoutes = require('./routes/discoveryRoutes');

dotenv.config();

const app = express();

// Middleware
// app.use(cors());

const allowedOrigins = [
    'https://lostify-git-main-adityasharmaas813-5253s-projects.vercel.app',
    'https://lostify-hazel.vercel.app',
    'http://localhost:5173',
    'http://localhost:3000',
    'https://lostify.vercel.app'
];

app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/user', userRoutes);
app.use('/api/lost', lostItemRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/discovery', discoveryRoutes);

// Catch-all for 404s
app.use((req, res) => {
    res.status(404).send('Not Found');
});

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.log('MongoDB Connection Error:', err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

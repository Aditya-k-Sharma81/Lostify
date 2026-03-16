const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const lostItemRoutes = require('./routes/lostItemRoutes');
const discoveryRoutes = require('./routes/discoveryRoutes');

const dotenv = require('dotenv');
dotenv.config();

const app = express();

// Middleware
// app.use(cors());

const allowedOrigins = [
    'https://lostify-hazel.vercel.app',
    'https://lostify.vercel.app',
    /https:\/\/lostify-.*-adityasharma.*\.vercel\.app$/, // Allow all Vercel previews for this project
    'http://localhost:5173',
    'http://localhost:3000'
];

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);

        const isAllowed = allowedOrigins.some(allowed => {
            if (allowed instanceof RegExp) {
                return allowed.test(origin);
            }
            return allowed === origin;
        });

        if (isAllowed) {
            callback(null, true);
        } else {
            console.warn('CORS blocked origin:', origin);
            // Return false instead of an Error to allow the response to proceed 
            // with headers (though origin will be blocked by browser)
            callback(null, false);
        }
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: true
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

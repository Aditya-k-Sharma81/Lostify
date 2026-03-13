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

/* ===============================
   CORS CONFIGURATION
================================= */

const allowedOrigins = [
    "https://lostify.vercel.app",
    "https://lostify-hazel.vercel.app",
    "https://lostify-git-main-adityasharmaas813-5253s-projects.vercel.app",
    "http://localhost:5173",
    "http://localhost:3000"
];

app.use(cors({
    origin: function (origin, callback) {

        // allow requests with no origin (mobile apps / curl)
        if (!origin) return callback(null, true);

        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        } else {
            return callback(null, true);
            // production me error throw kar sakte ho
        }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true
}));

// Preflight request handle
app.options("*", cors());

/* ===============================
   MIDDLEWARE
================================= */

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static folder for uploads
app.use('/uploads', express.static('uploads'));

/* ===============================
   ROUTES
================================= */

app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/lost', lostItemRoutes);
app.use('/api/discovery', discoveryRoutes);

/* ===============================
   ROOT ROUTE (FOR TEST)
================================= */

app.get("/", (req, res) => {
    res.json({
        message: "Lostify Backend Running Successfully 🚀"
    });
});

/* ===============================
   404 HANDLER
================================= */

app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "Route Not Found"
    });
});

/* ===============================
   DATABASE CONNECTION
================================= */

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => {
        console.log("MongoDB Connected Successfully");
    })
    .catch((err) => {
        console.log("MongoDB Connection Error:", err);
    });

/* ===============================
   SERVER
================================= */

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
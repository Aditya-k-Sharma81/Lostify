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



app.use(cors());


app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static folder for uploads
app.use('/uploads', express.static('uploads'));



app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/lost', lostItemRoutes);
app.use('/api/discovery', discoveryRoutes);



app.get("/", (req, res) => {
    res.json({
        message: "Lostify Backend Running Successfully 🚀"
    });
});



app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "Route Not Found"
    });
});



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


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
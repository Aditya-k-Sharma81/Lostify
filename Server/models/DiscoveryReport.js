const mongoose = require('mongoose');

const discoveryReportSchema = new mongoose.Schema({
    reporter: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    lostItem: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'LostItem',
        required: true
    },
    discoveryDate: {
        type: Date,
        required: true
    },
    discoveryLocation: {
        type: String,
        required: true
    },
    discoveryDesc: {
        type: String,
        required: true
    },
    discoveryPhotos: [{
        type: String, // Cloudinary URLs
        required: true
    }],
    similarityScore: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected'],
        default: 'pending'
    }
}, { timestamps: true });

module.exports = mongoose.model('DiscoveryReport', discoveryReportSchema);

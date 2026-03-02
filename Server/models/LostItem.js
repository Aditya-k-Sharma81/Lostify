const mongoose = require('mongoose');

const lostItemSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    itemName: {
        type: String,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    dateLost: {
        type: Date,
        required: true
    },
    description: {
        type: String
    },
    images: [{
        type: String
    }],
    status: {
        type: String,
        enum: ['lost', 'accepted', 'claimed', 'recovered'],
        default: 'lost'
    }
}, { timestamps: true });

module.exports = mongoose.model('LostItem', lostItemSchema);

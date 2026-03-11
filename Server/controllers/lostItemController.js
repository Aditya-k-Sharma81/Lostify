const LostItem = require('../models/LostItem');

exports.reportLostItem = async (req, res) => {
    try {
        const { itemName, location, dateLost, description, name, phone } = req.body;

        if (!itemName || !location || !dateLost) {
            return res.status(400).json({ message: 'Item name, location, and date are required' });
        }

        const imageUrls = req.files ? req.files.map(file => file.path) : [];

        const newLostItem = new LostItem({
            user: req.user,
            name,
            phone,
            itemName,
            location,
            dateLost,
            description,
            images: imageUrls
        });

        await newLostItem.save();

        res.status(201).json({
            message: 'Lost item reported successfully',
            item: newLostItem
        });
    } catch (err) {
        console.error('Error reporting lost item:', err);
        res.status(500).json({ message: 'Server error while reporting lost item' });
    }
};

exports.getLostItems = async (req, res) => {
    try {
        const items = await LostItem.find().sort({ createdAt: -1 }).populate('user', 'name profilePic email phone');
        res.json(items);
    } catch (err) {
        console.error('Error fetching lost items:', err);
        res.status(500).json({ message: 'Server error while fetching items' });
    }
};

exports.getMyLostItems = async (req, res) => {
    try {
        const items = await LostItem.find({ user: req.user }).sort({ createdAt: -1 });
        res.json(items);
    } catch (err) {
        console.error('Error fetching my lost items:', err);
        res.status(500).json({ message: 'Server error while fetching your items' });
    }
};

exports.deleteLostItem = async (req, res) => {
    try {
        const item = await LostItem.findById(req.params.id);

        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }

        // Check user
        if (item.user.toString() !== req.user) {
            return res.status(401).json({ message: 'User not authorized' });
        }

        await item.deleteOne();

        res.json({ message: 'Item removed' });
    } catch (err) {
        console.error('Error deleting lost item:', err);
        res.status(500).json({ message: 'Server error while deleting item' });
    }
};

const User = require('../models/User');

exports.updateProfile = async (req, res) => {
    try {
        const { name, phone, address } = req.body;

        // Find user by ID (from auth middleware)
        const user = await User.findById(req.user);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Update fields
        if (name) user.name = name;
        if (phone) user.phone = phone;
        if (address) user.address = address;

        // Handle profile picture update if a new file is uploaded
        if (req.file) {
            user.profilePic = req.file.path; // Cloudinary path
        }

        await user.save();

        res.json({
            message: 'Profile updated successfully',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                profilePic: user.profilePic,
                phone: user.phone,
                address: user.address
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error during profile update' });
    }
};

exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

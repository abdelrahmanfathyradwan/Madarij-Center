const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Generate JWT Token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'madarij_secret_key_2024', {
        expiresIn: '30d'
    });
};

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'البريد الإلكتروني وكلمة المرور مطلوبان' });
        }

        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            return res.status(401).json({ message: 'بيانات الدخول غير صحيحة' });
        }

        if (!user.isActive) {
            return res.status(401).json({ message: 'الحساب غير مفعل' });
        }

        const isMatch = await user.comparePassword(password);

        if (!isMatch) {
            return res.status(401).json({ message: 'بيانات الدخول غير صحيحة' });
        }

        const token = generateToken(user._id);

        res.json({
            success: true,
            token,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                roleDisplay: user.getRoleDisplayName()
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'حدث خطأ في الخادم' });
    }
});

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).populate('assignedHalqat');
        res.json({
            success: true,
            user: {
                ...user.toObject(),
                roleDisplay: user.getRoleDisplayName()
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'حدث خطأ في الخادم' });
    }
});

// @route   POST /api/auth/logout
// @desc    Logout user (client-side token removal)
// @access  Private
router.post('/logout', protect, (req, res) => {
    res.json({ success: true, message: 'تم تسجيل الخروج بنجاح' });
});

module.exports = router;

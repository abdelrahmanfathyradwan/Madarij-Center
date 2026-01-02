const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes - require authentication
const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'madarij_secret_key_2024');
            req.user = await User.findById(decoded.id).select('-password');

            if (!req.user) {
                return res.status(401).json({ message: 'المستخدم غير موجود' });
            }

            if (!req.user.isActive) {
                return res.status(401).json({ message: 'الحساب غير مفعل' });
            }

            next();
        } catch (error) {
            console.error(error);
            return res.status(401).json({ message: 'غير مصرح - الرمز غير صالح' });
        }
    }

    if (!token) {
        return res.status(401).json({ message: 'غير مصرح - لا يوجد رمز' });
    }
};

// Role-based access control
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({
                message: `الدور ${req.user ? req.user.role : 'غير معروف'} غير مصرح له بالوصول إلى هذا المسار`
            });
        }
        next();
    };
};

module.exports = { protect, authorize };

const { findUserById } = require('../repositories/userRepository.js');

async function requireAdmin(req, res, next) {
    try {
        const userId = req.user.userId
        const user = await findUserById(userId);

        if (!user) {
            return res.status(401).json({ message: "User does not exist" });
        }

        const role = user.role;

        if (role !== "admin") {
            return res.status(403).json({ message: "Admin access required" });
        }

        next();
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ message: "Database error" });
    }
}

module.exports = { requireAdmin }
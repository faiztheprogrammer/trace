const { verifyToken } = require("../utils/token");

function requireAuth(req, res, next) {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ", 0)) {
            return res.status(401).json({ message: "Authentication required" });
        }

        const token = authHeader.slice(7);

        if (!token) {
            return res.status(401).json({ message: "No token found" });
        }

        // Verify the token and get the payload back (e.g., { userId: 1 })
        const tokenVerified = verifyToken(token);

        // Attach it to req.user so downstream controllers can use it
        req.user = tokenVerified;

        next();
    } catch (error) {
        console.error(error.message);
        return res.status(401).json({ message: "Invalid or expired token" });
    }
}

module.exports = { requireAuth }
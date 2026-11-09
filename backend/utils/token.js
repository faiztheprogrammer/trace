const jwt = require('jsonwebtoken');

function generateToken(Id) {
    const token = jwt.sign(
        { userId: Id },
        process.env.JWT_SECRET,
        { algorithm: "HS256", expiresIn: "1h" }
    )
    return token;
}

function verifyToken(token) {
    const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET,
        { algorithms: ["HS256"]}
    );

    return decoded;
}

module.exports = { generateToken, verifyToken }
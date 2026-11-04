const jwt = require('jsonwebtoken');

function generateToken(Id) {
    const token = jwt.sign(
        { userId: Id },
        process.env.JWT_SECRET,
        { algorithm: "HS256", expiresIn: "1h" }
    )
    return token;
}

module.exports = { generateToken }
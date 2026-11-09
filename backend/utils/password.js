const argon2 = require('argon2');

async function hashPassword(password) {
    const hashedPassword = await argon2.hash(password);
    return hashedPassword;
}

async function verifyPassword(storedHash, enteredPassword) {
    const isValid = await argon2.verify(storedHash, enteredPassword);
    return isValid
}

module.exports = { hashPassword, verifyPassword }
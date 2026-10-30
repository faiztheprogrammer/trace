const argon2 = require('argon2');

async function hashPassword(password) {
    const hashedPassword = await argon2.hash(password);
    return hashedPassword;
}

module.exports = { hashPassword }
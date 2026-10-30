const pool = require('../db.js');

async function createUserRepo(email, passwordHash) {
    const result = await pool.query(
        `INSERT INTO users (email, password_hash)
        VALUES ($1, $2) RETURNING id, email`,
        [email, passwordHash]
    );

    return result.rows[0];
}

module.exports = { createUserRepo };
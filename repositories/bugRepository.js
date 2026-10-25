const pool = require('../db.js');

async function findBugById(id) {
    const result = await pool.query(
        "SELECT * FROM bugs WHERE id = $1",
        [id]
    );

    return result.rows[0];
}

module.exports = { findBugById }
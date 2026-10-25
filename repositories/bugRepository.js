const pool = require('../db.js');

async function findBugById(id) {
    const result = await pool.query(
        "SELECT * FROM bugs WHERE id = $1",
        [id]
    );

    return result.rows[0];
}

async function findAllBugs(status) {
    if (!status) {
        const allBugs = await pool.query("SELECT * FROM bugs");
        return allBugs.rows;
    }

    const bugsFilteredByStatus = await pool.query(
        'SELECT * FROM bugs WHERE status = $1',
        [status]
    );
    return bugsFilteredByStatus.rows;
}

async function createBugRepo(title, status) {
    const result = await pool.query(
        "INSERT INTO bugs (title, status) VALUES ($1, $2) RETURNING *",
        [title, status]
    );
    return result.rows[0];
}

async function updateBugRepo(id, status) {
    const result = await pool.query(
        "UPDATE bugs SET status = $1 WHERE id = $2 RETURNING *",
        [status, id]
    );
    return result.rows[0];
}

async function deleteBugRepo(id) {
    const result = await pool.query(
        "DELETE from bugs WHERE id = $1",
        [id]
    );

    return result.rowCount > 0;
}

module.exports = { findBugById, findAllBugs, createBugRepo, updateBugRepo, deleteBugRepo }
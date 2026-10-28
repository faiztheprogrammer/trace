const pool = require('../db.js');

async function findBugById(id) {
    const result = await pool.query(
        `SELECT
            bugs.id,
            bugs.title,
            bugs.status,
            bugs.project_id,
            projects.name AS project_name
        FROM bugs
        LEFT JOIN projects
            ON bugs.project_id = projects.id
            WHERE bugs.id = $1`,
        [id]
    );

    return result.rows[0];
}

async function findAllBugs(status) {
    if (!status) {
        const allBugs = await pool.query(
            `SELECT
                bugs.id,
                bugs.title, 
                bugs.status,
                bugs.project_id, 
                projects.name AS project_name 
            FROM bugs
            LEFT JOIN projects
                ON bugs.project_id = projects.id;`
        );
        return allBugs.rows;
    }

    const bugsFilteredByStatus = await pool.query(
        `Select
            bugs.id,
            bugs.title,
            bugs.status,
            bugs.project_id,
            projects.name AS project_name
        FROM bugs
        LEFT JOIN projects
            ON bugs.project_id = projects.id
            WHERE bugs.status = $1`,
        [status]
    );
    return bugsFilteredByStatus.rows;
}

async function createBugRepo(title, status, projectId) {
    const result = await pool.query(
        "INSERT INTO bugs (title, status, project_id) VALUES ($1, $2, $3) RETURNING *",
        [title, status, projectId]
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
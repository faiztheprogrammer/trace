const pool = require('../db.js');

async function findProjectById(id) {
    const result = await pool.query(
        "SELECT * FROM projects WHERE id = $1",
        [id]
    );

    return result.rows[0];
}

async function findAllProjects() {
    const allProjects = await pool.query(
        "SELECT * FROM projects"
    );
    return allProjects.rows;
}

async function addNewProjectRepo(name) {
    const newProject = await pool.query(
        "INSERT INTO projects (name) VALUES ($1) RETURNING *",
        [name]
    );

    return newProject.rows[0];
}

async function updateProjectNameRepo(id, name) {
    const updatedProjectName = await pool.query(
        "UPDATE projects SET name = $1 WHERE id = $2 RETURNING *",
        [name, id]
    );

    return updatedProjectName.rows[0];
}

module.exports = { findProjectById, findAllProjects, addNewProjectRepo, updateProjectNameRepo }
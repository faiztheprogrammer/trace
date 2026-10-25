const pool = require('../db.js');
const { findBugById } = require('../repositories/bugRepository.js');

const allowedStatuses = ["Open", "In Progress", "Closed"];

async function getBugById(req, res) {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            res.status(400).json({ message: "Invalid input" });
            return;
        }

        const bug = await findBugById(id);

        if(!bug) {
            return res.status(404).json({ message: "Bug not found" });
        }

        return res.json(bug);
        
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ message: "Database query failed" });
    }
}

async function deleteBug(req, res) {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id < 1) {
            return res.status(400).json({ message: "Invalid id" });
        }

        const result = await pool.query(
            "DELETE from bugs WHERE id = $1",
            [id]
        );

        if (result.rowCount > 0) {
            return res.status(204).send();
        }

        return res.status(404).json({ message: "Record not found" });
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ message: "Database query failed" });
    }
}

async function getAllBugs(req, res) {
    try {
        const status = req.query.status;

        if (!status) {
            const allBugs = await pool.query("SELECT * FROM bugs");
            return res.json(allBugs.rows);
        }

        if (!allowedStatuses.includes(status)) {
            res.status(400).json({ message: "Invalid request" });
            return;
        }

        const bugsFilteredByStatus = await pool.query(
            'SELECT * FROM bugs WHERE status = $1',
            [status]
        );

        return res.json(bugsFilteredByStatus.rows);
    } catch (error) {
        console.error(error.message);

        return res.status(500).json({
            message: "Database query failed"
        });
    }
}

async function createBug(req, res) {
    try {
        const newBug = req.body || {};

        if (typeof newBug.title !== 'string' || newBug.title.trim() === "" || !allowedStatuses.includes(newBug.status)) {
            res.status(400).json({ message: "Invalid input" });
            return;
        }

        const result = await pool.query(
            "INSERT INTO bugs (title, status) VALUES ($1, $2) RETURNING *",
            [newBug.title, newBug.status]
        );

        res.status(201).json(result.rows[0]);
        return;
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({ message: "Database query failed for the post request" })
    }
}

async function updateBug(req, res) {
    try {
        const id = Number(req.params.id);
        const incomingBug = req.body || {};
        const status = incomingBug.status;

        if (!Number.isInteger(id) || id <= 0 || !allowedStatuses.includes(status)) {
            res.status(400).json({ message: `Invalid id: "${id}" or status: "${status}"` });
            return;
        }

        const result = await pool.query(
            "UPDATE bugs SET status = $1 WHERE id = $2 RETURNING *",
            [status, id]
        );

        if (result.rowCount < 1) {
            return res.status(404).json({ message: "No record was found" })
        }
        return res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ message: "Database query failed" });
    }
}

module.exports = { getBugById, deleteBug, getAllBugs, createBug, updateBug }
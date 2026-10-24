const express = require("express");
const router = express.Router();
const pool = require('../db.js');

const allowedStatuses = ["Open", "In Progress", "Closed"];

router.get("/", async (req, res) => {
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
});

router.get("/:id", async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            res.status(400).json({ message: "Invalid input" })
            return;
        }

        const result = await pool.query(
            "SELECT * FROM bugs WHERE id = $1",
            [id]
        );

        if (result.rowCount < 1) {
            res.status(404).json({ message: `No record matching id: ${id}` });
            return;
        }

        return res.json(result.rows[0]);
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ message: "Database query failed" });
    }
});

router.post("/", async (req, res) => {
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
});

router.patch("/:id", async (req, res) => {
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
});

router.delete("/:id", async (req, res) => {
    try {
            const id = Number(req.params.id);

    if (!Number.isInteger(id) || id < 1) {
        return res.status(400).json({ message: "Invalid id" });
    }

    const result = await pool.query(
        "DELETE from bugs WHERE id = $1",
        [id]
    );

    if(result.rowCount > 0) {
        return res.status(204).send();
    }

    return res.status(404).json({ message: "Record not found" });
    } catch(error) {
        console.error(error.message);
        return res.status(500).json({ message: "Database query failed" });
    }
});

module.exports = router;
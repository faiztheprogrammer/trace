const express = require("express");
const router = express.Router();
const pool = require('../db.js');

const bugs = [
    {
        id: 1,
        title: "Download certificate button not working",
        status: "Open"
    }, {
        id: 2,
        title: "API response return 500 internal server error",
        status: "In Progress"
    }, {
        id: 3,
        title: "Dashboard failing to load within 10 seconds",
        status: "Open"
    }
];

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

        if(!Number.isInteger(id) || id <= 0) {
            res.status(400).json({ message: "Invalid input" })
            return;
        }

        const result = await pool.query(
            "SELECT * FROM bugs WHERE id = $1",
            [id]
        );

        if(result.rowCount < 1) {
            res.status(404).json({ message: `No record matching id: ${id}` });
            return;
        }

        return res.json(result.rows[0]);
    } catch(error) {
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

router.patch("/:id", (req, res) => {
    const id = Number(req.params.id);
    const existingBug = bugs.find((bug) => bug.id === id);
    const incomingBug = req.body;

    if (!existingBug) {
        return res.status(404).json({
            message: "The bug you want to modify doesn't exist"
        });
    }

    if (!incomingBug) {
        return res.status(400).json({ message: "400 Bad Request" });
    }

    if (!allowedStatuses.includes(incomingBug.status)) {
        res.status(400).json({
            message: "Invalid or missing data"
        });
        return;
    }

    existingBug.status = incomingBug.status;
    res.status(200).json(existingBug);
});

router.delete("/:id", (req, res) => {
    const id = Number(req.params.id);
    const bugIndexToDelete = bugs.findIndex((bug) => bug.id === id);

    if (bugIndexToDelete === -1) {
        res.status(404).json({ message: "Bug doesn't exist" });
        return;
    }

    bugs.splice(bugIndexToDelete, 1);
    return res.status(204).send();
});

module.exports = router;
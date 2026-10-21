const express = require("express");
const router = express.Router();

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

router.get("/", (req, res) => {
    const status = req.query.status;
    if(!status) {
        res.json(bugs);
        return;
    }

    if(!allowedStatuses.includes(status)) {
        res.status(400).json({ message: "Invalid bug status" });
        return;
    }

    const filteredBugs = bugs.filter((bug) => bug.status === status);
    res.status(200).json(filteredBugs);
});

router.get("/:id", (req, res) => {
    const id = Number(req.params.id);
    const bug = bugs.find((bug) => bug.id === id)

    if (bug) {
        res.json(bug);
        return;
    }

    res.status(404).json({
        message: "Bug not found!"
    });
});

let nextId = 4;

router.post("/", (req, res) => {
    const newBug = req.body;

    if (!newBug.title || typeof newBug.title != "string" || newBug.title.trim() === "") {
        res.status(400).json({ message: "Bug title is required" });
        return;
    }

    if (!allowedStatuses.includes(newBug.status)) {
        res.status(400).json({ message: "Invalid bug status" });
        return;
    }

    newBug.id = nextId;
    nextId++;

    bugs.push(newBug);

    res.status(201).json(newBug);
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
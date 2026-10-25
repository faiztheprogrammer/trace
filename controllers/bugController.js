const { findBugById, findAllBugs, createBugRepo, updateBugRepo, deleteBugRepo } = require('../repositories/bugRepository.js');
const allowedStatuses = ["Open", "In Progress", "Closed"];

async function getBugById(req, res) {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            res.status(400).json({ message: "Invalid input" });
            return;
        }

        const bug = await findBugById(id);

        if (!bug) {
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

        const deletedBug = await deleteBugRepo(id);

        if (deletedBug) {
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

        if (status && !allowedStatuses.includes(status)) {
            res.status(400).json({ message: "Invalid request" });
            return;
        }

        const allBugs = await findAllBugs(status);
        return res.json(allBugs);
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

        const createdBug = await createBugRepo(newBug.title, newBug.status)
        return res.status(201).json(createdBug);
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

        const updatedBug = await updateBugRepo(id, status);

        if (!updatedBug) {
            return res.status(404).json({ message: "No record was found" })
        }

        return res.status(200).json(updatedBug);
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ message: "Database query failed" });
    }
}

module.exports = { getBugById, deleteBug, getAllBugs, createBug, updateBug }
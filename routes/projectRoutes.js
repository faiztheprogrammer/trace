const express = require('express');
const router = express.Router();
const { getProjectById, getAllProjects, addNewProject } = require('../controllers/projectController.js');

router.get("/", getAllProjects);
router.get("/:id", getProjectById);
router.post("/", addNewProject);

module.exports = router;
const express = require('express');
const router = express.Router();
const { getProjectById, getAllProjects, addNewProject, updateProjectName } = require('../controllers/projectController.js');

router.get("/", getAllProjects);
router.get("/:id", getProjectById);
router.post("/", addNewProject);
router.patch("/:id", updateProjectName);

module.exports = router;
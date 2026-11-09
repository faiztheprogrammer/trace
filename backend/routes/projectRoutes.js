const express = require('express');
const router = express.Router();
const { getProjectById, getAllProjects, addNewProject, updateProjectName, deleteProject } = require('../controllers/projectController.js');
const { requireAuth } = require('../middleware/requireAuth.js');
const { requireAdmin } = require('../middleware/requireAdmin.js');

router.get("/", requireAuth, getAllProjects);
router.get("/:id",  requireAuth, getProjectById);
router.post("/",  requireAuth, requireAdmin, addNewProject);
router.patch("/:id", requireAuth, requireAdmin, updateProjectName);
router.delete("/:id", requireAuth, requireAdmin, deleteProject);

module.exports = router;
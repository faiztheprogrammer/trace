const express = require("express");
const router = express.Router();
const { getAllBugs, getBugById, createBug, updateBug, deleteBug } = require('../controllers/bugController.js');
const { requireAuth } = require("../middleware/requireAuth.js");
const { requireAdmin } = require("../middleware/requireAdmin.js");

router.get("/", requireAuth, getAllBugs);
router.get("/:id", requireAuth, getBugById);
router.post("/", requireAuth, createBug);
router.patch("/:id", requireAuth, updateBug) 
router.delete("/:id", requireAuth, requireAdmin, deleteBug);

module.exports = router;
const express = require("express");
const router = express.Router();
const { getAllBugs, getBugById, createBug, updateBug, deleteBug } = require('../controllers/bugController.js');
const { requireAuth } = require("../middleware/requireAuth.js");
const { requireAdmin } = require("../middleware/requireAdmin.js");

router.get("/", getAllBugs);
router.get("/:id", getBugById);
router.post("/", createBug);
router.patch("/:id", updateBug) 
router.delete("/:id", requireAuth, requireAdmin, deleteBug);

module.exports = router;
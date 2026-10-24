const express = require("express");
const router = express.Router();
const { getAllBugs, getBugById, createBug, updateBug, deleteBug } = require('../controllers/bugController.js');

router.get("/", getAllBugs);
router.get("/:id", getBugById);
router.post("/", createBug);
router.patch("/:id", updateBug) 
router.delete("/:id", deleteBug);

module.exports = router;
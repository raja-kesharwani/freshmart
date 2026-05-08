const express = require('express')
const router = express.Router()
const Category = require("../models/category");
const { protect, admin } = require("../middleware/authMiddleware");
const { requireDatabase } = require("../middleware/dbMiddleware");

// GET all categories
router.get('/', requireDatabase, async (req, res) => {
  try {
    const categories = await Category.find()
    res.status(200).json(categories)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// CREATE category
router.post('/', requireDatabase, protect, admin, async (req, res) => {
  try {
    const { name, image, description } = req.body
    const category = await Category.create({ name, image, description })
    res.status(201).json(category)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

module.exports = router

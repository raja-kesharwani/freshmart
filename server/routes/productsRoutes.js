const express = require("express");
const router = express.Router();
const {
  getProducts,
  getProductsByCategory,
  getProductById,
  getProductByName,
  createProduct,
  deleteProduct,
} = require("../controllers/productControllers");
const { protect, admin } = require("../middleware/authMiddleware");
const { requireDatabase } = require("../middleware/dbMiddleware");

// PUBLIC ROUTES
router.get("/", requireDatabase, getProducts);
router.get("/lookup", requireDatabase, getProductByName);
router.get("/category/:categoryId", requireDatabase, getProductsByCategory);
router.get("/:id", requireDatabase, getProductById);

// PROTECTED ROUTES (admin only)
router.post("/", requireDatabase, protect, admin, createProduct);
router.delete("/:id", requireDatabase, protect, admin, deleteProduct);

module.exports = router;

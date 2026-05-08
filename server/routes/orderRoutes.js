const express = require("express");
const router = express.Router();
const {
  createOrder,
  getMyOrders,
  getAllOrders,
  updateOrderStatus,
} = require("../controllers/orderControllers");
const { protect, admin } = require("../middleware/authMiddleware");
const { requireDatabase } = require("../middleware/dbMiddleware");

// ALL ROUTES ARE PROTECTED
router.post("/", requireDatabase, protect, createOrder);
router.get("/myorders", requireDatabase, protect, getMyOrders);
router.get("/", requireDatabase, protect, admin, getAllOrders);
router.put("/:id", requireDatabase, protect, admin, updateOrderStatus);

module.exports = router;

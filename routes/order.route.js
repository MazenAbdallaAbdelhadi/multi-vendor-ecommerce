const { Router } = require("express");
const {
  paymentSheet,
  createCashOrder,
  filterOrderForLoggedUser,
  getOrder,
  getOrders,
  updateOrderToDelivered,
  updateOrderToPaid,
} = require("../controller/order.controller");
const { protect, allowedRoles } = require("../services/auth");
const roles = require("../config/roles");

const router = Router();

router.use(protect);
router.get("/", filterOrderForLoggedUser, getOrders);
router.get("/:id", getOrder);
router.post("/payment-sheet/:cartId", paymentSheet);
router.post("/cash/:cartId", createCashOrder);

router.post("/:id/paid", allowedRoles(roles.ADMIN), updateOrderToPaid);
router.post(
  "/:id/delivered",
  allowedRoles(roles.VENDOR),
  updateOrderToDelivered
);

module.exports = router;

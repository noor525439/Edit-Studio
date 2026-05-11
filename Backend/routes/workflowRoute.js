import express from "express";
import { isAuthenticated } from "../middleware/authenticated.js";
import { authorizeRole } from "../middleware/authorizeRole.js";
import {
  getAdminChatMonitor,
  getAdminCommissionOverview,
  createOrder,
  createOrGetThread,
  createReview,
  createTask,
  deleteMessage,
  editMessage,
  getEditorGigProfile,
  getMyThreads,
  getOrders,
  getTasks,
  markThreadRead,
  sendMessage,
  updateOrderProgress,
  updateTaskTimer,
  getReviews,
  createPaymentIntent,
  refundPayment,
  getPayments,
  createCheckoutSession,
  approvePaymentManual
} from "../Controllers/workflowController.js";

const router = express.Router();

router.post("/orders", isAuthenticated, authorizeRole("client"), createOrder);
router.get("/orders", isAuthenticated, getOrders);
router.put(
  "/orders/:orderId/progress",
  isAuthenticated,
  authorizeRole("editor", "admin"),
  updateOrderProgress
);

router.post("/tasks", isAuthenticated, authorizeRole("client", "admin"), createTask);
router.get("/tasks", isAuthenticated, getTasks);
router.put("/tasks/:taskId/timer", isAuthenticated, authorizeRole("editor"), updateTaskTimer);

router.post("/chat/threads", isAuthenticated, createOrGetThread);
router.get("/chat/threads", isAuthenticated, getMyThreads);
router.patch("/chat/threads/:threadId/read", isAuthenticated, markThreadRead);
router.post("/chat/threads/:threadId/messages", isAuthenticated, sendMessage);
router.patch("/chat/threads/:threadId/messages/:messageId", isAuthenticated, editMessage);
router.delete("/chat/threads/:threadId/messages/:messageId", isAuthenticated, deleteMessage);

router.post("/payments/create-payment-intent",isAuthenticated,authorizeRole("client"),createPaymentIntent);
router.post("/payments/create-checkout-session",isAuthenticated,authorizeRole("client"),createCheckoutSession);
router.get("/payments", isAuthenticated, getPayments);
router.post("/payments/:paymentId/refund",isAuthenticated,authorizeRole("admin"),refundPayment);
router.patch("/payments/:paymentId/approve", isAuthenticated, approvePaymentManual);

router.get("/reviews", isAuthenticated, getReviews);
router.post("/reviews", isAuthenticated, authorizeRole("client"), createReview);
router.get("/gig/editor/:editorUserId", isAuthenticated, getEditorGigProfile);
router.get("/admin/commissions", isAuthenticated, authorizeRole("admin"), getAdminCommissionOverview);

export default router;

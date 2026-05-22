import express from "express";
import { isAuthenticated } from "../middleware/authenticated.js";
import { authorizeRole } from "../middleware/authorizeRole.js";
import { isAdmin } from "../middleware/isAdmin.js";
import {
  getOrderById,
  publishOrder,
  getMarketplaceTasks,
  applyForProject,
  acceptApplication,
  rejectApplication,
  instantHire,
  updateProgressPercent,
  createSubmission,
  getSubmissions,
  requestRevision,
  confirmDelivery,
  rateProject,
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  getAdminUsers,
  getAdminUserById,
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
  approvePaymentManual,
  submitReview,
  getProjectReviews,
  getEditorReviews,
  getAllReviewsAdmin,
  editReview,
  deleteReview,
  getAdminActivities,
  getAdminOverview,
} from "../Controllers/projectWorkflowController.js";
import {
  getClientPublicProfile,
  getOrderDetail,
  addOrderComment,
  browseEditors,
  getPublicEditorProfile,
  submitOrderReview,
} from "../Controllers/profilesReviewsController.js";

const router = express.Router();

router.post("/orders", isAuthenticated, authorizeRole("client"), createOrder);
router.get("/orders", isAuthenticated, getOrders);
router.put(
  "/orders/:orderId/progress",
  isAuthenticated,
  authorizeRole("editor", "admin"),
  updateOrderProgress
);

router.post("/tasks", isAuthenticated, authorizeRole("client", "admin", "editor"), createTask);
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
router.get("/admin/users", isAuthenticated, authorizeRole("admin"), getAdminUsers);
router.get("/admin/users/:userId", isAuthenticated, authorizeRole("admin"), getAdminUserById);
router.get("/admin/activities", isAuthenticated, isAdmin, getAdminActivities);
router.get("/admin/overview", isAuthenticated, isAdmin, getAdminOverview);

router.get("/marketplace", isAuthenticated, getMarketplaceTasks);
router.get("/orders/:orderId", isAuthenticated, getOrderById);
router.get("/orders/:orderId/detail", isAuthenticated, getOrderDetail);
router.post("/orders/:orderId/comments", isAuthenticated, addOrderComment);
router.post("/orders/:orderId/review", isAuthenticated, authorizeRole("client"), submitOrderReview);

router.get("/clients/:clientId/profile", isAuthenticated, authorizeRole("editor", "admin"), getClientPublicProfile);
router.get("/editors/browse", isAuthenticated, browseEditors);
router.get("/editors/profile/:editorId", isAuthenticated, getPublicEditorProfile);
router.post("/orders/:orderId/publish", isAuthenticated, authorizeRole("client"), publishOrder);
router.put("/orders/:orderId/progress-percent", isAuthenticated, authorizeRole("editor"), updateProgressPercent);
router.post("/orders/:orderId/apply", isAuthenticated, authorizeRole("editor"), applyForProject);
router.post("/orders/:orderId/accept-application", isAuthenticated, authorizeRole("client"), acceptApplication);
router.post("/orders/:orderId/reject-application", isAuthenticated, authorizeRole("client"), rejectApplication);
router.post("/orders/:orderId/request-revision", isAuthenticated, authorizeRole("client"), requestRevision);
router.post("/orders/:orderId/confirm-delivery", isAuthenticated, authorizeRole("client"), confirmDelivery);
router.post("/orders/:orderId/rate", isAuthenticated, authorizeRole("client"), rateProject);
router.post("/instant-hire", isAuthenticated, authorizeRole("client"), instantHire);

router.post("/submissions", isAuthenticated, authorizeRole("editor"), createSubmission);
router.get("/submissions", isAuthenticated, getSubmissions);

router.get("/notifications", isAuthenticated, getNotifications);
router.patch("/notifications/:notificationId/read", isAuthenticated, markNotificationRead);
router.patch("/notifications/read-all", isAuthenticated, markAllNotificationsRead);

export const reviewApiRouter = express.Router();
reviewApiRouter.post("/", isAuthenticated, authorizeRole("client"), submitReview);
reviewApiRouter.get("/project/:id", isAuthenticated, getProjectReviews);
reviewApiRouter.get("/editor/:id", isAuthenticated, getEditorReviews);
reviewApiRouter.get("/admin/all", isAuthenticated, authorizeRole("admin"), getAllReviewsAdmin);
reviewApiRouter.put("/:id", isAuthenticated, authorizeRole("client"), editReview);
reviewApiRouter.delete("/:id", isAuthenticated, authorizeRole("admin"), deleteReview);

export default router;

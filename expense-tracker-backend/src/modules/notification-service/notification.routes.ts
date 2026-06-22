// import { Router } from "express";
// // import { authMiddleware } from "../middleware/auth.middleware.js";
// import { authMiddleware } from "../../shared/middlewares/auth.middleware.js";
// import { getVapidPublicKey, subscribe, triggerBudgetAlert, triggerBudgetExceeded, triggerExportComplete, triggerFraudAlert, triggerReportReady, triggerTransactionAdded, unsubscribe } from "./notification.controller.js";

// const router = Router();

// router.get("/vapid-public-key", getVapidPublicKey);
// router.post("/subscribe", authMiddleware, subscribe);
// router.delete("/unsubscribe", authMiddleware, unsubscribe);

// router.post("/trigger/budget-alert", authMiddleware, triggerBudgetAlert);
// router.post("/trigger/budget-exceeded", authMiddleware, triggerBudgetExceeded);
// router.post("/trigger/fraud-alert", authMiddleware, triggerFraudAlert);
// router.post("/trigger/export-complete", authMiddleware, triggerExportComplete);
// router.post("/trigger/report-ready", authMiddleware, triggerReportReady);
// router.post("/trigger/transaction-added", authMiddleware, triggerTransactionAdded);

// export default router;

// import { prisma } from "../lib/prisma.js";
// import {
//   sendToUser,
//   sendToAll,
//   buildNotification,
// } from "../services/notification.service.js";

// export const getVapidPublicKey = (_req, res) => {
//   res.json({ publicKey: process.env.VAPID_PUBLIC_KEY });
// };

// export const subscribe = async (req, res) => {
//   const { endpoint, keys } = req.body;
//   const userId = req.user.id;

//   if (!endpoint || !keys?.p256dh || !keys?.auth) {
//     return res.status(400).json({ error: "Missing endpoint or keys" });
//   }

//   try {
//     await prisma.pushSubscription.upsert({
//       where: { endpoint },
//       update: {
//         user_id: userId,
//         p256dh:  keys.p256dh,
//         auth:    keys.auth,
//       },
//       create: {
//         user_id:  userId,
//         endpoint,
//         p256dh:   keys.p256dh,
//         auth:     keys.auth,
//       },
//     });

//     return res.json({ success: true });
//   } catch (err) {
//     console.error("[notify] subscribe error:", err.message);
//     return res.status(500).json({ error: err.message });
//   }
// };

// // ─── DELETE /api/notifications/unsubscribe ────────────────────────────────────
// export const unsubscribe = async (req, res) => {
//   const { endpoint } = req.body;
//   if (!endpoint) return res.status(400).json({ error: "endpoint required" });

//   try {
//     await prisma.pushSubscription.deleteMany({ where: { endpoint } });
//     return res.json({ success: true });
//   } catch (err) {
//     return res.status(500).json({ error: err.message });
//   }
// };

// // POST /api/notifications/trigger/budget-alert
// export const triggerBudgetAlert = async (req, res) => {
//   try {
//     const { userId, category, percent } = req.body;
//     if (!userId || !category || percent == null) {
//       return res.status(400).json({ error: "userId, category and percent required" });
//     }
//     await sendToUser(userId, buildNotification("budget_alert", { category, percent }));
//     return res.json({ success: true });
//   } catch (err) {
//     return res.status(500).json({ error: err.message });
//   }
// };

// // POST /api/notifications/trigger/budget-exceeded
// export const triggerBudgetExceeded = async (req, res) => {
//   try {
//     const { userId, category, month } = req.body;
//     if (!userId || !category) {
//       return res.status(400).json({ error: "userId and category required" });
//     }
//     await sendToUser(userId, buildNotification("budget_exceeded", { category, month }));
//     return res.json({ success: true });
//   } catch (err) {
//     return res.status(500).json({ error: err.message });
//   }
// };

// // POST /api/notifications/trigger/fraud-alert
// export const triggerFraudAlert = async (req, res) => {
//   try {
//     const { userId, merchant, amount } = req.body;
//     if (!userId || !merchant || amount == null) {
//       return res.status(400).json({ error: "userId, merchant and amount required" });
//     }
//     await sendToUser(userId, buildNotification("fraud_alert", { merchant, amount }));
//     return res.json({ success: true });
//   } catch (err) {
//     return res.status(500).json({ error: err.message });
//   }
// };

// // POST /api/notifications/trigger/export-complete
// export const triggerExportComplete = async (req, res) => {
//   try {
//     const { userId, filename } = req.body;
//     if (!userId || !filename) {
//       return res.status(400).json({ error: "userId and filename required" });
//     }
//     await sendToUser(userId, buildNotification("export_complete", { filename }));
//     return res.json({ success: true });
//   } catch (err) {
//     return res.status(500).json({ error: err.message });
//   }
// };

// // POST /api/notifications/trigger/report-ready
// export const triggerReportReady = async (req, res) => {
//   try {
//     const { month } = req.body;
//     await sendToAll(buildNotification("report_ready", { month }));
//     return res.json({ success: true });
//   } catch (err) {
//     return res.status(500).json({ error: err.message });
//   }
// };

// // POST /api/notifications/trigger/transaction-added
// export const triggerTransactionAdded = async (req, res) => {
//   try {
//     const { userId, merchant, amount, date } = req.body;
//     if (!userId || !merchant || amount == null) {
//       return res.status(400).json({ error: "userId, merchant and amount required" });
//     }
//     await sendToUser(userId, buildNotification("transaction_added", { merchant, amount, date }));
//     return res.json({ success: true });
//   } catch (err) {
//     return res.status(500).json({ error: err.message });
//   }
// };

// import webpush from "web-push";
// import { prisma } from "../lib/prisma.js";

// webpush.setVapidDetails(
//   process.env.VAPID_MAILTO,
//   process.env.VAPID_PUBLIC_KEY,
//   process.env.VAPID_PRIVATE_KEY
// );

// export function buildNotification(type, data = {}) {
//   const category = data.category ?? "a category";
//   const percent  = data.percent  ?? 0;
//   const amount   = data.amount   ?? 0;
//   const merchant = data.merchant ?? "Unknown merchant";
//   const month    = data.month    ?? new Date().toLocaleString("default", { month: "long", year: "numeric" });
//   const filename = data.filename ?? "export.csv";
//   const date     = data.date     ?? new Date().toLocaleDateString();

//   /** @type {Record<NotificationType, NotificationPayload>} */
//   const map = {
//     budget_alert: {
//       title: "Budget limit approaching",
//       body:  `${category} is at ${percent}% of your monthly budget.`,
//       url:   "/budgets",
//       icon:  "/icons/budget.png",
//       actions: [
//         { action: "view",    title: "View Budget" },
//         { action: "dismiss", title: "Dismiss"     },
//       ],
//     },

//     budget_exceeded: {
//       title: "Budget exceeded",
//       body:  `You have exceeded your ${category} budget for ${month}.`,
//       url:   "/budgets",
//       icon:  "/icons/budget-exceeded.png",
//       actions: [
//         { action: "view",    title: "View Details" },
//         { action: "dismiss", title: "Dismiss"      },
//       ],
//     },

//     fraud_alert: {
//       title: "Unusual spend detected",
//       body:  `₹${amount} at ${merchant} — was this you?`,
//       url:   "/expenses",
//       icon:  "/icons/alert.png",
//       actions: [
//         { action: "review",  title: "Review"    },
//         { action: "its_me",  title: "It was me" },
//       ],
//     },

//     export_complete: {
//       title: "Export complete",
//       body:  `${filename} has been downloaded successfully.`,
//       url:   "/expenses",
//       icon:  "/icons/export.png",
//     },

//     report_ready: {
//       title: "Monthly report ready",
//       body:  `Your ${month} spending summary is available to download.`,
//       url:   "/analytics",
//       icon:  "/icons/report.png",
//       actions: [
//         { action: "download", title: "Download" },
//         { action: "view",     title: "View"     },
//       ],
//     },

//     transaction_added: {
//       title: "New transaction recorded",
//       body:  `₹${amount} at ${merchant} on ${date}.`,
//       url:   "/expenses",
//       icon:  "/icons/transaction.png",
//     },
//   };

//   return (
//     map[type] ?? {
//       title:   "New Notification",
//       body:    "You have an update in ExpenseWallet.",
//       url:     "/dashboard",
//       icon:    "/icons/default.png",
//     }
//   );
// }

// async function sendPush(sub, payload) {
//   try {
//     await webpush.sendNotification(
//       {
//         endpoint: sub.endpoint,
//         keys: { p256dh: sub.p256dh, auth: sub.auth },
//       },
//       JSON.stringify(payload)
//     );
//   } catch (err) {
//     if (err.statusCode === 410 || err.statusCode === 404) {
//       await prisma.pushSubscription.delete({ where: { id: sub.id } });
//       console.log(`[push] Removed expired subscription ${sub.id}`);
//     } else {
//       console.error(`[push] Failed for subscription ${sub.id}:`, err.message);
//     }
//   }
// }

// export async function sendToUser(userId, payload) {
//   const subs = await prisma.pushSubscription.findMany({
//     where: { user_id: userId },
//   });
//   await Promise.all(subs.map((s) => sendPush(s, payload)));
// }

// export async function sendToUsers(userIds, payload) {
//   const subs = await prisma.pushSubscription.findMany({
//     where: { user_id: { in: userIds } },
//   });
//   await Promise.all(subs.map((s) => sendPush(s, payload)));
// }

// export async function sendToAll(payload) {
//   const subs = await prisma.pushSubscription.findMany();
//   await Promise.all(subs.map((s) => sendPush(s, payload)));
// }

// export const notifyBudgetAlert = (userId, category, percent) =>
//   sendToUser(userId, buildNotification("budget_alert", { category, percent }));

// export const notifyBudgetExceeded = (userId, category, month) =>
//   sendToUser(userId, buildNotification("budget_exceeded", { category, month }));

// export const notifyFraudAlert = (userId, merchant, amount) =>
//   sendToUser(userId, buildNotification("fraud_alert", { merchant, amount }));

// export const notifyExportComplete = (userId, filename) =>
//   sendToUser(userId, buildNotification("export_complete", { filename }));

// export const notifyReportReady = (userId, month) =>
//   sendToUser(userId, buildNotification("report_ready", { month }));

// export const notifyTransactionAdded = (userId, merchant, amount, date) =>
//   sendToUser(userId, buildNotification("transaction_added", { merchant, amount, date }));

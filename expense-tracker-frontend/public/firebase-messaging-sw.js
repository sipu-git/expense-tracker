importScripts("https://www.gstatic.com/firebasejs/12.15.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/12.15.0/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyBlTGA686YPV0hZe5TwxF4CdCgDyLxEPDM",
  authDomain: "expense-tracking-a7454.firebaseapp.com",
  projectId: "expense-tracking-a7454",
  storageBucket: "expense-tracking-a7454.firebasestorage.app",
  messagingSenderId: "136148128824",
  appId: "1:136148128824:web:1e5d3154f7afbe4b1882cd",
  measurementId: "G-BEHCJ5PWX3",
});

const messaging = firebase.messaging();

// Handle background messages from Firebase
messaging.onBackgroundMessage((payload) => {
  console.log("[FCM] Background message received:", payload);

  const title = payload.data?.title || "ExpenseWallet";
  const options = {
    body: payload.data?.body || "You have a new notification.",
    icon: payload.data?.icon || "/vite.svg",
    badge: payload.data?.badge || "/vite.svg",
    data: {
      url: payload.data?.deepLink || payload.data?.click_action || "/dashboard",
    },
  };

  self.registration.showNotification(title, options);
});

// Handle notification clicks
self.addEventListener("notificationclick", (event) => {
  console.log("[FCM] Notification clicked:", event);
  event.notification.close();

  if (event.action === "close" || event.action === "dismiss") return;

  const targetUrl = new URL(
    event.notification.data?.url || "/dashboard",
    self.location.origin
  ).href;

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ("focus" in client) {
          client.navigate(targetUrl);
          return client.focus();
        }
      }

      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});
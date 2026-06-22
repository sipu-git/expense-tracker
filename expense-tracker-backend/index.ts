import exxpress from "express";
import dotenv from "dotenv";
import cors from "cors";
import userRoutes from "./src/modules/user-service/user.routes.js";
import groupRoutes from "./src/modules/group-service/group.routes.js";
import expenseRoutes from "./src/modules/expense-service/expenses.routes.js";
import authRoutes from './src/modules/auth-service/auth.routes.js';
// import notificationRoutes from './src/modules/notification-service/notification.routes.ts'
import cookiesParser from "cookie-parser";
import { globalErrorHandler } from "./src/shared/middlewares/error.middleware.js";
dotenv.config();

const app = exxpress();
app.use(exxpress.json());
app.use(
    cors({
        origin: ["http://localhost:5173", "http://localhost:3000", "https://expense-tracker-steel-delta-33.vercel.app", "https://expense-tracker-1-6m9p.onrender.com"],
        credentials: true,
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization", "x-active-account-id", "Cache-Control", "Pragma"],
    })
); app.use(cookiesParser());

app.use("/api", (req, res, next) => {
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
    res.setHeader("Pragma", "no-cache");
    next();
});
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/group", groupRoutes);
app.use("/api/expenses", expenseRoutes);
// app.use("/api/notifications", notificationRoutes);

app.use(globalErrorHandler)

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
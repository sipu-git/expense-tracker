import exxpress from "express";
import dotenv from "dotenv";
import cors from "cors";
import userRoutes from "./src/modules/user-service/user.routes.js";
import groupRoutes from "./src/modules/group-service/group.routes.js";
import expenseRoutes from "./src/modules/expense-service/expenses.routes.js";
import authRoutes from './src/modules/auth-service/auth.routes.js';

import cookiesParser from "cookie-parser";
const app = exxpress();
app.use(exxpress.json());
app.use(
    cors({
        origin: ["http://localhost:5173","https://expense-tracker-steel-delta-33.vercel.app","https://expense-tracker-1-6m9p.onrender.com"],
        credentials: true,
    })
); app.use(cookiesParser());
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/group", groupRoutes);
app.use("/api/expenses", expenseRoutes);

dotenv.config();
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
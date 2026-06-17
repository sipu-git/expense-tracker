import exxpress from "express";
import dotenv from "dotenv";
import cors from "cors";
import userRoutes from "./src/modules/user-service/user.routes";
import groupRoutes from "./src/modules/group-service/group.routes";
import expenseRoutes from "./src/modules/expense-service/expenses.routes";
import authRoutes from './src/modules/auth-service/auth.routes';

import cookiesParser from "cookie-parser";
const app = exxpress();
app.use(exxpress.json());
app.use(
    cors({
        origin: "http://localhost:5173",
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
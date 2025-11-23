import { Router } from "express";
import authRoutes from "./auth";
import companyRoutes from "./company";
import userRoutes from "./user";

const router = Router();
router.use("/auth", authRoutes);
router.use("/company", companyRoutes);
router.use("/users", userRoutes);

export default router;

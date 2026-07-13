import { Router } from "express";
import { getMySalon, updateMySalon } from "../controllers/salon.controller.js";
import { requireAuth, requireSalon } from "../middleware/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const salonRouter = Router();

salonRouter.use(requireAuth, requireSalon);
salonRouter.get("/", asyncHandler(getMySalon));
salonRouter.patch("/", asyncHandler(updateMySalon));

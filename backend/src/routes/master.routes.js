import { Router } from "express";
import {
  listSalons,
  getSalon,
  createSalon,
  updateSalon,
  setSalonStatus,
  deleteSalon,
} from "../controllers/master.controller.js";
import { requireAuth, requireMaster } from "../middleware/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const masterRouter = Router();

masterRouter.use(requireAuth, requireMaster);

masterRouter.get("/salons", asyncHandler(listSalons));
masterRouter.get("/salons/:id", asyncHandler(getSalon));
masterRouter.post("/salons", asyncHandler(createSalon));
masterRouter.patch("/salons/:id", asyncHandler(updateSalon));
masterRouter.patch("/salons/:id/status", asyncHandler(setSalonStatus));
masterRouter.delete("/salons/:id", asyncHandler(deleteSalon));

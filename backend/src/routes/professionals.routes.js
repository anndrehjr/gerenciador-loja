import { Router } from "express";
import {
  listProfessionals,
  getProfessional,
  createProfessional,
  updateProfessional,
  deleteProfessional,
  replaceWorkingHours,
  createTimeOff,
  deleteTimeOff,
} from "../controllers/professionals.controller.js";
import { requireAuth, requireSalon } from "../middleware/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const professionalsRouter = Router();

professionalsRouter.use(requireAuth, requireSalon);
professionalsRouter.get("/", asyncHandler(listProfessionals));
professionalsRouter.get("/:id", asyncHandler(getProfessional));
professionalsRouter.post("/", asyncHandler(createProfessional));
professionalsRouter.patch("/:id", asyncHandler(updateProfessional));
professionalsRouter.delete("/:id", asyncHandler(deleteProfessional));
professionalsRouter.put("/:id/working-hours", asyncHandler(replaceWorkingHours));
professionalsRouter.post("/:id/time-off", asyncHandler(createTimeOff));
professionalsRouter.delete("/:id/time-off/:timeOffId", asyncHandler(deleteTimeOff));

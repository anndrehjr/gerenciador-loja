import { Router } from "express";
import {
  listAppointments,
  getAppointment,
  createAppointment,
  updateAppointment,
  deleteAppointment,
} from "../controllers/appointments.controller.js";
import { requireAuth } from "../middleware/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const appointmentsRouter = Router();

appointmentsRouter.use(requireAuth);
appointmentsRouter.get("/", asyncHandler(listAppointments));
appointmentsRouter.get("/:id", asyncHandler(getAppointment));
appointmentsRouter.post("/", asyncHandler(createAppointment));
appointmentsRouter.patch("/:id", asyncHandler(updateAppointment));
appointmentsRouter.delete("/:id", asyncHandler(deleteAppointment));

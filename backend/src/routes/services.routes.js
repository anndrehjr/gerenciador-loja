import { Router } from "express";
import {
  listServices,
  getService,
  createService,
  updateService,
  deleteService,
} from "../controllers/services.controller.js";
import { requireAuth } from "../middleware/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const servicesRouter = Router();

servicesRouter.use(requireAuth);
servicesRouter.get("/", asyncHandler(listServices));
servicesRouter.get("/:id", asyncHandler(getService));
servicesRouter.post("/", asyncHandler(createService));
servicesRouter.patch("/:id", asyncHandler(updateService));
servicesRouter.delete("/:id", asyncHandler(deleteService));

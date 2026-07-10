import { Router } from "express";
import { listPublicServices } from "../controllers/public.controller.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const publicRouter = Router();

publicRouter.get("/services", asyncHandler(listPublicServices));

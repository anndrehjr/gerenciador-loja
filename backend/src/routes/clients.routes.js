import { Router } from "express";
import {
  listClients,
  getClient,
  createClient,
  updateClient,
  deleteClient,
} from "../controllers/clients.controller.js";
import { requireAuth, requireSalon } from "../middleware/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const clientsRouter = Router();

clientsRouter.use(requireAuth, requireSalon);
clientsRouter.get("/", asyncHandler(listClients));
clientsRouter.get("/:id", asyncHandler(getClient));
clientsRouter.post("/", asyncHandler(createClient));
clientsRouter.patch("/:id", asyncHandler(updateClient));
clientsRouter.delete("/:id", asyncHandler(deleteClient));

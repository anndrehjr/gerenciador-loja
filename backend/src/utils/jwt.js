import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

const EXPIRES_IN = "8h";

export function signSessionToken(user) {
  return jwt.sign({ sub: user.id, role: user.role }, env.JWT_SECRET, {
    expiresIn: EXPIRES_IN,
  });
}

export function verifySessionToken(token) {
  return jwt.verify(token, env.JWT_SECRET);
}

export const COOKIE_MAX_AGE_MS = 8 * 60 * 60 * 1000;

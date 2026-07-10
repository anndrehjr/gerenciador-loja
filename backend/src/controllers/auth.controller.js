import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { verifyPassword } from "../utils/password.js";
import { signSessionToken, COOKIE_MAX_AGE_MS } from "../utils/jwt.js";
import { env } from "../config/env.js";
import { HttpError } from "../middleware/errorHandler.js";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

// hash bcrypt de uma senha aleatória fixa, usado só pra manter o tempo de
// resposta constante quando o email não existe (evita enumerar emails válidos).
const DUMMY_HASH = "$2a$12$CwTycUXWue0Thq9StjUM0uJ8vMxxV4pJC6ZlOF2ZoQO3vzYAY6Sfy";

const cookieOptions = {
  httpOnly: true,
  sameSite: "lax",
  secure: env.COOKIE_SECURE,
  maxAge: COOKIE_MAX_AGE_MS,
  path: "/",
};

export async function login(req, res) {
  const { email, password } = loginSchema.parse(req.body);

  const user = await prisma.user.findUnique({ where: { email } });
  const valid = await verifyPassword(password, user?.passwordHash || DUMMY_HASH);

  if (!user || !valid) {
    throw new HttpError(401, "Credenciais inválidas.");
  }

  const token = signSessionToken(user);
  res.cookie(env.COOKIE_NAME, token, cookieOptions);
  res.json({ id: user.id, name: user.name, email: user.email, role: user.role });
}

export async function logout(req, res) {
  res.clearCookie(env.COOKIE_NAME, { ...cookieOptions, maxAge: undefined });
  res.status(204).send();
}

export async function me(req, res) {
  const user = await prisma.user.findUnique({ where: { id: req.user.sub } });
  if (!user) {
    throw new HttpError(401, "Sessão inválida.");
  }
  res.json({ id: user.id, name: user.name, email: user.email, role: user.role });
}

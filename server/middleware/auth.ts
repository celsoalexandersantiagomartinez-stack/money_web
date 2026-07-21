import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("Falta la variable de entorno JWT_SECRET (revisá tu .env).");
}

export interface AuthRequest extends Request {
  usuarioId?: number;
}

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Falta el token de autenticación." });
  }

  const token = header.slice("Bearer ".length);

  try {
    const payload = jwt.verify(token, JWT_SECRET) as { sub: number };
    req.usuarioId = payload.sub;
    next();
  } catch {
    return res.status(401).json({ error: "Token inválido o expirado." });
  }
}

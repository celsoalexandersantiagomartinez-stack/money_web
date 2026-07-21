import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma.js";
import { requireAuth, type AuthRequest } from "../middleware/auth.js";

const router = Router();

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("Falta la variable de entorno JWT_SECRET (revisá tu .env).");
}

router.post("/registro", async (req, res) => {
  const { nombre, correo, contrasena } = req.body ?? {};

  if (!nombre || !correo || !contrasena) {
    return res
      .status(400)
      .json({ error: "Faltan datos: nombre, correo y contrasena son obligatorios." });
  }

  const existente = await prisma.usuario.findUnique({ where: { correo } });
  if (existente) {
    return res.status(409).json({ error: "Ya existe un usuario con ese correo." });
  }

  const contrasenaHash = await bcrypt.hash(contrasena, 10);

  const usuario = await prisma.usuario.create({
    data: { nombre, correo, contrasenaHash },
  });

  return res.status(201).json({
    id: usuario.id,
    nombre: usuario.nombre,
    correo: usuario.correo,
  });
});

router.post("/login", async (req, res) => {
  const { correo, contrasena } = req.body ?? {};

  if (!correo || !contrasena) {
    return res.status(400).json({ error: "Faltan datos: correo y contrasena son obligatorios." });
  }

  const usuario = await prisma.usuario.findUnique({ where: { correo } });
  if (!usuario) {
    return res.status(401).json({ error: "Correo o contraseña incorrectos." });
  }

  const coincide = await bcrypt.compare(contrasena, usuario.contrasenaHash);
  if (!coincide) {
    return res.status(401).json({ error: "Correo o contraseña incorrectos." });
  }

  const token = jwt.sign({ sub: usuario.id }, JWT_SECRET, { expiresIn: "7d" });

  return res.json({ token });
});

router.get("/me", requireAuth, async (req: AuthRequest, res) => {
  const usuario = await prisma.usuario.findUnique({ where: { id: req.usuarioId } });
  if (!usuario) {
    return res.status(404).json({ error: "Usuario no encontrado." });
  }

  return res.json({ id: usuario.id, nombre: usuario.nombre, correo: usuario.correo });
});

export default router;

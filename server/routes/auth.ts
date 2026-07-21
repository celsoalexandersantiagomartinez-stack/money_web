import { Router } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma.js";

const router = Router();

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

export default router;

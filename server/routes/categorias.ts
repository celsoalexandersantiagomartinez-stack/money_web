import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.use(requireAuth);

router.get("/", async (_req, res) => {
  const categorias = await prisma.categoria.findMany({ orderBy: { nombre: "asc" } });
  res.json(categorias);
});

router.post("/", async (req, res) => {
  const { nombre } = req.body ?? {};

  if (!nombre || typeof nombre !== "string") {
    return res.status(400).json({ error: "nombre es obligatorio." });
  }

  const existente = await prisma.categoria.findUnique({ where: { nombre } });
  if (existente) {
    return res.status(409).json({ error: "Ya existe una categoría con ese nombre." });
  }

  const categoria = await prisma.categoria.create({ data: { nombre } });
  res.status(201).json(categoria);
});

export default router;

import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { requireAuth, type AuthRequest } from "../middleware/auth.js";

const router = Router();

router.use(requireAuth);

router.post("/", async (req: AuthRequest, res) => {
  const { monto, categoriaId, fecha, nota } = req.body ?? {};

  if (typeof monto !== "number" || monto <= 0) {
    return res.status(400).json({ error: "monto debe ser un número mayor a 0." });
  }
  if (typeof categoriaId !== "number") {
    return res.status(400).json({ error: "categoriaId es obligatorio." });
  }
  if (!fecha) {
    return res.status(400).json({ error: "fecha es obligatoria." });
  }

  const categoria = await prisma.categoria.findUnique({ where: { id: categoriaId } });
  if (!categoria) {
    return res.status(404).json({ error: "La categoría indicada no existe." });
  }

  const gasto = await prisma.gasto.create({
    data: {
      usuarioId: req.usuarioId!,
      categoriaId,
      monto,
      fecha: new Date(fecha),
      nota: nota ?? null,
    },
  });

  res.status(201).json(gasto);
});

router.get("/", async (req: AuthRequest, res) => {
  const gastos = await prisma.gasto.findMany({
    where: { usuarioId: req.usuarioId },
    include: { categoria: true },
    orderBy: { fecha: "desc" },
  });

  res.json(gastos);
});

export default router;

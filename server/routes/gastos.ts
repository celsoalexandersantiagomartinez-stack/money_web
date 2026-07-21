import { Router } from "express";
import { Prisma } from "@prisma/client";
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
  const { desde, hasta, categoriaId } = req.query;

  const where: Prisma.GastoWhereInput = { usuarioId: req.usuarioId };

  if (categoriaId !== undefined) {
    const catId = Number(categoriaId);
    if (Number.isNaN(catId)) {
      return res.status(400).json({ error: "categoriaId debe ser un número." });
    }
    where.categoriaId = catId;
  }

  if (desde !== undefined || hasta !== undefined) {
    where.fecha = {};
    if (desde !== undefined) {
      const desdeFecha = new Date(String(desde));
      if (Number.isNaN(desdeFecha.getTime())) {
        return res.status(400).json({ error: "desde no es una fecha válida." });
      }
      where.fecha.gte = desdeFecha;
    }
    if (hasta !== undefined) {
      const hastaFecha = new Date(String(hasta));
      if (Number.isNaN(hastaFecha.getTime())) {
        return res.status(400).json({ error: "hasta no es una fecha válida." });
      }
      where.fecha.lte = hastaFecha;
    }
  }

  const gastos = await prisma.gasto.findMany({
    where,
    include: { categoria: true },
    orderBy: { fecha: "desc" },
  });

  res.json(gastos);
});

router.get("/resumen", async (req: AuthRequest, res) => {
  const ahora = new Date();
  const inicioMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1);
  const inicioMesSiguiente = new Date(ahora.getFullYear(), ahora.getMonth() + 1, 1);

  const gastosDelMes = await prisma.gasto.findMany({
    where: {
      usuarioId: req.usuarioId,
      fecha: { gte: inicioMes, lt: inicioMesSiguiente },
    },
    include: { categoria: true },
  });

  const totalMes = gastosDelMes.reduce((acc, g) => acc + Number(g.monto), 0);

  const porCategoriaMap = new Map<string, number>();
  for (const g of gastosDelMes) {
    const nombre = g.categoria.nombre;
    porCategoriaMap.set(nombre, (porCategoriaMap.get(nombre) ?? 0) + Number(g.monto));
  }

  const porCategoria = Array.from(porCategoriaMap.entries()).map(([categoria, total]) => ({
    categoria,
    total,
  }));

  res.json({ totalMes, porCategoria });
});

router.delete("/:id", async (req: AuthRequest, res) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    return res.status(400).json({ error: "id inválido." });
  }

  const gasto = await prisma.gasto.findUnique({ where: { id } });
  if (!gasto || gasto.usuarioId !== req.usuarioId) {
    return res.status(404).json({ error: "Gasto no encontrado." });
  }

  await prisma.gasto.delete({ where: { id } });
  res.status(204).send();
});

export default router;

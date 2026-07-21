import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { requireAuth, type AuthRequest } from "../middleware/auth.js";

const router = Router();

router.patch("/presupuesto", requireAuth, async (req: AuthRequest, res) => {
  const { presupuestoMensual } = req.body ?? {};

  if (typeof presupuestoMensual !== "number" || presupuestoMensual < 0) {
    return res
      .status(400)
      .json({ error: "presupuestoMensual debe ser un número mayor o igual a 0." });
  }

  const usuario = await prisma.usuario.update({
    where: { id: req.usuarioId },
    data: { presupuestoMensual },
  });

  return res.json({ presupuestoMensual: usuario.presupuestoMensual });
});

export default router;

import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import authRouter from "./routes/auth.js";
import usuarioRouter from "./routes/usuario.js";
import categoriasRouter from "./routes/categorias.js";
import gastosRouter from "./routes/gastos.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
app.use(express.json());

app.use("/api/auth", authRouter);
app.use("/api/usuario", usuarioRouter);
app.use("/api/categorias", categoriasRouter);
app.use("/api/gastos", gastosRouter);

// Sirve el frontend ya compilado (llega en la Fase 4/5). En desarrollo
// esta carpeta todavía no existe, así que no afecta nada por ahora.
const clientDist = path.join(__dirname, "..", "dist", "client");
app.use(express.static(clientDist));
app.get("/*splat", (req, res, next) => {
  if (req.path.startsWith("/api")) return next();
  res.sendFile(path.join(clientDist, "index.html"), (err) => {
    if (err) next();
  });
});

const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});

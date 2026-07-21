import express from "express";
import path from "node:path";
import authRouter from "./routes/auth.js";
import usuarioRouter from "./routes/usuario.js";
import categoriasRouter from "./routes/categorias.js";
import gastosRouter from "./routes/gastos.js";

const app = express();
app.use(express.json());

app.use("/api/auth", authRouter);
app.use("/api/usuario", usuarioRouter);
app.use("/api/categorias", categoriasRouter);
app.use("/api/gastos", gastosRouter);

// Sirve el frontend ya compilado. Usamos process.cwd() (siempre la raíz
// del proyecto, tanto en "npm run dev" como en "npm start") en vez de
// __dirname, porque __dirname cambia según si el código corre desde
// server/ (dev, sin compilar) o desde dist/server/ (compilado en prod).
const clientDist = path.join(process.cwd(), "dist", "client");
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

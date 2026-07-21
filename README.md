# Money Web — Gestor de Gastos Personales

Proyecto académico: gestor de gastos personales, web (mobile-first),
construido con ayuda de IA (Claude Code) y desplegado completo (frontend
+ backend + base de datos) en Railway. Cada quien se registra con su
propia cuenta y ve únicamente sus propios datos (gastos, categorías y
presupuesto no se comparten entre cuentas).

## Descripción

Permite registrarte con correo y contraseña, cargar gastos por categoría
(con fecha y nota opcional), ver un resumen del mes con el total y el
porcentaje que representa cada categoría, definir un presupuesto mensual
con indicador de cuánto te queda o cuánto te excediste, personalizar el
color de cada categoría, y ver esos gastos en gráficos (barras por día y
circular) filtrando por rango de fechas. Los gastos se listan agrupados
por día, y un botón de ayuda ("?") en el encabezado abre en cualquier
momento un tutorial corto de cómo usar la app.

**Stack:**
- Frontend: React + Vite + Tailwind CSS (tema oscuro)
- Backend: Node.js + Express + TypeScript
- ORM: Prisma 6
- Base de datos: PostgreSQL en Railway
- Despliegue: un solo servicio en Railway (Express sirve el frontend ya
  compilado y expone la API bajo `/api`, sin necesidad de CORS)

## Instalación

```bash
git clone https://github.com/celsoalexandersantiagomartinez-stack/money_web.git
cd money_web
npm install
cp .env.example .env   # completar los valores reales, ver abajo
npx prisma migrate dev # crea las tablas en la base indicada por DATABASE_URL
```

## Variables de entorno

Definidas en `.env` (nunca se sube a git — ver `.env.example` para la
plantilla):

| Variable | Para qué sirve |
|---|---|
| `DATABASE_URL` | Cadena de conexión a PostgreSQL. En local, la URL pública del proxy de Railway; en producción, se referencia el servicio de Postgres directamente (`${{Postgres.DATABASE_URL}}`). |
| `PORT` | Puerto del servidor en local (por defecto 4000). En Railway se ignora: Railway inyecta su propia variable `PORT`. |
| `JWT_SECRET` | Secreto para firmar los tokens de sesión. Usar un valor distinto (largo y aleatorio) en local y en producción. |

## Cómo correr en local

```bash
npm run dev
```

Esto levanta backend (`http://localhost:4000`) y frontend (Vite, con
recarga en caliente, en `http://localhost:5173`) al mismo tiempo. El
frontend llama a `/api/...` con rutas relativas — Vite las redirige al
backend automáticamente en desarrollo.

Para probar el build de producción tal cual corre en Railway:

```bash
npm run build
npm start   # sirve todo desde http://localhost:4000
```

## Despliegue

App publicada en Railway: **https://moneyweb-production.up.railway.app**

Cuenta de prueba:
- Correo: `test@test.com`
- Contraseña: `1234`
- Ya tiene datos de ejemplo cargados (gastos diarios entre el
  1/6/2026 y el 20/7/2026) para poder ver el resumen, la lista y los
  gráficos con contenido real sin cargar nada a mano.

## Documentación del proceso

Este proyecto se construyó fase por fase dándole instrucciones a Claude
Code. El detalle completo (los prompts originales y todo lo que se pidió
y se ajustó después) está en [`PROMPTS_REALIZADOS.md`](./PROMPTS_REALIZADOS.md).

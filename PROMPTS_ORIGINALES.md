# Prompts para construir el Gestor de Gastos Personales con Claude Code

Cada bloque es un prompt independiente. Dáselos a Claude Code **uno a la vez**, en orden. No pases a la siguiente fase hasta que la anterior funcione y esté commiteada.

Puedes modificar el texto libremente — esto es una base de partida, no un guion fijo.

---

## 🔒 Bloque de contexto (pega esto al inicio de la PRIMERA conversación con Claude Code)

```
Estoy construyendo un proyecto académico: un gestor de gastos personales,
web (no APK), mobile-first en el diseño pero accesible desde navegador.

Stack fijo (no lo cambies ni sugieras alternativas, ya está decidido):
- Frontend: React + Vite + Tailwind CSS
- Backend: Node.js + Express + TypeScript
- ORM: Prisma
- Base de datos: PostgreSQL alojado en Railway
- Despliegue: todo (frontend, backend y base de datos) en Railway
- Control de versiones: Git + GitHub
- Estructura: monorepo con carpetas server/, src/, database/
- package.json único en la raíz del proyecto, con varios tsconfig.json
  separados por destino (app, node, server)

Alcance funcional: usuario único (sin roles admin/cliente), con:
- Registro e inicio de sesión (correo + contraseña)
- Categorías de gasto
- Registrar gastos (monto, categoría, fecha, nota opcional)
- Listado de gastos con filtro por fecha y categoría
- Totales: gasto del mes, gasto por categoría (con gráfico simple)
- Presupuesto mensual definido por el usuario, con indicador de cuánto
  lleva gastado vs el límite

Es un proyecto académico, no necesita ser perfecto ni tener funciones
extra — necesita FUNCIONAR y estar bien organizado para revisión.

Vamos a construirlo por fases. Espera mis instrucciones fase por fase,
no adelantes trabajo de fases futuras.
```

---

## 📁 Fase 1 — Esqueleto del repositorio

```
Fase 1: crea el esqueleto inicial del proyecto. Necesito:

- Estructura de carpetas: server/, src/, database/
- Inicializar git y hacer el primer commit
- .gitignore que excluya node_modules, .env, dist, build
- .env.example con placeholders de las variables que vamos a necesitar
  (ej. DATABASE_URL para Railway, puerto del servidor, etc.)
- package.json único en la raíz con los scripts básicos (dev, build)
- tsconfig.json base + los separados por destino que necesitemos
- README.md con secciones vacías: Descripción, Instalación, Variables
  de entorno, Cómo correr en local, Despliegue

No instales dependencias todavía de Prisma ni Express, eso lo hacemos
en la fase siguiente. Antes de crear los archivos, dime brevemente
el plan de qué vas a crear.
```

---

## 🗄️ Fase 2 — Base de datos (Prisma + Railway)

```
Fase 2: configura Prisma y define el esquema de base de datos dentro
de database/. Necesito estas tablas:

- Usuario: id, nombre, correo (único), contraseña_hash, presupuesto_mensual
- Categoria: id, nombre
- Gasto: id, usuarioId (relación a Usuario), categoriaId (relación a
  Categoria), monto, fecha, nota (opcional)

Configura la conexión usando la variable DATABASE_URL desde .env
(todavía no tengo el valor real de Railway, usa el placeholder).

Explícame los comandos que voy a tener que correr yo manualmente
para crear la base de datos en Railway y conectar el proyecto,
antes de aplicar la migración.
```

*(Nota: aquí es donde tú vas a Railway, creas el proyecto y el servicio de PostgreSQL, copias la URL de conexión real a tu `.env`, y recién ahí aplicas la migración.)*

---

## ⚙️ Fase 3 — Backend, por partes (no pidas todo junto)

**3a — Autenticación**
```
Fase 3a: implementa en server/ los endpoints de autenticación:
- POST /auth/registro (nombre, correo, contraseña)
- POST /auth/login (correo, contraseña) → devuelve un token
- Middleware que valide el token en rutas protegidas

Usa bcrypt para el hash de contraseñas y JWT para el token.
Dime cómo puedo probar estos endpoints (ej. con curl o Postman)
antes de seguir a la siguiente fase.
```

**3b — Categorías**
```
Fase 3b: implementa el CRUD de categorías en server/:
- GET /categorias (listar)
- POST /categorias (crear)
Rutas protegidas con el middleware de autenticación de la fase anterior.
```

**3c — Gastos**
```
Fase 3c: implementa el CRUD de gastos en server/:
- GET /gastos (con filtros opcionales por fecha y categoría vía query params)
- POST /gastos (crear)
- DELETE /gastos/:id
- GET /gastos/resumen (total del mes actual, total por categoría)
Todo asociado al usuario autenticado (via el token), nunca a gastos
de otro usuario.
```

---

## 🎨 Fase 4 — Frontend, por partes

**4a — Estructura y autenticación**
```
Fase 4a: crea en src/ las pantallas de registro e inicio de sesión,
conectadas a los endpoints /auth/registro y /auth/login del backend.
Guarda el token de sesión y protege las rutas internas de la app
para que solo se acceda si hay sesión iniciada.
Diseño mobile-first con Tailwind, simple y limpio, sin necesidad de
que sea vistoso — prioriza que funcione bien.
```

**4b — Registrar y listar gastos**
```
Fase 4b: crea la pantalla principal con:
- Formulario para registrar un gasto (monto, categoría, fecha, nota)
- Lista de gastos con filtro por fecha y por categoría
Conecta todo a los endpoints de /gastos que ya existen en el backend.
```

**4c — Totales y presupuesto**
```
Fase 4c: crea la pantalla/sección de resumen con:
- Gasto total del mes actual
- Gráfico simple de gasto por categoría (usa una librería ligera,
  recomiéndame cuál te parece mejor para este caso)
- Indicador visual de cuánto llevo gastado vs mi presupuesto mensual
```

---

## 🚀 Fase 5 — Despliegue en Railway

```
Fase 5: prepara el proyecto para desplegarse completo en Railway
(backend + frontend + base de datos ya están ahí). Necesito:
- Scripts de build correctos en package.json para producción
- Confirmar que el backend sirve el build del frontend, o explicarme
  si necesito dos servicios separados dentro del mismo proyecto Railway
- Checklist de variables de entorno que tengo que configurar en el
  dashboard de Railway antes de que funcione
Explícamelo paso a paso, esta es la primera vez que despliego algo ahí.
```

---

## 📝 Fase 6 — Cierre de documentación

```
Fase 6: completa el README.md con:
- Descripción del proyecto
- Instrucciones de instalación local paso a paso
- Lista de variables de entorno necesarias (referenciando .env.example)
- Cómo correr el proyecto en desarrollo
- Link de la app ya desplegada en Railway
- Credenciales de una cuenta de prueba (usuario y contraseña de ejemplo)
No inventes nada que no exista en el proyecto real.
```

---

## 💡 Recordatorios de flujo (no son prompts, son para ti)

- Después de cada fase que funciona: **commit**.
- Antes de aceptar los cambios que proponga Claude Code, revisa el diff.
- Si una fase se siente demasiado grande en la respuesta, pídele que
  la divida más (ej. separar 3c en "crear" y "listar con filtros").
- Si Claude Code sugiere algo fuera del stack fijo (otra librería, otro
  ORM, etc.), recuérdale el bloque de contexto — no tiene por qué
  desviarse de lo ya decidido.

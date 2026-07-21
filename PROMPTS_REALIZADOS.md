# Prompts realizados — registro completo del desarrollo

Este documento complementa a [`PROMPTS_ORIGINALES.md`](./PROMPTS_ORIGINALES.md).
Ese archivo es el plan que escribí *antes* de empezar; este es el registro de
lo que realmente se le pidió a Claude Code, fase por fase, incluyendo los
ajustes y pedidos nuevos que fueron surgiendo después de tener la app
funcionando. Está pensado para que se pueda reconstruir el mismo resultado
dándole estos prompts a Claude Code en orden.

---

## Fase 0 — Preflight

```
Revisá mis instrucciones originales (PROMPTS_ORIGINALES.md) antes de
construir nada. Decime si hay algo que convenga subdividir o reordenar
para que el flujo sea más fácil de seguir para alguien que no sabe
programar. Después de eso: guardá mis instrucciones originales aparte,
inicializá git en esta carpeta, y confirmá que tengo Node.js instalado
(si no, instalalo).
```

Resultado: se detectó que la decisión "¿un servicio en Railway o dos?"
estaba planteada demasiado tarde en el plan original (afectaba cómo
escribir el login y las llamadas del frontend desde el principio), y se
resolvió antes de la Fase 1: **un solo servicio**, Express sirve el
frontend compilado. También se instaló Node.js (no estaba en la máquina).

---

## Fase 1 — Esqueleto del repositorio

```
Fase 1: creá el esqueleto del proyecto — carpetas server/, src/,
database/, .gitignore, .env.example con placeholders, package.json único
con scripts básicos, los tsconfig.json separados por destino (app, node,
server), y un README con secciones vacías. Todavía no instales Express,
Prisma ni React — eso lo hacemos en las fases siguientes.
```

---

## Fase 2 — Base de datos (Prisma + Railway)

```
Fase 2: configurá Prisma con el esquema en database/schema.prisma —
Usuario (con presupuesto mensual), Categoria, Gasto. Explicame paso a
paso qué tengo que hacer yo en Railway (crear el proyecto, provisionar
Postgres, copiar la URL de conexión) antes de aplicar la migración.
```

Se instaló Prisma 6 (no la última versión mayor disponible, que cambiaba
la forma de conectar la base de datos y agregaba complejidad innecesaria
para este proyecto).

---

## Fase 3 — Backend

**3a — Autenticación**, dividida en pasos chicos para poder probar cada
uno por separado:

```
3a-i: POST /api/auth/registro (bcrypt para la contraseña).
3a-ii: POST /api/auth/login, devuelve un JWT.
3a-iii: middleware que valida el token + una ruta de prueba (GET /api/auth/me).
3a-iv: PATCH /api/usuario/presupuesto para definir el presupuesto mensual.
Probá cada uno con curl antes de pasar al siguiente.
```

**3b — Categorías**
```
3b: CRUD simple de categorías — GET y POST /api/categorias, protegido
por el middleware de autenticación.
```

**3c — Gastos**, también dividida:
```
3c-i: crear y listar gastos (POST y GET /api/gastos).
3c-ii: filtros por fecha y categoría en el listado (query params).
3c-iii: borrar un gasto — nunca de otro usuario.
3c-iv: GET /api/gastos/resumen — total del mes y total por categoría.
```

---

## Fase 4 — Frontend

**4a — Auth**
```
4a: pantallas de login y registro con React + Vite + Tailwind, mobile-first.
Guardá el token en localStorage y protegé las rutas internas. Las llamadas
a la API tienen que ser relativas (/api/...), sin CORS.
```

**4b — Formulario y listado**
```
4b: formulario para cargar un gasto (categoría, monto, fecha, nota) y
una lista con filtros por fecha y categoría, conectados al backend.
```

**4c — Resumen**
```
4c: sección de resumen con el total del mes, un gráfico simple de gasto
por categoría, y el presupuesto mensual con indicador visual de cuánto
llevo gastado.
```

---

## Fase 5 — Despliegue en Railway

```
5a: antes de tocar Railway, probá el build de producción en mi máquina
(npm run build && npm start) para separar errores de la app de errores
de la plataforma.
5b: ayudame a conectar el repo de GitHub a Railway, configurar las
variables de entorno (DATABASE_URL referenciando el Postgres del mismo
proyecto, JWT_SECRET) y disparar el deploy.
5c: una vez desplegado, generá el dominio público y probá que todo
funcione en producción (login, resumen, rutas internas).
```

Durante 5a se encontró y arregló un bug real: la ruta al frontend
compilado se calculaba mal (`dist/dist/client` en vez de `dist/client`)
porque dependía de `__dirname`, que cambia entre desarrollo y producción.
Se resolvió usando `process.cwd()` en su lugar.

---

## Ronda extra 1 — Diseño visual

```
Quiero mejorar el diseño visual de la app (colores, etc.) — dark mode
por defecto, con un acento verde esmeralda (tema financiero).
```

Se rediseñaron todas las pantallas (login, registro, dashboard, formulario,
lista, resumen) con la nueva paleta oscura, y se ajustaron los colores del
gráfico siguiendo criterios de accesibilidad (contraste, colores de estado
separados de los colores de categoría).

---

## Ronda extra 2 — Mejoras de uso

```
1. Necesito un botón para actualizar manualmente los gastos.
2. En el formulario, poné primero la categoría y después monto/fecha/nota
   (es más intuitivo elegir la categoría primero).
3. En el indicador de presupuesto, mostrá la diferencia: cuánto falta o
   cuánto me pasé.
4. Agregá un botón de configuración para elegir un color por categoría
   (5 colores a elección).
5. Agregá un botón de gráficos: barras por día (desglosadas por
   categoría) y un gráfico de puntos, con rango de fechas.
```

Esto agregó un campo `color` a la tabla de categorías (con su propia
migración), un endpoint para editarlo, un endpoint nuevo
(`/api/gastos/serie`) para los datos agrupados por día, y dos paneles
nuevos en el frontend (configuración de colores y gráficos).

---

## Ronda extra 3 — Ajustes al gráfico circular

```
Cambiá el gráfico de puntos por uno circular (dona) en el panel de
gráficos — el de puntos ya no hace falta.
```

```
El gráfico circular se corta arriba y abajo, hay que agrandarlo. Y en
el de barras, falta mostrar los montos de referencia al costado (no
solo la fecha abajo).
```

Ambos eran bugs reales de geometría SVG: el radio del círculo era más
grande que el alto disponible, y el gráfico de barras no tenía escala de
referencia. Se le dio al circular su propio tamaño (más alto) y se
agregó un eje con tres referencias de monto ($0, mitad, máximo) al
gráfico de barras.

---

## Ronda extra 4 — Porcentajes dinámicos

```
Al lado de cada categoría en el resumen, mostrá el porcentaje que
representa sobre el total (ej: comida 10%, transporte 20%). Y en el
presupuesto, mostrá el porcentaje que queda disponible (o el porcentaje
de exceso). Todo esto tiene que recalcularse solo si cambia el
presupuesto o si agrego categorías nuevas.
```

Al ser valores calculados directamente de los datos (no guardados), se
actualizan automáticamente sin lógica extra.

---

## Ronda extra 5 — Formato de números

```
Los montos se muestran como 57900.00 pero los quiero como 57,900.00 —
coma para los miles, punto para los decimales.
```

Se centralizó el formateo en una sola función (`Intl.NumberFormat`,
configuración "en-US") para que todos los montos de la app se muestren
igual.

---

## Notas para quien quiera repetir este proceso

- Cada fase se probó antes de seguir (con `curl` en el backend, en el
  navegador en el frontend) y se hizo un commit por fase.
- Cuando una fase resultaba demasiado grande para revisar de una sola
  vez, se pidió dividirla más (ej. separar autenticación en registro,
  login y middleware).
- Ante cualquier bug real (la ruta del frontend compilado, el gráfico
  circular cortado), se dejó que la IA lo investigue y explique la causa
  antes de aplicar el arreglo — no alcanza con "probar de nuevo".

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

## Ronda extra 6 — Bug real: categorías compartidas entre usuarios

```
Tengo una web montada en Railway pero tiene un solo error: si un usuario
crea una categoría de algún gasto, se crea para los demás usuarios
también, y no puede ser así. Antes de modificar algo, leé el README.md
y los prompts.
```

Bug real, no de diseño: `Categoria` nunca tuvo relación con `Usuario` en
el esquema de Prisma (a diferencia de `Gasto`, que sí estaba bien
aislado por usuario) ni una restricción de unicidad por usuario, y las
tres rutas de `/api/categorias` (`GET`, `POST`, `PATCH /:id/color`)
tampoco filtraban ni validaban por el usuario autenticado. Se agregó
`Categoria.usuarioId` (con `@@unique([usuarioId, nombre])` en vez de la
unicidad global anterior), y las tres rutas ahora usan el mismo patrón
que ya tenía `gastos.ts` (`req.usuarioId`). De paso se cerró un hueco
relacionado: `POST /api/gastos` no verificaba que la categoría indicada
perteneciera a quien hacía la petición.

Como la base de datos de Railway es la única que existe (local y
producción apuntan a la misma), la migración se escribió a mano para
reasignar sin pérdida de datos las categorías existentes (a la cuenta
`test@test.com`) y, para los pocos casos de gastos de otra cuenta que ya
apuntaban a esas categorías compartidas por el bug, crearles una copia
privada antes de aplicar la restricción de unicidad nueva. La migración
falló una vez en producción por un orden de pasos incorrecto (se
detectó, se corrigió y se volvió a aplicar con `prisma migrate resolve
--rolled-back` + `migrate deploy`, sin pérdida de datos). Luego se
detectó que el código corregido no se había subido a Git todavía —
Railway seguía sirviendo el código viejo contra el esquema ya migrado,
lo que causaba justamente los síntomas reportados después (categorías
"duplicadas" y no poder crear categorías nuevas). Se hizo commit y push
del fix, y se verificó en producción con el propio endpoint de la app.

---

## Ronda extra 7 — Datos de prueba

```
En la cuenta de usuario test@test.com hacé una serie de registros desde
el día 1/6/2026 hasta el 20/7/2026, con registro diario de 3 o más
gastos. Los gastos se pueden repetir, como comida, porque las personas
pueden comer hoy, ayer y mañana.
```

Se corrió un script puntual (no versionado, solo para poblar datos) que
generó 179 gastos para `test@test.com` entre esas fechas: 2-3 comidas
por día (desayuno/almuerzo/cena/snack), transporte casi a diario, y
apariciones ocasionales de cine, deportes, y recibos mensuales de Luz y
Cable — usando siempre las categorías propias de esa cuenta.

---

## Ronda extra 8 — Lista de gastos agrupada por día

```
Arriba ya aparecen los gastos, lo que pasa es que se crea una lista muy
larga si hay muchos registros y se pierde. ¿Creamos una lista agrupada
por día, borramos ese apartado, o tenés alguna sugerencia?
```

Se agrupó la lista por fecha (con el total de cada día como
encabezado) y el filtro de fechas ahora arranca precargado en el mes
actual en vez de mostrar todo el historial de una vez; el historial
completo se sigue pudiendo ver ampliando el rango de fechas.

---

## Ronda extra 9 — Tutorial de ayuda

```
Como última modificación, agregá un tutorial o ícono de ayuda que
explique el funcionamiento de la app. Puede ser un botón con forma de
"?" o el típico triángulo de advertencia, que se destaque hasta el
primer clic, o con un checkbox de "no mostrar de nuevo" como en los
avisos comunes. ¿Vos qué opinás?
```

Se recomendó el ícono "?" en vez del triángulo (ese se asocia a
error/advertencia, no a ayuda) y un pulso sutil en vez de mover el botón
por la pantalla. El tutorial se abre solo la primera vez que se inicia
sesión, con checkbox "no mostrar de nuevo" guardado en `localStorage`,
y el botón de ayuda queda siempre disponible en el header para
reabrirlo manualmente.

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
- Como local y producción comparten la misma base de datos en Railway,
  cuando un cambio necesita migración: aplicar la migración y subir
  (commit + push) el código que la usa como un solo paso, no por
  separado — dejar el código viejo corriendo contra el esquema nuevo (o
  al revés) rompe la app en producción, como pasó en la Ronda extra 6.

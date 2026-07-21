-- Categoria pasa a ser privada por usuario (antes era global y visible/editable
-- por cualquier usuario autenticado).

-- 1. Columna nueva, todavía opcional para poder rellenar filas existentes.
ALTER TABLE "Categoria" ADD COLUMN "usuarioId" INTEGER;

-- 2. Backfill: las categorías existentes (creadas antes de este cambio, sin
--    dueño) se asignan a la cuenta de prueba test@test.com.
UPDATE "Categoria" c
SET "usuarioId" = (SELECT id FROM "Usuario" WHERE correo = 'test@test.com')
WHERE c."usuarioId" IS NULL;

-- 3. Se quita la unicidad global de nombre para poder crear, en el paso
--    siguiente, copias privadas de una categoría con el mismo nombre para
--    otros usuarios (la unicidad por usuario se recrea en el paso 5).
DROP INDEX IF EXISTS "Categoria_nombre_key";

-- 4. Si algún gasto de OTRO usuario ya apuntaba a una de esas categorías
--    (categoría "compartida" de facto por el bug), se le crea una copia
--    privada con el mismo nombre/color y se re-apunta ese gasto a la copia,
--    en vez de dejarlo referenciando una categoría que ya no es suya.
DO $$
DECLARE
  r RECORD;
  nueva_categoria_id INTEGER;
BEGIN
  FOR r IN
    SELECT DISTINCT g."usuarioId" AS owner_id, c.id AS old_cat_id, c.nombre, c.color
    FROM "Gasto" g
    JOIN "Categoria" c ON c.id = g."categoriaId"
    WHERE g."usuarioId" <> c."usuarioId"
  LOOP
    SELECT id INTO nueva_categoria_id
    FROM "Categoria"
    WHERE "usuarioId" = r.owner_id AND nombre = r.nombre;

    IF nueva_categoria_id IS NULL THEN
      INSERT INTO "Categoria" (nombre, color, "usuarioId")
      VALUES (r.nombre, r.color, r.owner_id)
      RETURNING id INTO nueva_categoria_id;
    END IF;

    UPDATE "Gasto"
    SET "categoriaId" = nueva_categoria_id
    WHERE "usuarioId" = r.owner_id AND "categoriaId" = r.old_cat_id;
  END LOOP;
END $$;

-- 5. Ahora que toda fila tiene dueño, la columna pasa a ser obligatoria y
--    se recrea la unicidad de nombre, esta vez por usuario.
ALTER TABLE "Categoria" ALTER COLUMN "usuarioId" SET NOT NULL;
CREATE UNIQUE INDEX "Categoria_usuarioId_nombre_key" ON "Categoria"("usuarioId", "nombre");

-- 6. Relación con Usuario.
ALTER TABLE "Categoria" ADD CONSTRAINT "Categoria_usuarioId_fkey"
  FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

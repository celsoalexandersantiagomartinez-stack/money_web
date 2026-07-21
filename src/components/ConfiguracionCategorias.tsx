import { useState } from "react";
import { apiFetch, ApiError } from "../lib/api";
import { card, errorBanner } from "../lib/ui";
import { OPCIONES_COLOR } from "../lib/colores";
import type { Categoria } from "../lib/types";

interface Props {
  categorias: Categoria[];
  onCategoriaActualizada: (categoria: Categoria) => void;
  onClose: () => void;
}

export default function ConfiguracionCategorias({
  categorias,
  onCategoriaActualizada,
  onClose,
}: Props) {
  const [error, setError] = useState<string | null>(null);
  const [guardandoId, setGuardandoId] = useState<number | null>(null);

  async function handleElegirColor(categoria: Categoria, color: string) {
    setGuardandoId(categoria.id);
    setError(null);
    try {
      const nuevaColor = categoria.color === color ? null : color;
      const actualizada = await apiFetch<Categoria>(`/categorias/${categoria.id}/color`, {
        method: "PATCH",
        body: JSON.stringify({ color: nuevaColor }),
      });
      onCategoriaActualizada(actualizada);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo guardar el color.");
    } finally {
      setGuardandoId(null);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
      <div className={`w-full max-w-sm p-4 space-y-4 ${card}`}>
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-100">Color por categoría</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-200 text-sm">
            Cerrar
          </button>
        </div>

        {error && <p className={errorBanner}>{error}</p>}

        <ul className="space-y-3">
          {categorias.map((cat) => (
            <li key={cat.id} className="flex items-center justify-between">
              <span className="text-sm text-gray-200">{cat.nombre}</span>
              <div className="flex gap-2">
                {OPCIONES_COLOR.map((opcion) => (
                  <button
                    key={opcion.key}
                    type="button"
                    disabled={guardandoId === cat.id}
                    onClick={() => handleElegirColor(cat, opcion.key)}
                    title={opcion.label}
                    className={`h-6 w-6 rounded-full ${opcion.dot} ${
                      cat.color === opcion.key
                        ? "ring-2 ring-offset-2 ring-offset-gray-800 ring-gray-100"
                        : "opacity-60 hover:opacity-100"
                    }`}
                  />
                ))}
              </div>
            </li>
          ))}
          {categorias.length === 0 && (
            <p className="text-sm text-gray-500">Todavía no creaste categorías.</p>
          )}
        </ul>
      </div>
    </div>
  );
}

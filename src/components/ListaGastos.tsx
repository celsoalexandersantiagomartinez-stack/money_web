import { useEffect, useState } from "react";
import { apiFetch, ApiError } from "../lib/api";
import type { Categoria, Gasto } from "../lib/types";
import { card, errorBanner } from "../lib/ui";
import { colorDeCategoria } from "../lib/colores";

interface Props {
  categorias: Categoria[];
  reloadTrigger: number;
}

const filterInput =
  "rounded border border-gray-700 bg-gray-900 px-2 py-1 text-xs text-gray-100 focus:outline-none focus:border-emerald-500";

export default function ListaGastos({ categorias, reloadTrigger }: Props) {
  const [gastos, setGastos] = useState<Gasto[]>([]);
  const [categoriaId, setCategoriaId] = useState("");
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams();
    if (categoriaId) params.set("categoriaId", categoriaId);
    if (desde) params.set("desde", desde);
    if (hasta) params.set("hasta", hasta);

    apiFetch<Gasto[]>(`/gastos?${params.toString()}`)
      .then(setGastos)
      .catch((err) =>
        setError(err instanceof ApiError ? err.message : "No se pudieron cargar los gastos."),
      );
  }, [categoriaId, desde, hasta, reloadTrigger]);

  async function handleBorrar(id: number) {
    try {
      await apiFetch(`/gastos/${id}`, { method: "DELETE" });
      setGastos((prev) => prev.filter((g) => g.id !== id));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo borrar el gasto.");
    }
  }

  return (
    <div className={`p-4 space-y-3 ${card}`}>
      <h2 className="text-sm font-semibold text-gray-100">Gastos</h2>

      {error && <p className={errorBanner}>{error}</p>}

      <div className="flex flex-wrap gap-2">
        <select
          value={categoriaId}
          onChange={(e) => setCategoriaId(e.target.value)}
          className={filterInput}
        >
          <option value="">Todas las categorías</option>
          {categorias.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nombre}
            </option>
          ))}
        </select>
        <input
          type="date"
          value={desde}
          onChange={(e) => setDesde(e.target.value)}
          className={filterInput}
        />
        <input
          type="date"
          value={hasta}
          onChange={(e) => setHasta(e.target.value)}
          className={filterInput}
        />
      </div>

      <ul className="divide-y divide-gray-700">
        {gastos.length === 0 && (
          <li className="text-sm text-gray-500 py-2">No hay gastos para mostrar.</li>
        )}
        {gastos.map((g) => (
          <li key={g.id} className="py-2 flex items-center justify-between text-sm">
            <div>
              <p className="font-medium text-gray-100 flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full ${colorDeCategoria(g.categoria.color).dot}`} />
                ${Number(g.monto).toFixed(2)} — {g.categoria.nombre}
              </p>
              <p className="text-xs text-gray-500">
                {new Date(g.fecha).toLocaleDateString()}
                {g.nota ? ` · ${g.nota}` : ""}
              </p>
            </div>
            <button
              onClick={() => handleBorrar(g.id)}
              className="text-xs text-red-400 hover:text-red-300 font-medium"
            >
              Borrar
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

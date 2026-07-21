import { useEffect, useState } from "react";
import { apiFetch, ApiError } from "../lib/api";
import type { Categoria, Gasto } from "../lib/types";
import { card, errorBanner } from "../lib/ui";
import { colorDeCategoria } from "../lib/colores";
import { formatMonto } from "../lib/format";

interface Props {
  categorias: Categoria[];
  reloadTrigger: number;
}

const filterInput =
  "rounded border border-gray-700 bg-gray-900 px-2 py-1 text-xs text-gray-100 focus:outline-none focus:border-emerald-500";

function aIsoLocal(d: Date): string {
  const mes = String(d.getMonth() + 1).padStart(2, "0");
  const dia = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mes}-${dia}`;
}

function primerDiaDelMes(): string {
  const hoy = new Date();
  return aIsoLocal(new Date(hoy.getFullYear(), hoy.getMonth(), 1));
}

function hoyIso(): string {
  return aIsoLocal(new Date());
}

function gruposPorDia(gastos: Gasto[]) {
  const mapa = new Map<string, Gasto[]>();
  for (const g of gastos) {
    const dia = g.fecha.slice(0, 10);
    if (!mapa.has(dia)) mapa.set(dia, []);
    mapa.get(dia)!.push(g);
  }
  return Array.from(mapa.entries())
    .sort((a, b) => b[0].localeCompare(a[0]))
    .map(([fecha, items]) => ({
      fecha,
      items,
      total: items.reduce((acc, g) => acc + Number(g.monto), 0),
    }));
}

function encabezadoDia(fechaIso: string): string {
  const [anio, mes, dia] = fechaIso.split("-").map(Number);
  const texto = new Date(anio, mes - 1, dia).toLocaleDateString(undefined, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

export default function ListaGastos({ categorias, reloadTrigger }: Props) {
  const [gastos, setGastos] = useState<Gasto[]>([]);
  const [categoriaId, setCategoriaId] = useState("");
  const [desde, setDesde] = useState(primerDiaDelMes());
  const [hasta, setHasta] = useState(hoyIso());
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

      {gastos.length === 0 && (
        <p className="text-sm text-gray-500 py-2">No hay gastos para mostrar.</p>
      )}

      <div className="space-y-4 max-h-[32rem] overflow-y-auto pr-1">
        {gruposPorDia(gastos).map(({ fecha, items, total }) => (
          <div key={fecha}>
            <div className="flex items-center justify-between sticky top-0 bg-gray-800/95 backdrop-blur py-1">
              <h3 className="text-xs font-semibold text-gray-300">{encabezadoDia(fecha)}</h3>
              <span className="text-xs font-semibold text-gray-400">${formatMonto(total)}</span>
            </div>
            <ul className="divide-y divide-gray-700">
              {items.map((g) => (
                <li key={g.id} className="py-2 flex items-center justify-between text-sm">
                  <div>
                    <p className="font-medium text-gray-100 flex items-center gap-2">
                      <span
                        className={`h-2 w-2 rounded-full ${colorDeCategoria(g.categoria.color).dot}`}
                      />
                      ${formatMonto(Number(g.monto))} — {g.categoria.nombre}
                    </p>
                    {g.nota && <p className="text-xs text-gray-500">{g.nota}</p>}
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
        ))}
      </div>
    </div>
  );
}

import { useState, type FormEvent } from "react";
import { apiFetch, ApiError } from "../lib/api";
import type { Categoria } from "../lib/types";

interface Props {
  categorias: Categoria[];
  onCategoriaCreada: (categoria: Categoria) => void;
  onGastoCreado: () => void;
}

export default function FormularioGasto({ categorias, onCategoriaCreada, onGastoCreado }: Props) {
  const [monto, setMonto] = useState("");
  const [categoriaId, setCategoriaId] = useState("");
  const [fecha, setFecha] = useState(() => new Date().toISOString().slice(0, 10));
  const [nota, setNota] = useState("");
  const [nuevaCategoria, setNuevaCategoria] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

  async function handleCrearCategoria() {
    if (!nuevaCategoria.trim()) return;
    try {
      const categoria = await apiFetch<Categoria>("/categorias", {
        method: "POST",
        body: JSON.stringify({ nombre: nuevaCategoria.trim() }),
      });
      onCategoriaCreada(categoria);
      setCategoriaId(String(categoria.id));
      setNuevaCategoria("");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo crear la categoría.");
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    const montoNum = Number(monto);
    if (!montoNum || montoNum <= 0) {
      setError("Ingresá un monto válido.");
      return;
    }
    if (!categoriaId) {
      setError("Elegí una categoría.");
      return;
    }

    setCargando(true);
    try {
      await apiFetch("/gastos", {
        method: "POST",
        body: JSON.stringify({
          monto: montoNum,
          categoriaId: Number(categoriaId),
          fecha,
          nota: nota.trim() || undefined,
        }),
      });
      setMonto("");
      setNota("");
      onGastoCreado();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo registrar el gasto.");
    } finally {
      setCargando(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-4 space-y-3">
      <h2 className="text-sm font-semibold text-gray-900">Registrar gasto</h2>

      {error && <p className="text-sm text-red-600 bg-red-50 rounded p-2">{error}</p>}

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Monto</label>
          <input
            type="number"
            step="0.01"
            min="0"
            required
            value={monto}
            onChange={(e) => setMonto(e.target.value)}
            className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Fecha</label>
          <input
            type="date"
            required
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Categoría</label>
        <select
          value={categoriaId}
          onChange={(e) => setCategoriaId(e.target.value)}
          className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
        >
          <option value="">Elegí una categoría</option>
          {categorias.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nombre}
            </option>
          ))}
        </select>
        <div className="flex gap-2 mt-2">
          <input
            placeholder="Nueva categoría..."
            value={nuevaCategoria}
            onChange={(e) => setNuevaCategoria(e.target.value)}
            className="flex-1 rounded border border-gray-300 px-3 py-1.5 text-xs"
          />
          <button
            type="button"
            onClick={handleCrearCategoria}
            className="text-xs font-medium text-blue-600 px-2"
          >
            + agregar
          </button>
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Nota (opcional)</label>
        <input
          value={nota}
          onChange={(e) => setNota(e.target.value)}
          className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
        />
      </div>

      <button
        type="submit"
        disabled={cargando}
        className="w-full bg-blue-600 text-white rounded py-2 text-sm font-medium disabled:opacity-50"
      >
        {cargando ? "Guardando..." : "Registrar gasto"}
      </button>
    </form>
  );
}

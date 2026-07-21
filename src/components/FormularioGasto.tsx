import { useState, type FormEvent } from "react";
import { apiFetch, ApiError } from "../lib/api";
import type { Categoria } from "../lib/types";
import { card, label, input, buttonPrimary, errorBanner } from "../lib/ui";

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
    <form onSubmit={handleSubmit} className={`p-4 space-y-3 ${card}`}>
      <h2 className="text-sm font-semibold text-gray-100">Registrar gasto</h2>

      {error && <p className={errorBanner}>{error}</p>}

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={label}>Monto</label>
          <input
            type="number"
            step="0.01"
            min="0"
            required
            value={monto}
            onChange={(e) => setMonto(e.target.value)}
            className={input}
          />
        </div>
        <div>
          <label className={label}>Fecha</label>
          <input
            type="date"
            required
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            className={input}
          />
        </div>
      </div>

      <div>
        <label className={label}>Categoría</label>
        <select
          value={categoriaId}
          onChange={(e) => setCategoriaId(e.target.value)}
          className={input}
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
            className={`flex-1 ${input} py-1.5 text-xs`}
          />
          <button
            type="button"
            onClick={handleCrearCategoria}
            className="text-xs font-medium text-emerald-400 hover:text-emerald-300 px-2"
          >
            + agregar
          </button>
        </div>
      </div>

      <div>
        <label className={label}>Nota (opcional)</label>
        <input value={nota} onChange={(e) => setNota(e.target.value)} className={input} />
      </div>

      <button type="submit" disabled={cargando} className={`w-full ${buttonPrimary}`}>
        {cargando ? "Guardando..." : "Registrar gasto"}
      </button>
    </form>
  );
}

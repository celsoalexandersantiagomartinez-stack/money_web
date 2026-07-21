import { useEffect, useState } from "react";
import { apiFetch, ApiError } from "../lib/api";
import { card, errorBanner, input, buttonPrimary } from "../lib/ui";

interface ResumenData {
  totalMes: number;
  porCategoria: { categoria: string; total: number }[];
}

interface Props {
  reloadTrigger: number;
}

export default function Resumen({ reloadTrigger }: Props) {
  const [resumen, setResumen] = useState<ResumenData | null>(null);
  const [presupuesto, setPresupuesto] = useState<number | null>(null);
  const [inputPresupuesto, setInputPresupuesto] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    apiFetch<ResumenData>("/gastos/resumen")
      .then(setResumen)
      .catch((err) =>
        setError(err instanceof ApiError ? err.message : "No se pudo cargar el resumen."),
      );
  }, [reloadTrigger]);

  useEffect(() => {
    apiFetch<{ presupuestoMensual: string | null }>("/auth/me").then((data) => {
      const valor = data.presupuestoMensual ? Number(data.presupuestoMensual) : null;
      setPresupuesto(valor);
      setInputPresupuesto(valor !== null ? String(valor) : "");
    });
  }, [reloadTrigger]);

  async function handleGuardarPresupuesto() {
    const valor = Number(inputPresupuesto);
    if (!valor || valor < 0) {
      setError("Ingresá un presupuesto válido.");
      return;
    }
    setGuardando(true);
    setError(null);
    try {
      await apiFetch("/usuario/presupuesto", {
        method: "PATCH",
        body: JSON.stringify({ presupuestoMensual: valor }),
      });
      setPresupuesto(valor);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo guardar el presupuesto.");
    } finally {
      setGuardando(false);
    }
  }

  if (!resumen) {
    return <div className={`p-4 text-sm text-gray-500 ${card}`}>Cargando resumen...</div>;
  }

  const maxCategoria = Math.max(1, ...resumen.porCategoria.map((c) => c.total));
  const porcentajePresupuesto = presupuesto
    ? Math.min(100, (resumen.totalMes / presupuesto) * 100)
    : null;
  const excedido = presupuesto !== null && resumen.totalMes > presupuesto;

  return (
    <div className={`p-4 space-y-4 ${card}`}>
      <h2 className="text-sm font-semibold text-gray-100">Resumen del mes</h2>

      {error && <p className={errorBanner}>{error}</p>}

      <p className="text-2xl font-semibold text-gray-100">${resumen.totalMes.toFixed(2)}</p>

      <div className="space-y-2">
        {resumen.porCategoria.length === 0 && (
          <p className="text-sm text-gray-500">Todavía no hay gastos este mes.</p>
        )}
        {resumen.porCategoria.map((c) => (
          <div key={c.categoria}>
            <div className="flex justify-between text-xs text-gray-400 mb-1">
              <span>{c.categoria}</span>
              <span>${c.total.toFixed(2)}</span>
            </div>
            <div className="h-2 bg-gray-700 rounded">
              <div
                className="h-2 bg-blue-500 rounded"
                style={{ width: `${(c.total / maxCategoria) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="pt-2 border-t border-gray-700 space-y-2">
        <label className="block text-xs font-medium text-gray-300">Presupuesto mensual</label>
        <div className="flex gap-2">
          <input
            type="number"
            step="0.01"
            min="0"
            value={inputPresupuesto}
            onChange={(e) => setInputPresupuesto(e.target.value)}
            className={`flex-1 ${input} py-1.5`}
          />
          <button
            onClick={handleGuardarPresupuesto}
            disabled={guardando}
            className={`px-3 text-xs ${buttonPrimary}`}
          >
            Guardar
          </button>
        </div>

        {presupuesto !== null && (
          <div>
            <div className="h-2 bg-gray-700 rounded">
              <div
                className={`h-2 rounded ${excedido ? "bg-red-500" : "bg-emerald-500"}`}
                style={{ width: `${porcentajePresupuesto}%` }}
              />
            </div>
            <p className={`text-xs mt-1 ${excedido ? "text-red-400" : "text-gray-400"}`}>
              ${resumen.totalMes.toFixed(2)} de ${presupuesto.toFixed(2)}
              {excedido ? " — superaste el presupuesto" : ""}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

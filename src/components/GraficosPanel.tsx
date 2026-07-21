import { useEffect, useState } from "react";
import { apiFetch, ApiError } from "../lib/api";
import { card, errorBanner } from "../lib/ui";
import { colorDeCategoria } from "../lib/colores";
import type { Gasto } from "../lib/types";

interface SerieDia {
  fecha: string;
  categorias: { categoria: string; total: number; color: string | null }[];
}

interface Props {
  onClose: () => void;
}

function hoyMenosDias(dias: number): string {
  const d = new Date();
  d.setDate(d.getDate() - dias);
  return d.toISOString().slice(0, 10);
}

const ANCHO = 600;
const ALTO = 220;

export default function GraficosPanel({ onClose }: Props) {
  const [desde, setDesde] = useState(() => hoyMenosDias(29));
  const [hasta, setHasta] = useState(() => hoyMenosDias(0));
  const [vista, setVista] = useState<"barras" | "puntos">("barras");
  const [serie, setSerie] = useState<SerieDia[]>([]);
  const [gastos, setGastos] = useState<Gasto[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams({ desde, hasta });
    Promise.all([
      apiFetch<SerieDia[]>(`/gastos/serie?${params.toString()}`),
      apiFetch<Gasto[]>(`/gastos?${params.toString()}`),
    ])
      .then(([serieData, gastosData]) => {
        setSerie(serieData);
        setGastos(gastosData);
      })
      .catch((err) =>
        setError(err instanceof ApiError ? err.message : "No se pudieron cargar los gráficos."),
      );
  }, [desde, hasta]);

  const categoriasPresentes = Array.from(
    new Set(
      vista === "barras"
        ? serie.flatMap((d) => d.categorias.map((c) => c.categoria))
        : gastos.map((g) => g.categoria.nombre),
    ),
  );
  const colorPorNombre = new Map<string, string | null>();
  serie.forEach((d) => d.categorias.forEach((c) => colorPorNombre.set(c.categoria, c.color)));
  gastos.forEach((g) => colorPorNombre.set(g.categoria.nombre, g.categoria.color));

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className={`w-full max-w-2xl p-4 space-y-4 ${card}`}>
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-100">Gráficos</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-200 text-sm">
            Cerrar
          </button>
        </div>

        {error && <p className={errorBanner}>{error}</p>}

        <div className="flex flex-wrap items-center gap-2">
          <input
            type="date"
            value={desde}
            onChange={(e) => setDesde(e.target.value)}
            className="rounded border border-gray-700 bg-gray-900 px-2 py-1 text-xs text-gray-100"
          />
          <span className="text-xs text-gray-500">a</span>
          <input
            type="date"
            value={hasta}
            onChange={(e) => setHasta(e.target.value)}
            className="rounded border border-gray-700 bg-gray-900 px-2 py-1 text-xs text-gray-100"
          />

          <div className="ml-auto flex rounded border border-gray-700 overflow-hidden">
            <button
              onClick={() => setVista("barras")}
              className={`px-3 py-1 text-xs ${
                vista === "barras" ? "bg-emerald-600 text-white" : "text-gray-300"
              }`}
            >
              Barras por día
            </button>
            <button
              onClick={() => setVista("puntos")}
              className={`px-3 py-1 text-xs ${
                vista === "puntos" ? "bg-emerald-600 text-white" : "text-gray-300"
              }`}
            >
              Puntos
            </button>
          </div>
        </div>

        {vista === "barras" ? <GraficoBarras serie={serie} /> : <GraficoPuntos gastos={gastos} />}

        {categoriasPresentes.length > 0 && (
          <ul className="flex flex-wrap gap-3">
            {categoriasPresentes.map((nombre) => {
              const opcion = colorDeCategoria(colorPorNombre.get(nombre));
              return (
                <li key={nombre} className="flex items-center gap-1.5 text-xs text-gray-300">
                  <span className={`h-2.5 w-2.5 rounded-full ${opcion.dot}`} />
                  {nombre}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

function GraficoBarras({ serie }: { serie: SerieDia[] }) {
  if (serie.length === 0) {
    return <p className="text-sm text-gray-500 py-8 text-center">No hay gastos en este rango.</p>;
  }

  const maxTotal = Math.max(1, ...serie.map((d) => d.categorias.reduce((acc, c) => acc + c.total, 0)));
  const slot = ANCHO / serie.length;
  const barWidth = Math.min(36, slot * 0.6);
  const zonaBarras = ALTO - 24;
  const cadaCuanto = Math.max(1, Math.ceil(serie.length / 8));

  return (
    <svg viewBox={`0 0 ${ANCHO} ${ALTO}`} className="w-full" style={{ height: ALTO }}>
      <line x1={0} y1={zonaBarras} x2={ANCHO} y2={zonaBarras} stroke="#374151" strokeWidth={1} />
      {serie.map((dia, i) => {
        let y = zonaBarras;
        const x = i * slot + (slot - barWidth) / 2;
        return (
          <g key={dia.fecha}>
            {dia.categorias.map((cat) => {
              const alto = (cat.total / maxTotal) * zonaBarras * 0.95;
              const opcion = colorDeCategoria(cat.color);
              y -= alto;
              return (
                <rect
                  key={cat.categoria}
                  x={x}
                  y={y}
                  width={barWidth}
                  height={alto}
                  fill={opcion.hex}
                  rx={2}
                />
              );
            })}
            {i % cadaCuanto === 0 && (
              <text
                x={x + barWidth / 2}
                y={ALTO - 6}
                fontSize={9}
                fill="#898781"
                textAnchor="middle"
              >
                {dia.fecha.slice(5)}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

function GraficoPuntos({ gastos }: { gastos: Gasto[] }) {
  if (gastos.length === 0) {
    return <p className="text-sm text-gray-500 py-8 text-center">No hay gastos en este rango.</p>;
  }

  const fechas = gastos.map((g) => new Date(g.fecha).getTime());
  const minFecha = Math.min(...fechas);
  const maxFecha = Math.max(...fechas);
  const rangoFecha = Math.max(1, maxFecha - minFecha);
  const maxMonto = Math.max(1, ...gastos.map((g) => Number(g.monto)));
  const zona = ALTO - 24;

  return (
    <svg viewBox={`0 0 ${ANCHO} ${ALTO}`} className="w-full" style={{ height: ALTO }}>
      <line x1={0} y1={zona} x2={ANCHO} y2={zona} stroke="#374151" strokeWidth={1} />
      {gastos.map((g) => {
        const t = new Date(g.fecha).getTime();
        const x = ((t - minFecha) / rangoFecha) * (ANCHO - 20) + 10;
        const y = zona - (Number(g.monto) / maxMonto) * zona * 0.95;
        const opcion = colorDeCategoria(g.categoria.color);
        return (
          <circle
            key={g.id}
            cx={x}
            cy={y}
            r={5}
            fill={opcion.hex}
            fillOpacity={0.85}
            stroke="#111827"
            strokeWidth={1}
          />
        );
      })}
      <text x={8} y={12} fontSize={9} fill="#898781">
        ${maxMonto.toFixed(0)}
      </text>
      <text x={8} y={zona - 4} fontSize={9} fill="#898781">
        $0
      </text>
    </svg>
  );
}

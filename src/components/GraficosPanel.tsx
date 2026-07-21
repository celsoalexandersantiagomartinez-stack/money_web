import { useEffect, useState } from "react";
import { apiFetch, ApiError } from "../lib/api";
import { card, errorBanner } from "../lib/ui";
import { colorDeCategoria } from "../lib/colores";
import { formatEntero } from "../lib/format";

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
  const [vista, setVista] = useState<"barras" | "circular">("barras");
  const [serie, setSerie] = useState<SerieDia[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams({ desde, hasta });
    apiFetch<SerieDia[]>(`/gastos/serie?${params.toString()}`)
      .then(setSerie)
      .catch((err) =>
        setError(err instanceof ApiError ? err.message : "No se pudieron cargar los gráficos."),
      );
  }, [desde, hasta]);

  const colorPorNombre = new Map<string, string | null>();
  serie.forEach((d) => d.categorias.forEach((c) => colorPorNombre.set(c.categoria, c.color)));
  const categoriasPresentes = Array.from(colorPorNombre.keys());

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
              onClick={() => setVista("circular")}
              className={`px-3 py-1 text-xs ${
                vista === "circular" ? "bg-emerald-600 text-white" : "text-gray-300"
              }`}
            >
              Circular
            </button>
          </div>
        </div>

        {vista === "barras" ? <GraficoBarras serie={serie} /> : <GraficoCircular serie={serie} />}

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
  const margenIzq = 52;
  const anchoBarras = ANCHO - margenIzq;
  const slot = anchoBarras / serie.length;
  const barWidth = Math.min(36, slot * 0.6);
  const zonaBarras = ALTO - 24;
  const cadaCuanto = Math.max(1, Math.ceil(serie.length / 8));

  return (
    <svg viewBox={`0 0 ${ANCHO} ${ALTO}`} className="w-full" style={{ height: ALTO }}>
      {[0, 0.5, 1].map((frac) => {
        const y = zonaBarras - zonaBarras * 0.95 * frac;
        return (
          <g key={frac}>
            <line
              x1={margenIzq}
              y1={y}
              x2={ANCHO}
              y2={y}
              stroke="#374151"
              strokeWidth={1}
              strokeDasharray={frac === 0 ? undefined : "3 3"}
            />
            <text x={margenIzq - 6} y={y + 3} fontSize={9} fill="#898781" textAnchor="end">
              ${formatEntero(maxTotal * frac)}
            </text>
          </g>
        );
      })}
      {serie.map((dia, i) => {
        let y = zonaBarras;
        const x = margenIzq + i * slot + (slot - barWidth) / 2;
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

function GraficoCircular({ serie }: { serie: SerieDia[] }) {
  const totales = new Map<string, { total: number; color: string | null }>();
  serie.forEach((d) =>
    d.categorias.forEach((c) => {
      const previo = totales.get(c.categoria);
      totales.set(c.categoria, {
        total: (previo?.total ?? 0) + c.total,
        color: c.color,
      });
    }),
  );

  const entradas = Array.from(totales.entries());
  const total = entradas.reduce((acc, [, d]) => acc + d.total, 0);

  if (total === 0) {
    return <p className="text-sm text-gray-500 py-8 text-center">No hay gastos en este rango.</p>;
  }

  const ALTO_CIRCULAR = 300;
  const cx = ANCHO / 2;
  const cy = ALTO_CIRCULAR / 2;
  const r = 110;
  const grosor = 34;
  const circunferencia = 2 * Math.PI * r;
  let acumulado = 0;

  return (
    <svg viewBox={`0 0 ${ANCHO} ${ALTO_CIRCULAR}`} className="w-full" style={{ height: ALTO_CIRCULAR }}>
      <g transform={`rotate(-90 ${cx} ${cy})`}>
        {entradas.map(([nombre, datos]) => {
          const pct = datos.total / total;
          const dash = pct * circunferencia;
          const offset = -acumulado * circunferencia;
          acumulado += pct;
          const opcion = colorDeCategoria(datos.color);
          return (
            <circle
              key={nombre}
              cx={cx}
              cy={cy}
              r={r}
              fill="none"
              stroke={opcion.hex}
              strokeWidth={grosor}
              strokeDasharray={`${dash} ${circunferencia - dash}`}
              strokeDashoffset={offset}
            />
          );
        })}
      </g>
      <text x={cx} y={cy - 6} textAnchor="middle" fontSize={16} fill="#f3f4f6" fontWeight={600}>
        ${formatEntero(total)}
      </text>
      <text x={cx} y={cy + 12} textAnchor="middle" fontSize={10} fill="#898781">
        total del rango
      </text>
    </svg>
  );
}

import { useState } from "react";
import { card, buttonPrimary } from "../lib/ui";
import { RefreshIcon, SettingsIcon, ChartIcon } from "./icons";

interface Props {
  onClose: (noMostrarDeNuevo: boolean) => void;
}

const pasos = [
  {
    titulo: "1. Registrá un gasto",
    texto:
      "Elegí la categoría, el monto, la fecha y (opcional) una nota, y tocá \"Agregar\". Si la categoría no existe todavía, podés crearla ahí mismo escribiendo su nombre.",
  },
  {
    titulo: "2. Revisá tus gastos",
    texto:
      "Debajo del formulario aparecen tus gastos agrupados por día, con el total de cada día. Podés filtrar por categoría o por rango de fechas, y borrar cualquier gasto con el botón \"Borrar\".",
  },
  {
    titulo: "3. Mirá el resumen y tu presupuesto",
    texto:
      "Arriba de todo ves el total del mes y cuánto representa cada categoría. Ahí mismo podés definir tu presupuesto mensual y ver cuánto te queda disponible (o cuánto te excediste).",
  },
  {
    titulo: "4. Personalizá los colores",
    texto: "Con el ícono de engranaje elegís un color para cada categoría, para identificarlas rápido.",
    icono: <SettingsIcon className="h-4 w-4" />,
  },
  {
    titulo: "5. Mirá tus gráficos",
    texto:
      "Con el ícono de barras abrís el panel de gráficos: gasto por día (barras) o por categoría (dona), eligiendo el rango de fechas que quieras.",
    icono: <ChartIcon className="h-4 w-4" />,
  },
  {
    titulo: "6. Actualizá cuando quieras",
    texto: "El ícono de flechas circulares vuelve a cargar tus datos más recientes.",
    icono: <RefreshIcon className="h-4 w-4" />,
  },
];

export default function AyudaTutorial({ onClose }: Props) {
  const [noMostrarDeNuevo, setNoMostrarDeNuevo] = useState(false);

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className={`w-full max-w-lg p-4 space-y-4 ${card}`}>
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-100">Cómo funciona Money Web</h2>
          <button
            onClick={() => onClose(noMostrarDeNuevo)}
            className="text-gray-400 hover:text-gray-200 text-sm"
          >
            ✕
          </button>
        </div>

        <div className="space-y-3">
          {pasos.map((p) => (
            <div key={p.titulo} className="flex gap-2">
              {p.icono && (
                <span className="mt-0.5 text-emerald-400 shrink-0">{p.icono}</span>
              )}
              <div>
                <p className="text-sm font-medium text-gray-100">{p.titulo}</p>
                <p className="text-xs text-gray-400">{p.texto}</p>
              </div>
            </div>
          ))}
        </div>

        <label className="flex items-center gap-2 text-xs text-gray-400 pt-2 border-t border-gray-700">
          <input
            type="checkbox"
            checked={noMostrarDeNuevo}
            onChange={(e) => setNoMostrarDeNuevo(e.target.checked)}
            className="accent-emerald-500"
          />
          No mostrar de nuevo al iniciar sesión
        </label>

        <button onClick={() => onClose(noMostrarDeNuevo)} className={`w-full ${buttonPrimary}`}>
          Entendido
        </button>
      </div>
    </div>
  );
}

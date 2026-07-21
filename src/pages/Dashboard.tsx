import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch, ApiError } from "../lib/api";
import { clearToken } from "../lib/auth";
import type { Categoria } from "../lib/types";
import { errorBanner } from "../lib/ui";
import { RefreshIcon, SettingsIcon, ChartIcon } from "../components/icons";
import FormularioGasto from "../components/FormularioGasto";
import ListaGastos from "../components/ListaGastos";
import Resumen from "../components/Resumen";
import ConfiguracionCategorias from "../components/ConfiguracionCategorias";
import GraficosPanel from "../components/GraficosPanel";

export default function Dashboard() {
  const navigate = useNavigate();
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [reloadTrigger, setReloadTrigger] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [mostrarConfig, setMostrarConfig] = useState(false);
  const [mostrarGraficos, setMostrarGraficos] = useState(false);

  useEffect(() => {
    apiFetch<Categoria[]>("/categorias")
      .then(setCategorias)
      .catch((err) =>
        setError(err instanceof ApiError ? err.message : "No se pudieron cargar las categorías."),
      );
  }, [reloadTrigger]);

  function handleLogout() {
    clearToken();
    navigate("/login");
  }

  function handleActualizar() {
    setReloadTrigger((n) => n + 1);
  }

  return (
    <div className="min-h-screen bg-gray-950 p-4 space-y-4">
      <header className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-gray-100">
          Money <span className="text-emerald-400">Web</span>
        </h1>
        <div className="flex items-center gap-3">
          <button
            onClick={handleActualizar}
            title="Actualizar"
            className="text-gray-400 hover:text-gray-100"
          >
            <RefreshIcon className="h-5 w-5" />
          </button>
          <button
            onClick={() => setMostrarConfig(true)}
            title="Configurar colores"
            className="text-gray-400 hover:text-gray-100"
          >
            <SettingsIcon className="h-5 w-5" />
          </button>
          <button
            onClick={() => setMostrarGraficos(true)}
            title="Gráficos"
            className="text-gray-400 hover:text-gray-100"
          >
            <ChartIcon className="h-5 w-5" />
          </button>
          <button
            onClick={handleLogout}
            className="text-sm text-red-400 hover:text-red-300 font-medium"
          >
            Cerrar sesión
          </button>
        </div>
      </header>

      {error && <p className={errorBanner}>{error}</p>}

      <Resumen reloadTrigger={reloadTrigger} />

      <FormularioGasto
        categorias={categorias}
        onCategoriaCreada={(c) => setCategorias((prev) => [...prev, c])}
        onGastoCreado={() => setReloadTrigger((n) => n + 1)}
      />

      <ListaGastos categorias={categorias} reloadTrigger={reloadTrigger} />

      {mostrarConfig && (
        <ConfiguracionCategorias
          categorias={categorias}
          onCategoriaActualizada={(actualizada) =>
            setCategorias((prev) => prev.map((c) => (c.id === actualizada.id ? actualizada : c)))
          }
          onClose={() => setMostrarConfig(false)}
        />
      )}

      {mostrarGraficos && <GraficosPanel onClose={() => setMostrarGraficos(false)} />}
    </div>
  );
}
